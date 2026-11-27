// NEXUS 0.1.4.7 Living Waters – vodní plochy Údolí 07: data pro export (Unreal), engine-neutral síť
// vrcholů s atributy pro shader a jednoduchá Three.js vrstva (MeshStandardMaterial) pro planet-explorer.
// Hydrologie (trasy, hladiny, hloubky, rychlosti) je ve valley-hydrology.js; výšky terénu z elyra-geography.js,
// tedy ze stejného zdroje jako renderer (planet-streaming) i fyzika (planet-physics).
import {PLANET,valleyDirection,valleyCoordinates,valleyLandscape,valleyWaterNetwork,valleyManifest,surfaceRadiusMeters} from './elyra-geography.js?v=4';
import {lakeSignedDistance} from './valley-hydrology.js?v=01470';
import {valleyLayerVisible} from './valley-nature.js?v=01470';
import {createWaterUniforms,linkSkyUniforms,createWaterMaterial,createWaterfallMist} from './water-material.js?v=01470';

export const WATER_KIND={lake:0,stream:1,waterfall:2,wetland:3};
// Popis atributů geometrie (stejné názvy v BufferGeometry i v engine-neutral datech).
export const WATER_ATTRIBUTES={
 position:'vec3, km, scéna relativně k lokálnímu počátku údolí (root.position = kotva - plovoucí počátek kamery)',
 normal:'vec3, světový směr: radiála (hladiny) nebo směr proudu (vodopád)',
 uv:'vec2: u = příčná poloha 0..1 přes šířku pásu (0 = levý břeh po proudu); v = metry po proudu od začátku toku (jezero: lokální metry x,z od rohu)',
 flowDirection:'vec3, jednotkový světový směr proudění (u vodopádu se sklání dolů); jezero (0,0,0)',
 flowSpeed:'float, m/s (Manning; u břehů pomalejší; vodopád = rychlost pádu)',
 waterDepth:'float, m vody nad upraveným terénem v daném vrcholu (0 nad břehem; vodopád = tloušťka clony 0,3 m)',
 shoreDistance:'float, m od vodní hrany, kladné ve vodě, záporné nad břehem (pás přesahuje pod terén)',
 waterKind:'float: 0 jezírko, 1 potok, 2 vodopád, 3 mokřad',
 foam:'float 0..1: návrh pěny (peřeje podle sklonu, tůň pod vodopádem, okraje, ústí)',
 color:'vec3 vertex colour – jen pro dočasný MeshStandardMaterial (mělká/hluboká voda)'};

const R=PLANET.radiusKm*1000,base=()=>valleyManifest().baseElevationMeters,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
// Výška upraveného terénu (m nad základnou) – uvnitř údolí přímo valleyLandscape, v přechodovém pásmu skutečný povrch.
export function groundHeight(x,z){const v=valleyLandscape(x,z);return v.weight===1?v.heightMeters:surfaceRadiusMeters(valleyDirection(x,z))-R-base()}
function streamDistance(net,x,z){let best=Infinity;for(const Rr of net.reaches){const bb=Rr.bbox;if(x<bb[0]||x>bb[1]||z<bb[2]||z>bb[3])continue;const st=Rr.stations;for(let i=0;i<st.length-1;i++){const A=st[i],B=st[i+1];if(Math.abs(x-A.x)>12||Math.abs(z-A.z)>12)continue;const dx=B.x-A.x,dz=B.z-A.z,t=clamp(((x-A.x)*dx+(z-A.z)*dz)/(dx*dx+dz*dz),0,1),d=Math.hypot(x-A.x-t*dx,z-A.z-t*dz)-(A.w+(B.w-A.w)*t)/2;if(d<best)best=d}}return best}

// Engine-neutral síť: lokální x,z (m), h (m nad základnou), atributy, indexy (trojúhelníky CCW shora).
export function buildWaterMeshData({quality='high'}={}){
 const net=valleyWaterNetwork(),high=quality==='high',out={quality,x:[],z:[],h:[],u:[],v:[],dirX:[],dirZ:[],dirY:[],speed:[],depth:[],shore:[],kind:[],foam:[],indices:[],parts:[]};
 const push=(x,z,h,u,v,dx,dz,dy,speed,depth,shore,kind,foam)=>{out.x.push(x);out.z.push(z);out.h.push(h);out.u.push(u);out.v.push(v);out.dirX.push(dx);out.dirZ.push(dz);out.dirY.push(dy);out.speed.push(speed);out.depth.push(depth);out.shore.push(shore);out.kind.push(kind);out.foam.push(foam);return out.x.length-1};
 // 1) Jezírko a mokřad: konstantní hladina. Vnitřní buňky mřížky + okrajové buňky ořezané marching squares
 //    po vrstevnici (hladina + 8 cm) – hladina končí ~na čáře břehu, ne schodovitě (důležité u hrubého LOD terénu).
 for(const L of net.lakes){const start=out.indices.length,step=high?1:2,c=L.cell*step,nx=Math.floor((L.nx-1)/step),nz=Math.floor((L.nz-1)/step),ids=new Map(),kind=L.kind==='wetland'?WATER_KIND.wetland:WATER_KIND.lake;
  const K0=(i,j)=>(j*step)*L.nx+i*step,inMask=(i,j)=>i>=0&&j>=0&&i<=nx&&j<=nz&&L.mask[K0(i,j)]===1,mouths=net.reaches.filter(r=>r.to===L.id).map(r=>r.stations[r.stations.length-1]);
  const F=new Float64Array((nx+1)*(nz+1));for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let near=false;for(let a=-1;a<=1&&!near;a++)for(let b=-1;b<=1;b++)if(inMask(i+a,j+b)){near=true;break}F[j*(nx+1)+i]=near?L.level+.08-L.terrain[K0(i,j)]:-1}
  const vertexAt=(key,x,z)=>{if(ids.has(key))return ids.get(key);const sd=lakeSignedDistance(L,x,z),g=groundHeight(x,z),mouth=Math.min(1e9,...mouths.map(m=>Math.hypot(m.x-x,m.z-z)));
   const id=push(x,z,L.level,x-L.x0,z-L.z0,0,0,0,0,Math.max(0,L.level-g),sd,kind,clamp(clamp(.5*(1-sd/2.5),0,.5)+clamp(.6*(1-mouth/10),0,.6),0,1));ids.set(key,id);return id};
  const corner=(i,j)=>vertexAt('v'+i+','+j,L.x0+i*c,L.z0+j*c),edge=(i0,j0,i1,j1)=>{const f0=F[j0*(nx+1)+i0],f1=F[j1*(nx+1)+i1],t=f0/(f0-f1),key=i0<i1||j0<j1?'e'+i0+','+j0+','+i1+','+j1:'e'+i1+','+j1+','+i0+','+j0;return vertexAt(key,L.x0+(i0+(i1-i0)*t)*c,L.z0+(j0+(j1-j0)*t)*c)};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const cs=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],f=cs.map(([a,b])=>F[b*(nx+1)+a]);if(f.every(v=>v<=0))continue;
   const poly=[];for(let k=0;k<4;k++){const [a,b]=cs[k],[a2,b2]=cs[(k+1)%4];if(f[k]>0)poly.push(corner(a,b));if((f[k]>0)!==(f[(k+1)%4]>0))poly.push(edge(a,b,a2,b2))}
   for(let k=1;k<poly.length-1;k++)out.indices.push(poly[0],poly[k],poly[k+1])}
  out.parts.push({kind:L.kind,id:L.id,start,count:out.indices.length-start})}
 // 2) Potoky: pás po staničení, hladina vodorovná napříč, klesá po proudu; přesah 0,4 m za okraj koryta.
 const K=high?7:5,ov=.4;
 for(const Rr of net.reaches){const st=Rr.stations,f=Rr.fallIndex,fallS=f>=0?st[f].s:NaN,pieces=f>=0?[[0,f],[f+1,st.length-1]]:[[0,st.length-1]];
  for(const [a,b] of pieces){const start=out.indices.length,rows=[];for(let i=a;i<=b;i++)if(high||i===a||i===b||(i-a)%2===0)rows.push(i);let prev=null;
   for(const i of rows){const p=st[i],row=[],k=p.s-fallS,pool=k>=.6&&k<=8?1-(k-.6)/7.4:0,rapids=clamp((p.slope-.08)*2.5,0,.8);
    for(let c=0;c<K;c++){const o=(.5-c/(K-1))*(p.w+2*ov),x=p.x+p.nx*o,z=p.z+p.nz*o,shore=p.w/2-Math.abs(o),g=groundHeight(x,z),edge=clamp(1-shore/.6,0,1);
     row.push(push(x,z,p.ws,c/(K-1),p.s,p.tx,p.tz,0,Math.max(0,p.speed*(1-.6*Math.min(1,(2*o/p.w)**2))),Math.max(0,p.ws-g),shore,WATER_KIND.stream,clamp(Math.max(rapids,pool,edge*.35),0,1)))}
    if(prev)for(let c=0;c<K-1;c++)out.indices.push(prev[c],prev[c+1],row[c],prev[c+1],row[c+1],row[c]);prev=row}
   out.parts.push({kind:'stream',id:Rr.id,start,count:out.indices.length-start})}}
 // 3) Vodopád: svislá clona po balistické dráze z hrany do tůně (v0 = rychlost na hraně).
 for(const W of net.waterfalls){const start=out.indices.length,Rr=net.reaches.find(r=>r.id===W.reach),lip=Rr.stations[Rr.fallIndex],g=net.params.gravity,M=high?10:6;let prev=null,arc=0,last=null;
  for(let r=0;r<=M;r++){const t=W.fallSeconds*r/M,a=W.exitSpeed*t,drop=.5*g*t*t,vy=g*t,sp=Math.hypot(W.exitSpeed,vy),row=[];const cx=W.x+W.dirX*a,cz=W.z+W.dirZ*a,h=W.top-drop;if(last)arc+=Math.hypot(cx-last[0],cz-last[1],h-last[2]);last=[cx,cz,h];
   for(let c=0;c<K;c++){const o=(.5-c/(K-1))*W.width,x=cx+lip.nx*o,z=cz+lip.nz*o;row.push(push(x,z,h,c/(K-1),lip.s+arc,W.dirX*W.exitSpeed/sp,W.dirZ*W.exitSpeed/sp,-vy/sp,sp,.3,W.width/2-Math.abs(o),WATER_KIND.waterfall,clamp(.35+.65*r/M,0,1)))}
   if(prev)for(let c=0;c<K-1;c++)out.indices.push(prev[c],row[c],prev[c+1],prev[c+1],row[c],row[c+1]);prev=row}
  out.parts.push({kind:'waterfall',id:W.id,start,count:out.indices.length-start})}
 out.vertexCount=out.x.length;out.triangleCount=out.indices.length/3;return out;
}

// Data pro export (Unreal / další nástroje): lokální metry, hladiny v m nad základnou údolí.
export function waterExport(){const net=valleyWaterNetwork(),r=(v,d=3)=>+v.toFixed(d),m=valleyManifest();
 return {schema:1,id:'valley-07-water',name:'Údolí 07 – vodní síť',revision:net.revision,generator:'valley-hydrology.js + valley-water.js (NEXUS 0.1.4.7 Living Waters)',
  coordinateSystem:m.coordinateSystem+'; heights = metres above baseElevationMeters (planet radius '+PLANET.radiusKm+' km)',baseElevationMeters:m.baseElevationMeters,center:m.center,
  notes:['Hladina jezírka je konstantní; přítok končí nad hladinou, odtok začíná pod ní (zářez v přelivu).','Severní mokřad je bezodtoký (výpar/vsak), hladina pod přelivem pánve 18,44 m.','stations: [s, x, z, waterSurface, bed, width, depth, speed, dirX, dirZ]'],
  lakes:net.lakes.map(L=>({id:L.id,name:L.name,kind:L.kind,level:L.level,outflow:L.outflow,terminal:L.terminal,area:r(L.area,0),maxDepth:r(L.maxDepth,2),meanDepth:r(L.meanDepth,2),volume:r(L.volume,0),outline:L.outline.map(([x,z])=>[r(x,2),r(z,2)])})),
  reaches:net.reaches.map(Rr=>({id:Rr.id,name:Rr.name,kind:Rr.kind,from:Rr.from,to:Rr.to,source:Rr.source,discharge:Rr.discharge,length:r(Rr.length,1),fallIndex:Rr.fallIndex,stations:Rr.stations.map(p=>[r(p.s,2),r(p.x,2),r(p.z,2),r(p.ws),r(p.bed),r(p.w),r(p.depth),r(p.speed),r(p.tx,4),r(p.tz,4)])})),
  waterfalls:net.waterfalls.map(W=>({id:W.id,name:W.name,reach:W.reach,x:r(W.x,2),z:r(W.z,2),top:r(W.top),bottom:r(W.bottom),height:r(W.height,2),width:r(W.width,2),dirX:r(W.dirX,4),dirZ:r(W.dirZ,4),exitSpeed:r(W.exitSpeed),impactSpeed:r(W.impactSpeed),throwMeters:r(W.throwMeters)})),
  crossings:net.crossings.map(c=>({...c,x:r(c.x,2),z:r(c.z,2),width:r(c.width,2),length:r(c.length,2),waterDepth:r(c.waterDepth),waterLevel:r(c.waterLevel),flowSpeed:r(c.flowSpeed),deckLevel:r(c.deckLevel)})),
  routeClearance:routeClearance(net).map(c=>({...c,distance:r(c.distance,1)})),
  platform:{halfSize:120,minDistance:r(platformDistance(net),1)}};
}
// Nejmenší vzdálenost okraje vody od osy každé trasy (m) – kontrola, že voda trasy neblokuje.
export function routeClearance(net=valleyWaterNetwork()){const routes=valleyManifest().routes;return routes.map(route=>{let best={route:route.id,distance:Infinity,feature:null};const seg=(x,z)=>{let d=Infinity;for(let i=1;i<route.points.length;i++){const [a,b]=route.points[i-1],[c,e]=route.points[i],dx=c-a,dz=e-b,t=clamp(((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz),0,1);d=Math.min(d,Math.hypot(x-a-t*dx,z-b-t*dz))}return d};
 for(const Rr of net.reaches)for(const p of Rr.stations){const d=seg(p.x,p.z)-p.w/2-route.width/2;if(d<best.distance)best={route:route.id,distance:d,feature:Rr.id}}
 for(const L of net.lakes)for(const [x,z] of L.outline){const d=seg(x,z)-route.width/2;if(d<best.distance)best={route:route.id,distance:d,feature:L.id}}return best})}
export function platformDistance(net=valleyWaterNetwork(),half=120){let best=Infinity;const box=(x,z)=>Math.hypot(Math.max(0,Math.abs(x)-half),Math.max(0,Math.abs(z)-half));for(const Rr of net.reaches)for(const p of Rr.stations)best=Math.min(best,box(p.x,p.z)-p.w/2);for(const L of net.lakes)for(const [x,z] of L.outline)best=Math.min(best,box(x,z));return best}

// Three.js vrstva. T = modul three. Pozice v km relativně ke kotvě údolí jako valley-nature.js (plovoucí počátek).
export function installValleyWater(T,scene,{mist=true}={}){
 const root=new T.Group(),anchorDir=valleyDirection(0,0),anchor=anchorDir.map(x=>x*PLANET.radiusKm);root.name='valley-water';scene.add(root);
 // Materiál: procedurální voda (water-material.js); barvy oblohy sdílené s planet-atmosphere.js, světla ze scény.
 const U=createWaterUniforms(T),skyLinked=linkSkyUniforms(scene,U),materials={},unit=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)};
 const east0=unit(valleyDirection(1,0).map((v,k)=>v-anchorDir[k])),north0=unit(valleyDirection(0,1).map((v,k)=>v-anchorDir[k]));U.wEast.value.set(...east0);U.wNorth.value.set(...north0);
 let sunLight=null,hemiLight=null;const findLights=()=>scene.traverse(o=>{if(o.isDirectionalLight&&!sunLight)sunLight=o;if(o.isHemisphereLight&&!hemiLight)hemiLight=o});findLights();
 const materialFor=q=>materials[q]||(materials[q]=createWaterMaterial(T,U,q));
 const meshes={},mists=[];let enabled=true,mistEnabled=!!mist,current=null,stats={vertices:0,triangles:0,particles:0,drawCalls:0};const t0=performance.now();
 const landAlbedo=new T.Color(0x67875a),tmp=new T.Color(),tmp2=new T.Color();
 function geometry(quality){const d=buildWaterMeshData({quality}),n=d.vertexCount,pos=new Float32Array(n*3),nor=new Float32Array(n*3),flow=new Float32Array(n*3),col=new Float32Array(n*3),uv=new Float32Array(n*2),b=base();
  const shallow=new T.Color(0x86cbbb),deep=new T.Color(0x2c7383),fall=new T.Color(0xd6ecea),c=new T.Color();
  for(let i=0;i<n;i++){const x=d.x[i],z=d.z[i],dir=valleyDirection(x,z),rk=(R+b+d.h[i])/1000,e1=valleyDirection(x+1,z),n1=valleyDirection(x,z+1),east=e1.map((v,k)=>v-dir[k]),north=n1.map((v,k)=>v-dir[k]),le=Math.hypot(...east),ln=Math.hypot(...north);
   for(let k=0;k<3;k++){pos[i*3+k]=dir[k]*rk-anchor[k];const fx=east[k]/le*d.dirX[i]+north[k]/ln*d.dirZ[i]+dir[k]*d.dirY[i];flow[i*3+k]=fx;nor[i*3+k]=d.kind[i]===WATER_KIND.waterfall?east[k]/le*d.dirX[i]+north[k]/ln*d.dirZ[i]:dir[k]}
   uv[i*2]=d.u[i];uv[i*2+1]=d.v[i];
   if(d.kind[i]===WATER_KIND.waterfall)c.copy(fall);else c.copy(shallow).lerp(deep,1-Math.exp(-d.depth[i]/1.6));c.lerp(fall,d.foam[i]*.45);col.set([c.r,c.g,c.b],i*3)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(col,3));
  g.setAttribute('flowDirection',new T.BufferAttribute(flow,3));for(const [name,key] of [['flowSpeed','speed'],['waterDepth','depth'],['shoreDistance','shore'],['waterKind','kind'],['foam','foam']])g.setAttribute(name,new T.BufferAttribute(Float32Array.from(d[key]),1));
  g.setIndex(n>65535?new T.BufferAttribute(Uint32Array.from(d.indices),1):new T.BufferAttribute(Uint16Array.from(d.indices),1));g.computeBoundingSphere();
  const mesh=new T.Mesh(g,materialFor(quality));mesh.name='valley-water-'+quality;mesh.frustumCulled=true;mesh.renderOrder=2;mesh.receiveShadow=quality==='high';mesh.userData={parts:d.parts,vertices:n,triangles:d.triangleCount};return mesh}
 // Sprška u paty vodopádů – jen vysoká kvalita (jeden draw call Points na vodopád).
 function buildMists(){const net=valleyWaterNetwork(),b=base();for(const W of net.waterfalls){const x=W.x+W.dirX*W.throwMeters,z=W.z+W.dirZ*W.throwMeters,dir=valleyDirection(x,z),rk=(R+b+W.bottom)/1000,e=unit(valleyDirection(x+1,z).map((v,k)=>v-dir[k])),nn=unit(valleyDirection(x,z+1).map((v,k)=>v-dir[k]));
  const m=createWaterfallMist(T,{origin:dir.map((v,k)=>v*rk-anchor[k]),up:dir,flow:unit(e.map((v,k)=>v*W.dirX+nn[k]*W.dirZ)),count:90});root.add(m.points);mists.push(m)}}
 function refreshStats(quality){const m=meshes[quality],showMist=quality==='high'&&mistEnabled;stats={vertices:m.userData.vertices,triangles:m.userData.triangles,particles:showMist?mists.reduce((s,x)=>s+x.count,0):0,drawCalls:1+(showMist?mists.length:0)}}
 // position: jednotkový směr pozorovatele; origin: plovoucí počátek (km). Viditelnost = stejné pravidlo jako vegetace.
 function update(position,origin,high,walking){root.visible=enabled&&valleyLayerVisible(position,origin,walking);if(!root.visible)return;
  const quality=high?'high':'mobile';if(!meshes[quality]){meshes[quality]=geometry(quality);root.add(meshes[quality])}if(high&&mistEnabled&&!mists.length)buildMists();
  if(current!==quality){for(const [k,m] of Object.entries(meshes))m.visible=k===quality;current=quality}
  for(const m of mists)m.points.visible=high&&mistEnabled;refreshStats(quality);
  const t=((performance.now()-t0)/1000)%3600;U.wTime.value=t;for(const m of mists)m.uniforms.mTime.value=t;
  // Barva svahů v odrazu a osvětlení spršky podle aktuálních světel (den/noc z planet-atmosphere.js).
  if(!sunLight||!hemiLight)findLights();
  if(sunLight&&hemiLight){tmp.copy(hemiLight.color).multiplyScalar(hemiLight.intensity*.35).add(tmp2.copy(sunLight.color).multiplyScalar(sunLight.intensity*.3));U.wLand.value.copy(landAlbedo).multiply(tmp);
   tmp.copy(hemiLight.color).multiplyScalar(hemiLight.intensity*.6).add(tmp2.copy(sunLight.color).multiplyScalar(sunLight.intensity*.3));for(const m of mists)m.material.color.copy(tmp)}
  root.position.set(...anchor.map((x,i)=>x-origin[i]))}
 return {update,setEnabled(v){enabled=!!v;root.visible=enabled&&root.visible},setMistEnabled(v){mistEnabled=!!v},get enabled(){return enabled},get stats(){return root.visible?stats:{vertices:0,triangles:0,particles:0,drawCalls:0}},get material(){return materials[current||'high']||materialFor('high')},materials,uniforms:U,skyLinked,root,attributes:WATER_ATTRIBUTES,network:()=>valleyWaterNetwork()};
}
