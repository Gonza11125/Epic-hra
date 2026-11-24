import {PLANET,valleyManifest,valleyDirection} from './elyra-geography.js?v=3';
import {waterTriangles} from './valley-waters.js';

export function createValleyWater(T,scene) {
  const datum=valleyManifest().baseElevationMeters, radius=PLANET.radiusKm*1000;
  const anchor=valleyDirection(216,-178).map(v=>v*(radius+datum)/1000);
  const geometry=new T.BufferGeometry(),vertices=[],colors=[];
  for(const [e,n,h] of waterTriangles(5)){
    const position=valleyDirection(e,n);
    vertices.push(...position.map((v,i)=>v*(radius+datum+h)/1000-anchor[i]));
    const variation=.5+.5*Math.sin(e*.24+n*.31);
    colors.push(.035+variation*.015,.235+variation*.035,.24+variation*.035);
  }
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.23,metalness:.13});
  const mesh=new T.Mesh(geometry,mat);scene.add(mesh);
  return origin=>mesh.position.set(...anchor.map((v,i)=>v-origin[i]));
}
