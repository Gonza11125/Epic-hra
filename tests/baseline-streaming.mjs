// Baseline: kolik snímků (při tick(2)) trvá, než TileStream přepne aktivní sadu z 6 kořenů
// na detailní sadu (h = 0,00168 km jako v exploreru při přistání)
// pro přistání v Údolí 07, a jaký LOD je mezitím aktivní.
// Spuštění: node tests/baseline-streaming.mjs
import {selectTiles,TileStream,key,buildSurfaceTile} from '../planet-streaming.js?v=0145';
import {valleyDirection,surfaceRadiusMeters} from '../elyra-geography.js?v=3';
let fails=0;const check=(ok,msg)=>{console.log((ok?'OK   ':'FAIL ')+msg);if(!ok)fails++};
const p=valleyDirection(0,0);
const stream=new TileStream({build:t=>({tile:t}),maxCache:240});
const roots=Array.from({length:6},(_,face)=>({face,level:0,x:0,y:0}));
stream.request(roots);stream.tick(6);
check(stream.active.size===6,'po startu aktivních 6 kořenů (LOD 0)');
const tiles=selectTiles(p,.00168,{budget:165,maxLevel:17,threshold:.65});
const maxLevel=Math.max(...tiles.map(t=>t.level));
check(tiles.length<=165&&tiles.length>100,`výběr pro přistání: ${tiles.length} dlaždic, max LOD ${maxLevel}`);
const t0=performance.now();stream.request(tiles);let frames=0,lod0Frames=0;
while(stream.pending){stream.tick(2);frames++;if([...stream.active].every(k=>k.split('/')[1]==='0'))lod0Frames++}
check([...stream.active].length===tiles.length,`po ${frames} snímcích aktivní detailní sada`);
console.log(`INFO snímků s aktivním pouze LOD 0 během přistání: ${lod0Frames} (při 60 fps ~${(lod0Frames/60).toFixed(1)} s, při 3 fps SwiftShader ~${(lod0Frames/3).toFixed(0)} s)`);
const tb=performance.now();for(const t of tiles.slice(0,20))buildSurfaceTile(t,12);console.log(`INFO buildSurfaceTile (CPU, Node): ${((performance.now()-tb)/20).toFixed(1)} ms/dlaždici -> ${tiles.length} dlaždic ~${((performance.now()-tb)/20*tiles.length/1000).toFixed(1)} s čistého CPU`);
// Výškový rozdíl mezi LOD 0 kořenem a analytickým povrchem v místě přistání (proč vegetace "visí").
import {findTile,meshGroundRadius} from '../planet-physics.js?v=0144';
const coarse=meshGroundRadius(p,findTile(p,roots),12),fine=surfaceRadiusMeters(p);
console.log(`INFO povrch LOD 0 vs analytický povrch v místě přistání: ${((fine-coarse)).toFixed(0)} m (vegetace se kreslí na analytické výšce)`);
check(Number.isFinite(coarse)&&Number.isFinite(fine),'výšky konečné');
process.exitCode=fails?1:0;
