// NEXUS 5000: modular residential architecture.
// Original procedural models; units in metres, positive Z is the entrance.
export function createResidentialLibrary(T){
 const std=(color,roughness=.7,metalness=.1)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const M={shell:std(0xcbd7dc,.36,.24),frame:std(0x344955,.44,.6),floor:std(0x737d85,.75,.1),warm:std(0x9b8270,.76,.05),fabric:std(0x557a7e,.96,0),cream:std(0xd9d1ba,.91,0),dark:std(0x25353c,.65,.2),glass:new T.MeshStandardMaterial({color:0x86c8df,transparent:true,opacity:.25,depthWrite:false,roughness:.16,metalness:.1}),light:new T.MeshStandardMaterial({color:0xb9edf1,emissive:0x68d7e9,emissiveIntensity:1.4,roughness:.4}),amber:new T.MeshStandardMaterial({color:0xffdfb7,emissive:0xf8b45c,emissiveIntensity:1.2,roughness:.4})};
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,20,12),cyl=new T.CylinderGeometry(1,1,1,20);
 function mesh(g,geo,mat,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=!mat.transparent&&mat!==M.light&&mat!==M.amber;o.receiveShadow=!mat.transparent;g.add(o);return o}
 const b=(g,m,x,y,z,w,h,d)=>mesh(g,cube,m,x,y,z,w,h,d);
 const s=(g,m,x,y,z,w,h,d)=>mesh(g,sphere,m,x,y,z,w,h,d);
 const c=(g,m,x,y,z,w,h,d=w)=>mesh(g,cyl,m,x,y,z,w,h,d);
 function sign(g,title,sub,x,y,z,w=2.2){const cv=document.createElement('canvas');cv.width=512;cv.height=160;const a=cv.getContext('2d');a.fillStyle='#182d39';a.fillRect(0,0,512,160);a.fillStyle='#a5e4e6';a.font='bold 45px sans-serif';a.textAlign='center';a.fillText(title,256,65);a.fillStyle='#bfd1d7';a.font='24px sans-serif';a.fillText(sub,256,110);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;return mesh(g,new T.PlaneGeometry(w,w*160/512),new T.MeshBasicMaterial({map:tex}),x,y,z)}
 // Extruded curved roof section; a hollow shell rather than a solid block.
 function roof(g,w,d){const sh=new T.Shape();sh.moveTo(-w/2-.18,2.55);sh.lineTo(-w/2-.18,2.95);sh.quadraticCurveTo(-w/2-.02,3.55,-w*.34,3.78);sh.quadraticCurveTo(0,4.35,w*.34,3.78);sh.quadraticCurveTo(w/2+.02,3.55,w/2+.18,2.95);sh.lineTo(w/2+.18,2.55);sh.lineTo(w/2-.05,2.55);sh.lineTo(w/2-.05,2.96);sh.quadraticCurveTo(w/2-.22,3.39,w*.31,3.55);sh.quadraticCurveTo(0,4.08,-w*.31,3.55);sh.quadraticCurveTo(-w/2+.22,3.39,-w/2+.05,2.96);sh.lineTo(-w/2+.05,2.55);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:d+.45,bevelEnabled:true,bevelThickness:.055,bevelSize:.055,bevelSegments:2,curveSegments:12});mesh(g,geo,M.shell,0,0,-d/2-.22)}
 function glassWall(g,side,w,d){const x=side*w/2; b(g,M.frame,x,.26,0,.18,.52,d);b(g,M.frame,x,2.72,0,.18,.56,d);for(const z of [-d/2+.14,0,d/2-.14])b(g,M.frame,x,1.49,z,.18,2.05,.16);for(const z of [-d/4,d/4])b(g,M.glass,x,1.52,z,.045,1.95,d/2-.2);b(g,M.light,x,2.43,0,.045,.045,d-.45)}
 function habitat({id,title,w=8,d=7,variant='home'}){
  const g=new T.Group(),collisions=[],targets=[],doors=[];const addCol=(x,z,ww,dd)=>collisions.push([x-ww/2,x+ww/2,z-dd/2,z+dd/2]);
  const solid=(m,x,y,z,ww,h,dd)=>{addCol(x,z,ww,dd);return b(g,m,x,y,z,ww,h,dd)};
  b(g,M.floor,0,.045,0,w+.35,.09,d+.35);b(g,M.frame,0,.07,d/2+1.25,w+.8,.12,2.5);
  roof(g,w,d);for(const side of [-1,1]){const arch=new T.Shape();arch.moveTo(-w/2+.08,3.0);arch.quadraticCurveTo(-w*.36,3.72,0,4.04);arch.quadraticCurveTo(w*.36,3.72,w/2-.08,3.0);arch.closePath();const geo=new T.ShapeGeometry(arch,16);const material=(side===1?M.glass:M.shell).clone();material.side=T.DoubleSide;mesh(g,geo,material,0,0,side*d/2)}glassWall(g,-1,w,d);glassWall(g,1,w,d);addCol(-w/2,0,.2,d);addCol(w/2,0,.2,d);
  solid(M.shell,0,1.44,-d/2,w,2.88,.2);
  // Front wall includes a true 1.7 m opening; animated panels slide clear.
  const opening=1.8,sideW=(w-opening)/2;
  for(const side of [-1,1]){const x=side*(opening/2+sideW/2);solid(M.frame,x,.33,d/2,sideW,.66,.2);b(g,M.glass,x,1.58,d/2,sideW-.20,1.84,.055);b(g,M.shell,x,2.75,d/2,sideW,.50,.22);for(const dx of [-sideW/2+.06,sideW/2-.06])b(g,M.frame,x+dx,1.51,d/2,.12,2.17,.24);b(g,M.light,x,2.46,d/2+.14,sideW-.23,.045,.04)}
  b(g,M.shell,0,2.78,d/2,opening+.22,.44,.28);for(const x of [-.97,.97])b(g,M.frame,x,1.21,d/2,.15,2.44,.3);
  for(const side of [-1,1]){const panel=new T.Group();g.add(panel);panel.position.set(side*.45,1.20,d/2+.08);b(panel,M.frame,0,0,0,.87,2.36,.13);b(panel,M.glass,0,.36,.08,.62,1.18,.045);b(panel,M.light,-side*.35,0,.085,.035,1.95,.035);doors.push({panel,side})}
  // Side window frames and bright, low-profile pathway guides.
  for(const x of [-w/2+.3,w/2-.3]){b(g,M.light,x,.12,d/2+1.25,.055,.025,2.1);b(g,M.light,x,3.16,0,.075,.05,d-.2)}
  sign(g,title,'ELYRA / '+id,0,3.12,d/2+.28,2.25);
  for(const x of [-w*.39,w*.39]){c(g,M.frame,x,.40,d/2+2,.10,.8);s(g,M.light,x,.83,d/2+2,.13,.07,.13)}
  // Soft ceiling strips and central climate system.
  for(const x of [-w*.28,w*.28])b(g,M.amber,x,3.04,-.15,.09,.055,d*.73);
  c(g,M.frame,0,3.53,-.25,.57,.14);c(g,M.light,0,3.44,-.25,.45,.045);
  if(variant==='home'){
   // Sleeping, storage, kitchenette and lounge; keep central walkway clear.
   const bx=-w/2+1.07,bz=-d/2+1.58;solid(M.frame,bx,.26,bz,1.65,.52,2.35);b(g,M.cream,bx,.60,bz,1.58,.19,2.25);b(g,M.fabric,bx,.73,bz+.22,1.57,.10,1.68);for(const x of [-.38,.38])s(g,M.cream,bx+x,.77,bz-.77,.34,.12,.30);b(g,M.warm,bx,.92,-d/2+.20,1.9,1.55,.18);
   solid(M.dark,w/2-.54,.47,-d/2+1.48,.8,.94,2.6);b(g,M.warm,w/2-.54,.97,-d/2+1.48,.86,.08,2.65);b(g,M.light,w/2-.98,.64,-d/2+1.48,.025,.12,1.95);b(g,M.frame,w/2-.54,1.03,-d/2+.90,.59,.06,.63);for(let i=0;i<2;i++)c(g,M.light,w/2-.54,1.08,-d/2+.74+i*.29,.11,.025);solid(M.frame,w/2-.52,.94,-d/2+.4,.78,1.88,.66);
   solid(M.frame,-w/2+.67,.29,1.47,1.05,.58,2.05);b(g,M.fabric,-w/2+.67,.65,1.47,1.02,.17,1.97);b(g,M.fabric,-w/2+.20,.95,1.47,.22,.69,2.10);for(const z of [.51,2.43])b(g,M.fabric,-w/2+.67,.83,z,1.02,.25,.20);
   solid(M.warm,-1.57,.36,1.47,.83,.72,1.18);b(g,M.frame,-1.57,.75,1.47,.93,.06,1.28);c(g,M.amber,-1.57,.89,1.47,.12,.22);
   b(g,M.frame,0,1.61,-d/2+.11,2.25,1.25,.11);b(g,M.glass,0,1.61,-d/2+.19,2.05,1.04,.04);sign(g,'HOME','CLIMATE / ENERGY / LINK',0,1.61,-d/2+.23,1.80);
   targets.push({x:0,z:-d/2+1.25,name:'Domácí řídicí panel',note:'Modulární bydlení Elyry. Lokální energetická síť, automatická regulace klimatu a zásobování vodou. Vlastnictví domů přijde v další etapě.'});
  }else{
   // Public lounge, central passage between side benches.
   for(const side of [-1,1]){solid(M.frame,side*(w/2-.65),.31,-.35,1.05,.62,d*.62);b(g,M.fabric,side*(w/2-.65),.71,-.35,1.05,.18,d*.60);b(g,M.fabric,side*(w/2-.19),1.0,-.35,.24,.62,d*.63)}
   solid(M.frame,0,.50,-d/2+.68,2.1,1,1);b(g,M.warm,0,1.04,-d/2+.68,2.2,.08,1.1);sign(g,'COMMUNITY','LOCAL NETWORK',0,1.9,-d/2+.18,2.8);
   targets.push({x:0,z:-d/2+1.85,name:'Komunitní informační panel',note:'Společenský prostor osady. V budoucnu zde budou obyvatelé, služby a místní události.'});
  }
  const lamp=new T.PointLight(0xffdbad,0,10,2);lamp.position.set(0,2.8,0);g.add(lamp);
  let open=0;return {group:g,collisions,targets,doors,lamp,w,d,update(dt,px,pz,time,enabled){const near=enabled&&Math.abs(px)<2&&Math.abs(pz-d/2)<2.2;open=T.MathUtils.lerp(open,near?1:0,1-Math.exp(-dt*7));for(const door of doors)door.panel.position.x=door.side*(.45+open*.91);const inside=Math.abs(px)<w/2&&Math.abs(pz)<d/2;lamp.intensity=enabled&&(inside||Math.hypot(px,pz)<12)?(time>18||time<6?10:3.5):0},inside(px,pz){return Math.abs(px)<w/2-.1&&Math.abs(pz)<d/2-.1}};
 }
 return {habitat};
}
export function installHousing(T,root,colliders){
 const group=new T.Group();group.name='Elyra residential quarter';root.add(group);const library=createResidentialLibrary(T),buildings=[],targets=[];
 const specs=[{id:'H-01',title:'AURA',x:-17,z:22,w:8,d:7,variant:'home'},{id:'H-02',title:'NOVA',x:19,z:-21,w:8.6,d:7.2,variant:'home'},{id:'C-01',title:'FORUM',x:-20,z:-20,w:8.5,d:7,variant:'community'}];
 for(const spec of specs){const h=library.habitat(spec);h.group.position.set(spec.x,0,spec.z);group.add(h.group);for(const p of h.collisions)colliders.push([p[0]+spec.x,p[1]+spec.x,p[2]+spec.z,p[3]+spec.z]);for(const t of h.targets)targets.push({...t,x:t.x+spec.x,z:t.z+spec.z,building:spec.id,category:'housing'});buildings.push({...spec,h})}
 function covered(x,z,pad=0){return buildings.some(b=>Math.abs(x-b.x)<b.w/2+pad&&z>b.z-b.d/2-pad&&z<b.z+b.d/2+2.6+pad)}
 function inside(x,z){return buildings.some(b=>b.h.inside(x-b.x,z-b.z))}
 return {buildings,targets,covered,inside,update(dt,x,z,time,enabled){for(const b of buildings)b.h.update(dt,x-b.x,z-b.z,time,enabled)}}
}
