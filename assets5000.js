// NEXUS asset library — original reusable procedural meshes, year 5000.
// Units: metres. Each factory returns an independent Group; no game-state dependency.
export function createAssetLibrary(T){
 const std=(color,roughness=.45,metalness=.25)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const glow=(color,power=1.6)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:power,roughness:.28,metalness:.2});
 const M={ceramic:std(0xc6d3d4,.38,.35),graphite:std(0x23333e,.48,.55),metal:std(0x778c9b,.26,.8),blue:glow(0x36c9e8,1.9),amber:glow(0xf9af5d,1.5),violet:glow(0xb771ff,1.3),glass:std(0x274f68,.12,.65),organic:std(0x465478,.82,.1),petal:std(0x925cac,.5,.1)};
 const boxGeo=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,24,14),cylGeo=new T.CylinderGeometry(1,1,1,24);
 function mesh(parent,g,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new T.Mesh(g,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=!mat.emissiveIntensity||mat.emissiveIntensity<1;o.receiveShadow=true;parent.add(o);return o}
 const box=(p,m,x,y,z,w,h,d)=>mesh(p,boxGeo,m,x,y,z,w,h,d);
 const sphere=(p,m,x,y,z,w,h,d)=>mesh(p,sphereGeo,m,x,y,z,w,h,d);
 const cylinder=(p,m,x,y,z,w,h,d=w)=>mesh(p,cylGeo,m,x,y,z,w,h,d);
 function shell(p,outline,depth,mat,x=0,y=0,z=0,bevel=.12){const sh=new T.Shape();outline.forEach(([a,b],i)=>i?sh.lineTo(a,b):sh.moveTo(a,b));sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});return mesh(p,geo,mat,x,y,z)}
 function ring(p,r,t,mat,x,y,z,flat=true){const o=mesh(p,new T.TorusGeometry(r,t,8,48),mat,x,y,z);if(flat)o.rotation.x=Math.PI/2;return o}
 function tube(p,points,r,m){const path=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));return mesh(p,new T.TubeGeometry(path,24,r,6,false),m)}
 function textPlate(p,text,sub,w=3){const c=document.createElement('canvas');c.width=512;c.height=160;const g=c.getContext('2d');g.fillStyle='#12232d';g.fillRect(0,0,512,160);g.strokeStyle='#69c9d5';g.lineWidth=4;g.strokeRect(8,8,496,144);g.fillStyle='#b7e7e8';g.font='bold 48px sans-serif';g.textAlign='center';g.fillText(text,256,72);g.fillStyle='#7bafbc';g.font='22px sans-serif';g.fillText(sub,256,116);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return mesh(p,new T.PlaneGeometry(w,w*160/512),new T.MeshBasicMaterial({map:tex}),0,0,0)}
 function courier(){const g=new T.Group();const body=[[-.65,-2.45],[-1.35,-1.15],[-1.65,.75],[-1.25,2.15],[-.75,2.65],[.75,2.65],[1.25,2.15],[1.65,.75],[1.35,-1.15],[.65,-2.45]];const hull=shell(g,body,.47,M.ceramic,0,.55,0,.19);hull.rotation.x=-Math.PI/2; // shape XY becomes XZ
 const belly=shell(g,body,.20,M.graphite,0,.31,0,.12);belly.rotation.x=-Math.PI/2;belly.scale.set(.94,.95,1);
 sphere(g,M.glass,0,1.06,.48,.86,.53,1.35);sphere(g,M.ceramic,0,.88,-1.32,.73,.31,.72);
 for(const side of [-1,1]){const nacelle=sphere(g,M.graphite,side*1.52,.67,-.32,.52,.39,1.54);sphere(g,M.metal,side*1.52,.77,-.32,.45,.29,1.44);const end=ring(g,.29,.055,M.blue,side*1.52,.66,-1.78,false);cylinder(g,M.graphite,side*1.52,.17,-.32,.28,.11);ring(g,.25,.035,M.blue,side*1.52,.10,-.32);tube(g,[[side*.45,.95,2.25],[side*1.03,.98,1.05],[side*1.12,.92,-.7]],.035,M.blue);box(g,M.amber,side*1.48,.69,1.18,.13,.12,.22);box(g,M.graphite,side*.82,.16,.72,.27,.32,.75)}
 const badge=textPlate(g,'A-17','COURIER',.75);badge.position.set(0,.87,-2.48);badge.rotation.y=Math.PI;
 return g}
 function drone(){const g=new T.Group();sphere(g,M.graphite,0,0,0,.46,.25,.53);sphere(g,M.ceramic,0,.14,0,.4,.17,.44);sphere(g,M.glass,0,-.04,.43,.23,.13,.11);sphere(g,M.blue,0,-.06,.51,.09,.09,.045);
 for(const s of [-1,1]){tube(g,[[s*.2,.02,0],[s*.55,.02,0],[s*.78,.03,.08]],.08,M.metal);ring(g,.27,.075,M.graphite,s*.76,.03,.08);ring(g,.23,.027,M.blue,s*.76,-.015,.08);cylinder(g,M.metal,s*.76,.03,.08,.11,.10);box(g,M.amber,s*.76,.15,.08,.13,.06,.13)}return g}
 function relay(){const g=new T.Group();cylinder(g,M.graphite,0,.14,0,1.05,.28);cylinder(g,M.metal,0,.35,0,.78,.22);const profile=[new T.Vector2(.42,0),new T.Vector2(.60,.18),new T.Vector2(.34,.72),new T.Vector2(.24,2.0),new T.Vector2(.55,2.3),new T.Vector2(.58,2.55),new T.Vector2(.22,2.85)];mesh(g,new T.LatheGeometry(profile,32),M.ceramic,0,.35,0);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const x=Math.sin(a),z=Math.cos(a);tube(g,[[x*.76,.35,z*.76],[x*.44,1.05,z*.44],[x*.31,2.35,z*.31]],.065,M.graphite);tube(g,[[x*.46,.85,z*.46],[x*.37,1.15,z*.37],[x*.31,2.25,z*.31]],.027,M.blue)}ring(g,.60,.05,M.blue,0,2.77,0);sphere(g,M.blue,0,3.32,0,.20,.20,.20);ring(g,.78,.035,M.metal,0,3.3,0);return g}
 function kiosk(){const g=new T.Group();cylinder(g,M.graphite,0,.08,0,.66,.16);const outline=[[-.40,0],[-.52,.27],[-.36,1.28],[-.55,1.56],[-.53,1.94],[.53,1.94],[.55,1.56],[.36,1.28],[.52,.27],[.40,0]];shell(g,outline,.28,M.ceramic,0,.17,-.14,.08);box(g,M.graphite,0,1.74,.21,.91,.57,.08);const p=textPlate(g,'ELYRA','CIVIC NETWORK',.84);p.position.set(0,1.74,.26);box(g,M.blue,0,.82,.17,.065,1.02,.045);box(g,M.amber,0,2.14,.10,.5,.045,.07);
 const holo=new T.Group();holo.position.y=2.65;g.add(holo);mesh(holo,new T.IcosahedronGeometry(.31,1),new T.MeshBasicMaterial({color:0x78e5e9,wireframe:true,transparent:true,opacity:.8}));ring(holo,.42,.013,M.blue,0,0,0);g.userData.holo=holo;return g}
 function alienPlant(){const g=new T.Group();const h=1.1;for(let i=0;i<5;i++){const a=i*2.399,dx=Math.sin(a),dz=Math.cos(a);tube(g,[[0,0,0],[dx*.19,h*.42,dz*.19],[dx*.62,h*.72,dz*.62]],.055,M.organic);const l=sphere(g,M.petal,dx*.55,h*.73,dz*.55,.15,.36,.14);l.rotation.z=dx*.65;l.rotation.x=-dz*.65;sphere(g,M.violet,dx*.66,h*.88,dz*.66,.075,.10,.075)}return g}
 function gate(){const g=new T.Group();for(const s of [-1,1]){const a=shell(g,[[s*1.3,0],[s*1.65,0],[s*1.69,2.8],[s*1.16,3.35],[s*.85,3.35],[s*1.3,2.72]],.38,M.ceramic,0,0,-.19,.055);tube(g,[[s*1.43,.30,.26],[s*1.43,2.68,.26],[s*1.05,3.2,.26]],.035,M.blue)}box(g,M.graphite,0,3.38,0,2.35,.25,.5);const plate=textPlate(g,'SEKTOR 07','TRANSIT HUB / 5000',2.15);plate.position.set(0,3.38,.265);return g}
 return {courier,drone,relay,kiosk,alienPlant,gate};
}
export function decorateFrontier(T,root,colliders){
 const A=createAssetLibrary(T),group=new T.Group();root.add(group);const names=[];
 function place(name,model,x,y,z,ry=0,solid=null){model.position.set(x,y,z);model.rotation.y=ry;group.add(model);if(solid)colliders.push([x-solid[0],x+solid[0],z-solid[1],z+solid[1]]);names.push(name);return model}
 // New models deliberately sit off existing paths and mission targets.
 const ship=place('A-17 civil courier',A.courier(),12,.34,23,Math.PI,[2.15,2.9]);
 const padMat=new T.MeshStandardMaterial({color:0x3e505a,metalness:.55,roughness:.6}),markMat=new T.MeshBasicMaterial({color:0x78d8d9});
 const pad=new T.Mesh(new T.CylinderGeometry(4.4,4.4,.12,40),padMat);pad.position.set(12,.06,23);pad.receiveShadow=true;group.add(pad);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,o=new T.Mesh(new T.BoxGeometry(.08,.022,.42),markMat);o.position.set(12+Math.sin(a)*4.1,.135,23+Math.cos(a)*4.1);o.rotation.y=a;group.add(o)}
 const gate=place('Transit entrance',A.gate(),-13,.1,2.55);
 const kiosk=place('Civic terminal',A.kiosk(),-4.2,0,19,Math.PI/5,[.65,.65]);
 const relay=place('Quantum relay',A.relay(),22,0,19,0,[1,1]);
 const drone=place('Autonomous maintenance drone',A.drone(),7,3.2,8);
 const plantPositions=[[-23,8],[-26,19],[-23,25],[24,23],[25,5],[25,-14],[29,-32],[38,-39],[41,-45],[-27,-23],[-30,-8],[-35,26]];
 for(let i=0;i<plantPositions.length;i++){const [x,z]=plantPositions[i];const p=place('Luma flora',A.alienPlant(),x,0,z,i*2.4);p.scale.setScalar(.7+(i%4)*.22)}
 const targets=[{x:-4.2,z:19,name:'Občanský terminál',note:'Rok 5000 • Elyra, Svaz Aurelia. Občanská síť je v tomto sektoru v nouzovém režimu.'},{x:12,z:23,name:'Kurýrní loď A-17',note:'Civilní antigravitační kurýr. Pilotní rozhraní je zatím uzamčeno; létání přijde v pozdější verzi.'},{x:22,z:19,name:'Kvantový vysílač',note:'Meziplanetární komunikační uzel. Přijímá slabý signál ze soustavy Solaris.'}];
 return {targets,names,update(t){if(!root.visible)return;drone.position.set(7+Math.cos(t*.23)*3,3.25+Math.sin(t*1.1)*.24,8+Math.sin(t*.23)*4);drone.rotation.y=-t*.23;kiosk.userData.holo.rotation.y=t*.7;ship.position.y=.34+Math.sin(t*.9)*.045}}
}
