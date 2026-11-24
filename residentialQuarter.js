// Valley 07 south residential quarter. All dimensions in metres.
export const RESIDENTIAL=[
 {id:'H-03',title:'ORBIT',type:'arc',x:-50,z:38,w:10,d:8},
 {id:'H-04',title:'SOLA',type:'wing',x:-29,z:38,w:11,d:8},
 {id:'H-05',title:'TERRA',type:'tier',x:-50,z:57,w:11,d:9},
 {id:'H-06',title:'IRIS',type:'arc',x:31,z:40,w:10,d:8},
 {id:'H-07',title:'VELA',type:'wing',x:53,z:40,w:11,d:8},
 {id:'H-08',title:'ZENITH',type:'tier',x:53,z:58,w:11,d:9}
];
export const RES_PATHS=[
 {x:-39,z:46.5,w:3.6,d:37},{x:-40,z:46,w:33,d:3.6},{x:-45,z:65,w:22,d:3.6},
 {x:42,z:47,w:3.6,d:36},{x:42,z:48,w:33,d:3.6},{x:49,z:66,w:22,d:3.6}
];
const insideRect=(p,x,z,pad=0)=>Math.abs(x-p.x)<p.w/2+pad&&Math.abs(z-p.z)<p.d/2+pad;
export function residentialClearance(x,z,pad=0){return RES_PATHS.some(p=>insideRect(p,x,z,pad))||RESIDENTIAL.some(p=>Math.abs(x-p.x)<p.w/2+2+pad&&z>p.z-p.d/2-1.5-pad&&z<p.z+p.d/2+3.4+pad)}
export function installResidential(T,root,colliders){
 const group=new T.Group();group.name='South residential district';root.add(group);
 const mat=(color,roughness=.65,metalness=.12)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const M={shell:mat(0xe0e4e6,.38,.32),stone:mat(0x9babae),dark:mat(0x304754,.46,.48),wood:mat(0xa78d76,.78),fabric:mat(0x597e84,.95),cream:mat(0xe5daca,.9),pave:mat(0x728a92,.86),soil:mat(0x4b6561,.9),leaf:mat(0xa795cf,.7),glass:new T.MeshStandardMaterial({color:0x91cfdf,transparent:true,opacity:.22,depthWrite:false,roughness:.18}),glow:new T.MeshStandardMaterial({color:0x90eadc,emissive:0x46bea9,emissiveIntensity:1.2}),warm:new T.MeshStandardMaterial({color:0xffdfb0,emissive:0xf2b778,emissiveIntensity:1.1}),blue:mat(0x567a98,.4,.35)};
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1),cylinder=new T.CylinderGeometry(1,1,1,16);
 const batches=new Map(),dummy=new T.Object3D(),doors=[],targets=[],buildings=[];
 function batch(geo,m,x,y,z,w,h,d,ry=0){let byMat=batches.get(geo);if(!byMat)batches.set(geo,byMat=new Map());let a=byMat.get(m);if(!a)byMat.set(m,a=[]);dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(w,h,d);dummy.updateMatrix();a.push(dummy.matrix.clone())}
 const b=(m,x,y,z,w,h,d)=>batch(cube,m,x,y,z,w,h,d);
 function mesh(geo,m,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.receiveShadow=!m.transparent;group.add(o);return o}
 function col(x,z,w,d){colliders.push([x-w/2,x+w/2,z-d/2,z+d/2])}
 function sign(p){const c=document.createElement('canvas');c.width=384;c.height=128;const a=c.getContext('2d');a.fillStyle='#203743';a.fillRect(0,0,384,128);a.fillStyle='#d4f3ef';a.textAlign='center';a.font='bold 39px sans-serif';a.fillText(p.title,192,54);a.font='23px sans-serif';a.fillText('ELYRA / '+p.id,192,96);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(2.5,.83),new T.MeshBasicMaterial({map:t}),p.x,3.35,p.z+p.d/2+.16)}
 function profile(type,w){
  // Outer and inner roof contours; keep all roofs hollow and at least 2.9m above floor.
  if(type==='arc')return [[-w/2-.35,2.95],[-w*.49,4.05],[-w*.24,5.05],[0,5.2],[w*.24,5.05],[w*.49,4.05],[w/2+.35,2.95]];
  if(type==='wing')return [[-w/2-.65,4.75],[-w*.33,4.3],[-w*.17,3.8],[0,3.55],[w*.17,3.8],[w*.33,4.3],[w/2+.65,4.75]];
  return [[-w/2-.4,3.2],[-w*.29,3.2],[-w*.28,4.55],[w*.12,4.55],[w*.13,5.65],[w*.37,5.65],[w*.38,3.6],[w/2+.4,3.6]];
 }
 function roof(p){const points=profile(p.type,p.w);const sh=new T.Shape();sh.moveTo(...points[0]);for(let i=1;i<points.length;i++)sh.lineTo(...points[i]);for(let i=points.length-1;i>=0;i--)sh.lineTo(points[i][0],points[i][1]-.24);sh.closePath();mesh(new T.ExtrudeGeometry(sh,{depth:p.d+.8,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:1}),p.type==='wing'?M.blue:M.shell,p.x,0,p.z-p.d/2-.4);
  // Close each roof end with a translucent clerestory; no opaque volume over the interior.
  const g=new T.Shape();g.moveTo(-p.w/2,2.9);for(const q of points)g.lineTo(Math.max(-p.w/2,Math.min(p.w/2,q[0])),Math.max(2.9,q[1]-.25));g.lineTo(p.w/2,2.9);g.closePath();
  for(const z of [-p.d/2,p.d/2])mesh(new T.ShapeGeometry(g),M.glass,p.x,0,p.z+z);
  if(p.type==='tier'){b(M.blue,p.x+p.w*.23,5.7,p.z,2,.10,p.d*.7);for(let i=0;i<5;i++)b(M.dark,p.x+p.w*.23,5.76,p.z-p.d*.28+i*p.d*.14,1.9,.025,.035)}
 }
 function home(p){
  const B=(m,x,y,z,w,h,d)=>b(m,p.x+x,y,p.z+z,w,h,d),C=(x,z,w,d)=>col(p.x+x,p.z+z,w,d),S=(m,x,y,z,w,h,d)=>{B(m,x,y,z,w,h,d);C(x,z,w,d)};
  const {w,d}=p;buildings.push(p);
  B(M.stone,0,.035,0,w+.45,.07,d+.4);B(M.pave,0,.04,d/2+1.4,w+.7,.08,2.8);B(M.wood,0,.085,0,w-.3,.05,d-.3);
  S(M.shell,0,1.45,-d/2,w,2.9,.2);
  for(const side of [-1,1]){const x=side*w/2;C(x,0,.2,d);B(M.dark,x,.37,0,.2,.74,d);B(M.shell,x,2.72,0,.22,.4,d);for(const z of [-d/2,-d/6,d/6,d/2])B(M.dark,x,1.58,z,.22,2.4,.15);for(const z of [-d/3,0,d/3])mesh(cube,M.glass,p.x+x,1.63,p.z+z,.045,1.78,d/3-.15);
   const fw=(w-2.4)/2,fx=side*(1.2+fw/2);C(fx,d/2,fw,.2);B(M.dark,fx,.34,d/2,fw,.68,.22);B(M.shell,fx,2.72,d/2,fw,.4,.22);mesh(cube,M.glass,p.x+fx,1.62,p.z+d/2,fw-.12,1.84,.05);B(M.dark,side*1.2,1.45,d/2,.15,2.9,.24);B(M.glow,fx,2.42,d/2+.12,fw-.2,.045,.03);
   const panel=mesh(cube,M.blue,p.x+side*.59,1.25,p.z+d/2+.13,1.16,2.5,.10);doors.push({p,panel,side,open:0});B(M.warm,side*w*.28,2.76,0,.06,.04,d*.75)}
  B(M.shell,0,2.72,d/2,2.4,.4,.26);roof(p);sign(p);
  // Furniture is laid out to preserve a broad central aisle.
  const bx=-w/2+1.28,bz=-d/2+1.6;S(M.dark,bx,.27,bz,1.9,.54,2.45);B(M.cream,bx,.62,bz,1.83,.18,2.38);B(M.fabric,bx,.75,bz+.33,1.81,.08,1.6);for(const x of [-.43,.43])B(M.cream,bx+x,.78,bz-.8,.76,.14,.47);
  const kx=w/2-.65;S(M.dark,kx,.48,-d/2+1.45,1,.96,2.7);B(M.wood,kx,1.0,-d/2+1.45,1.05,.08,2.8);B(M.blue,kx,1.065,-d/2+.8,.68,.05,.75);B(M.glow,kx-.53,.88,-d/2+1.5,.03,.06,2.25);
  const sx=w/2-1.05;S(M.dark,sx,.28,1.25,1.55,.56,2.35);B(M.fabric,sx,.65,1.25,1.5,.2,2.3);B(M.fabric,sx+.63,.96,1.25,.28,.66,2.4);
  S(M.dark,-w/2+1.2,.39,1.3,1.3,.78,1.6);B(M.wood,-w/2+1.2,.82,1.3,1.5,.1,1.8);B(M.glow,-w/2+1.2,.91,1.3,.48,.035,.38);
  if(p.type==='tier'){S(M.dark,0,.55,-d/2+.7,2.3,1.1,.75);B(M.blue,0,1.48,-d/2+.7,1.65,.65,.12)}else if(p.type==='wing'){S(M.wood,0,.55,-d/2+.75,2.1,1.1,.8);B(M.glow,0,1.2,-d/2+.75,1.8,.06,.55)}else{B(M.dark,0,1.65,-d/2+.14,2,1.05,.14);B(M.blue,0,1.65,-d/2+.23,1.85,.91,.04)}
  // Porch planting and a lighted address bollard.
  for(const side of [-1,1]){const x=p.x+side*(w/2-1),z=p.z+d/2+1.45;batch(cylinder,M.soil,x,.26,z,.48,.52,.48);col(x,z,1,1);for(let i=0;i<3;i++){const a=i*2.1;batch(sphere,M.leaf,x+Math.cos(a)*.22,.85+(i%2)*.18,z+Math.sin(a)*.22,.27,.47,.27)}}
  targets.push({x:p.x,z:p.z,name:p.title+' / '+p.id,note:'Obytný modul '+p.title+'. '+({arc:'Oblouková panoramatická rezidence.',wing:'Dům se střechou ve tvaru křídel.',tier:'Terasovitý obytný modul s energetickou střechou.'}[p.type])+' Vlastnictví a vybavování budou zpřístupněny s ekonomikou.',category:'residential'});
 }
 for(let i=0;i<RES_PATHS.length;i++){const p=RES_PATHS[i],y=.04+i*.001;b(M.pave,p.x,y,p.z,p.w,.045,p.d);const hor=p.w>p.d;for(const side of [-1,1])b(M.glow,p.x+(hor?0:side*(p.w/2-.15)),y+.03,p.z+(hor?side*(p.d/2-.15):0),hor?p.w:.045,.018,hor?.045:p.d)}
 for(const p of RESIDENTIAL)home(p);
 // Shared pedestrian furniture, kept at the sides of the north-south lanes.
 for(const [x,z] of [[-41.8,33],[-36.2,53],[-41.8,62],[44.8,34],[39.2,55],[44.8,63]]){batch(cylinder,M.dark,x,1.35,z,.09,2.7,.09);batch(cylinder,M.glow,x,2.75,z,.28,.11,.28);col(x,z,.3,.3)}
 // Batch non-moving components into shared geometry/material draws.
 let instances=0,draws=0;for(const [geo,byMat] of batches)for(const [m,matrices] of byMat){const o=new T.InstancedMesh(geo,m,matrices.length);matrices.forEach((mx,i)=>o.setMatrixAt(i,mx));o.instanceMatrix.needsUpdate=true;o.receiveShadow=true;o.computeBoundingSphere();group.add(o);instances+=matrices.length;draws++}
 function inside(x,z){return buildings.some(p=>insideRect(p,x,z,-.12))}
 return {buildings,targets,inside,covered:residentialClearance,instances,draws,update(dt,x,z,time,enabled){for(const d of doors){const near=enabled&&Math.abs(x-d.p.x)<2.3&&Math.abs(z-d.p.z-d.p.d/2)<2.6;d.open=T.MathUtils.lerp(d.open,near?1:0,1-Math.exp(-dt*8));d.panel.position.x=d.p.x+d.side*(.59+d.open*1.22)}M.glow.emissiveIntensity=.65+.65*Math.max(0,Math.cos(time/24*Math.PI*2))}};
}
