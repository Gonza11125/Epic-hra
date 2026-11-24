// Radial locomotion on Elyra. SI units for motion; unit vectors for global position.
// Gameplay gravity is the existing fictional 0.96g, not inferred from radius.
import {PLANET,normalize,sample,greatCircleStep,tilePoint,surfaceRadiusMeters} from './elyra-geography.js?v=2';
export const WALK={gravity:9.414384,eyeMeters:1.68,walkMps:1.8,runMps:5.2,jumpMps:4.4};
const R=PLANET.radiusKm*1000,dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function tangentAt(p,t){p=normalize(p);const d=dot(p,t),v=t.map((x,i)=>x-d*p[i]);if(Math.hypot(...v)<1e-10)return normalize(cross(Math.abs(p[1])<.9?[0,1,0]:[1,0,0],p));return normalize(v)}
export function gravityVector(p,heightMeters=0){const r=Math.max(1,R+heightMeters),g=WALK.gravity*(R/r)**2;return normalize(p).map(x=>-x*g)}
export function createWalker(position,tangent){const p=normalize(position);return {position:p,tangent:tangentAt(p,tangent),offsetMeters:0,verticalMps:0,grounded:true,travelledMeters:0}}
export function stepWalker(state,{dt,move=0,strafe=0,run=false,jump=false,groundRadius=p=>surfaceRadiusMeters(p),canMove=p=>sample(p).elevationKm>0}){
 dt=Math.min(.1,Math.max(0,dt));if(!dt)return state;const p=state.position,t=tangentAt(p,state.tangent),right=normalize(cross(t,p));const mag=Math.hypot(move,strafe),speed=run?WALK.runMps:WALK.walkMps;
 if(mag>0){const v=normalize(t.map((x,i)=>x*move+right[i]*strafe)),meters=Math.min(1,mag)*speed*dt;const next=greatCircleStep(p,v,meters/1000).position;
 if(canMove(next)){const prevRadius=groundRadius(p),nextRadius=groundRadius(next);
 // Parallel transport original heading along the geodesic. Prevent steep steps.
 if(Math.abs(nextRadius-prevRadius)<Math.max(.35,meters*1.4)){const axis=normalize(cross(p,v)),angle=meters/R,rot=t.map((x,i)=>x*Math.cos(angle)+cross(axis,t)[i]*Math.sin(angle)+axis[i]*dot(axis,t)*(1-Math.cos(angle)));state.position=next;state.tangent=tangentAt(next,rot);state.travelledMeters+=meters;
 if(!state.grounded)state.offsetMeters+=prevRadius-nextRadius;}}}
 if(jump&&state.grounded){state.verticalMps=WALK.jumpMps;state.grounded=false}
 if(!state.grounded){const g=Math.hypot(...gravityVector(state.position,groundRadius(state.position)-R+state.offsetMeters));state.offsetMeters+=state.verticalMps*dt-.5*g*dt*dt;state.verticalMps-=g*dt;if(state.offsetMeters<=0&&state.verticalMps<=0){state.offsetMeters=0;state.verticalMps=0;state.grounded=true}}
 return state;
}
// Inverse cube-face coordinates; matches cubeDirection on all six faces.
export function faceUV(p){const [x,y,z]=normalize(p),a=Math.abs(x),b=Math.abs(y),c=Math.abs(z);if(a>=b&&a>=c)return x>=0?{face:0,u:-z/a,v:y/a}:{face:1,u:z/a,v:y/a};if(b>=c)return y>=0?{face:2,u:x/b,v:-z/b}:{face:3,u:x/b,v:z/b};return z>=0?{face:4,u:x/c,v:y/c}:{face:5,u:-x/c,v:y/c}}
export function findTile(p,tiles){const q=faceUV(p);let best=null;for(const t of tiles){if(t.face!==q.face)continue;const n=2**t.level,x=(q.u+1)*n/2-t.x,y=(q.v+1)*n/2-t.y;if(x>=-1e-9&&x<=1+1e-9&&y>=-1e-9&&y<=1+1e-9&&(!best||t.level>best.tile.level))best={tile:t,u:Math.max(0,Math.min(1,x)),v:Math.max(0,Math.min(1,y))}}return best}
// Ray intersection with exact triangles of the visible, non-skirt terrain grid.
// Use the same clamped sea-level vertex elevations as the renderer.
export function meshGroundRadius(p,hit,resolution=12){if(!hit)return surfaceRadiusMeters(p);const {tile:t,u,v}=hit,n=resolution,i=Math.min(n-1,Math.floor(u*n)),j=Math.min(n-1,Math.floor(v*n)),a=u*n-i,b=v*n-j;
 const vertex=(x,y)=>{const q=tilePoint(t.face,t.level,t.x,t.y,x/n,y/n),r=surfaceRadiusMeters(q);return q.map(x=>x*r)};
 const corners=a+b<=1?[[i,j],[i+1,j],[i,j+1]]:[[i+1,j],[i+1,j+1],[i,j+1]],vs=corners.map(([x,y])=>vertex(x,y)),e1=vs[1].map((x,k)=>x-vs[0][k]),e2=vs[2].map((x,k)=>x-vs[0][k]),normal=cross(e1,e2),den=dot(normal,p);return Math.abs(den)>1e-15?dot(normal,vs[0])/den:surfaceRadiusMeters(p);
}
