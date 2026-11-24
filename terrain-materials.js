// Procedural tileable terrain textures and Three.js PBR material bridge.
// The four channels are rock, soil, sand and snow/ice height-detail patterns.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),mix=(a,b,t)=>a+(b-a)*t;
function hash(x,y,seed){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(seed,1274126177);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
function noise(u,v,n,seed){const x=u*n,y=v*n,i=Math.floor(x),j=Math.floor(y),a=x-i,b=y-j,s=a*a*(3-2*a),t=b*b*(3-2*b),h=(p,q)=>hash(((p%n)+n)%n,((q%n)+n)%n,seed);return mix(mix(h(i,j),h(i+1,j),s),mix(h(i,j+1),h(i+1,j+1),s),t)}
export function texturePattern(u,v){const n=(f,s)=>noise(u,v,f,s),a=n(8,1),b=n(24,2),c=n(64,3),d=n(128,4);const crack=1-Math.pow(Math.abs(a-b),.45);return [clamp(.27+.35*a+.28*b+.17*c-.20*crack),clamp(.25+.26*n(12,5)+.30*c+.19*d),clamp(.48+.18*Math.sin(2*Math.PI*(v*12+1.3*n(4,6)))+.15*b+.14*d),clamp(.55+.18*n(7,7)+.12*c+.12*d)]}
export function packedTerrainTexture(size=128){if(!Number.isInteger(size)||size<16||size>512)throw Error('Texture size');const pixels=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const p=texturePattern((x+.5)/size,(y+.5)/size);pixels.set(p.map(v=>Math.round(255*v)),(y*size+x)*4)}return pixels}
export function terrainWeights(biome,slope=0){const map={ocean:[0,0,1,0],shelf:[0,0,1,0],ice:[.07,0,0,.93],tundra:[.26,.45,0,.29],boreal:[.24,.76,0,0],temperate:[.12,.88,0,0],grass:[.08,.80,.12,0],desert:[.15,.05,.8,0],savanna:[.12,.48,.4,0],tropical:[.09,.91,0,0],mountain:[.86,.14,0,0],snow:[.20,0,0,.8]};const w=map[biome]||map.grass,t=clamp((slope-.16)/.55)*.75;return w.map((v,i)=>mix(v,i===0?1:0,t))}
export function createTerrainMaterial(T){
 const tex=new T.DataTexture(packedTerrainTexture(),128,128,T.RGBAFormat,T.UnsignedByteType);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;tex.anisotropy=4;
 const detail={value:1},material=new T.MeshStandardMaterial({vertexColors:true,roughness:.88,side:T.DoubleSide});
 material.onBeforeCompile=shader=>{
 shader.uniforms.nexusPacked={value:tex};shader.uniforms.nexusDetail=detail;
 shader.vertexShader='attribute vec3 terrainCoord; attribute vec3 terrainRadial; attribute vec4 terrainWeights; attribute float terrainWater; varying vec3 vTerrainCoord; varying vec3 vTerrainRadial; varying vec4 vTerrainWeights; varying float vTerrainWater;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTerrainCoord=terrainCoord;vTerrainRadial=terrainRadial;vTerrainWeights=terrainWeights;vTerrainWater=terrainWater;');
 shader.fragmentShader='uniform sampler2D nexusPacked; uniform float nexusDetail; varying vec3 vTerrainCoord; varying vec3 vTerrainRadial; varying vec4 vTerrainWeights; varying float vTerrainWater;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 blend=pow(abs(normalize(vTerrainRadial)),vec3(4.0));blend/=max(.001,blend.x+blend.y+blend.z);
 float nexusFade=(1.0-smoothstep(.035,.45,length(vViewPosition)))*nexusDetail;
 vec3 uvw=vTerrainCoord/8.0;
 vec4 terrainTex=texture2D(nexusPacked,uvw.yz)*blend.x+texture2D(nexusPacked,uvw.xz)*blend.y+texture2D(nexusPacked,uvw.xy)*blend.z;
 float nexusHeight=dot(terrainTex,vTerrainWeights);
 float nexusWater=clamp(vTerrainWater,0.0,1.0);
 diffuseColor.rgb*=mix(1.0,.65+nexusHeight*.66,nexusFade*(1.0-nexusWater*.8));
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.86,.96,1.1),nexusWater*.55);
 `);
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 roughnessFactor=mix(clamp(.78+nexusHeight*.20,.65,1.0),.24,nexusWater);
 `);
 // Sub-centimetre surface bump from the same packed map; units are km.
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition);
 vec3 r1=cross(dy,normal),r2=cross(normal,dx);
 float det=dot(dx,r1);
 float heightDetail=nexusHeight*.000012*nexusFade*(1.0-nexusWater);
 vec3 grad=sign(det)*(dFdx(heightDetail)*r1+dFdy(heightDetail)*r2);
 normal=normalize(max(abs(det),1e-15)*normal-grad);
 `);
 };
 material.customProgramCacheKey=()=> 'elyra-terrain-pbr-0143';
 return {material,texture:tex,setDetail(v){detail.value=clamp(v)}};
}
// Use local tile coordinates plus periodic global phase: no texture swimming
// when floating camera origin changes. 64 m is a multiple of 8 m.
export function textureCoordinates(positions,originMeters){return positions.map((x,i)=>x+((originMeters[i%3]%64)+64)%64)}
