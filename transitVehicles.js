// NEXUS 5000 / public transport design system. Original procedural meshes.
export const DIMENSIONS={M1:{length:38.4,width:3.8,height:3.5,cars:3},A2:{length:10.8,width:4.1,height:3.6}};
export function createTransitVehicles(T){
 const mat=(color,roughness=.36,metalness=.35)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const glow=(color,emissive=color)=>new T.MeshStandardMaterial({color,emissive,emissiveIntensity:1.4,roughness:.28});
 const M={white:mat(0xf2fbff,.27,.32),blue:mat(0x1245dc,.29,.42),teal:mat(0x00c9c1,.29,.38),purple:mat(0x6329cc,.31,.4),orange:mat(0xff7315,.3,.32),dark:mat(0x10233e,.34,.55),glass:mat(0x123b63,.13,.55),metal:mat(0x91a9ba,.28,.7),cyan:glow(0x69f9ff,0x00cfff),gold:glow(0xffd472,0xff8b16),red:glow(0xff284c),rubber:mat(0x202b41,.87,.05)};
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,24,16);
 function mesh(g,geo,m,x=0,y=0,z=0,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=false;o.receiveShadow=true;g.add(o);return o}
 const box=(g,m,x,y,z,w,h,d)=>mesh(g,cube,m,x,y,z,w,h,d);
 const oval=(g,m,x,y,z,w,h,d)=>mesh(g,sphere,m,x,y,z,w,h,d);
 // Elliptical rectangular cross-sections, tapering in Z: real curved body mesh.
 function loft(g,sections,m){const p=[],idx=[],n=32;for(const [z,w,h,y] of sections)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const pow=(x)=>Math.sign(x)*Math.pow(Math.abs(x),.48);p.push(w*pow(Math.cos(a)),y+h*pow(Math.sin(a)),z)}for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c)}for(let i=1;i<n-1;i++){idx.push(0,i+1,i);const k=(sections.length-1)*n;idx.push(k,k+i,k+i+1)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,m)}
 function panel(g,m,x,y,z,w,h,d){return box(g,m,x,y,z,w,h,d)}
 function sign(g,line,name,x,y,z,ry,width=2.4){const c=document.createElement('canvas');c.width=768;c.height=192;const a=c.getContext('2d');a.fillStyle='#101b37';a.fillRect(0,0,768,192);a.fillStyle=line==='M1'?'#04e0cf':'#ff9f38';a.fillRect(0,0,165,192);a.fillStyle='#071628';a.font='bold 92px sans-serif';a.textAlign='center';a.fillText(line,82,125);a.fillStyle='#effdff';a.font='bold 50px sans-serif';a.fillText(name,466,112,570);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=mesh(g,new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:tex}),x,y,z);o.rotation.y=ry;return o}
 function train(){const g=new T.Group();g.name='M1 / AURORA MAGLEV';const doors=[];
 for(let car=0;car<3;car++){const part=new T.Group();part.position.z=(car-1)*13;g.add(part);const front=car===0,back=car===2;
 const sections=[[-6.2,front?.46:1.42,front?.45:1.30,front?1.13:1.9],[-5.6,front?1.05:1.68,front?.78:1.48,front?1.40:1.9],[-4.4,1.72,1.56,1.9],[4.4,1.72,1.56,1.9],[5.6,back?1.05:1.68,back?.78:1.48,back?1.40:1.9],[6.2,back?.46:1.42,back?.45:1.30,back?1.13:1.9]];
 loft(part,sections,M.white);loft(part,[[-5.25,1.38,.19,.61],[-4.6,1.71,.24,.59],[4.6,1.71,.24,.59],[5.25,1.38,.19,.61]],M.purple);
 if(front||back){const side=front?-1:1;const cab=oval(part,M.glass,0,2.20,side*4.95,1.32,.82,.99);cab.rotation.x=side*.28;for(const x of [-.79,.79])oval(part,side===-1?M.cyan:M.red,x,1.25,side*5.49,.22,.12,.13);oval(part,M.blue,0,.93,side*5.58,.94,.29,.48)}
 for(const side of [-1,1]){const x=side*1.727;box(part,M.teal,x,1.17,0,.045,.42,8.45);box(part,M.blue,x,2.91,0,.05,.24,8.45);box(part,M.dark,x,2.13,0,.07,1.22,8.7);for(const z of [-3.68,-2.38,2.38,3.68]){box(part,M.glass,side*1.78,2.13,z,.065,.98,1.13);box(part,M.metal,side*1.79,2.69,z,.035,.035,1.12)}
 box(part,M.dark,side*1.79,1.66,0,.06,2.10,1.84);for(const d of [-1,1]){const p=new T.Group();part.add(p);p.position.set(side*1.83,1.66,d*.44);box(p,M.blue,0,0,0,.07,2.03,.84);box(p,M.glass,side*.05,.36,0,.04,.85,.59);box(p,M.cyan,side*.06,-.52,0,.035,.04,.60);doors.push({p,d})}box(part,M.cyan,side*1.78,.75,0,.05,.055,8.9);sign(part,'M1','AURORA',side*1.8,2.88,2.95,side*Math.PI/2,2.1)}
 for(const z of [-3.8,3.8]){box(part,M.dark,0,.23,z,2.9,.28,2.5);box(part,M.cyan,0,.075,z,2.6,.07,1.85)}
 for(const z of [-3.1,3.1])box(part,M.metal,0,3.49,z,1.75,.11,1.05);
 }
 for(const z of [-6.5,6.5]){box(g,M.rubber,0,1.8,z,2.7,2.52,.80);for(let i=0;i<4;i++)box(g,M.dark,0,1.8,z-.3+i*.2,2.76,2.56,.065)}
 return {group:g,setDoors(open){for(const {p,d} of doors)p.position.z=d*(open?1.34:.44)}}}
 function shuttle(){const g=new T.Group();g.name='A2 / SOLARIS CITYLINER';const sections=[[-5.4,.65,.56,1.36],[-4.9,1.44,1.05,1.65],[-3.7,1.88,1.43,1.95],[2.9,1.88,1.43,1.95],[4.6,1.7,1.26,1.85],[5.4,1.1,.85,1.65]];
 loft(g,sections,M.white);loft(g,[[-4.8,1.4,.22,.71],[-3.7,1.88,.29,.72],[3.8,1.88,.29,.72],[5,1.2,.22,.72]],M.blue);
 const cockpit=oval(g,M.glass,0,2.28,-3.8,1.65,1.02,1.30);cockpit.rotation.x=-.22;
 const doors=[];for(const side of [-1,1]){box(g,M.orange,side*1.89,1.27,0,.065,.54,6.8);box(g,M.dark,side*1.90,2.13,.45,.07,1.36,5.8);for(const z of [-1.7,.25,2.1,3.05])box(g,M.glass,side*1.95,2.16,z,.045,1.05,1.20);box(g,M.dark,side*1.95,1.64,-.65,.07,2.23,1.5);for(const d of [-1,1]){const p=new T.Group();g.add(p);p.position.set(side*1.99,1.65,-.65+d*.36);box(p,M.orange,0,0,0,.07,2.14,.68);box(p,M.glass,side*.05,.40,0,.04,.79,.48);doors.push({p,d})}
 box(g,M.teal,side*1.91,2.92,.65,.05,.17,5.8);sign(g,'A2','CITYLINER',side*1.99,2.96,1.55,side*Math.PI/2,2.55);oval(g,M.blue,side*1.41,.54,1.9,.43,.35,1.45);oval(g,M.blue,side*1.41,.54,-2.25,.43,.35,1.45);for(const z of [-2.25,1.9])oval(g,M.cyan,side*1.41,.22,z,.39,.10,1.10);oval(g,M.gold,side*1.15,1.25,-4.75,.31,.12,.15);oval(g,M.red,side*1.14,1.4,4.86,.23,.14,.14)}
 box(g,M.purple,0,3.43,.25,2.15,.13,3.6);for(let i=0;i<5;i++)box(g,M.metal,0,3.53,-1+i*.56,1.7,.075,.09);
 return {group:g,setDoors(open){for(const {p,d} of doors)p.position.z=-.65+d*(open?1.05:.36)}}}
 return {train,shuttle};
}
// Smooth magnetic field slab with flush illuminated transverse induction tiles;
// no rails, sleepers, wheels or overhead electrical wiring.
export function buildGuideway(T,root,x,length=196){
 const g=new T.Group();g.name='M1 magnetic field guideway';root.add(g);
 const ceramic=new T.MeshStandardMaterial({color:0x344c8f,metalness:.45,roughness:.43}),top=new T.MeshStandardMaterial({color:0x284463,metalness:.5,roughness:.37}),field=new T.MeshBasicMaterial({color:0x12aeca}),accent=new T.MeshBasicMaterial({color:0x7356ff});
 const box=(m,x,y,z,w,h,d)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;g.add(o);return o};
 box(ceramic,x,.12,0,4.0,.24,length);box(top,x,.255,0,3.7,.035,length);for(const side of [-1,1])box(accent,x+side*1.94,.20,0,.05,.09,length);
 const n=Math.floor(length/2.4),tile=new T.InstancedMesh(new T.BoxGeometry(3.35,.014,.14),field,n),o=new T.Object3D();for(let i=0;i<n;i++){o.position.set(x,.285,-length/2+1.2+i*2.4);o.updateMatrix();tile.setMatrixAt(i,o.matrix)}g.add(tile);return g;
}
export function installTransitVehicles(T,{frontier,haven,schedule}){
 const A=createTransitVehicles(T),entries=[{line:'M1',stop:'valley',root:frontier,x:0,z:0,model:A.train()},{line:'A2',stop:'valley',root:frontier,x:8.35,z:1,model:A.shuttle()},{line:'M1',stop:'haven',root:haven,x:4.4,z:-13,model:A.train()}];
 for(const e of entries){e.root.add(e.model.group);e.model.group.visible=false}
 buildGuideway(T,frontier,0);buildGuideway(T,haven,4.4);
 const platform=new T.MeshStandardMaterial({color:0x7994b2,roughness:.65}),stripe=new T.MeshBasicMaterial({color:0x12e2c8});
 function slab(x,y,z,w,h,d,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);haven.add(o)}
 slab(1.25,.12,-13,2.15,.24,44,platform);slab(2.28,.25,-13,.08,.025,44,stripe);
 const smooth=x=>x*x*(3-2*x);
 function update(time){const minute=time*60;for(const e of entries){const v=schedule.localVehicle(e.line,e.stop,minute),o=e.model.group;o.visible=!!v;e.state=v;if(!v)continue;const d=smooth(v.distance),direction=v.local==='approaching'?1:v.local==='departing'?-1:0;o.position.set(e.x,e.line==='A2'?.55+Math.sin(d*Math.PI/2)*22:.58,e.z+direction*d*125);o.rotation.y=0;e.model.setDoors(v.local==='docked')}}
 function nearest(region,x,z){const stop=region==='haven'?'haven':'valley';let best=4,result=null;for(const e of entries){if(e.stop!==stop||!e.model.group.visible||e.state?.local!=='docked')continue;const o=e.model.group;const positions=e.line==='M1'?[-13,0,13]:[-.65];for(const dz of positions){const dist=Math.hypot(x-o.position.x,z-o.position.z-dz);if(dist<best){best=dist;result={line:e.line,stop:e.stop,name:e.line+' · '+schedule.STOPS[e.state.next].name,note:'Vozidlo stojí. Odjezd '+schedule.formatClock(e.state.departure)+'. A2 zatím nepřepravuje hráče.'}}}}return result}
 return {entries,update,nearest};
}
