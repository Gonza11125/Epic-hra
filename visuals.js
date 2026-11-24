// NEXUS 0.1.2 — visual systems. Original procedural art, no asset downloads.
export function installVisuals(T,{scene,renderer,camera,sun,hemi,M,box,colliders,anomaly,core,ring,ring2,grassBlade,crowns,trunks}){
 const clamp=T.MathUtils.clamp, mix=T.MathUtils.lerp;let seed=913726;
 const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const C=c=>new T.Color(c);
 const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<850;
 const skyU={zenith:{value:C(0x356d9b)},horizon:{value:C(0xb8d8dc)},sunColor:{value:C(0xffd7a0)},sunDir:{value:new T.Vector3(.3,.7,.4)},night:{value:0},cloud:{value:.3},clock:{value:0}};
 const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:skyU,vertexShader:`
 varying vec3 vDir;
 void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
 `,fragmentShader:`
 varying vec3 vDir;uniform vec3 zenith,horizon,sunColor,sunDir;uniform float night,cloud,clock;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 void main(){vec3 d=normalize(vDir);float h=max(0.,d.y);vec3 col=mix(horizon,zenith,pow(h,.48));float sd=max(0.,dot(d,sunDir));col+=sunColor*(pow(sd,16.)*.19+pow(sd,120.)*.55+smoothstep(.9990,.99965,sd)*2.5)*(1.-night);
 if(d.y>.025){vec2 p=d.xz/(d.y+.20)*3.7+vec2(clock*.009,clock*.003);float f=n(p)*.55+n(p*2.15)*.28+n(p*4.3)*.17;float a=smoothstep(.69-cloud*.24,.83-cloud*.27,f)*smoothstep(.025,.19,h);col=mix(col,mix(horizon,vec3(.72,.77,.79),.45)*(1.-night*.86),a*.88);vec2 st=vec2(atan(d.z,d.x),asin(d.y))*190.;float star=step(.996,hash(floor(st)))*(1.-smoothstep(.05,.31,length(fract(st)-.5)));col+=star*night*(1.-a)*.9;}
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const dome=new T.Mesh(new T.SphereGeometry(285,32,18),skyMat);dome.renderOrder=-100;dome.frustumCulled=false;scene.add(dome);
 // Layered, irregular ridges with vertex-painted rock and snow.
 function ridge(rad,base,amp,phase){const segments=128,rows=9,pos=[],colors=[],indices=[];const rock=C(0x657b80),dark=C(0x344b50),snow=C(0xd7e5e5);
 for(let j=0;j<rows;j++){const q=j/(rows-1);for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;const peak=base+amp*(.48+.22*Math.sin(a*7+phase)+.16*Math.sin(a*13+phase*2)+.09*Math.sin(a*29)+.05*Math.sin(a*47));const y=Math.max(-4,peak*Math.pow(Math.sin(q*Math.PI),1.15)*(1+.1*Math.sin(a*31+q*9)));const rr=rad+(q-.5)*65+Math.sin(a*17+q*8)*4*Math.sin(q*Math.PI);pos.push(Math.sin(a)*rr,y,Math.cos(a)*rr);const cc=dark.clone().lerp(rock,clamp(y/38,0,1)).lerp(snow,clamp((y-33+Math.sin(a*25)*4)/12,0,.92));colors.push(cc.r,cc.g,cc.b);if(i<segments&&j<rows-1){const k=j*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2)}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const m=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide,flatShading:true});scene.add(new T.Mesh(g,m))}
 ridge(207,25,55,2);ridge(145,12,34,6);
 // Richer material maps, including matching bump patterns.
 function texture(mat,kind,repeat){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#b6b6b6';g.fillRect(0,0,256,256);const bump=document.createElement('canvas');bump.width=bump.height=256;const b=bump.getContext('2d');b.fillStyle='#888';b.fillRect(0,0,256,256);
 if(kind==='gravel'){for(let i=0;i<1900;i++){const x=rnd()*256,y=rnd()*256,r=1+rnd()*5,v=75+Math.floor(rnd()*145);g.fillStyle='rgb('+v+','+(v-3)+','+(v-8)+')';g.beginPath();g.ellipse(x,y,r,r*.63,rnd()*6,0,Math.PI*2);g.fill();b.fillStyle='rgb('+v+','+v+','+v+')';b.beginPath();b.ellipse(x,y,r,r*.63,0,0,Math.PI*2);b.fill()}}
 else if(kind==='wood'){for(let i=0;i<220;i++){const x=rnd()*256,v=80+Math.floor(rnd()*120);g.strokeStyle='rgb('+v+','+v+','+v+')';g.lineWidth=.4+rnd()*2;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+8,75,x-9,150,x+2,256);g.stroke()}for(let i=0;i<4;i++){g.fillStyle='#535353';g.fillRect(i*64,0,2,256)}}
 else if(kind==='roof'){for(let y=0;y<256;y+=32)for(let x=-32;x<256;x+=48){const xx=x+(y%64?24:0),v=110+Math.floor(rnd()*65);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(xx,y,47,31);g.fillStyle='#444';g.fillRect(xx,y+29,48,3);b.fillStyle='#555';b.fillRect(xx,y+29,48,3)}}
 else if(kind==='grass'){for(let i=0;i<1700;i++){const x=rnd()*256,y=rnd()*256,r=2+rnd()*11;g.fillStyle=rnd()<.35?'#8d927f':'#c1c4a4';g.globalAlpha=.16+rnd()*.22;g.beginPath();g.ellipse(x,y,r,r*.6,rnd()*6,0,Math.PI*2);g.fill()}g.globalAlpha=1}
 else if(kind==='wall'){for(let i=0;i<100;i++){const x=rnd()*256,y=rnd()*256,r=3+rnd()*23;const grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'#66665a35');grad.addColorStop(1,'#66665a00');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2)}}
 for(let i=0;i<3500;i++){const x=rnd()*256,y=rnd()*256,v=90+Math.floor(rnd()*130);g.fillStyle='rgba('+v+','+v+','+v+',.19)';g.fillRect(x,y,1+rnd()*2,1+rnd()*2)}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(repeat,repeat);tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());mat.map=tex;if(kind==='gravel'||kind==='roof'){const bt=new T.CanvasTexture(bump);bt.wrapS=bt.wrapT=T.RepeatWrapping;bt.repeat.copy(tex.repeat);mat.bumpMap=bt;mat.bumpScale=kind==='gravel'?.055:.07}mat.needsUpdate=true}
 texture(M.grass,'grass',42);texture(M.gravel,'gravel',36);texture(M.wood,'wood',1);texture(M.crate,'wood',1);texture(M.wall,'wall',2);texture(M.roof,'roof',3);M.steel.metalness=.66;M.steel.roughness=.42;M.glass.roughness=.18;
 const materials={stone:new T.MeshStandardMaterial({color:0x807e70,roughness:1}),iron:new T.MeshStandardMaterial({color:0x3e4a4b,metalness:.55,roughness:.6}),rust:new T.MeshStandardMaterial({color:0x77513c,roughness:.93}),cream:new T.MeshStandardMaterial({color:0xd0c8ae,roughness:.88}),brick:new T.MeshStandardMaterial({color:0x8a6355,roughness:1}),green:new T.MeshStandardMaterial({color:0x304c39,roughness:1}),glass:M.glass};
 const batches=new Map(),obj=new T.Object3D();
 function detail(x,y,z,w,h,d,mat,ry=0,rz=0){if(!batches.has(mat))batches.set(mat,[]);obj.position.set(x,y,z);obj.rotation.set(0,ry,rz);obj.scale.set(w,h,d);obj.updateMatrix();batches.get(mat).push(obj.matrix.clone())}
 // Architectural trim, platform canopy, pitched roof and rail fittings.
 const {stone,iron,rust,cream,brick,green}=materials;
 // Transit hub geometry is now provided by transitStations.js.
 // All magnetic infrastructure is generated by transitVehicles.js.
 // Fine foliage and rocks, placed away from the mission path.
 const rockGeo=new T.IcosahedronGeometry(1,1),rocks=new T.InstancedMesh(rockGeo,stone,220),bushes=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),green,220);let n=0;
 for(let i=0;i<600&&n<220;i++){const x=(rnd()-.5)*185,z=(rnd()-.5)*185;if(Math.abs(x)<7||Math.abs(x-7.2)<3.7||Math.abs(z-14)<4||(Math.abs(x+11)<4&&Math.abs(z)<57)||(Math.abs(x)<28&&Math.abs(z)<28)||Math.hypot(x-35,z+42)<6)continue;obj.position.set(x,.17,z);obj.rotation.set(rnd(),rnd()*6,rnd());obj.scale.set(.28+rnd()*.85,.2+rnd()*.45,.35+rnd()*.65);obj.updateMatrix();rocks.setMatrixAt(n,obj.matrix);obj.position.set(x+1,.45,z+.3);obj.scale.set(.5+rnd()*.65,.42+rnd()*.5,.5+rnd()*.65);obj.updateMatrix();bushes.setMatrixAt(n,obj.matrix);bushes.setColorAt(n,C(0x9ebd80).lerp(C(0x43674b),rnd()));n++}rocks.count=bushes.count=n;scene.add(rocks,bushes);
 for(const [mat,matrices] of batches){const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh)}
 // Soft local contact shadows without requiring a shadow map on tablets.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const sg=shadowCanvas.getContext('2d'),grad=sg.createRadialGradient(32,32,4,32,32,32);grad.addColorStop(0,'rgba(0,0,0,.55)');grad.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=grad;sg.fillRect(0,0,64,64);const st=new T.CanvasTexture(shadowCanvas),sm=new T.MeshBasicMaterial({map:st,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 for(const [x,z,w,d,y] of [[-13,-4,19,17,.026],[14,-3,10,8,.027],[10,-12,6,5,.028]]){const sh=new T.Mesh(new T.PlaneGeometry(w,d),sm);sh.rotation.x=-Math.PI/2;sh.position.set(x,y,z);scene.add(sh)}
 const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const hg=haloCanvas.getContext('2d'),hh=hg.createRadialGradient(64,64,0,64,64,64);hh.addColorStop(0,'rgba(145,247,255,.85)');hh.addColorStop(.22,'rgba(52,194,255,.4)');hh.addColorStop(1,'rgba(0,120,255,0)');hg.fillStyle=hh;hg.fillRect(0,0,128,128);
 const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(haloCanvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));halo.scale.set(8,8,1);anomaly.add(halo);
 const shards=[];const shardMat=new T.MeshStandardMaterial({color:0x364c62,roughness:.4,metalness:.5,emissive:0x174d62,emissiveIntensity:.55});for(let i=0;i<18;i++){const o=new T.Mesh(new T.IcosahedronGeometry(.12+rnd()*.26,0),shardMat);anomaly.add(o);shards.push({o,a:rnd()*6.28,r:1.5+rnd()*2.5,h:(rnd()-.5)*3,s:.2+rnd()*.5})}
 const particleGeo=new T.BufferGeometry(),pa=new Float32Array(240*3);particleGeo.setAttribute('position',new T.BufferAttribute(pa,3));const particles=new T.Points(particleGeo,new T.PointsMaterial({color:0xa9edff,size:.075,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));particles.frustumCulled=false;anomaly.add(particles);
 // Optional true shadows; balanced mode stays light on mobile GPUs.
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:130});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00045;sun.shadow.normalBias=.035;scene.add(sun.target);
 scene.traverse(o=>{if(o.isMesh&&o!==dome&&!o.material.transparent&&o.geometry.type!=='SphereGeometry'){o.receiveShadow=true;if(o.position.y>0.3&&o.position.y<14)o.castShadow=true}});
 trunks.castShadow=true;crowns.castShadow=true;grassBlade.castShadow=false;let quality='balanced';
 function setQuality(q){quality=q;renderer.shadowMap.enabled=q==='high';renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setPixelRatio(Math.min(devicePixelRatio,q==='high'?1.8:q==='low'?1:1.35));renderer.setSize(innerWidth,innerHeight);grassBlade.visible=q!=='low';bushes.visible=q!=='low';particles.visible=q!=='low';scene.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.needsUpdate=true)}})}
 setQuality(mobile?'balanced':'high');
 const windUniform={value:0};grassBlade.material.onBeforeCompile=shader=>{shader.uniforms.nexusWind=windUniform;shader.vertexShader='uniform float nexusWind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat phase=instanceMatrix[3].x*.31+instanceMatrix[3].z*.19;\ntransformed.x+=sin(nexusWind*1.7+phase)*.11*max(0.,position.y+.32);\n#endif');};grassBlade.material.needsUpdate=true;const dayHemi=C(0xc7e7ff);const fogColor=C(0xaac3c8),dayZen=C(0x397caf),nightZen=C(0x08152f),dayHor=C(0xc6d9d6),nightHor=C(0x28394f),warm=C(0xf2a36c),white=C(0xffeed4),cool=C(0xa3b9e8),cloudColor=C(0x85959c);let overcast=0,fog=.006;
 function update(time,weather,t,dt){const a=(time-6)/24*Math.PI*2,alt=Math.sin(a),day=clamp((alt+.12)/.72,0,1),night=1-clamp((alt+.18)/.36,0,1),twilight=Math.exp(-Math.pow(alt/.24,2))*(1-night*.62);
 overcast=mix(overcast,weather==='Déšť'? .92:weather==='Mlha'?.75:.18,1-Math.exp(-dt*.8));fog=mix(fog,weather==='Mlha'?.019:weather==='Déšť'?.011:.0058,1-Math.exp(-dt*.65));
 skyU.zenith.value.copy(nightZen).lerp(dayZen,day).lerp(cloudColor,overcast*.42*day);skyU.horizon.value.copy(nightHor).lerp(dayHor,day).lerp(warm,twilight*.55*(1-overcast));skyU.sunDir.value.set(Math.cos(a)*.9,alt,Math.sin(a*.55)*.35+.25).normalize();skyU.sunColor.value.copy(white).lerp(warm,twilight*.8);skyU.night.value=night;skyU.cloud.value=overcast;skyU.clock.value=t;windUniform.value=t;dome.position.copy(camera.position);
 fogColor.copy(skyU.horizon.value).lerp(cloudColor,overcast*.22*day);scene.fog.color.copy(fogColor);scene.fog.density=fog;scene.background.copy(fogColor);
 hemi.color.copy(cool).lerp(dayHemi,day);hemi.groundColor.set(0x536147);hemi.intensity=.22+day*1.36+overcast*.12*day;sun.color.copy(white).lerp(warm,twilight*.8);sun.intensity=Math.max(0,alt)*3.0*(1-overcast*.70)+.035;
 sun.target.position.set(Math.round(camera.position.x/8)*8,0,Math.round(camera.position.z/8)*8);sun.position.copy(sun.target.position).addScaledVector(skyU.sunDir.value,62);sun.position.y=Math.max(6,sun.position.y);
 halo.scale.set(7.2+Math.sin(t*2)*.8,7.2+Math.sin(t*2)*.8,1);for(const s of shards){const a=s.a+t*s.s;s.o.position.set(Math.cos(a)*s.r,s.h+Math.sin(t+s.a)*.4,Math.sin(a)*s.r);s.o.rotation.set(t*.3+s.a,t*.4,t*.15)}
 if(particles.visible&&anomaly.visible){for(let i=0;i<240;i++){const a=i*2.399+t*.65,r=.65+(i%19)*.15;pa[i*3]=Math.cos(a)*r;pa[i*3+1]=Math.sin(i*.37+t*.8)*1.7;pa[i*3+2]=Math.sin(a)*r}particleGeo.attributes.position.needsUpdate=true}
 }
 return {update,setQuality,get quality(){return quality}};
}
