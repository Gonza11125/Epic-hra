// NEXUS organic architectural kit. World-independent, metres, entrance at +Z.
// Surface meshes are indexed, hollow and double-sided; no solid roof volume.
const cache=new WeakMap();
export function architectureMaterials(T){if(cache.has(T))return cache.get(T);const mat=(color,roughness,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});const m={porcelain:mat(0xf0f3f0,.29,.28),pearl:mat(0xc9dce1,.4,.24),trim:mat(0x456878,.42,.54),glass:new T.MeshStandardMaterial({color:0x91c9dc,metalness:.18,roughness:.14,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}),light:new T.MeshStandardMaterial({color:0x9fffee,emissive:0x40dbc8,emissiveIntensity:1.15,side:T.DoubleSide}),solar:mat(0x284e71,.21,.58)};cache.set(T,m);return m}
export function roofHeight(type,u,v,wallTop,rise){const a=Math.min(1,Math.abs(u)),c=Math.cos(Math.PI*a/2),s=Math.sin(Math.PI*a/2),long=.88+.12*Math.cos(v*Math.PI/2);switch(type){case 'wing':return wallTop+rise*(.30+.62*s*s)*long;case 'tier':return wallTop+rise*(.20+.49*Math.exp(-Math.pow((u-.23)/.43,4))+.15*c)*long;case 'nova':return wallTop+rise*(.22+.72*c*c+.10*u*c)*long;case 'forum':return wallTop+rise*(.16+.84*Math.pow(c,.7))*long;case 'helix':return wallTop+rise*(.12+.88*c*c)*long;case 'vita':return wallTop+rise*(.20+.65*Math.pow(c,1.4))*long;case 'market':return wallTop+rise*(.18+.82*Math.pow(c,.8))*long;default:return wallTop+rise*(.12+.88*Math.pow(c,.82))*long}}
export function surfaceData(nu,nv,point){const positions=[],indices=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const q=point(i/nu,j/nv);positions.push(...q)}for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;indices.push(a,c,b,b,c,d)}return {positions,indices}}
export function createOrganicEnvelope(T,parent,{x=0,z=0,w,d,type='arc',wallTop=2.9,doorWidth=2.4,rise=2.0,overhang=.6}){
 const M=architectureMaterials(T),g=new T.Group();g.name='Organic envelope '+type;g.position.set(x,0,z);parent.add(g);let meshes=0;
 const add=(geo,mat)=>{const o=new T.Mesh(geo,mat);o.receiveShadow=!mat.transparent;o.castShadow=mat===M.porcelain;g.add(o);meshes++;return o};
 function surf(mat,nu,nv,point){const a=surfaceData(nu,nv,point),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(a.positions,3));geo.setIndex(a.indices);geo.computeVertexNormals();return add(geo,mat)}
 const H=(u,v)=>roofHeight(type,u,v,wallTop,rise);
 const roof=(u,v,lower=0)=>{const t=u*2-1,k=v*2-1;const corner=1-.035*Math.pow(Math.abs(k),8);return [t*(w/2+overhang)*corner,H(t,k)-lower,k*(d/2+overhang)]};
 surf(M.porcelain,48,18,(u,v)=>roof(u,v));surf(M.pearl,48,18,(u,v)=>roof(1-u,v,.22));
 for(const u of [0,1])surf(M.porcelain,1,18,(a,v)=>roof(u,v,a*.22));for(const v of [0,1]){surf(M.porcelain,48,1,(u,a)=>roof(u,v,a*.22));surf(M.light,48,1,(u,a)=>{const p=roof(u,v,.105+a*.035);p[2]+=(v?1:-1)*.014;return p})}
 // Curved rectangular perimeter (corners outside the conservative collision line).
 const R=Math.min(.65,w*.07,d*.07),X=w/2,Z=d/2;
 const curve=(cx,cz,a,b)=>t=>[cx+R*Math.cos(a+(b-a)*t),cz+R*Math.sin(a+(b-a)*t)];
 const line=(a,b)=>t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 const edges=[{p:line([-X+R,-Z],[X-R,-Z]),back:true},{p:curve(X-R,-Z+R,-Math.PI/2,0)},{p:line([X,-Z+R],[X,Z-R])},{p:curve(X-R,Z-R,0,Math.PI/2)},{p:line([X-R,Z],[doorWidth/2,Z])},{p:line([-doorWidth/2,Z],[-X+R,Z])},{p:curve(-X+R,Z-R,Math.PI/2,Math.PI)},{p:line([-X,Z-R],[-X,-Z+R])},{p:curve(-X+R,-Z+R,Math.PI,Math.PI*1.5)}];
 const band=(p,lo,hi,m,n=14)=>surf(m,n,1,(u,v)=>{const [xx,zz]=p(u);return [xx,lo+(hi-lo)*v,zz]});
 for(const edge of edges){const p=edge.p;band(p,.07,.47,M.porcelain);band(p,.47,wallTop-.31,edge.back?M.porcelain:M.glass);band(p,wallTop-.31,wallTop,M.porcelain);band(p,wallTop-.32,wallTop-.29,M.light);
  // Roof gable and side clerestory follow the exact perimeter.
  surf(edge.back?M.porcelain:M.glass,20,2,(u,v)=>{const [xx,zz]=p(u),k=zz/(Z+overhang),t=xx/((X+overhang)*(1-.035*Math.pow(Math.abs(k),8)));return [xx,wallTop+Math.max(.02,H(t,k)-.22-wallTop)*v,zz]});
 }
 // Portal: no geometry crosses the clear opening below 2.35m.
 const portalY=Math.min(wallTop-.05,Math.max(2.45,wallTop-.15)),opening=doorWidth/2;
 band(line([-opening,Z],[opening,Z]),portalY,wallTop,M.porcelain);
 surf(M.glass,24,2,(u,v)=>{const xx=(u*2-1)*opening,k=Z/(Z+overhang),t=xx/((X+overhang)*(1-.035*Math.pow(Math.abs(k),8)));return [xx,wallTop+Math.max(.02,H(t,k)-.22-wallTop)*v,Z]});
 function tube(points,radius,material){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(new T.TubeGeometry(c,40,radius,8,false),material)}
 const arch=[[-opening-.12,.1,Z+.11],[-opening-.12,portalY-.45,Z+.11],[-opening+.24,portalY+.08,Z+.11],[0,portalY+.19,Z+.11],[opening-.24,portalY+.08,Z+.11],[opening+.12,portalY-.45,Z+.11],[opening+.12,.1,Z+.11]];
 tube(arch,.11,M.porcelain);tube(arch.map(p=>[p[0],p[1],p[2]+.10]),.025,M.light);
 // Slim structural ribs rather than block-like wall frames.
 for(const side of [-1,1])for(const zz of [-d*.29,0,d*.29]){const o=add(new T.CylinderGeometry(.047,.075,wallTop-.4,8),M.trim);o.position.set(side*(X-.035),(wallTop+.4)/2,zz)}
 // Sculpted front canopy with lifted edges and curved cyan lip, not a solid block.
 const canopyWidth=Math.min(w*.65,doorWidth+2.5),canopyDepth=1.65;
 surf(M.porcelain,28,8,(u,v)=>{const t=u*2-1;return [t*canopyWidth/2,portalY+.24+.24*t*t+.12*Math.sin(v*Math.PI),Z+.02+v*canopyDepth]});
 surf(M.light,28,1,(u,v)=>{const t=u*2-1;return [t*canopyWidth/2,portalY+.24+.24*t*t-v*.035,Z+.02+canopyDepth]});
 // Merge static envelope parts by material within each building. Preserve normals
 // by recomputing on the original indexed surface patches (no cross-patch weld).
 const byMaterial=new Map();for(const o of [...g.children]){let a=byMaterial.get(o.material);if(!a)byMaterial.set(o.material,a=[]);a.push(o)}
 for(const [material,parts] of byMaterial){const positions=[],indices=[];for(const o of parts){const a=o.geometry.getAttribute('position'),base=positions.length/3;for(let i=0;i<a.count;i++)positions.push(a.getX(i)+o.position.x,a.getY(i)+o.position.y,a.getZ(i)+o.position.z);if(o.geometry.index){for(const i of o.geometry.index.array)indices.push(base+i)}else{for(let i=0;i<a.count;i++)indices.push(base+i)}g.remove(o);o.geometry.dispose()}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingSphere();const o=new T.Mesh(geo,material);o.receiveShadow=!material.transparent;o.castShadow=material===M.porcelain;g.add(o)}
 return {group:g,meshes,draws:g.children.length};
}
