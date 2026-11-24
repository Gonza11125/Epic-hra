// Planet-relative cinematic atmosphere. All scene distances in kilometres.
import {PLANET} from './elyra-geography.js?v=3';
export const DAY_PRESETS={dawn:6.0,day:13.5,sunset:21.0,night:0};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export function localHour(position,hour){const lon=Math.atan2(position[2],position[0]);return ((hour-lon/(2*Math.PI)*PLANET.dayHours)%PLANET.dayHours+PLANET.dayHours)%PLANET.dayHours}
export function sunDirection(hour){const t=(hour/PLANET.dayHours-.5)*Math.PI*2,tilt=.19;return [Math.cos(t)*Math.cos(tilt),Math.sin(tilt),Math.sin(t)*Math.cos(tilt)]}
export function skyState(position,hour,altitudeKm=0,weather=.35){
 const sun=sunDirection(hour),elevation=position.reduce((s,x,i)=>s+x*sun[i],0),day=clamp((elevation+.075)/.24),twilight=Math.exp(-Math.pow((elevation+.015)/.16,2)),space=clamp((altitudeKm-12)/130),cloud=clamp(weather);
 return {sun,elevation,day,twilight,space,cloud,direct:Math.max(0,elevation+.025)*3.1*(1-.42*cloud),ambient:.12+day*(.88-.22*cloud),fogDensity:(.075+cloud*.16)*(1-space)};
}
export function installAtmosphere(T,scene,renderer,camera,sun,hemi){
 const C=c=>new T.Color(c),U={zenith:{value:C(0x397cba)},horizon:{value:C(0xbccfd6)},warm:{value:C(0xffb074)},sunDir:{value:new T.Vector3()},radial:{value:new T.Vector3(0,1,0)},east:{value:new T.Vector3(1,0,0)},north:{value:new T.Vector3(0,0,1)},clock:{value:0},day:{value:1},twilight:{value:0},space:{value:0},cloud:{value:.35},high:{value:0}};
 const sky=new T.Mesh(new T.SphereGeometry(4800,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:U,vertexShader:`
 varying vec3 skyDirection;
 void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
 `,fragmentShader:`
 varying vec3 skyDirection;uniform vec3 zenith,horizon,warm,sunDir,radial,east,north;uniform float clock,day,twilight,space,cloud,high;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 void main(){vec3 d=normalize(skyDirection);float h=max(0.,dot(d,radial)),s=max(0.,dot(d,sunDir));vec3 night=vec3(.004,.009,.024);
 vec3 atmosphere=mix(horizon,zenith,pow(h,.48));atmosphere=mix(night,atmosphere,day);
 atmosphere+=warm*twilight*(.14*exp(-h*6.)+.45*pow(s,12.));
 atmosphere+=warm*(pow(s,100.)*.35+smoothstep(.99975,.99991,s)*3.5)*(1.-space*.15);
 vec3 col=mix(atmosphere,night,space);
 vec2 stars=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*190.;float star=step(.997,hash(floor(stars)))*(1.-smoothstep(.05,.35,length(fract(stars)-.5)));col+=star*max(1.-day,space)*.7;
 if(h>.025&&space<.99){vec2 p=vec2(dot(d,east),dot(d,north))/(h+.14)*4.8+vec2(clock*.006,clock*.002);float f=noise2(p)*.53+noise2(p*2.1)*.27+noise2(p*4.2)*.14+mix(.5,noise2(p*8.5),high)*.06;float a=smoothstep(.73-cloud*.36,.84-cloud*.35,f)*smoothstep(.025,.14,h)*(1.-space);vec3 shade=mix(vec3(.04,.055,.095),vec3(.81,.85,.89),day);shade=mix(shade,warm,twilight*.48);shade*=.68+.32*smoothstep(.45,.8,f);col=mix(col,shade,a*.94);}
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));
 sky.frustumCulled=false;sky.renderOrder=-1000;scene.add(sky);scene.fog=new T.FogExp2(0x9dbbd2,.1);
 const skyDay=C(0x397cba),skyNight=C(0x101c42),horizonDay=C(0xc6d9df),horizonDusk=C(0xeab49a),horizonNight=C(0x182740),sunDay=C(0xfff1d8),sunDusk=C(0xffa35f),groundDay=C(0x8b987c),groundNight=C(0x232d45);
 const up=new T.Vector3(),east=new T.Vector3(),north=new T.Vector3(),dir=new T.Vector3();let hour=11.3,weather=.35,auto=true,elapsed=0,lastQuality=null;
 renderer.toneMappingExposure=1.08;
 // One local shadow map only in high mode. Units: km.
 sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-.045;sun.shadow.camera.right=.045;sun.shadow.camera.top=.045;sun.shadow.camera.bottom=-.045;sun.shadow.camera.near=.001;sun.shadow.camera.far=.35;sun.shadow.normalBias=.000055;sun.shadow.bias=-.00008;sun.shadow.radius=2;sun.shadow.camera.updateProjectionMatrix();renderer.shadowMap.type=T.PCFSoftShadowMap;
 function update(position,altitudeKm,dt,high,walking,origin){elapsed+=dt;if(auto)hour=(hour+dt*.035)%PLANET.dayHours;
 const state=skyState(position,hour,altitudeKm,weather),{day,twilight,space}=state;
 up.set(...position);east.set(-position[2],0,position[0]);if(east.lengthSq()<1e-10)east.set(1,0,0);east.normalize();north.crossVectors(east,up).normalize();dir.set(...state.sun);
 sky.position.copy(camera.position);U.radial.value.copy(up);U.east.value.copy(east);U.north.value.copy(north);U.sunDir.value.copy(dir);U.day.value=day;U.twilight.value=twilight;U.space.value=space;U.cloud.value=weather;U.high.value=high?1:0;U.clock.value=elapsed;U.zenith.value.copy(skyNight).lerp(skyDay,day);U.horizon.value.copy(horizonNight).lerp(horizonDay,day).lerp(horizonDusk,twilight*.62);
 scene.fog.color.copy(U.horizon.value).lerp(skyNight,space);scene.fog.density=state.fogDensity;sun.color.copy(sunDay).lerp(sunDusk,twilight*.85);sun.intensity=state.direct;hemi.color.copy(skyDay).lerp(horizonNight,1-day);hemi.groundColor.copy(groundNight).lerp(groundDay,day);hemi.intensity=state.ambient;
 sun.position.copy(dir).multiplyScalar(.16);sun.target.position.set(0,0,0);const shadows=!!high&&!!walking&&state.elevation>.08;if(lastQuality!==shadows){renderer.shadowMap.enabled=shadows;sun.castShadow=shadows;lastQuality=shadows;}
 return state;
 }
 return {update,setHour(v,position){const offset=position?Math.atan2(position[2],position[0])/(2*Math.PI)*PLANET.dayHours:0;hour=(((v+offset)%PLANET.dayHours)+PLANET.dayHours)%PLANET.dayHours},setAuto(v){auto=v},setWeather(v){weather=clamp(v)},get hour(){return hour},get auto(){return auto},sky};
}
