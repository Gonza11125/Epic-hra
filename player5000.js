// First playable third-person character. Dimensions in metres, local front is -Z.
export function createPlayer(T,scene){
 const g=new T.Group();g.name='Player / expedition suit';g.visible=false;scene.add(g);
 const mat=(c,r=.65,m=.1)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const suit=mat(0x224795),plate=mat(0xe4eaf1,.35,.35),joint=mat(0x172334),boot=mat(0x152a41),visor=mat(0x205773,.14,.65),cyan=new T.MeshStandardMaterial({color:0x44e7e9,emissive:0x16aac4,emissiveIntensity:1.4}),accent=mat(0x16b3ba,.42,.28);
 const sphere=new T.SphereGeometry(1,20,12),boxGeo=new T.BoxGeometry(1,1,1);
 function mesh(parent,geo,m,x,y,z,w,h,d){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 const oval=(p,m,x,y,z,w,h,d)=>mesh(p,sphere,m,x,y,z,w,h,d),box=(p,m,x,y,z,w,h,d)=>mesh(p,boxGeo,m,x,y,z,w,h,d);
 const torso=new T.Group();g.add(torso);torso.position.y=1.02;oval(torso,suit,0,.24,0,.25,.36,.15);oval(torso,plate,0,.31,-.075,.222,.235,.11);oval(torso,joint,0,-.06,0,.19,.15,.13);box(torso,accent,0,.03,0,.39,.08,.24);box(torso,plate,0,.30,.17,.25,.34,.12);box(torso,cyan,0,.32,.238,.12,.20,.015);box(torso,cyan,0,.33,-.184,.09,.045,.012);
 const head=new T.Group();head.position.y=.57;torso.add(head);oval(head,plate,0,.115,0,.135,.17,.135);oval(head,visor,0,.125,-.088,.116,.105,.071);for(const side of [-1,1])oval(head,accent,side*.126,.108,.015,.024,.07,.065);
 const arms=[],legs=[];for(const s of [-1,1]){const arm=new T.Group();arm.position.set(s*.265,.40,0);torso.add(arm);oval(arm,plate,0,-.025,0,.108,.13,.115);oval(arm,suit,0,-.19,0,.075,.15,.075);const elbow=new T.Group();elbow.position.y=-.30;arm.add(elbow);oval(elbow,joint,0,0,0,.067,.07,.067);oval(elbow,plate,0,-.12,0,.073,.13,.075);oval(elbow,boot,0,-.255,-.02,.061,.09,.06);arms.push({arm,elbow,s});
 const leg=new T.Group();leg.position.set(s*.11,.95,0);g.add(leg);oval(leg,suit,0,-.19,0,.103,.23,.105);const knee=new T.Group();knee.position.y=-.43;leg.add(knee);oval(knee,joint,0,0,0,.09,.085,.09);oval(knee,plate,0,-.17,-.01,.085,.19,.088);oval(knee,boot,0,-.405,-.065,.095,.095,.155);legs.push({leg,knee,s})}
 let gait=0,face=0;const pivot=new T.Vector3(),desired=new T.Vector3(),direction=new T.Vector3();
 function update(camera,{x,z,yaw,pitch,jump=0,dt,moving=0,dx=0,dz=0,speed=4.5,third=false,blocked}){g.visible=third;g.position.set(x,jump,z);
 if(moving>.05){const a=Math.atan2(-dx,-dz);face+=Math.atan2(Math.sin(a-face),Math.cos(a-face))*Math.min(1,dt*12);gait+=dt*(speed>5?13:8)}else face+=Math.atan2(Math.sin(yaw-face),Math.cos(yaw-face))*Math.min(1,dt*6);
 g.rotation.y=face;const a=Math.min(1,moving),sw=Math.sin(gait);torso.position.y=1.02+Math.abs(sw)*.025*a;for(const l of legs){l.leg.rotation.x=sw*l.s*.54*a;l.knee.rotation.x=Math.max(0,-sw*l.s)*.68*a}for(const l of arms){l.arm.rotation.x=-sw*l.s*.44*a;l.elbow.rotation.x=-.16-Math.max(0,sw*l.s)*.35*a}
 if(!third){camera.position.set(x,1.72+jump+(moving>.08?Math.sin(gait*2)*.025:0),z);camera.rotation.set(pitch,yaw,0,'YXZ');return}
 // Camera orbit follows existing look input. Pull toward character when walls intervene.
 pivot.set(x,1.48+jump,z);direction.set(Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));desired.copy(pivot).addScaledVector(direction,5.2);desired.y=Math.max(.55,desired.y+.9);
 let f=1;for(let i=1;i<=24;i++){const t=i/24,px=T.MathUtils.lerp(pivot.x,desired.x,t),pz=T.MathUtils.lerp(pivot.z,desired.z,t);if(blocked(px,pz)){f=Math.max(.10,(i-2)/24);break}}
 camera.position.copy(pivot).lerp(desired,f);camera.lookAt(pivot);g.visible=f>.21;
 }
 return {group:g,update,hide(){g.visible=false}}
}
