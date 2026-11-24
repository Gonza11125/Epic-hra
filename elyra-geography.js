// ELYRA: deterministic planet-wide geography, independent of any graphics engine.
// All positions are unit Cartesian directions, all physical distances in km.
export const PLANET={id:'elyra',name:'Elyra',radiusKm:1737.4,seed:61201,dayHours:27,seaLevelKm:0,maxElevationKm:7.2,minElevationKm:-5.2,revision:1};
export const BIOMES=[
{id:'ocean',name:'Oceán',color:'#224e78'},{id:'shelf',name:'Pobřežní vody',color:'#378b9e'},
{id:'ice',name:'Polární led',color:'#dce9ec'},{id:'tundra',name:'Tundra',color:'#a2adab'},
{id:'boreal',name:'Chladný les',color:'#526f79'},{id:'temperate',name:'Mírný les',color:'#507f6e'},
{id:'grass',name:'Travnatá krajina',color:'#91a676'},{id:'desert',name:'Poušť',color:'#c3a475'},
{id:'savanna',name:'Suchá savana',color:'#b5b07c'},{id:'tropical',name:'Tropický les',color:'#397d60'},
{id:'mountain',name:'Vysoké hory',color:'#9994a1'},{id:'snow',name:'Horský sníh',color:'#e0e3ea'}];
export const CIVILIZATIONS=[
{id:'union',name:'Svaz Elyry',color:'#72b9e8',lat:36,lon:18,radius:37},
{id:'meridian',name:'Meridiánské společenství',color:'#e8b46c',lat:1,lon:-112,radius:38},
{id:'aurora',name:'Aurorská konfederace',color:'#b8a0e6',lat:-36,lon:122,radius:35},
{id:'frontier',name:'Nezávislé pohraničí',color:'#92c9a0',lat:12,lon:104,radius:27}];
const rad=Math.PI/180,deg=180/Math.PI,clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
export function normalize(v){const l=Math.hypot(...v);if(!Number.isFinite(l)||l<1e-12)throw Error('Invalid direction');return v.map(x=>x/l)}
export function direction(lat,lon){const a=lat*rad,b=lon*rad,c=Math.cos(a);return [c*Math.cos(b),Math.sin(a),c*Math.sin(b)]}
export function coordinates(v){const [x,y,z]=normalize(v);return {lat:Math.asin(clamp(y,-1,1))*deg,lon:Math.atan2(z,x)*deg}}
export function angularDistance(a,b){const u=normalize(a),v=normalize(b);return Math.acos(clamp(u.reduce((s,x,i)=>s+x*v[i],0),-1,1))}
export const distanceKm=(a,b)=>angularDistance(a,b)*PLANET.radiusKm;
export function greatCircleStep(start,tangent,km){const a=normalize(start),proj=tangent.reduce((s,x,i)=>s+x*a[i],0),b=normalize(tangent.map((x,i)=>x-proj*a[i])),theta=km/PLANET.radiusKm;return {position:normalize(a.map((x,i)=>x*Math.cos(theta)+b[i]*Math.sin(theta))),tangent:normalize(a.map((x,i)=>-x*Math.sin(theta)+b[i]*Math.cos(theta)))}}
function hash(x,y,z,seed){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,2246822519)^Math.imul(seed,3266489917);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
function noise(x,y,z,seed){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),a=smooth(x-i),b=smooth(y-j),c=smooth(z-k);const h=(dx,dy,dz)=>hash(i+dx,j+dy,k+dz,seed);return mix(mix(mix(h(0,0,0),h(1,0,0),a),mix(h(0,1,0),h(1,1,0),a),b),mix(mix(h(0,0,1),h(1,0,1),a),mix(h(0,1,1),h(1,1,1),a),b),c)}
function fbm(v,f,seed,oct=5){let sum=0,weight=0,a=1;for(let i=0;i<oct;i++){sum+=a*noise(v[0]*f+17.3,v[1]*f-8.1,v[2]*f+29.7,seed+i*101);weight+=a;f*=2.08;a*=.52}return sum/weight}
const seeds=CIVILIZATIONS.map(c=>({...c,dir:direction(c.lat,c.lon)}));
export function sample(directionVector){const v=normalize(directionVector),lat=Math.abs(Math.asin(v[1])*deg),s=PLANET.seed;
 const continental=fbm(v,2.35,s,4),detail=fbm(v,9,s+991,4),ridge=1-Math.abs(2*fbm(v,6,s+355,4)-1);
 const base=(continental-.48)*15+(detail-.5)*1.7,land=base>0;
 const elev=clamp(base+(land?Math.pow(ridge,5)*Math.max(0,base)*1.25:0),PLANET.minElevationKm,PLANET.maxElevationKm);
 const temp=clamp(31-45*Math.pow(lat/90,1.35)-Math.max(0,elev)*5.5+(fbm(v,5,s+774,3)-.5)*10,-65,45);
 const moisture=clamp(fbm(v,4,s+7781,4)*1.5-.22+.14*Math.cos(lat*rad*2),0,1);
 let biome=elev<-.45?'ocean':elev<=0?'shelf':temp<-10?'ice':elev>3.5&&temp<4?'snow':elev>3.0?'mountain':temp<2?'tundra':temp<10?(moisture>.37?'boreal':'tundra'):temp>22?(moisture<.30?'desert':moisture<.55?'savanna':'tropical'):moisture<.28?'desert':moisture<.52?'grass':'temperate';
 let civilization='wild',score=Infinity;if(elev>0&&biome!=='ice'&&biome!=='snow'){for(const c of seeds){const q=angularDistance(v,c.dir)*deg/c.radius+(detail-.5)*.25;if(q<1&&q<score){score=q;civilization=c.id}}}
 return {elevationKm:elev,temperatureC:temp,moisture,biome,civilization};
}
// Land anchors found deterministically around requested nominal positions.
function findLand(lat,lon,preferredCivilization){for(let r=0;r<=30;r++)for(let i=0;i<(r===0?1:24);i++){const a=i*Math.PI/12,l=clamp(lat+r*Math.cos(a),-88,88),o=lon+r*Math.sin(a)/Math.max(.25,Math.cos(l*rad)),v=direction(l,o),p=sample(v);if(p.elevationKm>.08&&p.elevationKm<2.8&&p.civilization===preferredCivilization)return {...coordinates(v),biome:p.biome}}throw Error('No suitable settlement site: '+preferredCivilization)}
const anchor=findLand(36,18,'union');
export const LOCATIONS=[
{id:'frontier',name:'Údolí 07',kind:'osada',...anchor},
{id:'haven',name:'Haven',kind:'pobřežní oblast',lat:33.25,lon:17.5,biome:sample(direction(33.25,17.5)).biome},
{id:'capital',name:'Nova Aster',kind:'hlavní město',...findLand(anchor.lat-4,anchor.lon-5,'union')},
...CIVILIZATIONS.slice(1).map(c=>({id:c.id+'-hub',name:c.name,kind:'plánované centrum',...findLand(c.lat,c.lon,c.id)}))];
export function geographyManifest(){return {schema:1,planet:PLANET,coordinateSystem:'unit vector [cos(lat)*cos(lon),sin(lat),cos(lat)*sin(lon)]; degrees; km',biomes:BIOMES,civilizations:CIVILIZATIONS,locations:LOCATIONS,algorithm:'elyra-geography.js revision 1; sample(unitDirection)'}}
// Six cube faces tile a sphere without a longitude seam; compatible with future terrain streaming.
export function cubeDirection(face,u,v){const p=[[1,v,-u],[-1,v,u],[u,1,-v],[u,-1,v],[u,v,1],[-u,v,-1]][face];if(!p)throw Error('Invalid face');return normalize(p)}
export function tilePoint(face,level,x,y,u,v){const n=2**level;return cubeDirection(face,2*(x+u)/n-1,2*(y+v)/n-1)}
