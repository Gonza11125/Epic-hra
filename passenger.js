import {buildRegionalTrain,SEATS,cabinWalkable} from './regionalTrain.js?v=01364';
// Passenger state and cabin rendering are separate from the timetable.
export const BOARDING={valley:{region:'frontier',x:-2.65,z:0},haven:{region:'haven',x:1.75,z:-13}};
export function boardingPoint(line,stop){const p=BOARDING[stop];if(!p)return null;return line==='M2'?{...p,x:stop==='valley'?4.55:-.15}:p}
export function boardPassenger(schedule,region,minute,line='M1'){const stop=region==='haven'?'haven':region==='frontier'?'valley':null;if(!stop)return null;if(!['M1','M2'].includes(line))return null;const v=schedule.vehicleState(line,minute);if(!v||v.stop!==stop||!['docked','layover'].includes(v.status))return null;return {line,origin:stop,request:null,x:0,z:0,seated:null,departed:false}}
export function passengerTick(schedule,ride,minute){const v=schedule.vehicleState(ride.line,minute);if(!v)return {vehicle:null,exit:null};if(v.status==='moving'||v.stop!==ride.origin)ride.departed=true;const at=v.stop&&BOARDING[v.stop]?v.stop:null;return {vehicle:v,exit:null,canExit:at||null}}
export function validateRide(r){if(!r||!['M1','M2'].includes(r.line)||!BOARDING[r.origin])return null;let x=Number.isFinite(r.x)?r.x:0,z=Number.isFinite(r.z)?r.z:0;const seated=Number.isInteger(r.seated)&&SEATS[r.seated]?r.seated:null;if(seated!==null){x=SEATS[seated].x;z=SEATS[seated].z}else if(!cabinWalkable(x,z)){x=0;z=Math.max(-9.2,Math.min(9.2,z))}return {line:r.line,origin:r.origin,request:null,x,z,seated,departed:r.departed===true}}
export function createPassengerCabin(T){
 const scene=new T.Scene();scene.background=new T.Color(0x92b8ca);scene.fog=new T.FogExp2(0x92b8ca,.011);
 const hemi=new T.HemisphereLight(0xd5f0ff,0x4a515a,1.8),sun=new T.DirectionalLight(0xffead0,2.4);sun.position.set(10,25,12);scene.add(hemi,sun);
 const mat=(c,r=.65,m=.1)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const shell=mat(0xf0f9ff,.4,.25),dark=mat(0x24346f,.48,.3),floor=mat(0x697c83),seat=mat(0x006fa8,.9),trim=new T.MeshStandardMaterial({color:0xa6ebeb,emissive:0x4bbcc9,emissiveIntensity:1.6}),glass=new T.MeshStandardMaterial({color:0x9fd9ea,transparent:true,opacity:.14,depthWrite:false,roughness:.12});
 const cube=new T.BoxGeometry(1,1,1);function box(p,m,x,y,z,w,h,d){const o=new T.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);p.add(o);return o}
 const models={M1:buildRegionalTrain(T,'M1'),M2:buildRegionalTrain(T,'M2')};for(const m of Object.values(models)){scene.add(m.group);m.group.visible=false}
 const outside=new T.Group();scene.add(outside);box(outside,mat(0x65786e),0,-.9,0,240,.4,240);box(outside,mat(0x344c8f,.4,.5),0,-.58,0,4,.24,240);box(outside,mat(0x284463,.4,.5),0,-.445,0,3.7,.03,240);const opposite=new T.Group();outside.add(opposite);box(opposite,mat(0x344c8f,.4,.5),0,-.58,0,4,.24,240);box(opposite,mat(0x284463,.4,.5),0,-.445,0,3.7,.03,240);for(let z=-118;z<120;z+=2.4){box(outside,trim,0,-.425,z,3.35,.014,.14);box(opposite,trim,0,-.425,z,3.35,.014,.14);}
 let seed=975;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const trees=new T.Group();outside.add(trees);
 const trunkGeo=new T.CylinderGeometry(.15,.28,1,7),crownGeo=new T.IcosahedronGeometry(1,1),bark=mat(0x4e5365),leaf=mat(0x8889b3);const trunks=new T.InstancedMesh(trunkGeo,bark,90),crowns=new T.InstancedMesh(crownGeo,leaf,90),obj=new T.Object3D(),specs=[];
 for(let i=0;i<90;i++)specs.push({x:(i%2?1:-1)*(5+rand()*65),z:(rand()-.5)*150,h:3+rand()*7,r:1+rand()*2});trees.add(trunks,crowns);
 const station=new T.Group();outside.add(station);box(station,dark,-3.1,-.08,0,2.4,.18,20);box(station,shell,-3.1,3.3,0,2.6,.15,20);for(const z of [-8,0,8])box(station,dark,-3.1,1.55,z,.14,3.1,.14);
 let offset=0,lastLabel='';function update(dt,v,schedule,time){opposite.position.x=v?.line==='M2'?-7.2:7.2;const moving=v?.status==='moving';if(moving)offset=(offset+dt*23)%150;station.visible=!moving;trees.visible=moving;for(let i=0;i<specs.length;i++){const p=specs[i],z=((p.z+offset+225)%150)-75;obj.position.set(p.x,p.h*.45,z);obj.scale.set(1,p.h*.9,1);obj.updateMatrix();trunks.setMatrixAt(i,obj.matrix);obj.position.set(p.x,p.h,z);obj.scale.set(p.r,p.h*.27,p.r);obj.updateMatrix();crowns.setMatrixAt(i,obj.matrix)}trunks.instanceMatrix.needsUpdate=crowns.instanceMatrix.needsUpdate=true;trunks.frustumCulled=crowns.frustumCulled=false;
 const model=models[v?.line||'M1'];for(const m of Object.values(models))m.group.visible=m===model;model.setDoors(false);model.setDisplay(v?.stop?'STANICE '+schedule.STOPS[v.stop].name:'DALŠÍ '+(schedule.STOPS[v?.next]?.name||'—')+' '+schedule.formatClock(v?.arrival??0));
 const day=Math.max(.08,Math.sin((time-6)/12*Math.PI));scene.background.set(0x101d32).lerp(new T.Color(0x92b8ca),day);scene.fog.color.copy(scene.background);hemi.intensity=.65+day*1.4;sun.intensity=day*2.2;
 }
 return {scene,update};
}
