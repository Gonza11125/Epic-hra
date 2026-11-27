// 0.1.4.7 – testy streamingu dlaždic: postupný (progresivní) commit bez děr a překryvů, časový rozpočet tick(),
// oboustranně vinuté skirts, shoda výšek renderer = fyzika, pravidlo viditelnosti vegetace/vody podle připravenosti terénu.
// Spuštění: node tests/streaming-progressive.mjs
import {selectTiles,TileStream,key,buildSurfaceTile,parentTile,childTiles} from '../planet-streaming.js';
import {valleyDirection,surfaceRadiusMeters,direction,LOCATIONS,greatCircleStep,normalize,tilePoint} from '../elyra-geography.js?v=4';
import {findTile,meshGroundRadius} from '../planet-physics.js';
import {valleyLayerVisible,setValleyTerrainReady,valleyTerrainReady} from '../valley-nature.js';
let fails=0,checks=0;const groups={};
const check=(ok,msg,group='obecné')=>{checks++;groups[group]=(groups[group]||0)+1;if(!ok){fails++;console.log('FAIL '+msg)}};
const info=msg=>console.log('INFO '+msg);
const parse=k=>{const [face,level,x,y]=k.split('/').map(Number);return {face,level,x,y}};
// Aktivní sada musí být přesným pokrytím koule: součet ploch 6 stěn, žádný předek jiné aktivní dlaždice, vše postavené.
function coverOk(stream,label){
 const tiles=[...stream.active].map(parse),set=new Set(stream.active);let area=0,overlap=0,missing=0;
 for(const t of tiles){area+=4**-t.level;if(!stream.cache.has(key(t)))missing++;let p=t;while(p.level>0){p=parentTile(p);if(set.has(key(p))){overlap++;break}}}
 check(Math.abs(area-6)<1e-9,`${label}: pokrytí koule (plocha ${area.toFixed(9)} = 6)`,'pokrytí');
 check(overlap===0,`${label}: žádný překryv rodič/potomek (${overlap})`,'překryv');
 check(missing===0,`${label}: všechny aktivní dlaždice jsou postavené (${missing})`,'cache');
}
// Simulované hodiny: každá stavba "trvá" buildMs.
function makeStream(opts={}){let clock=0;const buildMs=opts.buildMs??3.6;const s=new TileStream({build:t=>{clock+=buildMs;return {tile:t}},maxCache:opts.maxCache??240,progressive:opts.progressive??true,now:()=>clock});s.advance=ms=>{clock+=ms};return s}
const roots=Array.from({length:6},(_,face)=>({face,level:0,x:0,y:0}));
const landing=valleyDirection(0,0);
const levelUnder=(s,p)=>findTile(p,[...s.active].map(parse))?.tile.level??-1;

// 1) Přistání v Údolí 07: progresivní stream vs. původní (vše najednou).
{
 const tiles=selectTiles(landing,.00168,{budget:165,maxLevel:17,threshold:.65});
 const legacy=makeStream({progressive:false});legacy.request(roots);legacy.tick(6);
 legacy.request(tiles);let legacyFrames=0,legacyLod0=0;while(legacy.pending){legacy.tick(2);legacyFrames++;if(levelUnder(legacy,landing)===0)legacyLod0++}
 check(legacy.active.size===tiles.length,'původní režim: po dostavění aktivní celá sada','režim');
 const prog=makeStream();prog.request(roots);prog.tick(6);coverOk(prog,'start');
 prog.request(tiles,{focus:landing});let frames=0,lod0=0,prev=0,mono=true;const trace=[];
 while(prog.pending){prog.tick(2);frames++;coverOk(prog,`přistání snímek ${frames}`);const l=levelUnder(prog,landing);if(l<prev)mono=false;prev=l;if(l===0)lod0++;trace.push(l)}
 check(prog.active.size===tiles.length&&tiles.every(t=>prog.active.has(key(t))),'progresivně: na konci aktivní přesně požadovaná sada','režim');
 check(mono,'LOD pod pozorovatelem během přistání nikdy neklesá','plynulost');
 check(lod0<=2,`LOD 0 pod pozorovatelem nejvýš 2 snímky (${lod0}, původně ${legacyLod0})`,'plynulost');
 info(`tick(2): původně ${legacyFrames} snímků, z toho ${legacyLod0} s LOD 0 pod pozorovatelem; progresivně ${frames} snímků (staví i ${prog.internal.size} mezilehlých předků), LOD 0 jen ${lod0}`);
 info('průběh LOD pod pozorovatelem (každý 8. snímek): '+trace.filter((_,i)=>i%8===0).join(' '));
 // Časový rozpočet: 3,6 ms/dlaždici, rozpočet 8 ms → 3 dlaždice/snímek (poslední smí rozpočet překročit), 40 ms → 12.
 for(const [budget,expect] of [[8,3],[10,3],[40,12]]){const s=makeStream();s.request(roots);s.tick(6);s.request(tiles,{focus:landing});const n=s.tick(64,{budgetMs:budget});check(n===expect,`rozpočet ${budget} ms při 3,6 ms/dlaždici postaví ${expect} dlaždic (${n})`,'rozpočet');let f=1;while(s.pending){s.tick(64,{budgetMs:budget});f++;coverOk(s,`rozpočet ${budget} ms snímek ${f}`)}info(`rozpočet ${budget} ms: přistání dostavěno za ${f} snímků`)}
 const one=makeStream({buildMs:50});one.request(roots);one.tick(6);one.request(tiles);check(one.tick(64,{budgetMs:8})===1,'pomalá stavba: aspoň 1 dlaždice za snímek','rozpočet');
}

// 2) Let a chůze: náhodné změny požadavku uprostřed stavby (stará sada zůstává, dokud nová oblast není hotová).
{
 const s=makeStream({maxCache:240});s.request(roots);s.tick(6);let p=landing,t=normalize([-p[2],0,p[0]]),seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const heights=[300,40,5,1.2,.4,.00168,.00168,.00168,2,800];let n=0;
 for(let step=0;step<60;step++){const h=heights[step%heights.length];const q=greatCircleStep(p,t,(rnd()-.3)*Math.max(.05,h*2));p=q.position;t=q.tangent;
  s.request(selectTiles(p,h,h<.01?{budget:165,maxLevel:17,threshold:.65}:{budget:105,maxLevel:13,threshold:.8}),{focus:p});
  const frames=1+Math.floor(rnd()*25);for(let f=0;f<frames;f++){s.tick(64,{budgetMs:8});coverOk(s,`let krok ${step} snímek ${f}`);n++}
  check(s.cache.size<=s.maxCache+s.desired.size+s.internal.size+6,`cache omezená (${s.cache.size})`,'cache')}
 while(s.pending){s.tick(64,{budgetMs:8});coverOk(s,'dobíhání')}
 check([...s.desired.keys()].every(k=>s.active.has(k))&&s.active.size===s.desired.size,'po doběhnutí aktivní přesně poslední požadavek','režim');
 info(`let/chůze: ${n} snímků s průběžnou kontrolou pokrytí, cache ${s.cache.size}`);
}

// 3) Nepokrývající (dílčí) požadavek spadne zpět na původní chování vše-nebo-nic.
{
 const s=makeStream();const part=[{face:0,level:2,x:1,y:1},{face:0,level:2,x:2,y:1}];s.request(part);check(s.active.size===0,'dílčí požadavek: nic aktivního před stavbou','režim');s.tick(10);check(s.active.size===2,'dílčí požadavek: po stavbě aktivní obě dlaždice','režim');
}

// 4) Geometrie dlaždic: skirts oboustranně (terén může být FrontSide), povrch konečný a shodný s fyzikou.
{
 const sample=[...selectTiles(landing,.00168,{budget:165,maxLevel:17,threshold:.65}),...LOCATIONS.slice(0,4).flatMap(l=>selectTiles(direction(l.lat,l.lon),.3,{budget:60,maxLevel:13,threshold:.8}))].filter((_,i)=>i%5===0);
 const res=12,n=res+1,surf=res*res*6;let rendererPhysicsMax=0,windingBad=0;
 for(const t of sample){const r=buildSurfaceTile(t,res),P=r.positions,I=r.indices;
  check(P.every(Number.isFinite)&&r.normals.every(Number.isFinite),`dlaždice ${key(t)}: konečné hodnoty`,'konečné');
  check(I.length===surf+4*res*12,`dlaždice ${key(t)}: ${res*res*2} trojúhelníků povrchu + ${4*res*4} skirts (obě vinutí)`,'skirts');
  // Každý skirt trojúhelník má protějšek s opačným vinutím.
  const tri=new Set();for(let k=surf;k<I.length;k+=3)tri.add(I.slice(k,k+3).join(','));let pairs=0;for(let k=surf;k<I.length;k+=3){const [a,b,c]=I.slice(k,k+3);if(tri.has([a,c,b].join(','))||tri.has([c,b,a].join(','))||tri.has([b,a,c].join(',')))pairs++}
  check(pairs===(I.length-surf)/3,`dlaždice ${key(t)}: skirts oboustranné (${pairs})`,'skirts');
  // Skirts mají vlastní vrcholy (≥ skirtStart, kvůli posunu hloubky v rendereru); povrch je nedotčený.
  check(r.skirtStart===n*n&&I.slice(surf).every(i=>i>=r.skirtStart)&&I.slice(0,surf).every(i=>i<r.skirtStart),`dlaždice ${key(t)}: skirt vrcholy oddělené od povrchu`,'skirts');
  check(r.regional.length===r.biomes.length&&r.positions.length===r.biomes.length*3&&r.skirtSource.length===r.biomes.length-r.skirtStart,`dlaždice ${key(t)}: délky atributů`,'skirts');
  let topOk=true;for(let e=0;e<4;e++)for(let j=0;j<n;j++){const v=r.skirtStart+e*2*n+j,src=r.skirtSource[v-r.skirtStart];for(let k=0;k<3;k++)if(P[v*3+k]!==P[src*3+k])topOk=false;const bot=v+n;const drop=[0,1,2].map(k=>P[src*3+k]-P[bot*3+k]);if(Math.abs(Math.hypot(...drop)-r.skirtDepthMeters)>1e-6)topOk=false}
  check(topOk,`dlaždice ${key(t)}: horní hrana skirtu = hrana povrchu, spodní o hloubku skirtu níž`,'skirts');
  // Povrch je CCW zvenku na všech stěnách (FrontSide je bezpečné).
  for(let k=0;k<surf;k+=3){const [a,b,c]=I.slice(k,k+3).map(i=>i*3),u=[0,1,2].map(i=>P[b+i]-P[a+i]),v=[0,1,2].map(i=>P[c+i]-P[a+i]),nn=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(nn[0]*r.radial[a]+nn[1]*r.radial[a+1]+nn[2]*r.radial[a+2]<=0)windingBad++}
  // Renderer = fyzika: střed každého 3. trojúhelníku povrchu → meshGroundRadius musí dát poloměr tohoto bodu.
  for(let k=0;k<surf;k+=9){const [a,b,c]=I.slice(k,k+3).map(i=>i*3),w=[0,1,2].map(i=>(P[a+i]+P[b+i]+P[c+i])/3+r.originMeters[i]),rad=Math.hypot(...w),d=w.map(x=>x/rad);const phys=meshGroundRadius(d,findTile(d,[t]),res);rendererPhysicsMax=Math.max(rendererPhysicsMax,Math.abs(phys-rad))}
 }
 check(windingBad===0,`povrch CCW zvenku na všech stěnách (${windingBad} špatně)`,'skirts');
 check(rendererPhysicsMax<1e-4,`renderer = fyzika: max odchylka ${rendererPhysicsMax.toExponential(2)} m`,'renderer=fyzika');
 // Hloubka skirts beze změny (≥ 3 m).
 check(buildSurfaceTile({face:0,level:17,x:5,y:5},12).skirtDepthMeters===3,'hloubka skirts na LOD 17 = 3 m (beze změny)','skirts');
}

// 5) Pravidlo viditelnosti vegetace i vody: bez připravenosti terénu skryto.
{
 const p=valleyDirection(0,0),origin=p.map(x=>x*(surfaceRadiusMeters(p)+1.68)/1000);
 delete globalThis[Symbol.for('nexus.valleyTerrainReady')];
 check(valleyTerrainReady()===true,'výchozí stav: terén připraven (zpětná kompatibilita)','viditelnost');
 check(valleyLayerVisible(p,origin,true)===true,'chůze v údolí s připraveným terénem: viditelné','viditelnost');
 setValleyTerrainReady(false);check(valleyLayerVisible(p,origin,true)===false,'terén nepřipraven: vegetace i voda skryté','viditelnost');
 check(valleyLayerVisible(p,origin,true,true)===true,'explicitní ready=true přebije globální stav','viditelnost');
 setValleyTerrainReady(true);check(valleyLayerVisible(p,origin,true)===true,'po připravení opět viditelné','viditelnost');
 const far=direction(0,0);check(valleyLayerVisible(far,far.map(x=>x*1740),true)===false,'mimo údolí skryté','viditelnost');
}
console.log('Kontroly podle skupin: '+JSON.stringify(groups));
console.log(fails?`FAIL – ${fails} z ${checks} kontrol selhalo`:`OK – ${checks} kontrol prošlo`);
process.exitCode=fails?1:0;
