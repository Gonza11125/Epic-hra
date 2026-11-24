// Original reusable public transit vehicle meshes and local visual simulation.
export function createTransitVehicles(T){
 const mat=(color,roughness=.42,metalness=.4)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const M={shell:mat(0xd7e3e3),dark:mat(0x223945),glass:mat(0x254d65,.15,.55),metal:mat(0x758a93),cyan:new T.MeshStandardMaterial({color:0x86f0ef,emissive:0x42cddd,emissiveIntensity:1.6}),gold:new T.MeshStandardMaterial({color:0xffc57a,emissive:0xf0a341,emissiveIntensity:1.2})};
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,20,12);
 function mesh(g,geo,m,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=false;o.receiveShadow=true;g.add(o);return o}
 const box=(g,m,x,y,z,w,h,d)=>mesh(g,cube,m,x,y,z,w,h,d);
 const oval=(g,m,x,y,z,w,h,d)=>mesh(g,sphere,m,x,y,z,w,h,d);
 function sign(g,line,name,x,y,z,ry){const c=document.createElement('canvas');c.width=512;c.height=128;const a=c.getContext('2d');a.fillStyle='#11262f';a.fillRect(0,0,512,128);a.fillStyle='#a8f2e9';a.font='bold 54px sans-serif';a.fillText(line,15,80);a.font='32px sans-serif';a.fillText(name,135,78);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=mesh(g,new T.PlaneGeometry(2.45,.61),new T.MeshBasicMaterial({map:tex}),x,y,z);o.rotation.y=ry}
 function train(){const g=new T.Group();g.name='M1 / MAGLEV';const sh=new T.Shape();sh.moveTo(-1.25,.35);sh.quadraticCurveTo(-1.47,.65,-1.47,1.5);sh.quadraticCurveTo(-1.47,2.8,-.7,2.95);sh.lineTo(.7,2.95);sh.quadraticCurveTo(1.47,2.8,1.47,1.5);sh.quadraticCurveTo(1.47,.65,1.25,.35);sh.closePath();mesh(g,new T.ExtrudeGeometry(sh,{depth:7.6,bevelEnabled:true,bevelSize:.12,bevelThickness:.18,bevelSegments:3,curveSegments:12}),M.shell,0,0,-3.8);
 for(const z of [-3.85,3.85]){oval(g,M.shell,0,1.56,z,1.38,1.36,1.22);oval(g,M.glass,0,2.02,z+(z>0?.7:-.7),1.13,.62,.53);box(g,M.dark,0,.46,z+(z>0?.9:-.9),1.3,.27,.22);for(const x of [-.75,.75])oval(g,M.cyan,x,1.12,z+(z>0?1.0:-1.0),.24,.11,.11)}
 const doors=[];for(const side of [-1,1]){for(const z of [-2.7,-1.4,1.4,2.7]){box(g,M.dark,side*1.49,1.95,z,.07,1.06,1.1);box(g,M.glass,side*1.54,1.95,z,.045,.91,.96)}box(g,M.dark,side*1.49,1.55,0,.08,2.3,1.2);const panel=box(g,M.shell,side*1.54,1.55,0,.07,2.22,1.12);doors.push(panel);box(g,M.cyan,side*1.54,.62,0,.045,.07,7.25);sign(g,'M1','COASTAL',side*1.57,2.62,0,side*Math.PI/2)}
 for(const z of [-2.9,2.9]){box(g,M.dark,0,.24,z,2.4,.38,1.7);for(const x of [-.88,.88])box(g,M.cyan,x,.16,z,.17,.06,1.5)}return {group:g,doors,setDoors(open){for(const p of doors)p.position.z=open?1.15:0}}}
 function shuttle(){const g=new T.Group();g.name='A2 / ANTIGRAV';oval(g,M.shell,0,1.35,0,1.5,1.14,2.9);oval(g,M.dark,0,.72,0,1.42,.6,2.6);oval(g,M.glass,0,1.91,-.8,1.19,.69,1.71);for(const x of [-1.3,1.3]){oval(g,M.metal,x,.72,0,.43,.42,1.95);oval(g,M.cyan,x,.38,.2,.34,.12,1.44);box(g,M.gold,x,.99,1.4,.14,.12,.3)}
 const door=box(g,M.dark,-1.46,1.36,.62,.10,1.53,1.08);const panel=box(g,M.shell,-1.53,1.36,.62,.06,1.45,1);sign(g,'A2','SHUTTLE',1.42,1.18,.6,Math.PI/2);return {group:g,setDoors(open){panel.position.z=open?1.65:.62}}}
 return {train,shuttle};
}
export function installTransitVehicles(T,{frontier,haven,schedule}){
 const A=createTransitVehicles(T);const entries=[{line:'M1',stop:'valley',root:frontier,x:0,z:0,model:A.train()},{line:'A2',stop:'valley',root:frontier,x:8.85,z:1,model:A.shuttle()},{line:'M1',stop:'haven',root:haven,x:4.4,z:-13,model:A.train()}];
 for(const e of entries){e.root.add(e.model.group);e.model.group.visible=false}
 // Haven's prototype railway and platform, clear of the shelter and landing pad.
 const trackMat=new T.MeshStandardMaterial({color:0x657b83,metalness:.6,roughness:.55});const platformMat=new T.MeshStandardMaterial({color:0x889e9e,roughness:.8});
 function rail(x,y,z,w,h,d,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);haven.add(o);return o}
 rail(4.4,.075,0,2.4,.15,184,platformMat);for(const x of [3.55,5.25])rail(x,.19,0,.14,.18,184,trackMat);rail(1.65,.12,-13,2.2,.24,17,platformMat);rail(2.6,.25,-13,.08,.025,17,new T.MeshBasicMaterial({color:0xf0c77e}));
 const smooth=x=>x*x*(3-2*x);
 function update(time){const minute=time*60;for(const e of entries){const v=schedule.localVehicle(e.line,e.stop,minute),o=e.model.group;o.visible=!!v;if(!v)continue;const d=smooth(v.distance),direction=v.local==='approaching'?1:v.local==='departing'?-1:0;o.position.set(e.x,e.line==='A2'?.35+d*12:.14,e.z+direction*d*94);o.rotation.y=0;e.model.setDoors(v.local==='docked');e.state=v}}
 function nearest(region,x,z){const stop=region==='haven'?'haven':'valley';let best=4,result=null;for(const e of entries){if(e.stop!==stop||!e.model.group.visible)continue;const o=e.model.group,dist=Math.hypot(x-o.position.x,z-o.position.z);if(dist<best&&e.state.local==='docked'){best=dist;result={line:e.line,stop:e.stop,name:e.line+' · '+schedule.STOPS[e.state.next].name,note:'Vozidlo stojí. Odjezd '+schedule.formatClock(e.state.departure)+'. Nastupování bude zpřístupněno v další verzi.'}}}return result}
 return {entries,update,nearest};
}
