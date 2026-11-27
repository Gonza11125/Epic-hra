// Planet-relative cinematic atmosphere. All scene distances in kilometres.
// 0.1.4.7a „filmové světlo“: předvolby místního času s nízkým sluncem (dlouhé stíny), noční měsíční světlo
// (stejné DirectionalLight – žádné další světlo ani průchod), expozice podle jasu scény (plynulá adaptace),
// výšková exponenciální mlha se směrovým rozptylem pro VŠECHNY vestavěné materiály (sdílený fog chunk).
import {PLANET} from './elyra-geography.js?v=4';
// Místní čas (h, den 27 h, poledne 13,5 h). Údolí 07 (36° s. š.): svítání/západ ≈ výška slunce 0,2 (≈ 12°).
export const DAY_PRESETS={dawn:7.3,day:10.5,sunset:19.7,night:0};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export function localHour(position,hour){const lon=Math.atan2(position[2],position[0]);return ((hour-lon/(2*Math.PI)*PLANET.dayHours)%PLANET.dayHours+PLANET.dayHours)%PLANET.dayHours}
export function sunDirection(hour){const t=(hour/PLANET.dayHours-.5)*Math.PI*2,tilt=.19;return [Math.cos(t)*Math.cos(tilt),Math.sin(tilt),Math.sin(t)*Math.cos(tilt)]}
// Měsíc: opačná strana oblohy než slunce, zvednutý k zenitu (noc je vždy čitelná, světlo shora-šikmo).
export function moonDirection(position,sun){const m=sun.map((x,i)=>-x+position[i]*.95),l=Math.hypot(...m)||1;return m.map(x=>x/l)}
export function skyState(position,hour,altitudeKm=0,weather=.35){
 const sun=sunDirection(hour),elevation=position.reduce((s,x,i)=>s+x*sun[i],0),cloud=clamp(weather),space=clamp((altitudeKm-12)/130);
 // day: obloha (0 noc .. 1 den); twilight: zbarvení kolem obzoru; golden: teplota slunce (dlouhá dráha vzduchem)
 const day=smooth(-.13,.16,elevation),twilight=Math.exp(-Math.pow((elevation-.02)/.22,2)),golden=1-smooth(.03,.5,elevation);
 const direct=3.1*smooth(-.03,.07,elevation)*(.5+.5*smooth(0,.45,elevation))*(1-.42*cloud);
 const moon=.24*smooth(-.04,-.17,elevation)*(1-.5*cloud);
 const ambient=.3+(.82-.3)*smooth(-.16,.2,elevation)+cloud*.12*day;
 return {sun,elevation,day,twilight,golden,space,cloud,direct,moon,ambient,fogDensity:(.075+cloud*.16)*(1-space)};
}
// Sdílené uniformy mlhy: prosté objekty {x,y,z,w} – UniformsUtils.clone je nekopíruje (jen Vector/Color),
// takže všechny materiály (terén, flóra, voda, avatar) čtou stejné hodnoty bez úprav jejich kódu.
const FOG={center:{x:0,y:0,z:0,w:PLANET.radiusKm},params:{x:.13,y:1,z:.006,w:1},layer:{x:0,y:.125,z:0,w:0},sun:{x:0,y:1,z:0,w:10},color:{x:.7,y:.8,z:.85},sunColor:{x:0,y:0,z:0},tint:{x:0,y:0,z:0}};
let fogInstalled=false;
function installHeightFog(T){
 if(fogInstalled)return;fogInstalled=true;
 const C=T.ShaderChunk;
 C.fog_pars_vertex='#ifdef USE_FOG\n\tvarying float vFogDepth;\n\tvarying vec3 vNexusFogView;\n#endif';
 C.fog_vertex='#ifdef USE_FOG\n\tvFogDepth = - mvPosition.z;\n\tvNexusFogView = mvPosition.xyz;\n#endif';
 C.fog_pars_fragment=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	varying vec3 vNexusFogView;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
	uniform vec4 nexusFogCenter,nexusFogParams,nexusFogSun,nexusFogLayer;uniform vec3 nexusFogColor,nexusFogSunColor,nexusFogTint;
#endif`;
 // NEXUS výšková mlha, dvě exponenciální vrstvy integrované analyticky po paprsku (lineární průběh výšky mezi
 // kamerou a bodem): přízemní opar a*exp(-(h-href)*b) vztažený k vyhlazené výšce terénu pod kamerou (layer.x, km)
 // a řídký vzdušný opar c*exp(-h*layer.y) od hladiny moře (měřítko obzoru, okraj planety z oběžné dráhy).
 // Barva: obzor oblohy + teplý rozptyl ke slunci + fialový nádech od slunce. params.w = síla (0 vypne).
 // Bez nexus uniforem (jiné ShaderMaterialy, center.w = 0) → původní mlha three.js.
 C.fog_fragment=`#ifdef USE_FOG
	if(nexusFogCenter.w>0.){
		vec3 nfRay=(vec4(vNexusFogView,0.)*viewMatrix).xyz;float nfD=length(nfRay);vec3 nfDir=nfRay/max(nfD,1e-9);
		vec3 nfP=cameraPosition-nexusFogCenter.xyz;
		float nfH0=length(nfP)-nexusFogCenter.w,nfH1=length(nfP+nfRay)-nexusFogCenter.w;
		float nfA=(nfH0-nexusFogLayer.x)*nexusFogParams.y,nfB=(nfH1-nexusFogLayer.x)*nexusFogParams.y,nfDH=nfB-nfA;
		float nfI=abs(nfDH)>1e-3?(exp(-nfA)-exp(-nfB))/nfDH:exp(-.5*(nfA+nfB));
		float nfA2=nfH0*nexusFogLayer.y,nfB2=nfH1*nexusFogLayer.y,nfDH2=nfB2-nfA2;
		float nfI2=abs(nfDH2)>1e-3?(exp(-nfA2)-exp(-nfB2))/nfDH2:exp(-.5*(nfA2+nfB2));
		float nfFog=(1.-exp(-(nexusFogParams.x*nfI+nexusFogParams.z*nfI2)*nfD))*nexusFogParams.w;
		float nfMu=dot(nfDir,nexusFogSun.xyz);
		vec3 nfCol=nexusFogColor+nexusFogSunColor*pow(max(nfMu,0.),nexusFogSun.w)+nexusFogTint*(.5-.5*nfMu);
		gl_FragColor.rgb=mix(gl_FragColor.rgb,nfCol,nfFog);
	}else{
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
	}
#endif`;
 for(const lib of Object.values(T.ShaderLib))if(lib.uniforms&&lib.uniforms.fogColor)Object.assign(lib.uniforms,{nexusFogCenter:{value:FOG.center},nexusFogParams:{value:FOG.params},nexusFogLayer:{value:FOG.layer},nexusFogSun:{value:FOG.sun},nexusFogColor:{value:FOG.color},nexusFogSunColor:{value:FOG.sunColor},nexusFogTint:{value:FOG.tint}});
}
export function installAtmosphere(T,scene,renderer,camera,sun,hemi){
 installHeightFog(T);
 const C=c=>new T.Color(c),U={zenith:{value:C(0x397cba)},horizon:{value:C(0xbccfd6)},warm:{value:C(0xffb074)},violet:{value:C(0x8a6fc4)},nightZenith:{value:C(0x03040d)},nightHorizon:{value:C(0x0a1a22)},sunDir:{value:new T.Vector3()},moonDir:{value:new T.Vector3(0,1,0)},moon:{value:0},radial:{value:new T.Vector3(0,1,0)},east:{value:new T.Vector3(1,0,0)},north:{value:new T.Vector3(0,0,1)},clock:{value:0},day:{value:1},twilight:{value:0},space:{value:0},cloud:{value:.35},high:{value:0}};
 const sky=new T.Mesh(new T.SphereGeometry(4800,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:U,vertexShader:`
 varying vec3 skyDirection;
 // z těsně před vzdálenou rovinou: koule 4 800 km při far 5 200 km a near ~1 m leží v z/w ≈ 1 - 1e-8 a GPU
 // zaokrouhlením ořezávalo celé trojúhelníky (v letu „plovoucí šestiúhelník“ barvy pozadí na obloze).
 void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w*.9999;}
 `,fragmentShader:`
 varying vec3 skyDirection;uniform vec3 zenith,horizon,warm,violet,nightZenith,nightHorizon,sunDir,moonDir,radial,east,north;uniform float clock,day,twilight,space,cloud,high,moon;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 void main(){vec3 d=normalize(skyDirection);float hs=dot(d,radial),h=max(0.,hs),s=max(0.,dot(d,sunDir));
 vec3 night=mix(nightHorizon,nightZenith,pow(h,.35));
 vec3 atmosphere=mix(horizon,zenith,pow(h,.48));atmosphere=mix(night,atmosphere,day);
 // soumrak: teplá záře u slunce, nad ní a naproti fialový pás (identita Elyry)
 atmosphere+=warm*twilight*(.16*exp(-h*6.)*(.35+.65*s)+.5*pow(s,10.));
 atmosphere+=violet*twilight*.16*exp(-h*3.)*(1.-.6*s)*smoothstep(-.05,.02,hs);
 atmosphere+=warm*(pow(s,100.)*.35+smoothstep(.99975,.99991,s)*3.5)*(1.-space*.15);
 vec3 col=mix(atmosphere,nightZenith*.3,space);
 vec2 stars=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*190.;float star=step(.997,hash(floor(stars)))*(1.-smoothstep(.05,.35,length(fract(stars)-.5)));col+=star*max(1.-day,space)*.7*(.4+.6*hash(floor(stars)+3.1));
 float mc=dot(d,moonDir);col+=moon*(vec3(.85,.9,1.)*smoothstep(.99962,.99978,mc)*2.2+vec3(.35,.4,.7)*pow(max(mc,0.),60.)*.10);
 if(h>.025&&space<.99){vec2 p=vec2(dot(d,east),dot(d,north))/(h+.14)*4.8+vec2(clock*.006,clock*.002);float f=noise2(p)*.53+noise2(p*2.1)*.27+noise2(p*4.2)*.14+mix(.5,noise2(p*8.5),high)*.06;float a=smoothstep(.73-cloud*.36,.84-cloud*.35,f)*smoothstep(.025,.14,h)*(1.-space);vec3 shade=mix(nightHorizon*1.3+vec3(.006,.007,.016)*moon,vec3(.81,.85,.89),day);shade=mix(shade,mix(warm,violet,.35*(1.-s)),twilight*.5);shade*=.68+.32*smoothstep(.45,.8,f);col=mix(col,shade,a*.94);}
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));
 sky.frustumCulled=false;sky.renderOrder=-1000;scene.add(sky);scene.fog=new T.FogExp2(0x9dbbd2,.1);
 const skyDay=C(0x397cba),skyNight=C(0x0b1230),horizonDay=C(0xc2d8de),horizonDusk=C(0xe9b49e),horizonNight=C(0x10202c),
  sunDay=C(0xfff3e0),sunGold=C(0xffc685),sunDusk=C(0xff9150),moonColor=C(0x9aa8ff),
  hemiDay=C(0xbcd6ec),hemiDusk=C(0xa79bd6),hemiNight=C(0x5a68b8),groundDay=C(0x8b987c),groundDusk=C(0x6f6a78),groundNight=C(0x1c2236),
  warmDay=C(0xffb074),warmDusk=C(0xff9a5a),tealHaze=C(0x9fd0d4),violetHaze=C(0x7d6cb8);
 const up=new T.Vector3(),east=new T.Vector3(),north=new T.Vector3(),dir=new T.Vector3(),tmp=new T.Color(),fogC=new T.Color();let hour=11.3,weather=.35,auto=true,elapsed=0,lastQuality=null,exposure=null,fogRef=null;
 const opts={heightFog:true,autoExposure:true,moonLight:true,fogStrength:1};
 renderer.toneMappingExposure=1.08;
 // One local shadow map only in high mode. Units: km.
 sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-.045;sun.shadow.camera.right=.045;sun.shadow.camera.top=.045;sun.shadow.camera.bottom=-.045;sun.shadow.camera.near=.001;sun.shadow.camera.far=.35;sun.shadow.normalBias=.000055;sun.shadow.bias=-.00008;sun.shadow.radius=2;sun.shadow.camera.updateProjectionMatrix();renderer.shadowMap.type=T.PCFSoftShadowMap;
 const lum=c=>.2126*c.r+.7152*c.g+.0722*c.b;
 function update(position,altitudeKm,dt,high,walking,origin){elapsed+=dt;if(auto)hour=(hour+dt*.035)%PLANET.dayHours;
 const state=skyState(position,hour,altitudeKm,weather),{day,twilight,golden,space,elevation}=state;
 up.set(...position);east.set(-position[2],0,position[0]);if(east.lengthSq()<1e-10)east.set(1,0,0);east.normalize();north.crossVectors(east,up).normalize();dir.set(...state.sun);
 const moonDir=moonDirection(position,state.sun),moonI=opts.moonLight?state.moon:0;
 sky.position.copy(camera.position);U.radial.value.copy(up);U.east.value.copy(east);U.north.value.copy(north);U.sunDir.value.copy(dir);U.moonDir.value.set(...moonDir);U.moon.value=clamp(moonI/.24);U.day.value=day;U.twilight.value=twilight;U.space.value=space;U.cloud.value=weather;U.high.value=high?1:0;U.clock.value=elapsed;
 U.zenith.value.copy(skyNight).lerp(skyDay,day);U.horizon.value.copy(horizonNight).lerp(horizonDay,day).lerp(horizonDusk,twilight*.55);U.warm.value.copy(warmDay).lerp(warmDusk,golden);
 // Světla: slunce, pod obzorem stejné DirectionalLight jako měsíc (přepnutí směru, když jsou obě intenzity ~0).
 const sunUp=elevation>-.035;
 if(sunUp){sun.color.copy(sunDay).lerp(sunGold,smooth(0,.8,golden)).lerp(sunDusk,smooth(.75,1,golden));sun.intensity=state.direct;sun.position.copy(dir).multiplyScalar(.16)}
 else{sun.color.copy(moonColor);sun.intensity=moonI;sun.position.set(...moonDir).multiplyScalar(.16)}
 hemi.color.copy(hemiNight).lerp(hemiDay,day).lerp(hemiDusk,twilight*.45);hemi.groundColor.copy(groundNight).lerp(groundDay,day).lerp(groundDusk,twilight*.3);hemi.intensity=state.ambient;
 sun.target.position.set(0,0,0);const shadows=!!high&&!!walking&&state.elevation>.08;if(lastQuality!==shadows){renderer.shadowMap.enabled=shadows;sun.castShadow=shadows;lastQuality=shadows;}
 // Expozice podle odhadu osvětlení (oko se adaptuje): poledne ~1,0, zlatá hodina ~1,4, noc ~2,6.
 const key=(sunUp?sun.intensity*Math.max(elevation,0)*.9:moonI*.45)+hemi.intensity*lum(hemi.color)*.35+.004,target=opts.autoExposure?clamp(1.04*Math.pow(1.75/key,.36),.85,3.2):1.08;
 exposure=exposure===null||dt<=0?target:exposure+(target-exposure)*(1-Math.exp(-dt*2.5));renderer.toneMappingExposure=exposure;
 // Mlha: barva = obzor oblohy (+ soumrakový pás), teplý rozptyl ke slunci, modrozelený/fialový nádech od slunce.
 fogC.copy(U.horizon.value).lerp(tmp.copy(tealHaze).multiplyScalar(.25+.75*day),.25*day).add(tmp.copy(U.warm.value).multiplyScalar(twilight*.12));
 scene.fog.color.copy(fogC);scene.fog.density=state.fogDensity;scene.background.isColor&&scene.background.copy(U.horizon.value).lerp(skyNight,space);
 FOG.color.x=fogC.r;FOG.color.y=fogC.g;FOG.color.z=fogC.b;
 tmp.copy(U.warm.value).multiplyScalar(twilight*.55+day*.14);FOG.sunColor.x=tmp.r;FOG.sunColor.y=tmp.g;FOG.sunColor.z=tmp.b;
 tmp.copy(violetHaze).multiplyScalar(twilight*.1+(1-day)*.012);FOG.tint.x=tmp.r;FOG.tint.y=tmp.g;FOG.tint.z=tmp.b;
 FOG.sun.x=dir.x;FOG.sun.y=dir.y;FOG.sun.z=dir.z;FOG.sun.w=8;
 // Střed planety ve scéně = -origin (plovoucí počátek, km). Přízemní opar: 0,13/km u terénu pod kamerou
 // (údolí: ~18 % na 1,5 km), výška škály 1 km; reference = vyhlazená výška terénu, nad 8–40 km klesá k hladině moře.
 const o=origin||position.map(x=>x*(PLANET.radiusKm+altitudeKm));FOG.center.x=-o[0];FOG.center.y=-o[1];FOG.center.z=-o[2];
 const groundKm=Math.max(0,Math.hypot(...o)-PLANET.radiusKm-altitudeKm),refTarget=groundKm*(1-smooth(8,40,altitudeKm));
 fogRef=fogRef===null||dt<=0?refTarget:fogRef+(refTarget-fogRef)*(1-Math.exp(-dt*.6));
 const w=.7+weather*.9;FOG.layer.x=fogRef;FOG.layer.y=1/8;
 if(opts.heightFog){FOG.params.x=.13*w;FOG.params.y=1;FOG.params.z=.006*w}else{FOG.params.x=.05*w;FOG.params.y=1e-4;FOG.params.z=0}
 FOG.params.w=opts.fogStrength;
 return state;
 }
 return {update,setHour(v,position){const offset=position?Math.atan2(position[2],position[0])/(2*Math.PI)*PLANET.dayHours:0;hour=(((v+offset)%PLANET.dayHours)+PLANET.dayHours)%PLANET.dayHours},setAuto(v){auto=v},setWeather(v){weather=clamp(v)},
  // vypínače (výchozí zap. – žádná z funkcí nepřidává průchod ani draw call)
  setHeightFog(v){opts.heightFog=!!v},setAutoExposure(v){opts.autoExposure=!!v},setMoonLight(v){opts.moonLight=!!v},setFogStrength(v){opts.fogStrength=clamp(+v,0,2)},options:opts,fog:FOG,
  get exposure(){return exposure},get hour(){return hour},get auto(){return auto},sky};
}
