import {createOrganicEnvelope} from './organicArchitecture.js?v=01368';
// Valley 07: reusable civic architecture and a single authoritative district plan.
export const DISTRICTS=[
 {id:'market',name:'Aster Market',x:-39,z:16,w:22,d:24},
 {id:'science',name:'Helix Institute',x:-39,z:-34,w:22,d:20},
 {id:'park',name:'Luma Gardens',x:42,z:18,w:24,d:22},
 {id:'clinic',name:'Vita Centre',x:42,z:-12,w:22,d:20}
];
export const PATHS=[
 {x:-35,z:14,w:26,d:4},{x:-39,z:-9,w:4,d:50},
 {x:-30,z:-34,w:18,d:4},{x:31,z:14,w:24,d:4},
 {x:42,z:2,w:4,d:24},{x:30,z:-12,w:24,d:4}
];
const contains=(p,x,z,pad=0)=>Math.abs(x-p.x)<p.w/2+pad&&Math.abs(z-p.z)<p.d/2+pad;
export function urbanClearance(x,z,pad=0){return [...DISTRICTS,...PATHS].some(p=>contains(p,x,z,pad))}
export function installDistricts(T,root,colliders){
 const group=new T.Group();group.name='Valley 07 civic districts';root.add(group);
 const mat=(c,r=.6,m=.1)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const shell=mat(0xdce8e7,.38,.32),steel=mat(0x344d60,.4,.55),paving=mat(0x82969e,.83),tile=mat(0x627a86,.72),gold=mat(0xb69760,.45,.55),seat=mat(0x527e83,.85),glass=new T.MeshStandardMaterial({color:0x8dd5e3,transparent:true,opacity:.25,depthWrite:false,roughness:.15}),glow=new T.MeshStandardMaterial({color:0x93f3e5,emissive:0x3ccab7,emissiveIntensity:1.1}),violet=new T.MeshStandardMaterial({color:0xc0a8f2,emissive:0x7656bb,emissiveIntensity:.65}),water=mat(0x427d96,.18,.55);
 const cube=new T.BoxGeometry(1,1,1),orb=new T.IcosahedronGeometry(1,1),cylinder=new T.CylinderGeometry(1,1,1,20);
 function mesh(p,geo,m,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.receiveShadow=true;p.add(o);return o}
 const b=(p,m,x,y,z,w,h,d)=>mesh(p,cube,m,x,y,z,w,h,d);
 function sign(p,title,subtitle,x,y,z,w){const c=document.createElement('canvas');c.width=512;c.height=128;const a=c.getContext('2d');a.fillStyle='#17303b';a.fillRect(0,0,512,128);a.fillStyle='#a5e8e3';a.textAlign='center';a.font='bold 40px sans-serif';a.fillText(title,256,52,490);a.font='24px sans-serif';a.fillText(subtitle,256,98,490);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return mesh(p,new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}),x,y,z)}
 const targets=[],buildings=[],spinners=[],lights=[];
 function solid(p,x,z,w,d){colliders.push([p.position.x+x-w/2,p.position.x+x+w/2,p.position.z+z-d/2,p.position.z+z+d/2])}
 function structure(spec){const {x,z,w,d,name,kind}=spec,p=new T.Group();p.position.set(x,0,z);group.add(p);buildings.push(spec);
  b(p,tile,0,.065,0,w,.13,d);solid(p,0,-d/2,w,.2);
  for(const side of [-1,1]){solid(p,side*w/2,0,.2,d);const ww=(w-2.8)/2;solid(p,side*(1.4+ww/2),d/2,ww,.2)}
  createOrganicEnvelope(T,p,{w,d,type:kind==='TRŽNICE'?'market':kind==='VÝZKUMNÝ ÚSTAV'?'helix':'vita',wallTop:3.5,doorWidth:2.8,rise:kind==='VÝZKUMNÝ ÚSTAV'?2.4:2.15});
  sign(p,name,kind,0,4.05,d/2+.4,Math.min(w*.8,5.8));
  for(const xx of [-w*.33,w*.33]){b(p,glow,xx,3.21,0,.07,.06,d*.9);b(p,paving,xx,.065,d/2+1.1,w*.25,.12,2.2)}
  const counterZ=-d/2+1.2;b(p,steel,0,.55,counterZ,w*.57,1.1,.8);b(p,shell,0,1.14,counterZ,w*.59,.09,.9);solid(p,0,counterZ,w*.57,.9);
  for(const xx of [-w*.32,w*.32]){b(p,seat,xx,.43,0,1.1,.3,2.4);b(p,steel,xx,.19,0,.95,.32,2.2);solid(p,xx,0,1.1,2.4)}
  for(const xx of [-w*.19,0,w*.19]){b(p,steel,xx,1.45,counterZ,.76,.48,.12);b(p,glow,xx,1.47,counterZ+.08,.62,.32,.025)}
  if(kind==='VÝZKUMNÝ ÚSTAV'){const roofRing=mesh(p,new T.TorusGeometry(1.6,.17,10,40),steel,0,6.8,-.8);roofRing.rotation.x=.45;mesh(p,orb,glow,0,6.8,-.8,.65,.65,.65);b(p,steel,0,5.65,-.8,.85,.7,.85);const ring=mesh(p,new T.TorusGeometry(.68,.07,8,32),violet,0,2.1,counterZ-.22);ring.rotation.x=.6;spinners.push(ring);mesh(p,orb,glow,0,2.1,counterZ-.22,.29,.29,.29)}
  if(kind==='TRŽNICE'){for(let i=0;i<6;i++)mesh(p,orb,i%2?violet:gold,(i%3-1)*.5,1.38,counterZ+(i<3?-.15:.2),.18,.18,.18)}
  if(kind==='ZDRAVOTNÍ CENTRUM'){for(const side of [-1,1]){b(p,shell,side*3.8,5.55,-1,1.2,1.1,2.4);b(p,glow,side*3.8,6.12,-1,1.1,.055,2.3)}b(p,glow,0,2.35,counterZ,.65,.16,.07);b(p,glow,0,2.35,counterZ,.16,.65,.07)}
  targets.push({x,z:z+d/2-1.3,name,note:spec.note,category:'district'});
 }
 // Architectural fronts face south; open doors are aligned with the promenades.
 structure({x:-39,z:8,w:14,d:7,name:'ASTER MARKET',kind:'TRŽNICE',note:'Obchodní hala Údolí 07. Prodej a zásoby budou přidány s ekonomikou.'});
 structure({x:-39,z:-36,w:15,d:9,name:'HELIX',kind:'VÝZKUMNÝ ÚSTAV',note:'Helix Institute studuje zdejší biosféru a anomálie. Laboratorní úlohy zatím nejsou dostupné.'});
 structure({x:42,z:-14,w:14,d:8,name:'VITA',kind:'ZDRAVOTNÍ CENTRUM',note:'Veřejná klinika Elyry. Zdravotní služby zatím nejsou aktivní.'});
 // Ground network kept below existing raised transport platforms.
 for(const p of DISTRICTS)b(group,p.id==='park'?mat(0x567d72,.86):paving,p.x,.024,p.z,p.w,.048,p.d);for(let i=0;i<PATHS.length;i++){const p=PATHS[i];b(group,paving,p.x,.031+i*.001,p.z,p.w,.048,p.d)}
 for(const p of PATHS){const horizontal=p.w>p.d;for(const side of [-1,1])b(group,glow,p.x+(horizontal?0:side*(p.w/2-.15)),.056,p.z+(horizontal?side*(p.d/2-.15):0),horizontal?p.w:.055,.025,horizontal?.055:p.d)}
 function bench(x,z,rot=0){const p=new T.Group();p.position.set(x,0,z);p.rotation.y=rot;group.add(p);b(p,steel,0,.23,0,1.9,.46,.55);b(p,seat,0,.51,0,2.1,.14,.7);b(p,seat,0,.84,-.28,2.1,.6,.14);solid(p,0,0,rot? .75:2.1,rot?2.1:.75)}
 function lamp(x,z){const p=new T.Group();p.position.set(x,0,z);group.add(p);mesh(p,cylinder,steel,0,1.5,0,.09,3,.09);mesh(p,cylinder,glow,0,3.05,0,.32,.12,.32);mesh(p,cylinder,shell,0,3.17,0,.43,.12,.43);solid(p,0,0,.3,.3)}
 for(const [x,z] of [[-46,23],[-32,23],[-46,-26],[-32,-26],[33,-5],[51,-5],[31,10],[53,10],[31,26],[53,26]])lamp(x,z);
 for(const [x,z] of [[-44,20],[-34,20],[-45,-28],[-33,-28],[34,26],[50,26],[35,-6],[49,-6]])bench(x,z);
 const park=new T.Group();park.position.set(42,0,18);group.add(park);
 mesh(park,cylinder,steel,0,.16,0,3.6,.32,3.6);mesh(park,cylinder,water,0,.34,0,3.25,.055,3.25);solid(park,0,0,6.9,6.9);
 const ring=mesh(park,new T.TorusGeometry(1.65,.12,10,48),glow,0,1.75,0);ring.rotation.x=Math.PI/2;spinners.push(ring);mesh(park,orb,violet,0,1.15,0,.48,.83,.48);
 for(const [xx,zz] of [[-7,-6],[7,-6],[-7,6],[7,6]]){mesh(park,cylinder,steel,xx,.25,zz,1.65,.5,1.65);solid(park,xx,zz,3.2,3.2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;mesh(park,cylinder,seat,xx+Math.cos(a)*.63,.8,zz+Math.sin(a)*.63,.07,1.15,.07);mesh(park,orb,violet,xx+Math.cos(a)*.63,1.45+(i%2)*.4,zz+Math.sin(a)*.63,.38,.54,.38)}}
 sign(park,'LUMA GARDENS','VEŘEJNÝ PARK',0,2.1,9,4.8);targets.push({x:42,z:22.6,name:'Luma Gardens',note:'Veřejná zahrada s recirkulační fontánou a pěstovanými bioluminiscenčními rostlinami.',category:'district'});
 return {group,buildings,targets,covered:urbanClearance,inside:(x,z)=>buildings.some(p=>contains(p,x,z,-.15)),update(time,t){glow.emissiveIntensity=.85+.5*Math.max(0,Math.cos((time/24)*Math.PI*2));for(let i=0;i<spinners.length;i++)spinners[i].rotation.z=t*.35+i}};
}
