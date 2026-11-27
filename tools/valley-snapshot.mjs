// Referenční vzorky geografie Elyry a Údolí 07 (výšky, biomy, osady, flóra) pro porovnání před/po změně reliéfu.
// Použití: node tools/valley-snapshot.mjs <out.json>      (bez prohlížeče, čisté ES moduly)
import fs from 'fs';
import {LOCATIONS,sample,surfaceSample,direction,valleyDirection,valleyLandscape,valleyManifest,VALLEY_POINTS,VALLEY_ROUTES} from '../elyra-geography.js?v=4';
import {collectFlora} from '../valley-flora.js?v=01470';
const base=valleyManifest().baseElevationMeters,r=(v,d=4)=>+v.toFixed(d);
const surfaceM=(x,z)=>surfaceSample(valleyDirection(x,z)).surfaceElevationKm*1000-base;
const out={schema:1,created:'tools/valley-snapshot.mjs',baseElevationMeters:base,
 locations:LOCATIONS.map(l=>({id:l.id,lat:r(l.lat,9),lon:r(l.lon,9),biome:l.biome})),global:[],valley:{step:50,x0:-2200,z0:-2700,nx:89,nz:109,h:[]},points:[],routes:[],flora:[]};
for(let lat=-80;lat<=80;lat+=4)for(let lon=-180;lon<180;lon+=4){const v=direction(lat,lon),s=sample(v),q=surfaceSample(v);out.global.push([lat,lon,s.biome,s.civilization,r(s.elevationKm,7),r(q.surfaceElevationKm,7)])}
for(let j=0;j<out.valley.nz;j++)for(let i=0;i<out.valley.nx;i++)out.valley.h.push(r(surfaceM(out.valley.x0+i*50,out.valley.z0+j*50)));
for(const p of VALLEY_POINTS){const v=valleyLandscape(p.x,p.z);out.points.push({id:p.id,x:p.x,z:p.z,h:r(surfaceM(p.x,p.z)),zone:v.zone})}
for(const route of VALLEY_ROUTES){const pts=[];for(let i=1;i<route.points.length;i++){const [a,b]=route.points[i-1],[c,d]=route.points[i],n=Math.ceil(Math.hypot(c-a,d-b)/10);for(let k=0;k<n;k++){const t=k/n,x=a+(c-a)*t,z=b+(d-b)*t;pts.push([r(x,2),r(z,2),r(surfaceM(x,z))])}}out.routes.push({id:route.id,samples:pts})}
// Kandidáti flóry: klíč pásmo:i:j a druh (poloha z klíče je deterministická). Mobilní dosahy, bez limitů počtu.
for(const [x,z] of [[0,0],[620,900],[180,1300],[-40,1720]]){const items=collectFlora(x,z,{radii:[750,170,65],caps:[1e6,1e6,1e6]});out.flora.push({x,z,items:items.map(p=>p.key+'|'+p.id).sort()})}
fs.writeFileSync(process.argv[2]||'valley-snapshot.json',JSON.stringify(out));
console.log('global',out.global.length,'valley',out.valley.h.length,'routes',out.routes.reduce((s,x)=>s+x.samples.length,0),'flora',out.flora.reduce((s,f)=>s+f.items.length,0));
