// Elyra native ecosystem. Original reusable meshes, deterministic placement.
// One geometry/material batch per species component; no remote model downloads.
export function installElyraFlora(T,{root,trunks,crowns,grassBlade,ground,colliders,clearance=()=>false}){
 const flora=new T.Group();flora.name='Elyra | native ecosystem';root.add(flora);
 const std=(c,r=.8)=>new T.MeshStandardMaterial({color:c,roughness:r});
 const bark=std(0x4e5365),bark2=std(0x59405d),bark3=std(0x455d67);
 const canopy=std(0xa4a8ce,.72),petal=std(0xb98ebc,.63),fern=std(0x84b9bc,.76),cap=std(0xb29ac9,.54);
 const bio=new T.MeshStandardMaterial({color:0x81e8dc,emissive:0x238d9c,emissiveIntensity:.8,roughness:.55});
 const violet=new T.MeshStandardMaterial({color:0xd5a7fa,emissive:0x833ac4,emissiveIntensity:.55,roughness:.5});
 const seed=83451;let rng=seed;const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
 const v=(x,y,z)=>new T.Vector3(x,y,z);
 const ellipsoid=new T.IcosahedronGeometry(1,2),podGeo=new T.IcosahedronGeometry(1,1),stalkGeo=new T.CylinderGeometry(.65,1,1,8);
 const leafGeo=(()=>{const points=[],indices=[];for(let i=0;i<=12;i++){const q=i/12,w=Math.sin(q*Math.PI)*.42,y=Math.sin(q*Math.PI)*.16;points.push(-w,y,q,0,y+.09,q,w,y,q);if(i<12){const n=i*3;indices.push(n,n+3,n+1,n+1,n+3,n+4,n+1,n+4,n+2,n+2,n+4,n+5)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();return g})();
 const leafMat=std(0x79c7be,.68);leafMat.side=T.DoubleSide;const leafPurple=std(0xa581bf,.68);leafPurple.side=T.DoubleSide;
 const cupGeo=new T.LatheGeometry([new T.Vector2(0,-.22),new T.Vector2(.31,-.21),new T.Vector2(.72,-.12),new T.Vector2(1,0),new T.Vector2(.84,.14),new T.Vector2(.47,.32),new T.Vector2(0,.36)],24);
 const trunkGeo=new T.LatheGeometry([new T.Vector2(.34,0),new T.Vector2(.22,.09),new T.Vector2(.16,.3),new T.Vector2(.12,.65),new T.Vector2(.075,1)],10);
 const branchGeo=new T.CylinderGeometry(.055,.12,1,7);
 const batches=new Map(),obj=new T.Object3D(),local=new T.Object3D(),basis=new T.Matrix4(),out=new T.Matrix4(),rot=new T.Quaternion(),up=v(0,1,0);
 const baseColor=new T.Color();
 function add(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,tint=null){
   let byMat=batches.get(geo);if(!byMat){byMat=new Map();batches.set(geo,byMat)}let arr=byMat.get(mat);if(!arr){arr=[];byMat.set(mat,arr)}
   local.position.set(x,y,z);local.rotation.set(rx,ry,rz);local.scale.set(sx,sy,sz);local.updateMatrix();out.multiplyMatrices(basis,local.matrix);arr.push({m:out.clone(),c:tint?tint.clone():null})
 }
 function begin(x,y,z,h,w,angle){obj.position.set(x,y,z);obj.rotation.set(0,angle,0);obj.scale.set(w,h,w);obj.updateMatrix();basis.copy(obj.matrix)}
 function branch(x1,y1,z1,x2,y2,z2,mat,r=.7){const a=v(x1,y1,z1),b=v(x2,y2,z2),d=b.clone().sub(a);local.position.copy(a).add(b).multiplyScalar(.5);rot.setFromUnitVectors(up,d.clone().normalize());local.quaternion.copy(rot);local.scale.set(r,d.length(),r);local.updateMatrix();let byMat=batches.get(branchGeo);if(!byMat){byMat=new Map();batches.set(branchGeo,byMat)}let arr=byMat.get(mat);if(!arr){arr=[];byMat.set(mat,arr)}arr.push({m:new T.Matrix4().multiplyMatrices(basis,local.matrix),c:null})}
 const source=new T.Matrix4(),p=v(0,0,0),sc=v(0,0,0),quat=new T.Quaternion();
 const species={aurora:0,veil:0,spire:0,coral:0,mushroom:0},examples=[[],[],[]];
 // Preserve the old forest positions and physical trunk colliders.
 for(let i=0;i<trunks.count;i++){
  trunks.getMatrixAt(i,source);source.decompose(p,quat,sc);const x=p.x,z=p.z,h=sc.y/.85,angle=rand()*Math.PI*2;if(clearance(x,z,.8))continue;const typ=i%3;examples[typ].push({x,z});
  begin(x,0,z,h*.85,.85+h*.14,angle);
  if(typ===0){ // Aurora tree: branching umbrella, lilac canopy.
   species.aurora++;add(trunkGeo,bark,0,0,0,1,1,1);for(let j=0;j<4;j++){const a=j*Math.PI/2+.35,xx=Math.cos(a),zz=Math.sin(a);branch(0,.51,0,xx*.94,.86,zz*.94,bark,.85);add(ellipsoid,canopy,xx*.79,.92,zz*.79,.92,.19,.78,0,a,.08,baseColor.setHSL(.71+(i%5)*.016,.32,.65));add(podGeo,bio,xx*.79,.77,zz*.79,.075,.05,.075)}add(ellipsoid,canopy,0,1.03,0,1.05,.22,.96,0,0,0,baseColor.setHSL(.76,.22,.78));
  }else if(typ===1){ // Veil tree: layered turquoise fins.
   species.veil++;add(trunkGeo,bark3,0,0,0,.84,1.15,.84);for(let j=0;j<6;j++){const a=j*Math.PI/3;const y=.63+(j%2)*.18;add(leafGeo,leafMat,0,y,0,1.65,.85,1.5,-.13,a,0,baseColor.setHSL(.47+(i%5)*.012,.26,.70));add(leafGeo,leafMat,0,y+.14,0,1.25,.7,1.05,-.35,a+.38,0,baseColor.setHSL(.49,.20,.79))}add(podGeo,bio,0,1.14,0,.16,.055,.16);
  }else{ // Spire tree: dark sculptural trunk and violet seed clusters.
   species.spire++;add(trunkGeo,bark2,0,0,0,.82,1.15,.82);for(let j=0;j<3;j++){const a=j*2.399;const xx=Math.sin(a),zz=Math.cos(a),y=.58+j*.17;branch(0,y-.18,0,xx*.65,y,zz*.65,bark2,.65);add(podGeo,petal,xx*.6,y+.11,zz*.6,.5,.22,.55,.2,a,.1,baseColor.setHSL(.81+(i%4)*.014,.30,.72));add(podGeo,violet,xx*.68,y+.16,zz*.68,.10,.08,.10)}add(podGeo,petal,0,1.17,0,.39,.24,.39,0,0,0,baseColor.setHSL(.84,.25,.8))}
 }
 // No new solid obstacles near gameplay, existing routes stay clear.
 function safe(x,z){return !clearance(x,z,.6)&&Math.abs(x)>7&&Math.abs(z-14)>4&&!(Math.abs(x+11)<3&&Math.abs(z)<55)&&!(Math.abs(x)<27&&Math.abs(z)<28)&&Math.hypot(x-35,z+42)>6&&!colliders.some(b=>x>b[0]-.55&&x<b[1]+.55&&z>b[2]-.55&&z<b[3]+.55)}
 for(let i=0;i<220;i++){const x=(rand()-.5)*178,z=(rand()-.5)*178;if(!safe(x,z))continue;const size=.45+rand()*.65;begin(x,.01,z,size,size,rand()*6.28);if(i%2){species.mushroom++;for(let j=0;j<3;j++){const a=j*2.399,r=.19+j*.16,xx=Math.cos(a)*r,zz=Math.sin(a)*r,h=.45+j*.25;add(stalkGeo,bark3,xx,h/2,zz,.08,h,.08);add(cupGeo,cap,xx,h,zz,.27+j*.10,.27+j*.07,.27+j*.10,0,a,.06,baseColor.setHSL(.74+j*.035,.23,.78));add(podGeo,violet,xx,h+.09,zz,.055,.045,.055)}}else{species.coral++;for(let j=0;j<5;j++){const a=j*2.399,xx=Math.cos(a),zz=Math.sin(a);branch(0,0,0,xx*.34,.58+(j%2)*.16,zz*.34,bark3,.36);add(leafGeo,leafPurple,0,.16,0,.48,.58,.67,-.64,a,0,baseColor.setHSL(.78+(j%2)*.04,.25,.74));add(podGeo,bio,xx*.34,.6+(j%2)*.16,zz*.34,.07,.07,.07)}}}
 let count=0;const meshList=[];for(const [geo,materials] of batches)for(const [mat,instances] of materials){const mesh=new T.InstancedMesh(geo,mat,instances.length);const tinted=instances.some(k=>k.c);instances.forEach((e,i)=>{mesh.setMatrixAt(i,e.m);if(e.c)mesh.setColorAt(i,e.c);else if(tinted)mesh.setColorAt(i,baseColor.set(0xffffff))});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=false;mesh.receiveShadow=true;mesh.computeBoundingSphere();flora.add(mesh);meshList.push(mesh);count+=instances.length}
 // Existing forest is replaced visually, collision geometry retained.
 trunks.visible=false;crowns.visible=false;ground.color.set(0x66736e);grassBlade.material.color.set(0x719d9c);
 const fieldGuide=[['Aurora','Aurora — strom s širokou fialovou korunou a bioluminiscenčními semeny.',-33,29],['Veil','Veil — tyrkysové vějířovité listy zachycují světlo zdejší hvězdy.',31,-20],['Spire','Spire — rostlina s tmavým kmenem a fialovými shluky semen.',-27,-38]];
 const targets=[];for(let i=0;i<3;i++){const [name,note,x,z]=fieldGuide[i],pool=examples[i].filter(p=>Math.abs(p.x)<92&&Math.abs(p.z)<92);pool.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));if(pool.length)targets.push({...pool[0],name:'Atlas flóry: '+name,note,category:'flora'})}
 return {species,count,targets,update(t,time){if(!root.visible)return;const night=1-Math.max(0,Math.sin((time-6)*Math.PI/12));bio.emissiveIntensity=.36+night*1.4+Math.sin(t*1.7)*.09;violet.emissiveIntensity=.28+night*1.1+Math.sin(t*1.1)*.06},setQuality(q){for(const m of meshList){m.castShadow=q==='high'&&m.geometry===trunkGeo;m.material.needsUpdate=true;}}}
}
