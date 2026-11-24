// Original year-5000 transit hub. Uses old station footprint to preserve mission compatibility.
export function buildTransitHub(T,scene,colliders,schedule){
 const group=new T.Group();group.name='Transit Hub 07';scene.add(group);
 const mat=(color,roughness=.6,metalness=.2)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const shell=mat(0xc8d6dd,.35,.32),frame=mat(0x304651,.42,.6),floor=mat(0x7c8d93,.7,.15),seat=mat(0x547a85,.85,0),glass=new T.MeshStandardMaterial({color:0x9acfe3,transparent:true,opacity:.24,roughness:.15,depthWrite:false}),cyan=new T.MeshStandardMaterial({color:0x75dce8,emissive:0x42cada,emissiveIntensity:1.2}),amber=new T.MeshStandardMaterial({color:0xffd6a0,emissive:0xffa84f,emissiveIntensity:.9});
 const cube=new T.BoxGeometry(1,1,1);
 function b(x,y,z,w,h,d,m,solid=false){const o=new T.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=!m.transparent&&y>.35;o.receiveShadow=!m.transparent;group.add(o);if(solid)colliders.push([x-w/2,x+w/2,z-d/2,z+d/2]);return o}
 function plate(text,sub,x,y,z,w,rot=0){const cv=document.createElement('canvas');cv.width=512;cv.height=128;const a=cv.getContext('2d');a.fillStyle='#112831';a.fillRect(0,0,512,128);a.fillStyle='#a8e8ec';a.font='bold 43px sans-serif';a.textAlign='center';a.fillText(text,256,53);a.fillStyle='#c6d9dd';a.font='22px sans-serif';a.fillText(sub,256,96);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));o.position.set(x,y,z);o.rotation.y=rot;group.add(o);return o}
 b(-13,.06,-4,13.3,.12,12.4,floor);b(-13,.07,3.7,13.4,.14,3.5,frame);
 b(-13,1.85,-10,13,3.7,.24,shell,true);
 for(const x of [-19.5,-6.5]){b(x,.33,-4,.20,.66,12,frame,true);b(x,3.35,-4,.24,.70,12,shell);for(const z of [-9.85,-6,-2,1.85])b(x,1.93,z,.24,2.7,.17,frame);for(const z of [-8,-4,0])b(x,1.95,z,.055,2.58,3.83,glass);b(x,2.99,-4,.09,.055,11.7,cyan)}
 // Wide accessible entrance with two sliding glazed doors.
 for(const x of [-16.95,-9.05]){b(x,.32,2,5.1,.64,.24,frame,true);b(x,1.92,2,5,2.55,.07,glass);b(x,3.35,2,5.1,.70,.24,shell)}
 for(const x of [-19.44,-14.43,-11.57,-6.56])b(x,1.82,2,.18,3.64,.27,frame);
 b(-13,3.35,2,2.9,.7,.28,shell);
 const doors=[];for(const side of [-1,1]){const d=b(-13+side*.7,1.47,2.15,1.37,2.92,.09,glass);doors.push({d,side});}
 // Sculptural vault, roof section extruded along the length.
 const shape=new T.Shape();shape.moveTo(-6.9,3.35);shape.quadraticCurveTo(-6.1,5.55,0,5.7);shape.quadraticCurveTo(6.1,5.55,6.9,3.35);shape.lineTo(6.55,3.35);shape.quadraticCurveTo(5.85,5.17,0,5.34);shape.quadraticCurveTo(-5.85,5.17,-6.55,3.35);shape.closePath();
 const roof=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:12.8,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:2,curveSegments:20}),shell);roof.position.set(-13,0,-10.4);roof.castShadow=true;roof.receiveShadow=true;group.add(roof);
 for(const z of [-10.2,2.24]){const g=new T.Shape();g.moveTo(-6.52,3.54);g.quadraticCurveTo(-5.5,5.13,0,5.32);g.quadraticCurveTo(5.5,5.13,6.52,3.54);g.closePath();const o=new T.Mesh(new T.ShapeGeometry(g,20),new T.MeshStandardMaterial({color:0x78a6ba,transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false}));o.position.set(-13,0,z);group.add(o)}
 plate('TRANSIT 07','ELYRA / VEŘEJNÁ DOPRAVA',-13,4.28,2.47,5.3);
 for(const x of [-18,-8]){b(x,3.08,-4,.11,.07,11,cyan);b(x,.14,3.55,.07,.04,2.8,cyan)}
 for(const z of [-8,-4]){b(-8.1,.30,z,1.0,.6,2.3,frame,true);b(-8.1,.68,z,1,.15,2.3,seat);b(-7.68,1.01,z,.20,.63,2.3,seat)}
 b(-18.35,.46,-3,.85,.92,2.2,frame,true);b(-18.35,.96,-3,.9,.10,2.3,shell);plate('INFO','SÍŤ SOLARIS',-18.34,1.65,-2.52,1.15,Math.PI/2);
 // Long M1 boarding platform and contrasting A2 apron.
 const platformBlue=mat(0x2349b1,.45,.35),platformOrange=mat(0xf57922,.43,.25),deck=mat(0x9fbbca,.7,.2);
 for(const [x,number,label,len,accent,center] of [[-3.55,'01','MAGLEV M1',44,platformBlue,0],[3.6,'02','MAGLEV M2',44,platformBlue,0],[15.4,'03','ANTIGRAV',18,platformOrange,10]]){
  b(x,.10,center,2.65,.20,len,deck);b(x,.205,center,2.62,.035,len,accent);b(x,.23,center,2.1,.035,len-.35,deck);
  for(const side of [-1,1])b(x+side*1.22,.26,center,.065,.035,len-.4,cyan);
  for(const dz of [-len/2+2,0,len/2-2]){b(x,1.83,center+dz,.15,3.66,.15,frame);b(x,3.72,center+dz,2.8,.15,.18,accent)}
  b(x,3.85,center,2.9,.17,len,shell);b(x,3.68,center,.07,.055,len-.5,cyan);for(const dz of [-len/2+2,len/2-2])plate(number+' / '+label,'NÁSTUPIŠTĚ',x,3.0,center+dz,2.25,dz<0?Math.PI:0);
 }
 const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const a=cv.getContext('2d');const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
 b(-13,2.55,-9.64,5.6,2.4,.16,frame);
 const board=new T.Mesh(new T.PlaneGeometry(5.4,2.25),new T.MeshBasicMaterial({map:tex}));board.position.set(-13,2.55,-9.53);group.add(board);
 let lastMinute=-1,open=0;
 function update(time,dt,x,z,enabled){if(!enabled)return;const min=Math.floor(time*60);if(min!==lastMinute){lastMinute=min;a.fillStyle='#0a1b27';a.fillRect(0,0,1024,512);a.fillStyle='#79dae8';a.font='bold 49px sans-serif';a.fillText('ODJEZDY / TRANSIT 07',35,63);a.font='29px sans-serif';a.fillText(schedule.formatClock(min)+'  •  ZKUŠEBNÍ PROVOZ',35,112);const rows=schedule.departures('valley',min,120).slice(0,5);for(let i=0;i<rows.length;i++){const r=rows[i],y=152+i*68;a.fillStyle=i%2?'#142f3c':'#102631';a.fillRect(20,y,984,62);a.fillStyle='#edfaf7';a.font='bold 32px monospace';a.fillText(schedule.formatClock(r.at)+'  '+r.line,39,y+42);a.font='32px sans-serif';a.fillText(schedule.STOPS[r.next].name,290,y+42);a.fillStyle='#8de4e3';a.fillText(r.platform,910,y+42)}tex.needsUpdate=true}
 const near=Math.abs(x+13)<2.2&&Math.abs(z-2)<3;open=T.MathUtils.lerp(open,near?1:0,1-Math.exp(-dt*7));for(const p of doors)p.d.position.x=-13+p.side*(.7+open*1.36)
 }
 return {group,update,inside:(x,z)=>x>-19.4&&x<-6.6&&z>-9.9&&z<1.9,target:{x:-13,z:-6.6,name:'Odjezdová tabule'}};
}
