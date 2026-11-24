// Monumental architecture of Elyra, year 5000. Shared geometry and materials.
export function buildMonuments(T,root,colliders){
 const g=new T.Group();g.name='Elyra megastructures';root.add(g);
 const mat=(c,r=.4,m=.4)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const white=mat(0xe5edf8),blue=mat(0x143b9d),violet=mat(0x6335b6),dark=mat(0x203754),glass=mat(0x285a87,.15,.65),glow=new T.MeshBasicMaterial({color:0x20d8e7}),gold=new T.MeshBasicMaterial({color:0xffad52});
 const cube=new T.BoxGeometry(1,1,1);function mesh(p,geo,m,x,y,z,w=1,h=1,d=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);p.add(o);o.receiveShadow=true;return o}
 const box=(p,m,x,y,z,w,h,d)=>mesh(p,cube,m,x,y,z,w,h,d);
 function beam(p,m,a,b,w,d=w){const v=new T.Vector3(...b).sub(new T.Vector3(...a));const q=box(p,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,w,v.length(),d);q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return q}
 const points=[];
 // Three monumental gateways: 32 m high, span both magnetic lanes.
 for(const z of [-66,61]){const p=new T.Group();g.add(p);p.position.set(3.6,0,z);
 for(const side of [-1,1]){const x=side*11.7;box(p,dark,x,.4,0,4.1,.8,5);box(p,white,x,9.0,0,3.25,17.5,3.6);beam(p,white,[x,17,0],[side*6.2,30,0],3.2,3.7);beam(p,blue,[x-side*1.5,1,1.82],[x-side*1.5,17,1.82],.24,.18);beam(p,glow,[x-side*1.52,17,1.86],[side*5.9,30,1.86],.18,.12);box(p,violet,x,3,1.85,2.4,.8,.13);colliders.push([3.6+x-2.05,3.6+x+2.05,z-2.5,z+2.5]);points.push({x:3.6+x,z,w:4.1,d:5})}
 box(p,white,0,30.0,0,13.3,2.8,4.1);box(p,blue,0,29.8,2.1,12.8,1.5,.13);box(p,glow,0,28.9,2.2,12.6,.12,.12);box(p,gold,0,31.4,2.18,5.2,.12,.12);}
 // Colossal distant civic skyline: deliberately outside the current playable zone.
 const tower=(x,z,h,w,variant)=>{const p=new T.Group();p.position.set(x,0,z);g.add(p);box(p,dark,0,2,0,w*1.35,4,w*1.35);const section=[new T.Vector2(w*.38,0),new T.Vector2(w*.50,3),new T.Vector2(w*.45,h*.33),new T.Vector2(w*.35,h*.78),new T.Vector2(w*.19,h*.92),new T.Vector2(w*.13,h)];mesh(p,new T.LatheGeometry(section,12),variant?blue:glass,0,0,0);
 for(let j=0;j<4;j++){const a=j*Math.PI/2;const xx=Math.sin(a),zz=Math.cos(a);beam(p,white,[xx*w*.48,3,zz*w*.48],[xx*w*.19,h*.93,zz*w*.19],w*.11,w*.12);beam(p,glow,[xx*w*.51,6,zz*w*.51],[xx*w*.20,h*.91,zz*w*.20],.15,.15)}for(let i=1;i<6;i++){const r=w*(.48-i*.036),y=h*i/7;const ring=mesh(p,new T.TorusGeometry(r,.18,5,28),violet,0,y,0);ring.rotation.x=Math.PI/2}box(p,gold,0,h+.4,0,.35,.8,.35);return p};
 box(g,mat(0x526771,.85,.05),0,-.6,0,340,.4,340);
 const towers=[[-82,-125,96,22,0],[-51,-139,73,16,1],[8,-142,124,24,0],[54,-130,86,19,1],[91,-118,108,21,0],[-128,14,90,21,0],[127,23,112,22,1],[-103,103,72,18,1],[106,107,83,19,0]];
 for(const t of towers)tower(...t);
 // 100 m wide orbital-energy collector silhouette above the horizon.
 const collector=new T.Group();collector.position.set(55,77,-134);collector.rotation.set(.32,-.28,.15);g.add(collector);const ring=mesh(collector,new T.TorusGeometry(31,2.4,12,72),white);mesh(collector,new T.TorusGeometry(28.7,.24,8,72),glow);mesh(collector,new T.TorusGeometry(33.1,.22,8,72),blue);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(collector,dark,[Math.cos(a)*8,Math.sin(a)*8,0],[Math.cos(a)*28,Math.sin(a)*28,0],1.25,.9)}mesh(collector,new T.IcosahedronGeometry(7,1),violet);mesh(collector,new T.IcosahedronGeometry(4,1),glow);
 return {points,covered(x,z,pad=0){return points.some(p=>Math.abs(x-p.x)<p.w/2+pad&&Math.abs(z-p.z)<p.d/2+pad)}};
}
