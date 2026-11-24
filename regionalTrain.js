// Regional R-24: one walk-through physical model shared by the world and travel view.
export const REGIONAL={length:24,width:3.2,height:3.25,doorZ:[-5.5,5.5],halfWidth:1.58,exitX:2.15,floor:.17};
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
 function loft(sections,m){const p=[],idx=[],n=32;for(const [z,w,h,y] of sections)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,sp=x=>Math.sign(x)*Math.pow(Math.abs(x),.58);p.push(w*sp(Math.cos(a)),y+h*sp(Math.sin(a)),z)}for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c)}for(let i=1;i<n-1;i++){idx.push(0,i+1,i);const k=(sections.length-1)*n;idx.push(k,k+i,k+i+1)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,m,0,0,0)}
 // continuous deck and curved roof, two vehicle sections, central gangway.
 b(floor,0,.10,0,3.14,.14,19.5);b(dark,0,-.03,0,3.02,.12,19.5);
 const sh=new T.Shape();sh.moveTo(-1.6,2.62);sh.quadraticCurveTo(-1.5,3.17,-.82,3.22);sh.quadraticCurveTo(0,3.28,.82,3.22);sh.quadraticCurveTo(1.5,3.17,1.6,2.62);sh.lineTo(1.43,2.62);sh.quadraticCurveTo(1.34,2.99,.75,3.04);sh.quadraticCurveTo(0,3.10,-.75,3.04);sh.quadraticCurveTo(-1.34,2.99,-1.43,2.62);sh.closePath();
 mesh(g,new T.ExtrudeGeometry(sh,{depth:19.5,bevelEnabled:false,curveSegments:16}),white,0,0,-9.75);
 for(const side of [-1,1]){const x=side*1.55;
 // Side walls are actual individual segments; no hidden solid hull across doors.
 for(const [a,c] of [[-9.75,-6.22],[-4.78,-.20],[.20,4.78],[6.22,9.75]]){const z=(a+c)/2,d=c-a;b(white,x,.57,z,.12,.80,d);b(accent,x+side*.065,.83,z,.025,.22,d);b(blue,x+side*.068,.37,z,.025,.23,d);b(white,x,2.75,z,.14,.32,d);b(dark,x,1.82,z,.10,.08,d);b(glass,x,1.81,z,.055,1.30,d-.10);for(let j=1;j<Math.ceil(d/1.65);j++)b(dark,x,1.83,a+j*d/Math.ceil(d/1.65),.14,1.48,.075);for(const q of [a+.045,c-.045])b(white,x,1.76,q,.16,1.75,.09)}
 b(white,x,2.79,0,.15,.28,19.45);b(lit,side*1.34,2.91,0,.075,.045,19.2);
 for(const z of REGIONAL.doorZ){b(blue,x,2.70,z,.15,.33,1.46);b(amber,x+side*.08,2.52,z,.035,.045,1.35);b(metal,x,.19,z,.20,.045,1.48)}
 // real flexible gangway between both articles, interior remains unobstructed.
 b(dark,x,1.50,0,.15,2.66,.40);for(let k=0;k<4;k++)b(metal,x+side*.08,1.50,-.15+k*.10,.035,2.55,.025)
 }
 for(const z of [-9.72,9.72]){b(white,0,1.48,z,3.0,2.62,.12);b(dark,0,1.48,z*.99,1.06,2.25,.06);b(glass,0,1.99,z*.985,.78,.82,.035)}
 // tapered compact noses; no passenger access to equipment cabs.
 const nose=white.clone();nose.side=T.DoubleSide;
 loft([[-12,.35,.36,1.05],[-11.55,.96,.73,1.36],[-10.7,1.47,1.23,1.63],[-9.75,1.6,1.48,1.68]],nose);
 loft([[9.75,1.6,1.48,1.68],[10.7,1.47,1.23,1.63],[11.55,.96,.73,1.36],[12,.35,.36,1.05]],nose);
 for(const side of [-1,1]){const z=side*10.64;const o=mesh(g,sphere,dark,0,2.22,z,1.29,.68,.86);o.rotation.x=side*.29;const v=mesh(g,sphere,glass,0,2.28,z+side*.09,1.23,.61,.83);v.rotation.x=side*.29;for(const x of [-.74,.74])mesh(g,sphere,side<0?lit:red,x,1.14,side*11.33,.22,.10,.10);mesh(g,sphere,accent,0,.80,side*11.25,.87,.18,.45)}
 const doors=[];for(const side of [-1,1])for(const z of REGIONAL.doorZ){for(const d of [-1,1]){const p=new T.Group();p.position.set(side*1.55,1.37,z+d*.355);g.add(p);b(blue,0,-.48,0,.12,1.18,.69,p);b(glass,0,.61,0,.075,.85,.55,p);b(white,0,1.10,0,.12,.18,.69,p);b(white,0,.46,-.32,.12,1.1,.065,p);b(white,0,.46,.32,.12,1.1,.065,p);b(metal,0,.02,d*.24,.16,.09,.045,p);doors.push({p,side,z,d})}}
 const steps=[];for(const side of [-1,1])for(const z of REGIONAL.doorZ){const p=b(metal,side*1.92,.16,z,.75,.08,1.37);b(amber,0,0,0,.02,.02,.02,p);p.visible=false;steps.push({p,side})}
 // 16 individually modelled seats, armrests, tables/handles and overhead storage.
 for(const s of SEATS){b(dark,s.x,.31,s.z,.77,.28,.79);b(seat,s.x,.51,s.z,.76,.17,.80);const back=b(seatBack,s.x,.95,s.z+.35,.77,.81,.14);back.rotation.x=-.10;b(seat,s.x,1.26,s.z+.38,.62,.23,.16);for(const dx of [-.34,.34])b(metal,s.x+dx,.72,s.z,.055,.08,.63)}
 for(const side of [-1,1]){b(white,side*1.12,2.47,0,.60,.075,18.9);b(metal,side*1.37,2.42,0,.055,.055,18.9);for(const z of [-5.5,5.5,-.5,.5]){b(metal,side*.78,1.78,z,.035,1.78,.035);b(amber,side*.78,2.58,z,.055,.23,.055)}}
 for(const z of [-7.8,-2.8,2.8,7.8]){b(dark,0,-.07,z,2.7,.16,1.85);b(lit,0,-.17,z,2.4,.045,1.55)}
 const cv=document.createElement('canvas');cv.width=1024;cv.height=192;const ctx=cv.getContext('2d'),tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const screenMat=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});for(const z of [-9.58,9.58]){const o=mesh(g,new T.PlaneGeometry(2.25,.42),screenMat,0,2.55,z);o.rotation.y=z>0?Math.PI:0}
 const nameCanvas=document.createElement('canvas');nameCanvas.width=1024;nameCanvas.height=192;const n=nameCanvas.getContext('2d');n.fillStyle='#12283f';n.fillRect(0,0,1024,192);n.fillStyle=line==='M2'?'#bd85ff':'#00e0c4';n.fillRect(0,0,180,192);n.font='bold 92px sans-serif';n.fillStyle='#0c2334';n.fillText(line,24,125);n.fillStyle='#edfaff';n.font='bold 64px sans-serif';n.fillText('LUMEN • R24',220,118);const nt=new T.CanvasTexture(nameCanvas);nt.colorSpace=T.SRGBColorSpace;for(const side of [-1,1]){const o=mesh(g,new T.PlaneGeometry(2.5,.47),new T.MeshBasicMaterial({map:nt}),side*1.632,2.75,2.7);o.rotation.y=side*Math.PI/2}
 let label='';function setDisplay(text){if(text===label)return;label=text;ctx.fillStyle='#10243a';ctx.fillRect(0,0,1024,192);ctx.font='bold 64px sans-serif';ctx.fillStyle='#8af1eb';ctx.fillText(line+'  /  '+text,25,115,970);tex.needsUpdate=true}setDisplay('REGIONAL');
 let opening=0;function setDoors(open,side=0,dt=1){opening=T.MathUtils.lerp(opening,open?1:0,Math.min(1,dt*8));for(const d of doors)d.p.position.z=d.z+d.d*(.355+(d.side===side||side===0?opening:0)*.74);for(const s of steps)s.p.visible=opening>.7&&(s.side===side||side===0)}
 return {group:g,setDoors,setDisplay};
}
