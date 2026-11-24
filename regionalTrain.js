// Regional R-24 LUMEN: one walk-through physical model shared by the world, the travel view and the Design Lab.
// 0.1.3.6.4: textured materials, plug-sliding door mechanism with warning cycle, door lamps and buttons,
// ceiling lighting, levitation glow and static-mesh merging (far fewer draw calls on iPad).
export const REGIONAL={length:24,width:3.2,height:3.25,doorZ:[-5.5,5.5],halfWidth:1.58,exitX:2.15,floor:.17};
export const SEATS=[];for(const z of [-8.3,-6.9,-3.9,-2.5,2.5,3.9,6.9,8.3])for(const side of [-1,1])SEATS.push({id:SEATS.length,x:side*1.05,z,side});
export function platformSide(line,stop){return line==='M2'&&stop==='valley'?1:-1}
export function nearDoor(z,margin=.55){return REGIONAL.doorZ.some(d=>Math.abs(z-d)<=margin)}
export function cabinWalkable(x,z,side=0){if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(z)>9.35)return false;if(Math.abs(x)>1.28)return side!==0&&Math.sign(x)===side&&Math.abs(x)<=2.28&&nearDoor(z,.53);if(Math.abs(x)>.54&&SEATS.some(s=>Math.abs(z-s.z)<.56))return false;return true}
export function nearestSeat(x,z){return SEATS.reduce((best,s)=>{const d=Math.hypot(x-s.x,z-s.z);return d<1.25&&(!best||d<best.d)?{...s,d}:best},null)}

// Door cycle in game minutes. The game clock runs 0.66 game minutes per real second,
// so a three-minute dwell is roughly 4.5 s: release, opening, open, warning tones, closing.
export const DOOR_TIMING={release:.12,opening:.38,warning:.95,closing:.4};
const clamp01=x=>Math.max(0,Math.min(1,x));
export function doorCycle(v,minute){
 const closed={phase:'closed',progress:0,passable:false,released:false,remaining:null};
 if(!v||!Number.isFinite(minute)||!['docked','layover'].includes(v.status)||!Number.isFinite(v.arrival)||!Number.isFinite(v.departure))return closed;
 const since=minute-v.arrival,remaining=v.departure-minute,T=DOOR_TIMING;
 if(since<0||remaining<=0)return {...closed,remaining:Math.max(0,remaining)};
 let progress=clamp01((since-T.release)/T.opening);
 if(remaining<T.closing)progress=Math.min(progress,clamp01(remaining/T.closing));
 const phase=remaining<T.closing?'closing':remaining<T.warning?'warning':since<T.release?'released':progress<1?'opening':'open';
 return {phase,progress,passable:progress>=.92&&phase!=='closing',released:phase!=='closing',remaining};
}
// 0 = hovering at a platform, 1 = cruising. Smooth acceleration and braking profile for a leg.
export function motionLevel(v){if(!v||v.status!=='moving')return 0;const p=clamp01(v.progress||0);return Math.min(1,Math.min(p,1-p)*5)}

const smooth=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t)};
// Procedural texture set, built once per three.js instance and shared by every train.
const KIT=new WeakMap();
function kit(T){
 if(KIT.has(T))return KIT.get(T);
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 let seed=4207;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const tex=(c,color=true)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;return t};
 // terrazzo-like vinyl floor with fine anti-slip grain
 const floor=canvas(512,512,(a,w,h)=>{a.fillStyle='#5b6576';a.fillRect(0,0,w,h);for(let i=0;i<5200;i++){const g=rnd();a.fillStyle=g<.55?'rgba(32,42,58,.45)':g<.85?'rgba(196,210,222,.35)':g<.95?'rgba(0,205,191,.38)':'rgba(140,96,230,.4)';const s=.6+rnd()*2.1;a.fillRect(rnd()*w,rnd()*h,s,s)}a.strokeStyle='rgba(20,28,40,.22)';a.lineWidth=1;for(let y=0;y<h;y+=8){a.beginPath();a.moveTo(0,y);a.lineTo(w,y);a.stroke()}});
 const floorBump=canvas(256,256,(a,w,h)=>{a.fillStyle='#777';a.fillRect(0,0,w,h);for(let y=0;y<h;y+=8){a.fillStyle='#999';a.fillRect(0,y,w,3)}for(let i=0;i<1800;i++){a.fillStyle=rnd()<.5?'#5a5a5a':'#a8a8a8';a.fillRect(rnd()*w,rnd()*h,1.5,1.5)}});
 // LUMEN moquette: deep blue weave with a small teal/violet diamond motif
 const moquette=canvas(256,256,(a,w,h)=>{a.fillStyle='#1d4f8f';a.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){a.fillStyle=y%4?'rgba(10,30,70,.35)':'rgba(70,130,200,.18)';a.fillRect(0,y,w,1)}for(let x=0;x<w;x+=3){a.fillStyle='rgba(8,22,55,.18)';a.fillRect(x,0,1,h)}for(let y=0;y<h;y+=32)for(let x=(y/32)%2*16;x<w;x+=32){a.fillStyle=(x+y)%64?'#18c4c0':'#8d63e6';a.beginPath();a.moveTo(x,y-4);a.lineTo(x+4,y);a.lineTo(x,y+4);a.lineTo(x-4,y);a.fill()}});
 // interior lining: warm white with micro-perforated acoustic dots
 const lining=canvas(256,256,(a,w,h)=>{a.fillStyle='#e9eef1';a.fillRect(0,0,w,h);a.fillStyle='rgba(120,140,155,.18)';for(let y=4;y<h;y+=8)for(let x=4+(y/8%2)*4;x<w;x+=8)a.fillRect(x,y,1.4,1.4);a.fillStyle='rgba(90,110,130,.25)';a.fillRect(0,0,w,1.5);a.fillRect(0,0,1.5,h)});
 // gradient environment for reflections on paint and glass (cheap, no extra lights)
 const envCanvas=canvas(256,128,(a,w,h)=>{const g=a.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2a4a78');g.addColorStop(.42,'#9fc7e6');g.addColorStop(.5,'#f2f6f8');g.addColorStop(.56,'#56677a');g.addColorStop(1,'#1c2430');a.fillStyle=g;a.fillRect(0,0,w,h);a.fillStyle='rgba(255,246,230,.9)';a.beginPath();a.ellipse(w*.7,h*.24,10,7,0,0,Math.PI*2);a.fill();for(let i=0;i<6;i++){a.fillStyle='rgba(255,255,255,.35)';a.fillRect(i*44+8,h*.5-2,28,3)}});
 const env=new T.CanvasTexture(envCanvas);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;
 const k={floor:tex(floor),floorBump:tex(floorBump,false),moquette:tex(moquette),lining:tex(lining),env};
 KIT.set(T,k);return k;
}
// Rounded cushion geometry (bevelled extrusion), centred at origin.
function roundedBox(T,w,h,d,r){const s=new T.Shape(),x=w/2-r,y=h/2-r;s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return g}

// Merge every static mesh into one mesh per material (from ~420 draw calls to ~35 per train).
// Textured materials receive box-projected UVs in metres, so patterns keep a constant scale.
function mergeStatic(T,group,keep){
 const buckets=new Map();
 for(const o of [...group.children]){if(!o.isMesh||keep.has(o))continue;o.updateMatrix();let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrix);if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(geo);group.remove(o)}
 const merged=[];
 for(const [m,list] of buckets){let n=0;for(const g of list)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let i=0;const scale=m.userData.uvScale;
 for(const g of list){const p=g.attributes.position,q=g.attributes.normal,u=g.attributes.uv;for(let j=0;j<p.count;j++,i++){const x=p.getX(j),y=p.getY(j),z=p.getZ(j),nx=q.getX(j),ny=q.getY(j),nz=q.getZ(j);pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;nor[i*3]=nx;nor[i*3+1]=ny;nor[i*3+2]=nz;if(scale){const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);const [a,b]=ay>=ax&&ay>=az?[x,z]:ax>=az?[z,y]:[x,y];uv[i*2]=a*scale;uv[i*2+1]=b*scale}else if(u){uv[i*2]=u.getX(j);uv[i*2+1]=u.getY(j)}}g.dispose()}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.computeBoundingSphere();const mesh=new T.Mesh(geo,m);mesh.receiveShadow=true;mesh.matrixAutoUpdate=false;group.add(mesh);merged.push(mesh)}
 return merged;
}

export function buildRegionalTrain(T,line='M1'){
 const K=kit(T),g=new T.Group();g.name=line+' / R-24 LUMEN';
 const purple=line==='M2';
 // Reflections only on exterior glossy surfaces; interior materials stay cheap for tablet GPUs.
 const std=(color,roughness=.45,metalness=.25,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
 const reflective=[];const gloss=(color,roughness,metalness,intensity=.8)=>{const m=std(color,roughness,metalness,{envMap:K.env,envMapIntensity:intensity});m.userData.env=intensity;reflective.push(m);return m};
 const paint=(color,roughness=.26)=>gloss(color,roughness,.2,.85);
 // exterior
 const white=paint(0xeef6f8),blue=paint(0x123fa6,.3),accent=paint(purple?0x8d42d8:0x00bdb2,.3),dark=std(0x14263c,.42,.45),metal=gloss(0x9fb6c6,.26,.85,1),rubber=std(0x1a222c,.9,0);
 const glass=new T.MeshStandardMaterial({color:0x7fb9d6,transparent:true,opacity:.26,depthWrite:false,roughness:.05,metalness:0,envMap:K.env,envMapIntensity:1.3,side:T.DoubleSide});glass.userData.env=1.3;reflective.push(glass);
 const tint=gloss(0x0c2236,.06,.4,1.4);
 const lit=new T.MeshBasicMaterial({color:0x68f9f0}),head=new T.MeshBasicMaterial({color:0xf4fbff}),red=new T.MeshBasicMaterial({color:0xf72e5c});
 // interior (slightly emissive so the cabin glows at night without real lights)
 const lining=std(0xffffff,.62,.05,{map:K.lining,emissive:0xe8f4ff,emissiveIntensity:.12});lining.userData.uvScale=.9;
 const ceiling=std(0xffffff,.5,.05,{map:K.lining,emissive:0xf0f8ff,emissiveIntensity:.3});ceiling.userData.uvScale=1.1;
 const floor=std(0xffffff,.82,.05,{map:K.floor,bumpMap:K.floorBump,bumpScale:.6,emissive:0x2a3442,emissiveIntensity:.25});floor.userData.uvScale=.55;
 const aisle=std(0x8fa3b8,.8,.05,{map:K.floor,emissive:0x2a3442,emissiveIntensity:.2});aisle.userData.uvScale=.55;
 const moq=std(0xffffff,.95,0,{map:K.moquette,emissive:0x0d2a55,emissiveIntensity:.18});moq.userData.uvScale=2.2;
 const shell=std(0x33465e,.55,.25),portal=std(0xc9d3dc,.45,.35);
 const caution=new T.MeshStandardMaterial({color:0xffc23a,roughness:.6,emissive:0x5a3a00,emissiveIntensity:.5});
 const diffuser=new T.MeshBasicMaterial({color:0xf2fbff}),cove=new T.MeshBasicMaterial({color:0x9ff7f2});
 // animated materials (kept out of the merge or shared so one colour change drives all lamps on a side)
 const lev=new T.MeshBasicMaterial({color:0x1aa7c4}),levCore=new T.MeshBasicMaterial({color:0x7ffcff,transparent:true,opacity:.9,depthWrite:false});
 const lamp={'-1':new T.MeshBasicMaterial({color:0x3a2a12}),'1':new T.MeshBasicMaterial({color:0x3a2a12})};
 const button={'-1':new T.MeshBasicMaterial({color:0x29404a}),'1':new T.MeshBasicMaterial({color:0x29404a})};
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,24,16),lo=new T.SphereGeometry(1,12,6),mid=new T.SphereGeometry(1,20,8),cyl=new T.CylinderGeometry(1,1,1,10);
 function mesh(p,geo,m,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.receiveShadow=true;p.add(o);return o}
 const b=(m,x,y,z,w,h,d,p=g)=>mesh(p,cube,m,x,y,z,w,h,d);
 function loft(sections,m){const p=[],idx=[],n=32;for(const [z,w,h,y] of sections)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,sp=x=>Math.sign(x)*Math.pow(Math.abs(x),.58);p.push(w*sp(Math.cos(a)),y+h*sp(Math.sin(a)),z)}for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c)}for(let i=1;i<n-1;i++){idx.push(0,i+1,i);const k=(sections.length-1)*n;idx.push(k,k+i,k+i+1)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,m,0,0,0)}
 const keep=new Set();

 // --- body: deck, underframe, roof shell -------------------------------------------------
 b(floor,0,.10,0,3.06,.14,19.5);b(aisle,0,.172,0,.98,.006,18.7);b(dark,0,-.03,0,3.02,.12,19.5);
 for(const side of [-1,1])b(dark,side*1.47,-.02,0,.12,.24,19.4); // side skirts
 const sh=new T.Shape();sh.moveTo(-1.6,2.62);sh.quadraticCurveTo(-1.5,3.17,-.82,3.22);sh.quadraticCurveTo(0,3.28,.82,3.22);sh.quadraticCurveTo(1.5,3.17,1.6,2.62);sh.lineTo(1.43,2.62);sh.quadraticCurveTo(1.34,2.99,.75,3.04);sh.quadraticCurveTo(0,3.10,-.75,3.04);sh.quadraticCurveTo(-1.34,2.99,-1.43,2.62);sh.closePath();
 mesh(g,new T.ExtrudeGeometry(sh,{depth:19.5,bevelEnabled:false,curveSegments:16}),white,0,0,-9.75);
 // roof equipment fairings and accent light lines
 for(const z of [-5.2,5.2]){mesh(g,mid,white,0,3.2,z,.95,.13,2.7);b(dark,0,3.29,z,.7,.035,1.6)}
 for(const side of [-1,1])b(accent,side*1.18,3.17,0,.05,.03,19.2);
 // interior ceiling liner, central light diffuser and indirect coves above the racks
 for(const [a,c] of [[-9.6,-.25],[.25,9.6]]){const z=(a+c)/2,d=c-a;b(ceiling,0,2.66,z,1.66,.04,d);b(diffuser,0,2.637,z,.36,.012,d-.3);for(const side of [-1,1]){b(ceiling,side*.86,2.6,z,.12,.14,d);b(cove,side*.82,2.535,z,.025,.02,d-.3)}}

 for(const side of [-1,1]){const x=side*1.55;
 // Side walls are individual segments; door openings are real gaps in the body.
 for(const [a,c] of [[-9.75,-6.22],[-4.78,-.20],[.20,4.78],[6.22,9.75]]){const z=(a+c)/2,d=c-a;b(white,x,.57,z,.12,.80,d);b(accent,x+side*.065,.83,z,.025,.22,d);b(blue,x+side*.068,.37,z,.025,.23,d);b(white,x,2.75,z,.14,.32,d);b(dark,x,1.82,z,.10,.08,d);b(glass,x,1.81,z,.055,1.30,d-.10);
  // interior lining below the windows and a window sill
  b(lining,x-side*.075,.62,z,.03,.86,d-.04);b(lining,x-side*.1,1.13,z,.1,.04,d-.04);
  const panes=Math.ceil(d/1.65);for(let j=1;j<panes;j++)b(dark,x,1.83,a+j*d/panes,.14,1.48,.075);for(const q of [a+.045,c-.045])b(white,x,1.76,q,.16,1.75,.09)}
 b(white,x,2.79,0,.15,.28,19.45);b(lit,side*1.34,2.91,0,.075,.045,19.2);
 for(const z of REGIONAL.doorZ){
  b(blue,x,2.70,z,.15,.33,1.46);b(metal,x,.19,z,.20,.045,1.48);
  // door portal: rubber seals, outside and inside warning lamps, caution strip on the floor
  for(const e of [-1,1])b(rubber,x,1.37,z+e*.705,.18,2.3,.03);
  b(lamp[side],x+side*.085,2.52,z,.03,.05,1.3);b(lamp[side],x-side*.09,2.48,z,.03,.04,1.1);
  b(caution,side*1.34,.176,z,.26,.008,1.42);b(dark,side*1.47,.176,z,.04,.009,1.42);
  // interior push buttons on the portal pillar
  const pb=mesh(g,cyl,button[side],x-side*.09,1.18,z+.86,.045,.02,.045);pb.rotation.z=Math.PI/2;
 }
 // flexible gangway bellows between both articles
 b(dark,x,1.50,0,.15,2.66,.40);for(let k=0;k<4;k++)b(metal,x+side*.08,1.50,-.15+k*.10,.035,2.55,.025);
 // levitation pods along the underframe
 for(const z of [-7.8,-2.8,2.8,7.8]){mesh(g,lo,dark,side*1.2,-.06,z,.34,.08,1.05);mesh(g,lo,lev,side*1.22,-.115,z,.26,.03,.9)}
 }
 for(const z of [-.25,.25]){for(const side of [-1,1])b(portal,side*1.0,1.4,z,.9,2.46,.05);b(portal,0,2.5,z,1.1,.3,.05)}b(caution,0,.176,-.25,1.1,.008,.06);b(caution,0,.176,.25,1.1,.008,.06); // gangway portal frames
 for(const z of [-9.72,9.72]){b(white,0,1.48,z,3.0,2.62,.12);b(lining,0,1.2,z*.993,2.8,1.9,.02);b(dark,0,1.48,z*.99,1.06,2.25,.06);b(glass,0,1.99,z*.985,.78,.82,.035)}
 // tapered compact noses; no passenger access to equipment cabs.
 const nose=white.clone();nose.side=T.DoubleSide;reflective.push(nose);
 loft([[-12,.35,.36,1.05],[-11.55,.96,.73,1.36],[-10.7,1.47,1.23,1.63],[-9.75,1.6,1.48,1.68]],nose);
 loft([[9.75,1.6,1.48,1.68],[10.7,1.47,1.23,1.63],[11.55,.96,.73,1.36],[12,.35,.36,1.05]],nose);
 for(const side of [-1,1]){const z=side*10.64;const o=mesh(g,sphere,tint,0,2.22,z,1.29,.68,.86);o.rotation.x=side*.29;const v=mesh(g,sphere,glass,0,2.28,z+side*.09,1.23,.61,.83);v.rotation.x=side*.29;
  for(const x of [-.74,.74]){mesh(g,lo,side<0?head:red,x,1.14,side*11.33,.22,.10,.10);const strip=mesh(g,lo,side<0?lit:red,x*.62,1.02,side*11.5,.3,.03,.05);strip.rotation.y=x>0?-side*.5:side*.5}
  mesh(g,mid,accent,0,.80,side*11.25,.87,.18,.45);mesh(g,mid,dark,0,.55,side*11.05,1.05,.12,.5)}

 // --- doors: two plug-sliding leaves per opening ---------------------------------------------
 const doors=[];for(const side of [-1,1])for(const z of REGIONAL.doorZ){for(const d of [-1,1]){const p=new T.Group();p.position.set(side*1.55,1.37,z+d*.355);g.add(p);keep.add(p);
  b(blue,0,-.48,0,.12,1.18,.69,p);b(glass,0,.61,0,.075,.85,.55,p);b(white,0,1.10,0,.12,.18,.69,p);b(white,0,.46,-.32,.12,1.1,.065,p);b(white,0,.46,.32,.12,1.1,.065,p);b(rubber,0,.32,-d*.345,.13,2.2,.025,p);b(metal,side*.065,.02,d*.24,.03,.5,.04,p);b(metal,-side*.065,.02,d*.24,.03,.5,.04,p);
  if(d<0){for(const s of [1,-1]){const bt=mesh(p,cyl,button[side],side*s*.066,-.1,-.2,.05,.012,.05);bt.rotation.z=Math.PI/2}}
  mergeStatic(T,p,new Set());doors.push({p,side,z,d})}}
 const steps=[];for(const side of [-1,1])for(const z of REGIONAL.doorZ){const p=new T.Group();p.position.set(side*1.45,.16,z);g.add(p);b(metal,0,0,0,.75,.06,1.37,p);b(caution,side*.355,.032,0,.04,.006,1.3,p);mergeStatic(T,p,new Set());p.visible=false;keep.add(p);steps.push({p,side})}

 // --- seats: 16 individually modelled seats with rounded cushions ------------------------------
 const cushion=roundedBox(T,.74,.15,.76,.05),backGeo=roundedBox(T,.74,.84,.13,.05),headGeo=roundedBox(T,.6,.2,.15,.06);
 for(const s of SEATS){const wall=s.side*1.47;b(dark,s.x,.36,s.z,.62,.07,.7);b(metal,(s.x+wall)/2,.36,s.z,Math.abs(wall-s.x),.05,.08);b(metal,s.x-s.side*.18,.26,s.z,.05,.2,.05);
  mesh(g,cushion,moq,s.x,.5,s.z,1,1,1);const back=mesh(g,backGeo,moq,s.x,.96,s.z+.35,1,1,1);back.rotation.x=-.1;const hr=mesh(g,headGeo,shell,s.x,1.42,s.z+.39,1,1,1);hr.rotation.x=-.1;const sb=b(white,s.x,.96,s.z+.43,.72,.8,.03);sb.rotation.x=-.1;
  for(const dx of [-.36,.36])b(metal,s.x+dx,.68,s.z,.045,.06,.6);b(metal,s.x-s.side*.3,1.43,s.z+.33,.05,.05,.06)}
 // luggage racks, handrails and grab poles
 for(const side of [-1,1]){b(white,side*1.12,2.47,0,.60,.035,18.9);for(let i=0;i<7;i++)b(metal,side*1.12,2.452,-9+i*3,.58,.02,.03);b(metal,side*.83,2.43,0,.04,.04,18.9);b(metal,side*1.37,2.42,0,.055,.055,18.9);for(const z of [-5.5,5.5,-.5,.5]){b(metal,side*.78,1.4,z,.035,2.5,.035);b(lamp[side],side*.78,2.43,z,.05,.05,.05)}}

 // --- passenger information: end displays and two ceiling displays per article ----------------
 const cv=document.createElement('canvas');cv.width=1024;cv.height=192;const ctx=cv.getContext('2d'),tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;const screenMat=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});
 const screenGeo=new T.PlaneGeometry(2.25,.42),hangGeo=new T.PlaneGeometry(1.1,.205);
 for(const z of [-9.58,9.58]){const o=mesh(g,screenGeo,screenMat,0,2.55,z);o.rotation.y=z>0?Math.PI:0;keep.add(o)}
 for(const z of [-5.5,5.5]){for(const f of [0,Math.PI]){const o=mesh(g,hangGeo,screenMat,0,2.42,z+(f?-.012:.012));o.rotation.y=f;keep.add(o)}b(dark,0,2.42,z,1.16,.24,.02);b(metal,0,2.55,z,.04,.2,.04)}
 const nameCanvas=document.createElement('canvas');nameCanvas.width=1024;nameCanvas.height=192;const n=nameCanvas.getContext('2d');n.fillStyle='#12283f';n.fillRect(0,0,1024,192);n.fillStyle=purple?'#bd85ff':'#00e0c4';n.fillRect(0,0,180,192);n.font='bold 92px sans-serif';n.fillStyle='#0c2334';n.fillText(line,24,125);n.fillStyle='#edfaff';n.font='bold 64px sans-serif';n.fillText('LUMEN • R24',220,118);n.font='28px sans-serif';n.fillStyle='#8fb6cf';n.fillText('ELYRA REGIONAL',720,118);const nt=new T.CanvasTexture(nameCanvas);nt.colorSpace=T.SRGBColorSpace;const nameMat=new T.MeshBasicMaterial({map:nt});for(const side of [-1,1]){const o=mesh(g,new T.PlaneGeometry(2.5,.47),nameMat,side*1.632,2.75,2.7);o.rotation.y=side*Math.PI/2}

 mergeStatic(T,g,keep);

 let label='';
 function setDisplay(text,sub='',alert=false){const key=text+'|'+sub+'|'+alert;if(key===label)return;label=key;
  ctx.fillStyle='#0b1b2e';ctx.fillRect(0,0,1024,192);ctx.fillStyle=purple?'#bd85ff':'#00e0c4';ctx.fillRect(0,0,150,192);ctx.fillStyle='#071628';ctx.font='bold 76px sans-serif';ctx.textAlign='center';ctx.fillText(line,75,122);ctx.textAlign='left';
  ctx.fillStyle='#e9fbff';ctx.font='bold 60px sans-serif';ctx.fillText(text,180,sub?88:116,820);if(sub){ctx.fillStyle=alert?'#ff6b7f':'#8af1eb';ctx.font=(alert?'bold ':'')+'40px sans-serif';ctx.fillText(sub,180,152,820)}
  if(alert){ctx.fillStyle='#ff3d5c';ctx.fillRect(0,182,1024,10)}tex.needsUpdate=true}
 setDisplay('REGIONAL','LUMEN R24');

 // Door state: progress 0..1 on one side (0 = both sides, Design Lab).
 let opening=0,doorSide=0,phase='closed',released=false,clock=0,speed=0,daylight=1;
 function applyDoors(){for(const d of doors){const u=d.side===doorSide||doorSide===0?opening:0;const out=smooth(0,.24,u)*.15,slide=smooth(.2,1,u)*.74;d.p.position.x=d.side*(1.55+out);d.p.position.z=d.z+d.d*(.355+slide)}
  for(const s of steps){const u=s.side===doorSide||doorSide===0?smooth(.5,1,opening):0;s.p.visible=u>.01;s.p.position.x=s.side*(1.45+u*.47)}}
 function setDoorProgress(p,side=0,state='open'){opening=clamp01(p);doorSide=side;phase=state;released=state!=='closing'&&state!=='closed';applyDoors()}
 // Backwards-compatible eased version used by older callers.
 function setDoors(open,side=0,dt=1){const step=Math.min(1,dt*1.6);opening=clamp01(opening+(open?step:-step));doorSide=side;phase=open?(opening<1?'opening':'open'):(opening>0?'closing':'closed');released=open;applyDoors()}
 const levBase=new T.Color(0x0f6f86),levHot=new T.Color(0x7ffcff),c=new T.Color();
 // Per-frame lamps, buttons and levitation glow. speed 0..1, daylight 0..1.
 function animate(dt=0,opts={}){clock+=dt;if(Number.isFinite(opts.speed))speed=opts.speed;if(Number.isFinite(opts.daylight))daylight=opts.daylight;
  const flash=Math.sin(clock*Math.PI*6)>0;
  for(const s of ['-1','1']){const active=doorSide===0||String(doorSide)===s;const m=lamp[s];
   if(!active||phase==='closed')m.color.setHex(0x3a2a12);else if(phase==='warning'||phase==='closing')m.color.setHex(flash?0xff3046:0x4a1018);else if(phase==='open'||phase==='opening'||phase==='released')m.color.setHex(0x37f59a);
   button[s].color.setHex(active&&released?(flash||phase==='open'?0x3dff9e:0x1f8f5a):0x29404a)}
  const pulse=.75+.25*Math.sin(clock*(3+speed*9));c.copy(levBase).lerp(levHot,Math.min(1,.25+speed*.75)*pulse);lev.color.copy(c);
  const night=1.25-daylight*.9,sky=.12+.88*daylight;for(const m of reflective)m.envMapIntensity=m.userData.env*sky;lining.emissiveIntensity=.12*night;ceiling.emissiveIntensity=.32*night;floor.emissiveIntensity=.25*night;moq.emissiveIntensity=.18*night}
 return {group:g,setDoors,setDoorProgress,setDisplay,animate,get door(){return {progress:opening,side:doorSide,phase}}};
}
