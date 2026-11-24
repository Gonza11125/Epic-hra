// Engine-independent adaptive cube sphere selector and bounded incremental cache.
import {PLANET,tilePoint,normalize,terrainTile,surfaceRadiusMeters} from './elyra-geography.js?v=2';
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
 const metrics=new Map();function score(t){const k=key(t);if(!metrics.has(k))metrics.set(k,tileMetric(t,observer,heightKm).priority);return metrics.get(k)}
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
 const n=resolution+1,edges=[Array.from({length:n},(_,i)=>i),Array.from({length:n},(_,i)=>i*n+n-1),Array.from({length:n},(_,i)=>n*n-1-i),Array.from({length:n},(_,i)=>(n-1-i)*n)];
 const span=tileMetric(t,tilePoint(t.face,t.level,t.x,t.y,.5,.5),1).span;
 const depth=Math.max(3,span*1000*.025,span*span*1000/(R*8));
 for(const edge of edges){const base=positions.length/3;for(const i of edge){const normal=radial.slice(i*3,i*3+3);positions.push(...normal.map((x,k)=>positions[i*3+k]-depth*x));normals.push(...normals.slice(i*3,i*3+3));biomes.push(biomes[i])}
 for(let j=0;j<edge.length-1;j++){const a=edge[j],b=edge[j+1],c=base+j,d=c+1;indices.push(a,c,b,b,c,d)}}
 return {originMeters,positions,normals,radial,biomes,indices,skirtDepthMeters:depth};
}
export class TileStream{
 constructor({build,dispose=()=>{},maxCache=240}){this.build=build;this.dispose=dispose;this.maxCache=maxCache;this.cache=new Map();this.active=new Set();this.desired=new Map();this.queue=[]}
 request(tiles){this.desired=new Map(tiles.map(t=>[key(t),t]));this.queue=[...this.desired].filter(([k])=>!this.cache.has(k));this.commit()}
 commit(){if([...this.desired.keys()].some(k=>!this.cache.has(k)))return false;this.active=new Set(this.desired.keys());this.trim();return true}
 tick(limit=2){for(let i=0;i<limit&&this.queue.length;i++){const [k,t]=this.queue.shift();if(!this.cache.has(k))this.cache.set(k,this.build(t))}this.commit();this.trim()}
 trim(){for(const [k,v] of this.cache){if(this.cache.size<=this.maxCache)break;if(!this.active.has(k)&&!this.desired.has(k)){this.cache.delete(k);this.dispose(v)}}}
 get pending(){return this.queue.length}
}
