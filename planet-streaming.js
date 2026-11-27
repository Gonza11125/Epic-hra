// Engine-independent adaptive cube sphere selector and bounded incremental cache.
import {PLANET,tilePoint,normalize,terrainTile,surfaceRadiusMeters,valleyCoordinates,valleyPointInfo} from './elyra-geography.js?v=4';
export const key=t=>[t.face,t.level,t.x,t.y].join('/');
const R=PLANET.radiusKm;
export function tileMetric(t,observer,heightKm){
 const center=tilePoint(t.face,t.level,t.x,t.y,.5,.5),corners=[[0,0],[1,0],[0,1],[1,1]].map(([u,v])=>tilePoint(t.face,t.level,t.x,t.y,u,v));
 const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]))*R;
 const span=Math.max(...corners.map(v=>distance(v,center)))*2;
 const chord=distance(center,observer),near=Math.max(0,chord-span*.58),range=Math.hypot(near,Math.max(.001,heightKm));
 return {span,priority:span/range};
}
export function selectTiles(observer,heightKm,{budget=126,maxLevel=12,threshold=.8}={}){
 observer=normalize(observer);budget=Math.max(6,Math.floor(budget));const leaves=Array.from({length:6},(_,face)=>({face,level:0,x:0,y:0}));
 const regional=heightKm<3&&Math.hypot(...Object.values(valleyCoordinates(observer)))<6500;const metrics=new Map();function score(t){const k=key(t);if(!metrics.has(k)){const m=tileMetric(t,observer,heightKm);let priority=m.priority;if(regional){const q=valleyCoordinates(tilePoint(t.face,t.level,t.x,t.y,.5,.5)),d=Math.hypot(q.x,q.z);if(d<m.span*600+3000&&m.span>.28)priority=Math.max(priority,1.05+Math.min(1.8,m.span/3));}metrics.set(k,priority)}return metrics.get(k)}
 while(leaves.length+3<=budget){let best=-1,value=threshold;for(let i=0;i<leaves.length;i++){const t=leaves[i],s=score(t);if(t.level<maxLevel&&s>value){best=i;value=s}}if(best<0)break;
 const t=leaves[best],level=t.level+1,x=t.x*2,y=t.y*2;leaves.splice(best,1,...[[0,0],[1,0],[0,1],[1,1]].map(([a,b])=>({face:t.face,level,x:x+a,y:y+b})))}
 return leaves;
}
export function buildSurfaceTile(t,resolution=12){
 const raw=terrainTile(t.face,t.level,t.x,t.y,resolution),{originMeters}=raw,positions=[],normals=[],biomes=raw.biomes.slice(),indices=raw.indices.slice();
 // Render oceans at sea level rather than exposed ocean floor.
 for(let i=0;i<raw.biomes.length;i++){const n=raw.radialNormals.slice(i*3,i*3+3),r=surfaceRadiusMeters(n);positions.push(...n.map((x,k)=>x*r-originMeters[k]));normals.push(...n)}
 // Compute outward surface normals before adding skirts, so slopes catch light.
 const acc=new Float64Array(positions.length);
 for(let k=0;k<indices.length;k+=3){const [a,b,c]=indices.slice(k,k+3).map(i=>i*3),ux=positions[b]-positions[a],uy=positions[b+1]-positions[a+1],uz=positions[b+2]-positions[a+2],vx=positions[c]-positions[a],vy=positions[c+1]-positions[a+1],vz=positions[c+2]-positions[a+2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const i of [a,b,c]){acc[i]+=nx;acc[i+1]+=ny;acc[i+2]+=nz}}
 const radial=normals.slice();for(let i=0;i<normals.length;i+=3){const l=Math.hypot(acc[i],acc[i+1],acc[i+2]);if(l>1e-10){const sign=acc[i]*radial[i]+acc[i+1]*radial[i+1]+acc[i+2]*radial[i+2]>=0?1:-1;for(let k=0;k<3;k++)normals[i+k]=acc[i+k]/l*sign}}
 // Vertical skirts conceal differences in edge sampling between LOD levels.
 // Not exact mixed-LOD stitching. Actual shared edge vertices remain unchanged.
 // 0.1.4.7 (dashed seams): with MSAA + logarithmic depth (gl_FragDepth is evaluated once per pixel at its
 // centre), a skirt wall extrapolated above the shared edge got a nearer depth than the neighbouring surface
 // and won the edge samples; with DoubleSide its back face was lit with a flipped normal -> dark dashes.
 // Fix: skirts own duplicated top vertices (vertex index >= skirtStart), so the renderer can bias their
 // depth back (terrainSkirt attribute) and render the terrain FrontSide; skirts are wound both ways.
 // The surface grid (first (resolution+1)^2 vertices, first resolution^2*6 indices) is unchanged.
 const n=resolution+1,edges=[Array.from({length:n},(_,i)=>i),Array.from({length:n},(_,i)=>i*n+n-1),Array.from({length:n},(_,i)=>n*n-1-i),Array.from({length:n},(_,i)=>(n-1-i)*n)];
 const span=tileMetric(t,tilePoint(t.face,t.level,t.x,t.y,.5,.5),1).span;
 const depth=Math.max(3,span*1000*.025,span*span*1000/(R*8)),skirtStart=positions.length/3,source=[];
 const regional=Array.from({length:skirtStart},(_,i)=>valleyPointInfo(radial.slice(i*3,i*3+3)));
 for(const edge of edges){const base=positions.length/3;
 for(const drop of [0,depth])for(const i of edge){const normal=radial.slice(i*3,i*3+3);positions.push(...normal.map((x,k)=>positions[i*3+k]-drop*x));normals.push(...normals.slice(i*3,i*3+3));radial.push(...normal);biomes.push(biomes[i]);regional.push(regional[i]);source.push(i)}
 for(let j=0;j<edge.length-1;j++){const a=base+j,b=a+1,c=base+n+j,d=c+1;indices.push(a,c,b,b,c,d,a,b,c,b,d,c)}}
 return {originMeters,positions,normals,radial,biomes,indices,regional,skirtStart,skirtSource:source,skirtDepthMeters:depth};
}
// Quadtree helpers for the cube-sphere tiles.
export const parentTile=t=>({face:t.face,level:t.level-1,x:t.x>>1,y:t.y>>1});
export const childTiles=t=>[[0,0],[1,0],[0,1],[1,1]].map(([a,b])=>({face:t.face,level:t.level+1,x:t.x*2+a,y:t.y*2+b}));
const ROOTS=Array.from({length:6},(_,face)=>({face,level:0,x:0,y:0}));
const clock=()=>globalThis.performance?performance.now():Date.now();
// Bounded incremental tile cache.
// progressive=true (default): the displayed set always is a hole-free, non-overlapping cover of the
// sphere. A region switches from old tiles to newer ones only when every tile replacing it is built;
// the queue also builds the intermediate ancestors of the requested leaves coarse-to-fine, so LOD grows
// smoothly (a parent is replaced as soon as its 4 children are ready). progressive=false keeps the
// original all-or-nothing commit. tick() builds either a fixed number of tiles or within a time budget.
export class TileStream{
 constructor({build,dispose=()=>{},maxCache=240,progressive=true,now=clock}){this.build=build;this.dispose=dispose;this.maxCache=maxCache;this.progressive=progressive;this.now=now;this.cache=new Map();this.active=new Set();this.desired=new Map();this.internal=new Map();this.queue=[];this.requested=0;this.lastBuildMs=0;this.cover=false}
 request(tiles,{focus=null}={}){this.desired=new Map(tiles.map(t=>[key(t),t]));this.internal=new Map();
  // Progressive mode needs the request to be an exact quadtree cover of the sphere; otherwise all-or-nothing.
  let area=0,overlap=false;for(const t of this.desired.values()){area+=4**-t.level;let p=t;while(p.level>0){p=parentTile(p);const k=key(p);if(this.desired.has(k)){overlap=true;break}if(this.internal.has(k))break;this.internal.set(k,p)}}
  this.cover=this.progressive&&!overlap&&Math.abs(area-6)<1e-9;if(!this.cover)this.internal=new Map();
  const centre=t=>focus?Math.hypot(...tilePoint(t.face,t.level,t.x,t.y,.5,.5).map((x,i)=>x-focus[i])):0;
  this.queue=[...this.internal,...this.desired].filter(([k])=>!this.cache.has(k)).map(([k,t])=>[k,t,centre(t)]);
  if(this.cover)this.queue.sort((a,b)=>a[1].level-b[1].level||a[2]-b[2]);
  this.requested=this.queue.length;this.commit()}
 // Display set for node n (array of tiles covering exactly n) or null if n cannot be covered yet.
 resolve(n,oldAnc){const k=key(n);
  if(this.desired.has(k))return this.cache.has(k)?[n]:this.oldCover(n,oldAnc);
  if(this.internal.has(k)){const kids=childTiles(n).map(c=>this.resolve(c,oldAnc));if(kids.every(Boolean))return kids.flat()}
  const old=this.oldCover(n,oldAnc);if(old)return old;
  return this.cache.has(k)?[n]:null}
 // Old active tiles lying strictly inside n (they cover n exactly, because the active set is a cover).
 oldCover(n,oldAnc){if(!oldAnc.has(key(n)))return null;const out=[];for(const c of childTiles(n)){const k=key(c);if(this.active.has(k))out.push(c);else{const sub=this.oldCover(c,oldAnc);if(!sub)return null;out.push(...sub)}}return out}
 commit(){const full=[...this.desired.keys()].every(k=>this.cache.has(k));let next=null;
  if(!this.cover){if(full)next=[...this.desired.keys()]}
  else{const oldAnc=new Set();for(const k of this.active){const [face,level,x,y]=k.split('/').map(Number);let p={face,level,x,y};while(p.level>0){p=parentTile(p);const pk=key(p);if(oldAnc.has(pk))break;oldAnc.add(pk)}}
   const parts=ROOTS.map(r=>this.resolve(r,oldAnc));if(parts.every(Boolean))next=parts.flat().map(key)}
  if(next&&(next.length!==this.active.size||next.some(k=>!this.active.has(k))))this.active=new Set(next);
  this.trim();return full&&this.active.size===this.desired.size}
 // Build up to `limit` tiles; with budgetMs>0 stop once the frame budget is spent (at least one tile is built).
 tick(limit=2,{budgetMs=0}={}){const t0=this.now();let built=0;
  while(built<limit&&this.queue.length){if(budgetMs>0&&built>0&&this.now()-t0>=budgetMs)break;const [k,t]=this.queue.shift();if(this.cache.has(k))continue;
   if(this.internal.has(k)&&childTiles(t).every(c=>this.cache.has(key(c))))continue;
   const b0=this.now();this.cache.set(k,this.build(t));this.lastBuildMs=this.now()-b0;built++}
  if(built)this.commit();return built}
 trim(){const keep=k=>this.active.has(k)||this.desired.has(k)||(this.queue.length&&this.internal.has(k))||k.split('/')[1]==='0';
  for(const [k,v] of this.cache){if(this.cache.size<=this.maxCache)break;if(!keep(k)){this.cache.delete(k);this.dispose(v)}}}
 get pending(){return this.queue.length}
 // Fraction of the current request already built (1 when nothing is pending).
 get progress(){return this.requested?1-this.queue.length/this.requested:1}
}
