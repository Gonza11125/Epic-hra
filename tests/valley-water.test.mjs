// NEXUS 0.1.4.7 Living Waters – numerické kontroly vodní sítě Údolí 07 (Node, bez prohlížeče).
// Spuštění: node tests/valley-water.test.mjs        (exit 1 při chybě; vypisuje souhrn a odchylky)
// Referenční vzorky před úpravou reliéfu: tests/fixtures/valley-baseline-0146.json (tools/valley-snapshot.mjs).
import fs from 'fs';
import {execFileSync} from 'child_process';
import {fileURLToPath} from 'url';
import {LOCATIONS,sample,surfaceSample,direction,valleyDirection,valleyLandscape,valleyManifest,valleyUncarvedHeight,valleyWaterNetwork,valleyWaterAt,valleyWaterClear,surfaceRadiusMeters,PLANET,VALLEY_POINTS,VALLEY_ROUTES} from '../elyra-geography.js?v=4';
import {deriveWaterNetwork,carveHeight,WATER_DESIGN} from '../valley-hydrology.js?v=01470';
import {buildWaterMeshData,waterExport,groundHeight,WATER_KIND} from '../valley-water.js?v=01470';
import {collectFlora,candidate,SPECIES} from '../valley-flora.js?v=01470';
import {buildSurfaceTile} from '../planet-streaming.js?v=01470';
import {faceUV,findTile,meshGroundRadius} from '../planet-physics.js?v=01470';

const root=fileURLToPath(new URL('..',import.meta.url));
let checks=0,fails=0;const groups={},groupFails={};
function check(ok,group,msg){checks++;groups[group]=(groups[group]||0)+1;if(!ok){fails++;if((groupFails[group]=(groupFails[group]||0)+1)<=4)console.log('FAIL ['+group+'] '+msg)}}
const fin=v=>typeof v==='number'&&Number.isFinite(v);
const base=valleyManifest().baseElevationMeters,surfaceM=(x,z)=>surfaceSample(valleyDirection(x,z)).surfaceElevationKm*1000-base;
const net=valleyWaterNetwork();

// 1) Konečné hodnoty v celé síti.
for(const L of net.lakes){for(const k of ['level','area','maxDepth','meanDepth','volume'])check(fin(L[k]),'konečné',L.id+'.'+k);for(const [x,z] of L.outline)check(fin(x)&&fin(z),'konečné',L.id+' obrys');for(const v of L.sd)check(Number.isFinite(v),'konečné',L.id+' sd')}
for(const R of net.reaches)for(const p of R.stations)for(const k of ['x','z','s','h','w','ws','depth','speed','bed','slope','tx','tz','nx','nz'])check(fin(p[k]),'konečné',R.id+' '+k+' @'+p.s);
for(const W of net.waterfalls)for(const k of ['x','z','top','bottom','height','width','exitSpeed','impactSpeed','throwMeters'])check(fin(W[k]),'konečné',W.id+'.'+k);

// 2) Voda teče z kopce: hladina na každém úseku klesá, dno pod hladinou, kladná šířka/hloubka/rychlost.
for(const R of net.reaches){const st=R.stations;for(let i=1;i<st.length;i++){check(st[i].ws<st[i-1].ws,'spád',R.id+' úsek '+i+' '+st[i-1].ws.toFixed(4)+' -> '+st[i].ws.toFixed(4));check(st[i].s>st[i-1].s,'spád',R.id+' staničení roste '+i)}
 for(const p of st){check(p.bed<p.ws&&p.depth>0&&p.w>0&&p.speed>0&&p.speed<=4,'spád',R.id+' dno/šířka/rychlost @'+p.s.toFixed(1));check(p.ws<=p.h+1e-9,'spád',R.id+' hladina pod neupraveným terénem osy @'+p.s.toFixed(1))}
 const up=net.lakes.find(l=>l.id===R.from),down=net.lakes.find(l=>l.id===R.to);
 if(up)check(st[0].ws<up.level,'spád',R.id+' začíná pod hladinou jezera '+up.id);
 if(down)check(st[st.length-1].ws>=down.level,'spád',R.id+' končí nad hladinou příjemce '+down.id+' ('+st[st.length-1].ws.toFixed(3)+')');
 if(R.source)check(Math.abs(st[0].x-R.source.x)<1e-6&&Math.abs(st[0].z-R.source.z)<1e-6,'spád',R.id+' začíná v prameni');
 // Voda nepřetéká přes břehy: upravený terén 0,6 m za okrajem koryta je nad hladinou (mimo ústí do jezera/mokřadu 12 m).
 const end=st[st.length-1].s;for(const p of st){if(down&&end-p.s<12)continue;if(up&&p.s<4)continue;for(const side of [-1,1]){const o=p.w/2+.6,g=valleyLandscape(p.x+side*p.nx*o,p.z+side*p.nz*o).heightMeters,gb=Math.abs(p.z)<1745?g:surfaceM(p.x+side*p.nx*o,p.z+side*p.nz*o);check(gb>=p.ws-.02,'břehy',R.id+' břeh '+(side<0?'P':'L')+' @'+p.s.toFixed(1)+' terén '+gb.toFixed(3)+' < hladina '+p.ws.toFixed(3))}}}
// Vodopád: skutečný skok na přirozeném zlomu, hrana z původního terénu, tůň pod ním.
for(const W of net.waterfalls){const R=net.reaches.find(r=>r.id===W.reach),f=R.fallIndex,a=R.stations[f],b=R.stations[f+1];check(W.height>=8&&Math.abs(a.ws-b.ws-W.height)<1e-9,'vodopád','výška '+W.height);
 const g1=(valleyUncarvedHeight(a.x-a.tx*10,a.z-a.tz*10)-valleyUncarvedHeight(a.x,a.z))/10,g2=(valleyUncarvedHeight(a.x,a.z)-valleyUncarvedHeight(a.x+a.tx*10,a.z+a.tz*10))/10;check(g2>g1&&g2>.4,'vodopád','konvexní zlom: sklon nad '+g1.toFixed(2)+' < pod '+g2.toFixed(2));
 check(Math.abs(valleyLandscape(a.x-a.tx*3,a.z-a.tz*3).heightMeters-valleyUncarvedHeight(a.x-a.tx*3,a.z-a.tz*3))<.5,'vodopád','terén nad hranou jen mělké koryto');
 check(valleyLandscape(a.x+a.tx*2,a.z+a.tz*2).heightMeters<a.ws-W.height,'vodopád','tůň pod hranou je pod spodní hladinou');
 check(b.depth>=1.2,'vodopád','hloubka tůně '+b.depth.toFixed(2))}

// 3) Jezírko a mokřad: konstantní hladina nad dnem, uzavřená pánev, přeliv jen korytem odtoku.
for(const L of net.lakes){check(L.contained,'jezera',L.id+' maska nedosahuje okraje výřezu (žádný únik)');check(L.maxDepth>.3&&L.area>2000,'jezera',L.id+' plocha '+L.area+' hloubka '+L.maxDepth.toFixed(2));check(Math.abs(L.outlineArea-L.area)/L.area<.05,'jezera',L.id+' obrys odpovídá masce');
 let minBed=Infinity;for(let k=0;k<L.mask.length;k++)if(L.mask[k]){const i=k%L.nx,j=(k-i)/L.nx,x=L.x0+i*L.cell,z=L.z0+j*L.cell,g=groundHeight(x,z);minBed=Math.min(minBed,g);if(k%7===0)check(g<L.level,'jezera',L.id+' dno pod hladinou '+x+','+z)}
 check(minBed<L.level-.3,'jezera',L.id+' hladina nad dnem ('+(L.level-minBed).toFixed(2)+' m)');
 // Okraj masky: upravený terén nad hladinou, výjimkou je jen koryto odtoku.
 const out=L.outflow?net.reaches.find(r=>r.id===L.outflow):null;let leaks=0;
 for(let k=0;k<L.mask.length;k++){if(L.mask[k])continue;const i=k%L.nx,j=(k-i)/L.nx;if(![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const ii=i+a,jj=j+b;return ii>=0&&jj>=0&&ii<L.nx&&jj<L.nz&&L.mask[jj*L.nx+ii]}))continue;const x=L.x0+i*L.cell,z=L.z0+j*L.cell,g=groundHeight(x,z);
  if(g<L.level){const nearOut=out&&out.stations.slice(0,6).some(p=>Math.hypot(p.x-x,p.z-z)<p.w/2+L.cell*1.5);const nearIn=net.reaches.some(r=>r.to===L.id&&r.stations.slice(-4).some(p=>Math.hypot(p.x-x,p.z-z)<p.w/2+8));if(!nearOut&&!nearIn)leaks++}check(true,'jezera','okraj')}
 check(leaks===0,'jezera',L.id+' břeh pod hladinou mimo koryta: '+leaks+' buněk');
 if(L.outflow)check(net.reaches.find(r=>r.id===L.outflow).stations[0].ws>L.level-.1,'jezera',L.id+' odtok navazuje na hladinu')}
const mesh=buildWaterMeshData({quality:'high'}),meshLow=buildWaterMeshData({quality:'mobile'});
for(const d of [mesh,meshLow]){for(const part of d.parts){if(part.kind!=='lake'&&part.kind!=='wetland')continue;const L=net.lakes.find(l=>l.id===part.id),ids=new Set(d.indices.slice(part.start,part.start+part.count));for(const i of ids)check(d.h[i]===L.level,'jezera',L.id+' vrchol hladiny = '+L.level)}}

// 4) Plošina osady 240 × 240 m zůstává suchá a beze změny reliéfu.
for(const R of net.reaches)for(const p of R.stations)check(Math.max(Math.abs(p.x),Math.abs(p.z))>120+p.w/2+60,'plošina',R.id+' daleko od plošiny');
for(const L of net.lakes)check(L.bbox[0]>140||L.bbox[1]<-140||L.bbox[2]>140||L.bbox[3]<-140,'plošina',L.id+' mimo plošinu');
for(let x=-140;x<=140;x+=4)for(let z=-140;z<=140;z+=4){check(valleyLandscape(x,z).water===0&&!valleyWaterAt(x,z),'plošina','suchá '+x+','+z)}

// 5) Trasy: křížení musí mít brod/lávku; mimo křížení voda nezasahuje do koridoru trasy a nemění její výšku.
const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)};
for(const R of net.reaches)for(const p of R.stations)for(const route of VALLEY_ROUTES){let d=Infinity;for(let i=1;i<route.points.length;i++)d=Math.min(d,segD(p.x,p.z,route.points[i-1],route.points[i]));if(d<route.width/2+p.w/2+3){const c=net.crossings.find(c=>c.reach===R.id&&c.route===route.id);check(!!c&&fin(c.x)&&fin(c.width)&&(c.type==='ford'||c.type==='footbridge'),'trasy',R.id+' kříží '+route.id+' bez brodu/lávky')}else check(true,'trasy','mimo koridor')}
for(const c of net.crossings)check(c.type==='footbridge'||c.waterDepth<=.3,'trasy','brod '+c.id+' mělký');
for(const route of VALLEY_ROUTES)for(let i=1;i<route.points.length;i++){const [a,b]=route.points[i-1],[c,e]=route.points[i],n=Math.ceil(Math.hypot(c-a,e-b)/5);for(let k=0;k<=n;k++){const x=a+(c-a)*k/n,z=b+(e-b)*k/n;for(const o of [-route.width/2,0,route.width/2]){const L=Math.hypot(c-a,e-b),px=x-(e-b)/L*o,pz=z+(c-a)/L*o;const crossing=net.crossings.some(q=>q.route===route.id&&Math.hypot(q.x-px,q.z-pz)<q.length);if(!crossing)check(valleyLandscape(px,pz).water===0&&!valleyWaterAt(px,pz),'trasy',route.id+' koridor suchý '+px.toFixed(0)+','+pz.toFixed(0))}}}

// 6) Referenční vzorky před/po: geografie, pobřeží, osady a trasy se neposunuly; změny jen v korytech.
const fixture=JSON.parse(fs.readFileSync(root+'tests/fixtures/valley-baseline-0146.json','utf8'));
check(JSON.stringify(fixture.locations)===JSON.stringify(LOCATIONS.map(l=>({id:l.id,lat:+l.lat.toFixed(9),lon:+l.lon.toFixed(9),biome:l.biome}))),'před/po','LOCATIONS beze změny');
let globalDiff=0;for(const [lat,lon,biome,civ,e,se] of fixture.global){const v=direction(lat,lon),s=sample(v),q=surfaceSample(v),ok=s.biome===biome&&s.civilization===civ&&+s.elevationKm.toFixed(7)===e&&+q.surfaceElevationKm.toFixed(7)===se;if(!ok)globalDiff++;check(ok,'před/po','globální vzorek '+lat+','+lon)}
const V=fixture.valley;let vDiff=0,vMax=0,vOutside=0;for(let j=0;j<V.nz;j++)for(let i=0;i<V.nx;i++){const x=V.x0+i*V.step,z=V.z0+j*V.step,h=+surfaceM(x,z).toFixed(4),old=V.h[j*V.nx+i];if(h!==old){vDiff++;vMax=Math.max(vMax,Math.abs(h-old));const c=carveHeight(net,x,z);if(!(c<Infinity&&h<old))vOutside++}check(h===old||carveHeight(net,x,z)<Infinity,'před/po','výška údolí '+x+','+z)}
for(const p of fixture.points)check(+surfaceM(p.x,p.z).toFixed(4)===p.h&&valleyLandscape(p.x,p.z).zone===p.zone,'před/po','bod '+p.id);
let rDiff=0;for(const r of fixture.routes){const route=VALLEY_ROUTES.find(q=>q.id===r.id),pts=[];for(let i=1;i<route.points.length;i++){const [a,b]=route.points[i-1],[c,d]=route.points[i],n=Math.ceil(Math.hypot(c-a,d-b)/10);for(let k=0;k<n;k++){const t=k/n;pts.push([a+(c-a)*t,b+(d-b)*t])}}
 check(pts.length===r.samples.length,'před/po','trasa '+r.id+' počet vzorků');r.samples.forEach(([x,z,h],i)=>{const ok=+surfaceM(pts[i][0],pts[i][1]).toFixed(4)===h;if(!ok)rDiff++;check(ok,'před/po','trasa '+r.id+' '+x+','+z)})}
// Jemná mřížka 2 m v okolí vody: rozsah a maximum úpravy, žádné zvýšení terénu.
let carvedCells=0,maxCarve=0,maxCarveAt=null,maxDist=0,raised=0;for(const R of net.reaches){const [x0,x1,z0,z1]=R.bbox;for(let x=Math.ceil(x0/2)*2;x<=x1;x+=2)for(let z=Math.ceil(z0/2)*2;z<=z1;z+=2){const u=valleyUncarvedHeight(x,z),g=groundHeight(x,z);if(g>u+1e-9)raised++;if(u-g>1e-9){carvedCells++;if(u-g>maxCarve){maxCarve=u-g;maxCarveAt=[x,z]}let d=Infinity;for(const p of R.stations)d=Math.min(d,Math.hypot(p.x-x,p.z-z)-p.w/2);maxDist=Math.max(maxDist,d)}}}
check(raised===0,'před/po','terén nikde nezvýšen ('+raised+')');check(maxDist<=WATER_DESIGN.maxInfluence,'před/po','dosah úpravy '+maxDist.toFixed(1)+' m');

// 7) Determinismus: nové odvození = stejná síť; dva samostatné procesy = stejný export a geometrie.
const again=deriveWaterNetwork({height:valleyUncarvedHeight,routes:VALLEY_ROUTES,platform:{half:120}}),strip=n=>JSON.stringify(n,(k,v)=>v instanceof Float32Array||v instanceof Float64Array||v instanceof Uint8Array?Array.from(v):v);
check(strip(again)===strip(net),'determinismus','dvě odvození v jednom procesu');
const script=`import {waterExport,buildWaterMeshData} from '${root}valley-water.js?v=01470';import {createHash} from 'crypto';const m=buildWaterMeshData({quality:'high'});console.log(createHash('sha256').update(JSON.stringify(waterExport())+JSON.stringify(m)).digest('hex'))`;
const run=()=>execFileSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();const h1=run(),h2=run();
check(h1===h2&&h1.length===64,'determinismus','dva běhy '+h1.slice(0,12)+' / '+h2.slice(0,12));
const exported=fs.readFileSync(root+'valley-07-water.json','utf8');check(JSON.parse(exported).lakes.length===net.lakes.length&&JSON.stringify(JSON.parse(exported).waterfalls)===JSON.stringify(waterExport().waterfalls),'determinismus','valley-07-water.json odpovídá generátoru');
check(JSON.parse(fs.readFileSync(root+'valley-07.json','utf8')).water?.file==='valley-07-water.json','determinismus','valley-07.json odkazuje na vodní data');

// 8) Geometrie: atributy konečné, indexy v rozsahu, hladina potoků klesá po řádcích, vodopád padá.
for(const d of [mesh,meshLow]){for(const k of ['x','z','h','u','v','dirX','dirZ','dirY','speed','depth','shore','kind','foam'])for(const v of d[k])check(Number.isFinite(v),'geometrie',d.quality+' '+k);
 for(const i of d.indices)check(i>=0&&i<d.vertexCount,'geometrie','index');check(d.indices.length%3===0&&d.triangleCount<40000,'geometrie',d.quality+' trojúhelníků '+d.triangleCount);
 for(let i=0;i<d.vertexCount;i++){check((d.kind[i]===WATER_KIND.lake||d.kind[i]===WATER_KIND.wetland||(d.u[i]>=0&&d.u[i]<=1))&&d.foam[i]>=0&&d.foam[i]<=1&&d.depth[i]>=0&&d.speed[i]>=0,'geometrie','rozsahy atributů');if(d.kind[i]===WATER_KIND.stream)check(Math.abs(Math.hypot(d.dirX[i],d.dirZ[i])-1)<1e-6,'geometrie','jednotkový směr proudu')}
 for(const part of d.parts.filter(p=>p.kind==='stream')){const tri=d.indices.slice(part.start,part.start+part.count);for(let t=0;t<tri.length;t+=3){const [a,b,c]=[tri[t],tri[t+1],tri[t+2]];const vs=[a,b,c].map(i=>d.v[i]),hs=[a,b,c].map(i=>d.h[i]);const lo=vs.indexOf(Math.min(...vs)),hi=vs.indexOf(Math.max(...vs));if(vs[hi]>vs[lo])check(hs[hi]<hs[lo],'geometrie',part.id+' hladina klesá po proudu v trojúhelníku')}}
 for(const part of d.parts.filter(p=>p.kind==='waterfall')){const ids=[...new Set(d.indices.slice(part.start,part.start+part.count))].sort((a,b)=>a-b);const W=net.waterfalls[0];check(Math.abs(Math.max(...ids.map(i=>d.h[i]))-W.top)<1e-9&&Math.abs(Math.min(...ids.map(i=>d.h[i]))-W.bottom)<1e-6,'geometrie','vodopád z hrany do tůně')}}
console.log('INFO geometrie: vysoká',mesh.vertexCount,'vrcholů /',mesh.triangleCount,'△; mobilní',meshLow.vertexCount,'/',meshLow.triangleCount);

// 9) Vegetace mimo vodu: žádný kandidát ve vodě ani na břehu; oproti referenci jen ubyly položky u vody.
let floraRemoved=0,floraTotal=0;for(const f of fixture.flora){const now=collectFlora(f.x,f.z,{radii:[750,170,65],caps:[1e6,1e6,1e6]}),keys=new Set(now.map(p=>p.key+'|'+p.id)),before=new Set(f.items);floraTotal+=now.length;
 for(const k of keys)check(before.has(k),'vegetace','nová položka '+k);
 for(const k of before)if(!keys.has(k)){floraRemoved++;const [band,i,j]=k.split('|')[0].split(':').map(Number),step=[22,8,2.8][band],n=s=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(s+band*113,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295},x=(i+.13+.74*n(1))*step,z=(j+.13+.74*n(2))*step;const sp=SPECIES.find(q=>q.id===k.split('|')[1]);check(valleyLandscape(x,z).water>0||!valleyWaterClear(x,z,sp.radius*1.4),'vegetace','odebraná položka '+k+' není u vody')}
 for(const p of now){const w=valleyWaterAt(p.x,p.z);check(!w&&valleyLandscape(p.x,p.z).water===0,'vegetace','rostlina ve vodě '+p.key)}}
for(const R of net.reaches)for(const p of R.stations)for(let b=0;b<3;b++){const step=[22,8,2.8][b],i=Math.floor(p.x/step),j=Math.floor(p.z/step);for(let a=i-1;a<=i+1;a++)for(let c=j-1;c<=j+1;c++){const q=candidate(b,a,c);if(q)check(Math.hypot(q.x-p.x,q.z-p.z)>p.w/2,'vegetace','kandidát v korytě '+q.key)}}

// 10) Renderer a fyzika: stejný zdroj výšek. Trojúhelníky dlaždice z buildSurfaceTile vs meshGroundRadius.
const probes=[[620,900],[735,995],[300,960],[150,1400],[-60,1800],[600,850]];let maxRP=0,maxAn=0;
for(const [px,pz] of probes){const p=valleyDirection(px,pz),{face,u,v}=faceUV(p);for(const level of [15,17]){const n=2**level,tile={face,level,x:Math.min(n-1,Math.floor((u+1)*n/2)),y:Math.min(n-1,Math.floor((v+1)*n/2))},raw=buildSurfaceTile(tile,12);
 for(let k=0;k<25;k++){const q=valleyDirection(px+(k%5-2)*1.7,pz+(Math.floor(k/5)-2)*1.7),hit=findTile(q,[tile]);if(!hit)continue;const phys=meshGroundRadius(q,hit,12),N=12,i=Math.min(N-1,Math.floor(hit.u*N)),j=Math.min(N-1,Math.floor(hit.v*N)),a=hit.u*N-i,b=hit.v*N-j,corners=a+b<=1?[[i,j],[i+1,j],[i,j+1]]:[[i+1,j],[i+1,j+1],[i,j+1]];
  const vs=corners.map(([x,y])=>{const o=(y*(N+1)+x)*3;return [0,1,2].map(c=>raw.positions[o+c]+raw.originMeters[c])}),e1=vs[1].map((x,c)=>x-vs[0][c]),e2=vs[2].map((x,c)=>x-vs[0][c]),nn=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],rend=nn.reduce((s,x,c)=>s+x*vs[0][c],0)/nn.reduce((s,x,c)=>s+x*q[c],0);
  maxRP=Math.max(maxRP,Math.abs(rend-phys));check(Math.abs(rend-phys)<.01,'renderer=fyzika','LOD '+level+' '+px+','+pz+' rozdíl '+(rend-phys).toFixed(4)+' m');
  if(level===17)maxAn=Math.max(maxAn,Math.abs(phys-surfaceRadiusMeters(q)))}}}
console.log('INFO renderer vs fyzika max',maxRP.toExponential(2),'m; LOD17 síť vs analytický povrch max',maxAn.toFixed(3),'m (lineární interpolace 1,7 m buněk)');

// 11) Chůze ve vodě: hluboká voda v jezírku zastaví, potok je brodivý, na souši nic.
const lake=net.lakes[0];let deepest=null;for(let k=0;k<lake.mask.length;k++)if(lake.mask[k]){const i=k%lake.nx,j=(k-i)/lake.nx,x=lake.x0+i*lake.cell,z=lake.z0+j*lake.cell,w=valleyWaterAt(x,z);if(!deepest||w.depth>deepest.depth)deepest={...w,x,z}}
check(deepest&&deepest.depth>1.1,'chůze','jezírko má hluboké místo '+deepest.depth.toFixed(2)+' m (chůze zastavena > 1,1 m)');
const brook=net.reaches[1].stations[300],wb=valleyWaterAt(brook.x,brook.z);check(wb&&wb.kind==='stream'&&wb.depth>0&&wb.depth<.35,'chůze','potok mělký '+(wb?.depth??NaN).toFixed(2)+' m');
for(const p of VALLEY_POINTS)check(!valleyWaterAt(p.x,p.z),'chůze','orientační bod '+p.id+' suchý');

console.log('\nOdchylky před/po (referenční vzorky tests/fixtures/valley-baseline-0146.json):');
console.log('  globální vzorky (biom, civilizace, výška):',globalDiff,'/',fixture.global.length,'| LOCATIONS: beze změny');
console.log('  výšky údolí (mřížka 50 m, '+V.h.length+' bodů):',vDiff,'změněno, max',vMax.toFixed(3),'m, mimo koryta',vOutside);
console.log('  trasy (vzorky po 10 m):',rDiff,'změněno; orientační body: beze změny');
console.log('  jemná mřížka 2 m kolem toků:',carvedCells,'buněk sníženo (~'+(carvedCells*4)+' m²), max',maxCarve.toFixed(2),'m v',JSON.stringify(maxCarveAt),', max dosah',maxDist.toFixed(1),'m od okraje koryta');
console.log('  vegetace (4 vzorková místa):',floraRemoved,'položek odebráno u vody, zbývá',floraTotal);
console.log('\nKontroly podle skupin:',JSON.stringify(groups));if(fails)console.log('Selhání podle skupin:',JSON.stringify(groupFails));
console.log(fails?`SELHALO ${fails} z ${checks} kontrol`:`OK – ${checks} kontrol prošlo`);
process.exitCode=fails?1:0;
