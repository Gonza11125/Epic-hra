// Regional R-24: one walk-through physical model shared by the world and travel view.
export const REGIONAL={length:24,width:3.3,height:3.3,doorZ:[-5.5,5.5],halfWidth:1.58,exitX:2.15,floor:.17};
export const SEATS=[];for(const z of [-8.3,-6.9,-3.9,-2.5,2.5,3.9,6.9,8.3])for(const side of [-1,1])SEATS.push({id:SEATS.length,x:side*1.05,z,side});
export function platformSide(line,stop){return line==='M2'&&stop==='valley'?1:-1}
export function nearDoor(z,margin=.55){return REGIONAL.doorZ.some(d=>Math.abs(z-d)<=margin)}
export function cabinWalkable(x,z,side=0){if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(z)>9.35)return false;if(Math.abs(x)>1.28)return side!==0&&Math.sign(x)===side&&Math.abs(x)<=2.28&&nearDoor(z,.53);if(Math.abs(x)>.54&&SEATS.some(s=>Math.abs(z-s.z)<.56))return false;return true}
export function nearestSeat(x,z){return SEATS.reduce((best,s)=>{const d=Math.hypot(x-s.x,z-s.z);return d<1.25&&(!best||d<best.d)?{...s,d}:best},null)}
export function buildRegionalTrain(T,line='M1'){
 const g=new T.Group();g.name=line+' / R-24 LUMEN';
 const mat=(color,roughness=.45,metalness=.25)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const white=mat(0xe7f3f6),blue=mat(0x124ab4,.32,.45),accent=mat(line==='M2'?0xa34de6:0x00cbbf,.32,.35),dark=mat(0x162d45,.45,.4),floor=mat(0x46546b,.9,.1),seat=mat(0x246da4,.88,0),seatBack=mat(0x193f78,.72,.05),metal=mat(0x9db6c6,.31,.75),glass=new T.MeshStandardMaterial({color:0x80c5e4,transparent:true,opacity:.24,depthWrite:false,roughness:.12,side:T.DoubleSide}),lit=new T.MeshBasicMaterial({color:0x68f9f0}),amber=new T.MeshBasicMaterial({color:0xffc267}),red=new T.MeshBasicMaterial({color:0xf72e5c});
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,24,16);
 function mesh(p,geo,m,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.receiveShadow=true;p.add(o);return o}
 const b=(m,x,y,z,w,h,d,p=g)=>mesh(p,cube,m,x,y,z,w,h,d);
 // Sculpted monocoque: cross-section defined by smooth spline, continuous into tapered noses.
 // Coordinates shared by glazing, skin, paint and door panels; no enclosing solid block.
 const profile=[[.03,.65],[.17,1.36],[.40,1.53],[.78,1.61],[1.35,1.65],[1.90,1.62],[2.28,1.55],[2.60,1.42],[2.86,1.19],[3.06,.82],[3.18,.42],[3.22,0]];
 function width(y){let i=0;while(i<profile.length-2&&y>profile[i+1][0])i++;const [a,x]=profile[i],[c,w]=profile[i+1],q=T.MathUtils.clamp((y-a)/(c-a),0,1);const p=profile[Math.max(0,i-1)],n=profile[Math.min(profile.length-1,i+2)],m0=(w-p[1])/(c-p[0]),m1=(n[1]-x)/(n[0]-a);return Math.max(0,(2*q*q*q-3*q*q+1)*x+(q*q*q-2*q*q+q)*m0*(c-a)+(-2*q*q*q+3*q*q)*w+(q*q*q-q*q)*m1*(c-a))}
 function point(side,z,y,offset=0){const az=Math.abs(z),q=T.MathUtils.clamp((az-9.75)/2.25,0,1);const taper=Math.pow(Math.max(.001,Math.cos(q*Math.PI/2)),.70);const h=.20+.80*Math.pow(Math.max(0,Math.cos(q*Math.PI/2)),.68);const center=1.46-.46*q*q;const articulation=1-.085*Math.exp(-Math.pow(z/.23,2));return [side*(width(y)*taper*articulation+offset),center+(y-1.46)*h,z]}
 // Patches are tessellated, so curved paint bands and nose use the same actual surface.
 function patch(side,z0,z1,y0,y1,m,off=0,nz=null,ny=null,parent=g){nz=nz||Math.max(2,Math.ceil(Math.abs(z1-z0)*6));ny=ny||Math.max(2,Math.ceil(Math.abs(y1-y0)*12));const p=[],idx=[];for(let j=0;j<=nz;j++)for(let i=0;i<=ny;i++)p.push(...point(side,z0+(z1-z0)*j/nz,y0+(y1-y0)*i/ny,off));for(let j=0;j<nz;j++)for(let i=0;i<ny;i++){const a=j*(ny+1)+i,b=a+1,c=a+ny+1,d=c+1;idx.push(...(side===1?[a,b,c,b,d,c]:[a,c,b,b,c,d]))}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(parent,geo,m,0,0,0)}
 for(const m of [white,blue,accent,dark,metal,lit,amber,red])m.side=T.DoubleSide;
 const ink=mat(0x152c43,.19,.42);ink.side=T.DoubleSide;const interior=mat(0xc4dbe3,.68,.08);interior.side=T.DoubleSide;const rubber=mat(0x1b2838,.85,.04);rubber.side=T.DoubleSide;
 const noseGlass=mat(0x163c61,.13,.72);noseGlass.side=T.DoubleSide;
 // Top and belly form continuous surfaces; coloured strips are the shell material, not rectangles stuck on.
 for(const side of [-1,1]){
  for(const [lo,hi,m] of [[.03,.20,dark],[2.52,2.65,blue],[2.65,2.79,accent],[2.79,3.22,white]])patch(side,-9.75,9.75,lo,hi,m);
  for(const [lo,hi,m] of [[2.53,2.79,interior],[2.79,3.22,white]])patch(side,-9.73,9.73,lo,hi,m,-.055);
  // Curved noses with wraparound dark sensor glazing integrated into the surface.
  for(const [z0,z1] of [[-12,-9.75],[9.75,12]])for(const [lo,hi,m] of [[.03,.40,dark],[.40,.68,blue],[.68,.83,accent],[.83,1.40,white],[1.40,1.52,blue],[1.52,2.59,noseGlass],[2.59,2.73,accent],[2.73,3.22,white]])patch(side,z0,z1,lo,hi,m,0,32,Math.ceil((hi-lo)*16)+2);
  // Flush wrap-around light signatures and lower collision sensors.
  for(const sign of [-1,1]){patch(side,sign*11.20,sign*11.88,.96,1.07,sign<0?lit:red,.012,12,3);patch(side,sign*10.40,sign*11.48,.53,.585,lit,.018,12,3);patch(side,sign*10.02,sign*10.35,1.17,1.35,ink,.012,5,4)}
 }
 // Rounded actual window apertures: tessellated side panel with a rounded hole.
 function roundPath(path,z0,z1,y0,y1,r,clockwise=false){if(!clockwise){path.moveTo(z0+r,y0);path.lineTo(z1-r,y0);path.quadraticCurveTo(z1,y0,z1,y0+r);path.lineTo(z1,y1-r);path.quadraticCurveTo(z1,y1,z1-r,y1);path.lineTo(z0+r,y1);path.quadraticCurveTo(z0,y1,z0,y1-r);path.lineTo(z0,y0+r);path.quadraticCurveTo(z0,y0,z0+r,y0)}else{path.moveTo(z0+r,y0);path.quadraticCurveTo(z0,y0,z0,y0+r);path.lineTo(z0,y1-r);path.quadraticCurveTo(z0,y1,z0+r,y1);path.lineTo(z1-r,y1);path.quadraticCurveTo(z1,y1,z1,y1-r);path.lineTo(z1,y0+r);path.quadraticCurveTo(z1,y0,z1-r,y0);path.lineTo(z0+r,y0)}path.closePath();return path}
 function mappedShape(side,shape,m,offset=0){const geo=new T.ShapeGeometry(shape,10),p=geo.attributes.position;for(let i=0;i<p.count;i++){const v=point(side,p.getX(i),p.getY(i),offset);p.setXYZ(i,...v)}p.needsUpdate=true;geo.computeVertexNormals();return mesh(g,geo,m,0,0,0)}
 function window(side,a,c){const inset=.16,y0=1.17,y1=2.40;const outer=new T.Shape();outer.moveTo(a,1.02);outer.lineTo(c,1.02);outer.lineTo(c,2.52);outer.lineTo(a,2.52);outer.closePath();outer.holes.push(roundPath(new T.Path(),a+inset,c-inset,y0,y1,.20,true));mappedShape(side,outer,ink,.002);
 const frame=roundPath(new T.Shape(),a+inset,c-inset,y0,y1,.20);frame.holes.push(roundPath(new T.Path(),a+inset+.055,c-inset-.055,y0+.055,y1-.055,.15,true));mappedShape(side,frame,metal,.005);
 // Glass follows curved skin using a grid with rounded corner contour instead of an opaque box.
 const z0=a+inset+.05,z1=c-inset-.05,lo=y0+.05,hi=y1-.05,r=.15,n=18,p=[],ix=[];for(let i=0;i<=n;i++){const y=lo+(hi-lo)*i/n,d=Math.min(y-lo,hi-y),cut=d<r?r-Math.sqrt(Math.max(0,r*r-(r-d)*(r-d))):0;for(let j=0;j<=n;j++){const z=z0+cut+(z1-z0-2*cut)*j/n;p.push(...point(side,z,y,-.018))}}for(let i=0;i<n;i++)for(let j=0;j<n;j++){const k=i*(n+1)+j;ix.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(g,geo,glass,0,0,0)}
 for(const side of [-1,1]){
  for(const [a,c] of [[-9.75,-6.22],[-4.78,-.20],[.20,4.78],[6.22,9.75]]){
   for(const [lo,hi,m] of [[.20,.42,blue],[.42,.57,white],[.57,.84,accent],[.84,1.02,white]])patch(side,a,c,lo,hi,m);
   const count=Math.max(1,Math.round((c-a)/2.0));for(let j=0;j<count;j++)window(side,a+(c-a)*j/count,a+(c-a)*(j+1)/count);
   // Service-panel seams and etched fasteners following the shell.
   for(const z of [a+.12,c-.12])patch(side,z-.012,z+.012,.23,.50,ink,.009,1,4);
   patch(side,a,c,.345,.375,lit,.013,Math.ceil((c-a)*5),2);
  }
  for(const z of REGIONAL.doorZ){patch(side,z-.72,z+.72,.03,.22,metal);patch(side,z-.72,z+.72,2.40,2.52,blue);for(const d of [-1,1])patch(side,z+d*.72-.035,z+d*.72+.035,.20,2.52,metal,.008,2,28)}
  for(let k=0;k<7;k++){const z=-.20+k*.065;patch(side,z,z+.035,.20,2.52,rubber,.012,2,24)}
 }
 // Human-scale interior. Deck and tapered vestibule ends, continuous gangway.
 b(floor,0,.10,0,2.82,.14,19.45);b(dark,0,-.03,0,2.70,.12,19.5);b(interior,0,.178,0,.94,.015,19.3);
 for(const z of [-9.72,9.72]){b(interior,0,1.42,z,2.78,2.5,.13);b(dark,0,1.40,z*.99,1.0,2.24,.065);b(glass,0,1.95,z*.985,.76,.75,.035)}
 // Sculpted doors are parametrically matched to the hull when shut; slides outside the aperture.
 const doors=[];for(const side of [-1,1])for(const z of REGIONAL.doorZ)for(const d of [-1,1]){
 const p=new T.Group();g.add(p);const lo=d<0?z-.714:z+.008,hi=d<0?z-.008:z+.714;
 for(const [y0,y1,m] of [[.22,.57,blue],[.57,.83,accent],[.83,1.15,white],[1.15,1.22,ink],[2.22,2.40,white]])patch(side,lo,hi,y0,y1,m,.018,6,8,p);
 patch(side,lo+.045,hi-.045,1.22,2.22,glass,.016,7,14,p);for(const x of [lo,hi-.045])patch(side,x,x+.045,1.22,2.22,metal,.021,2,12,p);
 patch(side,lo+.09,hi-.09,.90,.95,amber,.025,4,2,p);doors.push({p,side,z,d})}
 const steps=[];for(const side of [-1,1])for(const z of REGIONAL.doorZ){const p=b(metal,side*1.92,.16,z,.75,.08,1.37);p.visible=false;steps.push({p,side})}
 // Reusable padded, bevelled seat meshes instead of flat box furniture.
 function padded(w,h,d,r){const shape=new T.Shape();const x=-w/2,y=-h/2;roundPath(shape,x,x+w,y,y+h,r);const geo=new T.ExtrudeGeometry(shape,{depth:d-.10,bevelEnabled:true,bevelSegments:3,bevelThickness:.05,bevelSize:.05,curveSegments:7});geo.translate(0,0,-(d-.10)/2);return geo}
 const cushion=padded(.65,.10,.70,.045),backGeo=padded(.65,.70,.16,.14),headGeo=padded(.48,.19,.15,.08),supportGeo=new T.CylinderGeometry(.055,.075,.36,12),handleGeo=new T.CylinderGeometry(.022,.022,1,10);
 function rod(x,y,z,xx,yy,zz,m=metal){const a=new T.Vector3(x,y,z),v=new T.Vector3(xx,yy,zz).sub(a);const o=mesh(g,handleGeo,m,x+v.x/2,y+v.y/2,z+v.z/2,1,v.length(),1);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o}
 for(const s of SEATS){mesh(g,supportGeo,metal,s.x,.35,s.z,1,1,1);mesh(g,cushion,seat,s.x,.54,s.z);const back=mesh(g,backGeo,seatBack,s.x,.96,s.z+.31);back.rotation.x=-.14;mesh(g,headGeo,seat,s.x,1.37,s.z+.37);for(const dx of [-.33,.33]){rod(s.x+dx,.58,s.z+.22,s.x+dx,.76,s.z+.22);rod(s.x+dx,.76,s.z+.22,s.x+dx,.76,s.z-.25,dark)}}
 for(const side of [-1,1]){b(interior,side*1.12,2.47,0,.49,.075,18.8);rod(side*1.31,2.42,-9.4,side*1.31,2.42,9.4);for(const z of [-5.5,5.5,-.5,.5]){rod(side*.78,.18,z,side*.78,2.76,z);rod(side*.78,2.76,z,side*1.19,2.76,z);const handle=mesh(g,new T.TorusGeometry(.10,.018,8,20),accent,side*.78,2.48,z);handle.rotation.y=Math.PI/2}
  for(const z of [-8,-4,4,8]){patch(side,z-.50,z+.50,2.91,2.97,lit,-.15,6,3)}
 }
 // Recessed levitation hardware and roof-mounted environmental modules.
 for(const z of [-7.8,-2.8,2.8,7.8]){mesh(g,sphere,dark,0,-.08,z,1.24,.16,.88);mesh(g,sphere,blue,0,-.19,z,1.05,.10,.72);for(const x of [-.63,.63])mesh(g,sphere,lit,x,-.245,z,.27,.035,.57);for(const x of [-.96,.96])for(let i=0;i<4;i++)b(metal,x,-.08,z-.36+i*.24,.07,.09,.055)}
 for(const z of [-6.8,6.8]){mesh(g,sphere,blue,0,3.19,z,.65,.10,.95);for(let i=0;i<8;i++)b(metal,0,3.27,z-.62+i*.17,.75,.028,.04)}
 const cv=document.createElement('canvas');cv.width=1024;cv.height=192;const ctx=cv.getContext('2d'),tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const screenMat=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});for(const z of [-9.58,9.58]){const o=mesh(g,new T.PlaneGeometry(2.25,.42),screenMat,0,2.55,z);o.rotation.y=z>0?Math.PI:0}
 const nameCanvas=document.createElement('canvas');nameCanvas.width=1024;nameCanvas.height=192;const n=nameCanvas.getContext('2d');n.fillStyle='#12283f';n.fillRect(0,0,1024,192);n.fillStyle=line==='M2'?'#bd85ff':'#00e0c4';n.fillRect(0,0,180,192);n.font='bold 92px sans-serif';n.fillStyle='#0c2334';n.fillText(line,24,125);n.fillStyle='#edfaff';n.font='bold 64px sans-serif';n.fillText('LUMEN • R24',220,118);const nt=new T.CanvasTexture(nameCanvas);nt.colorSpace=T.SRGBColorSpace;for(const side of [-1,1]){const o=mesh(g,new T.PlaneGeometry(2.5,.47),new T.MeshBasicMaterial({map:nt}),side*1.632,2.75,2.7);o.rotation.y=side*Math.PI/2}
 let label='';function setDisplay(text){if(text===label)return;label=text;ctx.fillStyle='#10243a';ctx.fillRect(0,0,1024,192);ctx.font='bold 64px sans-serif';ctx.fillStyle='#8af1eb';ctx.fillText(line+'  /  '+text,25,115,970);tex.needsUpdate=true}setDisplay('REGIONAL');
 let opening=0;function setDoors(open,side=0,dt=1){opening=T.MathUtils.lerp(opening,open?1:0,Math.min(1,dt*8));for(const d of doors){const q=(d.side===side||side===0?opening:0);d.p.position.z=d.d*q*.74;d.p.position.x=d.side*q*.075};for(const s of steps)s.p.visible=opening>.7&&(s.side===side||side===0)}
 return {group:g,setDoors,setDisplay,get doorOpen(){return opening>.88}};
}
