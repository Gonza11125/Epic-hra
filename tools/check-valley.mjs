import assert from 'node:assert/strict';
import fs from 'node:fs';
import {valleyLandscape,valleyDirection,valleyCoordinates,VALLEY_POINTS,VALLEY_ROUTES,valleyManifest} from '../elyra-geography.js';
import {surfaceSample,valleyPointInfo} from '../elyra-geography.js';
import {BASIN_APPROACH,BASIN_POINTS,basinRelief,basinTrailDistance} from '../northern-basin.js';
import {collectFlora,blockedByFlora} from '../valley-flora.js';
import {valleyWater,waterTriangles} from '../valley-waters.js';
import {readExplorer,writeExplorer} from '../explorer-save.js';
import {freshState,writeState,readState} from '../universe.js';

const dir=new URL('../Unreal/Nexus/Content/FieldData/',import.meta.url);
const grid=fs.readFileSync(new URL('Ground.bin',dir)),scene=JSON.parse(fs.readFileSync(new URL('Scene.json',dir)));
assert.equal(grid.length,scene.rows*scene.columns*4);
assert.deepEqual(scene.points,VALLEY_POINTS);assert.deepEqual(scene.routes,VALLEY_ROUTES);
assert.equal(scene.baseElevationMeters,valleyManifest().baseElevationMeters);
assert.equal(scene.radiusM,1737400);assert.equal(scene.seed,61201);
let maxError=0,min=Infinity,max=-Infinity;
for(let j=0;j<scene.rows;j++) for(let i=0;i<scene.columns;i++){
  const east=i*10-1250,north=j*10-1750,p=valleyLandscape(east,north);
  const off=(j*scene.columns+i)*4,h=grid.readInt16LE(off)/10;
  maxError=Math.max(maxError,Math.abs(h-p.heightMeters));min=Math.min(min,h);max=Math.max(max,h);
  assert.equal(grid[off+2],Math.round(p.rock*255));assert.equal(grid[off+3],Math.round(p.trail*255));
}
assert.ok(maxError<=.0500001);
for(const p of scene.points){const {x,z}=valleyCoordinates(valleyDirection(p.x,p.z));assert.ok(Math.hypot(x-p.x,z-p.z)<1e-6);}
assert.deepEqual(scene.water, waterTriangles());
for(let i=0;i<scene.water.length;i+=3){
  const [a,b,c]=scene.water.slice(i,i+3);
  const twiceArea=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  assert.ok(twiceArea>=-1e-6);
  for(const p of [a,b,c]){assert.ok(p.every(Number.isFinite));assert.ok(p[2]>17&&p[2]<29)}
}
for(const [e,n] of [[0,0],[-660,-420],[640,520],[15,-1350],[-35,1450]])assert.equal(valleyWater(e,n),null);
for(const r of scene.routes)for(let k=1;k<r.points.length;k++){
  const [a,b]=r.points.slice(k-1,k+1);
  for(let t=0;t<=1;t+=.01)assert.equal(valleyWater(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t),null);
}
const channel=[[350,-90],[294,-125],[249,-163],[216,-178],[182,-198],[160,-242],[139,-305]];
let previous=Infinity;
for(let k=1;k<channel.length;k++){
  const [a,b]=channel.slice(k-1,k+1);
  for(let i=0;i<=100;i++){
    const t=i/100,e=a[0]+t*(b[0]-a[0]),n=a[1]+t*(b[1]-a[1]),w=valleyWater(e,n);
    assert.ok(w.edge>0);assert.ok(w.level<=previous+1e-6);previous=w.level;
    assert.ok(valleyLandscape(e,n).heightMeters<w.level);
  }
}
assert.equal(Object.keys(scene.shapes).length,9);
for(const val of Object.values(scene.shapes)){const bytes=Buffer.from(val,'base64');assert.ok(bytes.length>0&&bytes.length%27===0);}
for(const [id,e,n] of scene.placements){assert.ok(id in scene.shapes);assert.ok((valleyWater(e,n)?.edge??-100)<0);}
const storage={data:new Map(),getItem(k){return this.data.get(k)??null},setItem(k,v){this.data.set(k,v)}};
const old=freshState();old.stage=2;assert.ok(writeState(storage,old));
assert.ok(writeExplorer(storage,[1,0,0],[0,0,1],9,true));assert.equal(readState(storage).stage,2);assert.equal(readExplorer(storage).pitch,9);
storage.setItem('nexus-elyra-explorer-v1','{');assert.equal(readExplorer(storage),null);assert.equal(readState(storage).stage,2);
console.log(`${scene.rows*scene.columns} terrain samples, max. error ${maxError.toFixed(4)} m, relief ${(max-min).toFixed(1)} m, ${scene.water.length/3} water triangles, ${scene.placements.length} instances. Hydrography, routes, transforms and save isolation passed.`);

const height=(x,z)=>surfaceSample(valleyDirection(x,z)).surfaceElevationKm*1000;
const [pass,floor]=BASIN_POINTS.map(p=>height(p.x,p.z));
assert.ok(pass-floor>55);
assert.ok(height(-500,3400)>floor+180 && height(720,3410)>floor+180);
for(const [x,z,dx,dz] of [[-1140,3410,1,0],[1450,3410,-1,0],[95,2050,0,1],[95,4710,0,-1]]){
  assert.equal(basinRelief(x,z),null);
  assert.ok(Math.abs(basinRelief(x+dx,z+dz).delta)<.01);
}
let distance=0,maxGrade=0;
for(let k=1;k<BASIN_APPROACH.length;k++){
  const [a,b]=BASIN_APPROACH.slice(k-1,k+1),dx=b[0]-a[0],dz=b[1]-a[1];
  const length=Math.hypot(dx,dz),steps=Math.ceil(length/4);
  let prev=height(...a);
  for(let i=1;i<=steps;i++){
    const x=a[0]+dx*i/steps,z=a[1]+dz*i/steps,h=height(x,z);
    assert.ok(valleyPointInfo(valleyDirection(x,z)).trail>.99);
    assert.ok(!blockedByFlora(x,z));assert.ok(h>0);
    maxGrade=Math.max(maxGrade,Math.abs(h-prev)*steps/length);prev=h;
  }
  distance+=length;
}
assert.ok(distance>2100 && distance<2300 && maxGrade<.25);
const alpine=collectFlora(95,3410);
assert.ok(alpine.some(p=>p.id==='spire') && alpine.some(p=>p.id==='boulder'));
assert.ok(alpine.every(p=>basinTrailDistance(p.x,p.z)>4));
console.log(`Northern route ${distance.toFixed(0)} m, maximum grade ${(100*maxGrade).toFixed(1)}%, pass ${(pass-floor).toFixed(0)} m above floor. Bounds, terrain, obstacles and trail checked.`);
