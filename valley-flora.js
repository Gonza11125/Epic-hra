import {basinRelief,basinTrailDistance,BASIN_POINTS} from './northern-basin.js';
import {valleyWater} from './valley-waters.js';
// Deterministic flora and rock placement for Valley 07, metres in its east/north frame.
import {valleyLandscape,VALLEY_POINTS,VALLEY_ROUTES} from './elyra-geography.js?v=3';
export const SPECIES=[
 {id:'aurora',name:'Aurora – deštníkovník',height:13,radius:5.3,solid:.55,band:0},
 {id:'spire',name:'Spire – jehlicový věžník',height:17,radius:2.4,solid:.48,band:0},
 {id:'veil',name:'Veil – vějířovec',height:8,radius:3.7,solid:.35,band:0},
 {id:'boulder',name:'Čedičový balvan',height:2.8,radius:2.1,solid:1.45,band:0},
 {id:'shrub',name:'Stříbrný keř',height:1.5,radius:1.2,solid:0,band:1},
 {id:'fern',name:'Spirálová kapradina',height:1.8,radius:1.25,solid:0,band:1},
 {id:'fungi',name:'Luminové houby',height:.65,radius:.7,solid:0,band:1},
 {id:'slab',name:'Vrstevnatá skála',height:1.4,radius:1.4,solid:.8,band:1},
 {id:'grass',name:'Azurová tráva',height:.52,radius:.56,solid:0,band:2}];
const byId=Object.fromEntries(SPECIES.map(s=>[s.id,s])),steps=[22,8,2.8];
function hash(x,z,seed){let n=Math.imul(x,374761393)^Math.imul(z,668265263)^Math.imul(seed,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295}
function seg(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
export function clearance(x,z,r=0){if((valleyWater(x,z)?.edge??-Infinity)>-r)return false;if(Math.abs(x)<128+r&&Math.abs(z)<128+r)return false;for(const p of VALLEY_POINTS)if(Math.hypot(x-p.x,z-p.z)<9+r)return false;for(const route of VALLEY_ROUTES)for(let i=1;i<route.points.length;i++)if(seg(x,z,route.points[i-1],route.points[i])<route.width/2+3+r)return false;return true}
export function candidate(band,i,j){const step=steps[band],n=seed=>hash(i,j,seed+band*113),x=(i+.13+.74*n(1))*step,z=(j+.13+.74*n(2))*step;const scale=.68+n(5)*.72;
 function placement(id){const s=byId[id];return {id,x,z,scale,yaw:n(6)*Math.PI*2,tint:.82+n(7)*.29,solid:s.solid*scale,band,key:band+':'+i+':'+j}}
 if(z>1740){
   const basin=basinRelief(x,z);
   if(!basin)return null;
   const r=n(4),rock=basin.rock;
   const id=band===0?(rock>.45||r<.64?'boulder':'spire'):band===1?(rock>.42||r<.34?'slab':'shrub'):'grass';
   const density=band===0?.28:band===1?.4:.48*(1-rock);
   if(n(3)>density*basin.weight)return null;
   const radius=byId[id].radius*scale;
   if(basinTrailDistance(x,z)<4+radius||BASIN_POINTS.some(p=>Math.hypot(x-p.x,z-p.z)<8+radius))return null;
   return placement(id);
 }
 if(Math.abs(x)>1240||z< -1740)return null;
 const v=valleyLandscape(x,z),slope=Math.hypot(valleyLandscape(x+1,z).heightMeters-valleyLandscape(x-1,z).heightMeters,valleyLandscape(x,z+1).heightMeters-valleyLandscape(x,z-1).heightMeters)/2;let id,prob;
 const grove=.5+.25*Math.sin(x/83+Math.sin(z/90))+.25*Math.cos(z/137-x/178),r=n(4);
 if(band===0){prob=.16+grove*.58;if(v.rock>.52||slope>.55){id=r<.78?'boulder':'spire';prob=.32+v.rock*.38}else{id=r<.45?'aurora':r<.76?'spire':r<.92?'veil':'boulder'}}
 else if(band===1){prob=.30+grove*.3;id=v.rock>.55?'slab':r<.45?'shrub':r<.78?'fern':r<.91?'fungi':'slab'}
 else{prob=.72*(1-v.rock);id='grass'}
 if(n(3)>prob||(slope>1.15&&id!=='boulder'&&id!=='slab'))return null;
 if(!clearance(x,z,byId[id].radius*scale))return null;
 return placement(id);
}
export function collectFlora(x,z,{radii=[750,170,65],caps=[950,550,1400]}={}){const out=[];for(let b=0;b<3;b++){const step=steps[b],r=radii[b],items=[];for(let i=Math.floor((x-r)/step);i<=Math.floor((x+r)/step);i++)for(let j=Math.floor((z-r)/step);j<=Math.floor((z+r)/step);j++){const p=candidate(b,i,j);if(!p)continue;const d=Math.hypot(p.x-x,p.z-z);if(d<=r)items.push({...p,d})}items.sort((a,b)=>a.d-b.d||a.key.localeCompare(b.key));out.push(...items.slice(0,caps[b]))}return out}
export function blockedByFlora(x,z,playerRadius=.32){for(let b=0;b<2;b++){const step=steps[b],i=Math.floor(x/step),j=Math.floor(z/step);for(let a=i-1;a<=i+1;a++)for(let c=j-1;c<=j+1;c++){const p=candidate(b,a,c);if(p&&p.solid>0&&Math.hypot(x-p.x,z-p.z)<p.solid+playerRadius)return true}}return false}
