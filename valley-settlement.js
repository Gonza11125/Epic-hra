import {installHousing} from './housing5000.js?v=0148';
import {createFloraGeometry} from './valley-nature.js?v=0146';
import {valleyCoordinates,valleyDirection,surfaceRadiusMeters} from './elyra-geography.js?v=3';

export const NOVA_APPROACH = {id:'nova-porch',name:'Před domem NOVA',x:-19,z:8};

// The source architecture uses +Z for the entrance. In the spherical frame
// its +Z faces south and +X faces west. A metre in the housing kit occupies .001 scene units.
export function installValleySettlement(T,scene) {
  const group=new T.Group();
  group.name='Údolí 07 / obytná čtvrť';
  scene.add(group);
  const dir=new T.Vector3(...valleyDirection(0,0));
  const west=new T.Vector3(...valleyDirection(-1,0)).projectOnPlane(dir).normalize();
  const south=new T.Vector3().crossVectors(west,dir).normalize();
  group.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(west,dir,south));
  group.scale.setScalar(.001);
  const anchor=dir.clone().multiplyScalar(surfaceRadiusMeters(dir.toArray())/1000);
  const walls=[];
  const housing=installHousing(T,group,walls);
  // Three scene lights measure distance in kilometres. Scale cut-off and luminous intensity together.
  for(const b of housing.buildings) b.h.lamp.distance=.010;

  const deck=new T.MeshStandardMaterial({color:0x88877b,roughness:.93});
  const rim=new T.MeshStandardMaterial({color:0x46565a,metalness:.42,roughness:.54});
  const barkBed=new T.MeshStandardMaterial({color:0x504541,roughness:.94});
  const beacon=new T.MeshStandardMaterial({color:0xb0e8dc,emissive:0x52b5a8,emissiveIntensity:.75});
  const cube=new T.BoxGeometry(1,1,1);
  function box(x,y,z,w,h,d,mat){
    const m=new T.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(w,h,d);
    m.receiveShadow=true;m.castShadow=h>.2;group.add(m);return m;
  }
  function path(ax,az,bx,bz,width) {
    const dx=bx-ax,dz=bz-az;
    const mesh=box((ax+bx)/2,.031,(az+bz)/2,width,.055,Math.hypot(dx,dz),deck);
    mesh.rotation.y=Math.atan2(dx,dz);
  }
  path(0,-21,0,30,3.2);
  for(const b of housing.buildings){
    const end=b.z+b.d/2+3.4;
    path(0,end,b.x,end,2.1);path(b.x,end,b.x,b.z+b.d/2,2.1);
  }
  const plantMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.9,side:T.DoubleSide});
  const treeShape=createFloraGeometry(T,'veil',1);
  const fernShape=createFloraGeometry(T,'fern',1);
  for(const [x,z] of [[-7,-10],[8,-6],[-9,8],[9,18]]){
    box(x,.11,z,3.1,.22,4.6,rim);box(x,.23,z,2.9,.065,4.4,barkBed);
    walls.push([x-1.55,x+1.55,z-2.3,z+2.3]);
    const tree=new T.Mesh(treeShape,plantMat);tree.scale.setScalar(.78);
    tree.position.set(x,.24,z);tree.rotation.y=z;tree.castShadow=true;group.add(tree);
    for(const end of [-1,1]){
      const fern=new T.Mesh(fernShape,plantMat);
      fern.scale.setScalar(.76);fern.position.set(x+.35*end,.26,z+1.55*end);group.add(fern);
    }
  }
  for(const [x,z] of [[-2,-16],[2,7],[-2,22],[16,-13],[-14,28]]){
    box(x,.43,z,.18,.86,.18,rim);box(x,.83,z,.22,.12,.22,beacon);
    walls.push([x-.11,x+.11,z-.11,z+.11]);
  }

  function nearby(x,z) {return Math.abs(x)<36 && Math.abs(z)<40}
  function blocked(e,n,r=.32,includeDoors=true) {
    const x=-e,z=-n;
    if(!nearby(x,z))return false;
    if(walls.some(([l,h,b,t])=>x>l-r&&x<h+r&&z>b-r&&z<t+r))return true;
    return includeDoors&&housing.buildings.some(b=>{
      const dx=x-b.x,dz=z-b.z;
      if(Math.abs(dx)>1.15 || Math.abs(dz-b.d/2-.08)>.06+r)return false;
      return b.h.doors.some(d=>Math.abs(dx-d.panel.position.x)<.435+r);
    });
  }
  function support(e,n){
    const x=-e,z=-n;
    if(!nearby(x,z))return 0;
    for(const b of housing.buildings){
      const dx=Math.abs(x-b.x),dz=z-b.z;
      if(dx<b.w/2+.4 && dz>=b.d/2 && dz<b.d/2+2.5)return .13;
      if(dx<b.w/2+.175 && Math.abs(dz)<b.d/2+.175)return .09;
    }
    return 0;
  }
  function indoor(e,n) {return housing.buildings.find(b=>b.h.inside(-e-b.x,-n-b.z))}
  function readout(e,n){
    const b=indoor(e,n);
    if(!b)return '';
    const panel=housing.targets.find(t=>t.building===b.id&&Math.hypot(-e-t.x,-n-t.z)<1.85);
    return panel?b.title+' · '+panel.name:b.title+' · '+(b.variant==='community'?'společenský sál':'obytný modul');
  }
  // Old saves on the empty pad may coincide with a newly built wall or planter.
  function safeLanding(p){
    const {x,z}=valleyCoordinates(p);
    if(!blocked(x,z,.32,false))return p;
    for(let radius=.5;radius<=12;radius+=.5)for(let k=0;k<16;k++){
      const e=x+radius*Math.cos(k*Math.PI/8), n=z+radius*Math.sin(k*Math.PI/8);
      if(!blocked(e,n,.32,false))return valleyDirection(e,n);
    }
    return valleyDirection(0,0);
  }
  const ray=new T.Raycaster(),delta=new T.Vector3();
  function clipCamera(aim,desired,e,n) {
    if(!nearby(-e,-n))return;
    const close=housing.buildings.filter(b=>Math.hypot(b.x+e,b.z+n)<16);
    if(!close.length)return;
    delta.subVectors(desired,aim);
    const length=delta.length();if(length<.0001)return;
    ray.set(aim,delta.multiplyScalar(1/length));ray.near=0;ray.far=length;
    const hit=ray.intersectObjects(close.map(b=>b.h.group),true)[0];
    if(hit)desired.copy(aim).addScaledVector(delta,Math.max(.00006,hit.distance-.00017));
  }
  function update(q,origin,dt,time){
    group.position.set(anchor.x-origin[0],anchor.y-origin[1],anchor.z-origin[2]);
    group.visible=Math.hypot(q.x,q.z)<2800;
    if(!group.visible)return;
    housing.update(dt,-q.x,-q.z,time,true);
    for(const b of housing.buildings) b.h.lamp.intensity*=1e-6;
    group.updateMatrixWorld(true);
  }
  return {blocked,support,indoor,readout,safeLanding,clipCamera,update};
}
