// NEXUS 0.1.4.7 Living Waters – materiál vody Údolí 07 (procedurální, bez externích textur).
// MeshStandardMaterial rozšířený přes onBeforeCompile: zachová mlhu, logaritmický depth buffer, tone mapping,
// stíny a světla scény. Atributy geometrie viz WATER_ATTRIBUTES ve valley-water.js.
// Kvalita: 'high' = 3 oktávy vln ve dvou fázích proudění, odraz hvězd, sprška u vodopádu;
//          'mobile' = 2 oktávy, bez hvězd v odrazu, bez částic. Žádný další render pass ani planární odraz.

// Sdílené uniformy (jeden objekt pro obě kvality). Barvy oblohy se při instalaci napojí přímo na uniformy
// procedurální oblohy z planet-atmosphere.js (stejné objekty {value}), takže odraz sleduje den/noc bez další logiky.
export function createWaterUniforms(T){
 const C=c=>new T.Color(c);
 return {
  wTime:{value:0},
  wEast:{value:new T.Vector3(1,0,0)},wNorth:{value:new T.Vector3(0,0,1)},
  // náhradní hodnoty, pokud by obloha nebyla nalezena
  radial:{value:new T.Vector3(0,1,0)},zenith:{value:C(0x397cba)},horizon:{value:C(0xbccfd6)},warm:{value:C(0xffb074)},sunDir:{value:new T.Vector3(0,1,0)},
  day:{value:1},twilight:{value:0},space:{value:0},
  wLand:{value:C(0x2a3a33)},          // barva okolních svahů v odrazu (nízké úhly) – aktualizuje se podle světla
  // 0.1.4.7a: mělká voda tmavší a průzračná (dno prosvítá ztmavené a do modrozelena), ne mátová barva
  wShallow:{value:C(0x2f6d66)},wDeep:{value:C(0x05303a)},wMarsh:{value:C(0x2f3d22)},
  wFoamColor:{value:C(0xe9f1f0)},wBank:{value:C(0x14120e)},
  // tůň pod vodopádem: x,z (rovinné metry jako vWPlane), poloměr pěny (m), síla (0 = žádný vodopád)
  wFall0:{value:new T.Vector4(0,0,1,0)}
 };
}

// Napojí uniformy na oblohu z planet-atmosphere.js (ShaderMaterial s uniformou zenith).
export function linkSkyUniforms(scene,U){
 let sky=null;scene.traverse(o=>{if(!sky&&o.isMesh&&o.material?.uniforms?.zenith&&o.material.uniforms.horizon)sky=o});
 if(sky)for(const k of ['radial','zenith','horizon','warm','sunDir','day','twilight','space'])if(sky.material.uniforms[k])U[k]=sky.material.uniforms[k];
 return !!sky;
}

const COMMON=/* glsl */`
uniform float wTime;uniform vec3 wEast,wNorth;
varying vec3 vWFlow;varying vec3 vWNormal;varying vec2 vWPlane;varying vec4 vWData;varying vec2 vWUv;
`;

const VERTEX_HEAD=/* glsl */`
attribute vec3 flowDirection;attribute float flowSpeed,waterDepth,shoreDistance,waterKind,foam;
`+COMMON;
// position je v km relativně ke kotvě údolí (statické) – rovinné souřadnice v metrech jsou stabilní při posunu počátku.
const VERTEX_BODY=/* glsl */`
vWFlow=flowDirection;vWNormal=normal;vWPlane=vec2(dot(position,wEast),dot(position,wNorth))*1000.;
vWData=vec4(flowSpeed,waterDepth,shoreDistance,waterKind);vWUv=vec2(uv.x,uv.y);
vWFoamV=foam;
`;

const FRAGMENT_HEAD=COMMON+/* glsl */`
varying float vWFoamV;
uniform vec3 radial,zenith,horizon,warm,sunDir,wLand,wShallow,wDeep,wMarsh,wFoamColor,wBank;uniform float day,twilight,space;uniform vec4 wFall0;
float wHash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
// value noise s analytickou derivací: (hodnota, d/dx, d/dy)
vec3 wNoised(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f),du=6.*f*(1.-f);
 float a=wHash(i),b=wHash(i+vec2(1.,0.)),c=wHash(i+vec2(0.,1.)),d=wHash(i+vec2(1.,1.)),k=a-b-c+d;
 return vec3(a+(b-a)*u.x+(c-a)*u.y+k*u.x*u.y,du*(vec2(b-a,c-a)+k*u.yx));}
// gradient výškového pole vln (m/m) + hodnota pro pěnu. fw = velikost pixelu v metrech (útlum jemných oktáv).
vec3 wWaves(vec2 p,float t,float fw){
 vec3 r=vec3(0.);
 const mat2 R1=mat2(.8,.6,-.6,.8),R2=mat2(.28,-.96,.96,.28);
 vec3 n=wNoised(p*.42+vec2(t*.05,t*.031));r+=vec3(n.x,n.yz*.42)*.5;
 vec2 q=R1*p;n=wNoised(q*1.13-vec2(t*.11,-t*.07));vec2 g=(n.yz*1.13)*R1;r+=vec3(n.x,g)*.27*(1.-smoothstep(.35,.9,fw*1.13));
 #ifdef WATER_HIGH
 q=R2*p;n=wNoised(q*2.9+vec2(-t*.19,t*.23));g=(n.yz*2.9)*R2;r+=vec3(n.x,g)*.12*(1.-smoothstep(.35,.9,fw*2.9));
 #endif
 return r;}
// pěna: úzké podélné pruhy, s rychlostí proudu delší (sp = m/s)
float wFoamTex(vec2 p,vec2 fd,float sp){vec2 q=vec2(dot(p,fd),dot(p,vec2(-fd.y,fd.x)))*vec2(.75/(1.+.8*sp),3.4);
 float f=wNoised(q*2.3).x*.62;
 #ifdef WATER_HIGH
 f+=wNoised(q*5.9+5.3).x*.38;
 #else
 f+=.19;
 #endif
 return f;}
// odraz oblohy: stejné barvy jako procedurální obloha (planet-atmosphere.js), dole svahy údolí
vec3 wSky(vec3 d,vec3 up){
 float h=dot(d,up),s=max(0.,dot(d,sunDir));vec3 night=vec3(.004,.009,.024);
 float hp=max(h,0.);vec3 a=mix(horizon,zenith,pow(hp,.48));a=mix(night,a,day);
 a+=warm*twilight*(.14*exp(-hp*6.)+.45*pow(s,12.));
 a+=warm*pow(s,100.)*.35*day;
 #ifdef WATER_HIGH
 vec2 st=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*190.;float star=step(.997,wHash(floor(st)))*(1.-smoothstep(.05,.35,length(fract(st)-.5)));a+=star*(1.-day)*.55;
 #endif
 a=mix(a,night,space);
 // nízké odražené paprsky narazí na svahy kolem vody (náhrada za planární odraz)
 vec3 land=mix(wLand,mix(night,horizon,day),.12)*mix(.6,1.,smoothstep(0.,.12,h)); // svahy, u hladiny tmavší pás břehu
 return mix(land,a,smoothstep(.02,.24,h));}
`;

const LIGHT_SPLIT=/* glsl */`
#include <normal_fragment_maps>
// --- NEXUS water: procedurální normála ---
vec3 wUp=normalize(vWNormal);float wKind=vWData.w,wSpeed=vWData.x,wDepth=vWData.y,wShore=vWData.z;
vec3 wV=normalize((vec4(normalize(vViewPosition),0.)*viewMatrix).xyz); // směr k pozorovateli ve světě
float wDist=length(vViewPosition)*1000.;
float wFw=max(length(fwidth(vWPlane)),1e-4);
bool wFall=wKind>1.5&&wKind<2.5;
// potoky klesají až ~35° (kaskády): skutečný sklon hladiny z derivací (atribut normal je radiála)
if(wKind>.5&&wKind<1.5){vec3 gn=normalize((vec4(cross(dFdx(vViewPosition),dFdy(vViewPosition)),0.)*viewMatrix).xyz);if(dot(gn,wUp)<0.)gn=-gn;wUp=gn;}
vec3 wN=wUp;vec2 wAdv=vec2(dot(vWFlow,wEast),dot(vWFlow,wNorth))*wSpeed;float wFoamN=.5;
if(wFall){
 vec3 wT=normalize(vWFlow);vec3 wB=normalize(cross(wUp,wT));
 // vláknitá clona: šum protažený po proudu, posun dolů rychlostí pádu
 // konstantní posun: wSpeed se po cloně mění a t*wSpeed by se interpolací roztrhal
 float sv=vWUv.y-wTime*7.;vec3 n=wNoised(vec2(vWUv.x*3.6,sv*.16)),n2=wNoised(vec2(vWUv.x*9.3+1.7,sv*.42));
 wN=normalize(wUp+wB*(n.y*.25+n2.y*.12)+wT*(n.z*.05));wFoamN=clamp(n.x*.65+n2.x*.45,0.,1.);
}else{
 float wStr=wKind<.5?.16:wKind>2.5?.05:.22+min(wSpeed,2.5)*.22;
 vec3 wg;
 if(wSpeed>.02){ // dvoufázová advekce podle proudu (bez trhání vzoru)
  float ph=wTime*.45,f0=fract(ph),f1=fract(ph+.5),k=abs(1.-2.*f0);
  vec2 pa=vWPlane-wAdv*f0*2.2,pb=vWPlane-wAdv*f1*2.2+vec2(.37,.71),fd=normalize(wAdv);
  // vlnky protažené po proudu (rychlejší proud = delší, užší čeřeny); gradient zpět do roviny: J^T g
  vec2 pd=vec2(-fd.y,fd.x),S=vec2(1./(1.+.7*wSpeed),1.5);
  vec3 ga=wWaves(vec2(dot(pa,fd),dot(pa,pd))*S,wTime,wFw),gb=wWaves(vec2(dot(pb,fd),dot(pb,pd))*S,wTime,wFw);
  ga.yz=fd*(ga.y*S.x)+pd*(ga.z*S.y);gb.yz=fd*(gb.y*S.x)+pd*(gb.z*S.y);
  wg=mix(ga,gb,k);
  wFoamN=mix(wFoamTex(pa,fd,wSpeed),wFoamTex(pb+vec2(3.1,1.7),fd,wSpeed),k);
 }else{wg=wWaves(vWPlane,wTime,wFw);wFoamN=wFoamTex(vWPlane+vec2(wTime*.03,0.),vec2(1.,0.),.2);}
 wStr*=1./(1.+wDist/90.);
 wN=normalize(wUp-(wg.y*wEast+wg.z*wNorth)*wStr);
}
float wSide=dot(wUp,wV)<0.?-1.:1.;wN*=wSide; // vždy k pozorovateli (clona vodopádu, pohled zespodu)
// provzdušnělá voda rozptyluje světlo do všech stran: osvětlení clony počítáme s normálou natočenou k obloze
vec3 wLightN=wFall?normalize(wN+normalize(radial)*1.2):wN;
normal=normalize((viewMatrix*vec4(wLightN,0.)).xyz);
`;

const COMPOSE=/* glsl */`
// --- NEXUS water: složení barvy ---
{
 vec3 irr=reflectedLight.directDiffuse+reflectedLight.indirectDiffuse; // osvětlení bílého albeda
 vec3 spec=reflectedLight.directSpecular;
 float cosV=clamp(dot(wN,wV),0.,1.);
 float F=.02+.98*pow(1.-cosV,5.);
 vec3 R=reflect(-wV,wN);
 vec3 sky=wSky(R,normalize(radial));
 // absorpce: mělká průzračná, hluboká tmavě modrozelená
 float wAbs=1.-exp(-wDepth/1.4);
 vec3 body=wKind>2.5?wMarsh:mix(wShallow,wDeep,wAbs);
 float aBody=wKind>2.5?mix(.55,.9,wAbs):mix(.3,.93,1.-exp(-wDepth/.75));
 // pěna (0.1.4.7a) jen kde má být: nejprudší peřeje (atribut > ~.65), tůň pod vodopádem (wFall0) a slabě ústí/okraj
 // jezírka; jinak průhledná voda s barvou dna a Fresnelovým odrazem.
 float pool=wFall0.w*(1.-smoothstep(wFall0.z*.35,wFall0.z,distance(vWPlane,wFall0.xy)));
 float wf=wKind<.5?vWFoamV*.4:wKind>2.5?vWFoamV*.1:smoothstep(.64,.8,vWFoamV)*.8;
 wf=max(wf,pool);
 float foamA=smoothstep(1.-wf*.7,1.-wf*.7+.16,wFoamN)*smoothstep(.0,.25,wf);
 // v peřejích je i voda mezi pěnou zakalená bublinami (ne průhledná na dno)
 if(wKind>.5&&wKind<1.5){aBody=max(aBody,wf*.6);body=mix(body,mix(wShallow,vec3(.55,.66,.64),.35),clamp(wf,0.,1.)*.6);}
 float lap=wKind<.5?exp(-max(wShore,0.)/.35)*smoothstep(.55,.8,.5+.5*sin(wShore*7.-wTime*1.3+wFoamN*5.))*.5:0.;
 foamA=clamp(foamA+lap,0.,1.)*(1.-smoothstep(25.,120.,wDist)*.6);
 vec3 col;float a;
 if(wKind>3.5){
  // mokrý pás břehu (jen geometrie vysoké kvality): ztmavení a lehký lesk, slábne od vody do ~1,5 m a do dálky
  float wb=clamp(-wShore/1.5,0.,1.);
  a=.5*(1.-smoothstep(.15,1.,wb+(wFoamN-.5)*.25))*(1.-smoothstep(60.,160.,wDist));
  col=wBank*irr+sky*F*.6+spec*.4;
 }else if(wFall){
  // provzdušnělá clona: nahoře sklovitá, dole bílá
  float aer=clamp(smoothstep(.15,.75,vWFoamV)*(.45+.75*wFoamN),0.,1.);
  // provzdušnělá voda rozptyluje i světlo oblohy (bez toho v polostínu šedá)
  vec3 white=wFoamColor*(irr*(.9+.3*(1.-cosV))+sky*.3);
  vec3 glass=wShallow*irr*.35+sky*max(F,.12);
  col=mix(glass,white,aer)+spec*(1.-aer);
  a=mix(.5+.4*F,.95,aer)*(.7+.3*wFoamN);
  a*=smoothstep(0.,.35,wShore);
 }else{
  vec3 prem=body*irr*aBody*(1.-F)+sky*F+spec;
  a=aBody*(1.-F)+F;
  prem=mix(prem,wFoamColor*(irr+sky*.15)*(.6+.3*wFoamN),foamA);a=mix(a,.9,foamA);
  a=max(a,min(1.,dot(spec,vec3(.3,.59,.11))*.25));
  col=prem/max(a,.001);
  // měkký okraj: hladina mizí k čáře břehu (skryje zubatý průnik s hrubým LOD terénu)
  a*=smoothstep(.0,wKind<.5?1.1:.55,wShore);
  // potok: přesah pásu za okraj koryta (záporná vzdálenost) = úzký mokrý okraj
  if(wKind>.5&&wKind<1.5&&wShore<0.){float wb=clamp(-wShore/.4,0.,1.);a=.35*(1.-wb);col=wBank*irr+sky*F*.5;}
 }
 outgoingLight=col;diffuseColor.a=clamp(a,0.,1.);
 #ifdef WATER_DEBUG
 outgoingLight=WATER_DEBUG==1?vec3(wAbs,aBody,F*5.):WATER_DEBUG==2?vec3(a):WATER_DEBUG==3?irr*.3:WATER_DEBUG==4?sky:wN*.5+.5;diffuseColor.a=1.;
 #endif
}
#include <opaque_fragment>
`;

export function createWaterMaterial(T,U,quality='high'){
 const high=quality==='high';
 const m=new T.MeshStandardMaterial({color:0xffffff,roughness:.04,metalness:0,transparent:true,side:T.DoubleSide,depthWrite:false});m.forceSinglePass=true;
 m.name='nexus-water-'+quality;m.defines={};if(high)m.defines.WATER_HIGH='';
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,U);
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\n'+VERTEX_HEAD+'varying float vWFoamV;\n').replace('#include <begin_vertex>','#include <begin_vertex>\n'+VERTEX_BODY);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\n'+FRAGMENT_HEAD).replace('#include <normal_fragment_maps>',LIGHT_SPLIT).replace('#include <opaque_fragment>',COMPOSE);
 };
 m.customProgramCacheKey=()=>'nexus-water-'+quality;
 return m;
}

// Sprška a mlha u paty vodopádu: jeden draw call Points, pohyb počítaný ve vertex shaderu (jen vysoká kvalita).
// origin: bod dopadu (km, souřadnice root), up/flow: jednotkové světové vektory, count částic.
export function createWaterfallMist(T,{origin,up,flow,count=90,seed=7}){
 const n=count,pos=new Float32Array(n*3),rnd=new Float32Array(n*4);let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<n;i++){pos.set(origin,i*3);rnd.set([r(),r(),r(),r()],i*4)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('mistSeed',new T.BufferAttribute(rnd,4));
 g.boundingSphere=new T.Sphere(new T.Vector3(...origin),.02);
 const side=new T.Vector3().crossVectors(new T.Vector3(...up),new T.Vector3(...flow)).normalize();
 const MU={mTime:{value:0},mUp:{value:new T.Vector3(...up)},mFlow:{value:new T.Vector3(...flow)},mSide:{value:side}};
 const m=new T.PointsMaterial({color:0xffffff,size:.004,sizeAttenuation:true,transparent:true,opacity:.32,depthWrite:false});m.name='nexus-waterfall-mist';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,MU);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 mistSeed;uniform float mTime;uniform vec3 mUp,mFlow,mSide;varying float vMistA;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
    float life=fract(mTime*(.12+.1*mistSeed.x)+mistSeed.y);
    float ang=mistSeed.z*6.2832;vec2 rad=vec2(cos(ang),sin(ang))*(.6+2.4*mistSeed.w);
    // metry: vystoupá 1–6 m, rozšíří se a unáší po proudu; převod na km
    vec3 off=mUp*(life*(1.5+4.5*mistSeed.x))+mFlow*(rad.x*(.6+life*1.6)+life*2.5)+mSide*(rad.y*(.6+life*1.8));
    transformed+=off*.001;vMistA=sin(life*3.1416)*(1.-.5*mistSeed.w);`)
   .replace('gl_PointSize = size;','gl_PointSize = min(size*(0.6+1.4*life),48.0);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vMistA;')
   .replace('#include <map_particle_fragment>','#include <map_particle_fragment>\nvec2 pc=gl_PointCoord-.5;diffuseColor.a*=vMistA*smoothstep(.5,.0,length(pc));');
 };
 m.customProgramCacheKey=()=>'nexus-waterfall-mist';
 const pts=new T.Points(g,m);pts.name='valley-waterfall-mist';pts.renderOrder=3;pts.frustumCulled=true;
 return {points:pts,material:m,uniforms:MU,count:n};
}

// 0.1.4.7a: mlžný závoj pod vodopádem – 2–3 billboardy (jedna geometrie, jeden draw call, jen vysoká kvalita).
// Vestavěný MeshBasicMaterial (mlha, log. hloubka a tone mapping zůstávají), billboarding ve vertex shaderu.
// origin/up/flow jako u createWaterfallMist; size = poloměr závoje v metrech; uniforms = sdílené {mTime}.
export function createWaterfallVeil(T,{origin,up,flow,count=3,size=4.5,uniforms}){
 const n=Math.max(1,Math.min(3,count)),pos=new Float32Array(n*12),corner=new Float32Array(n*8),seed=new Float32Array(n*4),idx=[];
 for(let i=0;i<n;i++){const h=(.35+.75*i)*size,f=(i-.5)*1.1;// metry nad dopadem / po proudu
  const c=[0,1,2].map(k=>origin[k]+(up[k]*h+flow[k]*f)*.001);
  for(let v=0;v<4;v++){pos.set(c,(i*4+v)*3);corner.set([v&1?1:-1,v&2?1:-1],(i*4+v)*2);seed[i*4+v]=i/n}
  idx.push(i*4,i*4+1,i*4+3,i*4,i*4+3,i*4+2)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('veilCorner',new T.BufferAttribute(corner,2));g.setAttribute('veilSeed',new T.BufferAttribute(seed,1));g.setIndex(idx);
 g.boundingSphere=new T.Sphere(new T.Vector3(...origin),size*.004);
 const U=uniforms||{mTime:{value:0}},VU={...U,veilSize:{value:size*.001}};
 const m=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide});m.name='nexus-waterfall-veil';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,VU);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 veilCorner;attribute float veilSeed;uniform float mTime,veilSize;varying vec2 vVeilUv;varying float vVeilSeed;')
   .replace('#include <project_vertex>',`vVeilUv=veilCorner;vVeilSeed=veilSeed;
    vec4 mvPosition=modelViewMatrix*vec4(transformed,1.0);
    float vs=veilSize*(.8+.45*veilSeed)*(1.+.08*sin(mTime*.7+veilSeed*9.));
    mvPosition.xy+=veilCorner*vs;gl_Position=projectionMatrix*mvPosition;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
   uniform float mTime;varying vec2 vVeilUv;varying float vVeilSeed;
   float vHash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}
   float vNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(vHash(i),vHash(i+vec2(1,0)),f.x),mix(vHash(i+vec2(0,1)),vHash(i+1.),f.x),f.y);}`)
   .replace('#include <alphamap_fragment>',`#include <alphamap_fragment>
   {float r=length(vVeilUv);vec2 q=vVeilUv*1.6+vec2(vVeilSeed*7.,-mTime*(.18+.1*vVeilSeed));
    float nz=vNoise(q*2.)*.65+vNoise(q*4.3+3.1)*.35;
    diffuseColor.a*=pow(clamp(1.-r*r,0.,1.),1.6)*smoothstep(.2,.75,nz)*(1.-.35*vVeilSeed);}`);
 };
 m.customProgramCacheKey=()=>'nexus-waterfall-veil';
 const mesh=new T.Mesh(g,m);mesh.name='valley-waterfall-veil';mesh.renderOrder=3;mesh.frustumCulled=true;
 return {mesh,material:m,uniforms:VU,count:n};
}
