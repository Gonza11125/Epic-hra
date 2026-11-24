// Requires Node 22+ and a local copy of the web prototype's Three.js r160 module.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {valleyLandscape, valleyManifest,PLANET} from '../../../elyra-geography.js';
import {waterTriangles} from '../../../valley-waters.js';
import {candidate,SPECIES} from '../../../valley-flora.js';
import {createFloraGeometry} from '../../../valley-nature.js';

const THREE=await import(process.argv[2]?pathToFileURL(path.resolve(process.argv[2])).href:'three');
const out=fileURLToPath(new URL('../Content/FieldData/',import.meta.url));
const manifest=valleyManifest();
const columns=251,rows=351,step=10,grid=Buffer.alloc(columns*rows*4);
for(let j=0;j<rows;j++) for(let i=0;i<columns;i++){
  const e=i*step-1250,n=j*step-1750;
  const v=valleyLandscape(e,n),offset=(j*columns+i)*4;
  grid.writeInt16LE(Math.round(v.heightMeters*10),offset);
  grid[offset+2]=Math.round(v.rock*255);grid[offset+3]=Math.round(v.trail*255);
}
fs.writeFileSync(path.join(out,'Ground.bin'),grid);
// Water follows the actual wet contour in the same triangles as collision.
// Signed bank distances clip each triangle. Keep the continuous level at cut vertices.
const water=waterTriangles(step);
const shapes={},placements=[];
for(const species of SPECIES){
  const mesh=createFloraGeometry(THREE,species.id,1),pos=mesh.attributes.position,color=mesh.attributes.color;
  const packed=Buffer.alloc(pos.count*9);
  for(let i=0;i<pos.count;i++){
    for(let k=0;k<3;k++){
      packed.writeInt16LE(Math.round(pos.array[i*3+k]*100),i*9+k*2);
      packed[i*9+6+k]=Math.round(Math.max(0,Math.min(1,color.array[i*3+k]))*255);
    }
  }
  shapes[species.id]=packed.toString('base64');
}
for(const [band,spacing,reach] of [[0,22,620],[1,8,165],[2,2.8,63]]){
  // Two populated zones along the walk. Leave the surveyed plateau clear.
  const seen=new Set();
  for(const [ce,cn] of [[0,0],[216,-178]])for(let i=Math.floor((ce-reach)/spacing);i<=Math.ceil((ce+reach)/spacing);i++)
    for(let j=Math.floor((cn-reach)/spacing);j<=Math.ceil((cn+reach)/spacing);j++){
      const key=i+','+j;if(seen.has(key))continue;
      const p=candidate(band,i,j);
      if(!p||Math.hypot(p.x-ce,p.z-cn)>reach)continue;
      seen.add(key);
      // Keep small plants as clusters beside the water rather than across the entire map.
      if(band===1&&(i+j)%3!==0 || band===2&&(i+j)%5!==0)continue;
      placements.push([p.id,+p.x.toFixed(2),+p.z.toFixed(2),+p.scale.toFixed(3),+p.yaw.toFixed(3),+p.tint.toFixed(3),+p.solid.toFixed(3)]);
    }
}
const info={schema:1,planet:PLANET.id,seed:PLANET.seed,radiusM:PLANET.radiusKm*1000,...manifest,columns,rows,step,water,shapes,placements};
fs.writeFileSync(path.join(out,'Scene.json'),JSON.stringify(info)+'\n');
console.log({columns,rows,waterTriangles:water.length/3,placements:placements.length});
