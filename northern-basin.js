// A neighbouring alpine basin in Valley 07's azimuthal east/north frame (metres).
// Relief is an offset to Elyra's existing global ground; edges fade to zero with zero slope.
export const BASIN_POINTS = [
  {id:'basin-pass', name:'Sedlo nad kotlinou', x:90, z:2510},
  {id:'basin-floor', name:'Dno severní kotliny', x:95, z:3410},
];
export const BASIN_APPROACH = [[-35,1450],[-35,1700],[0,1950],[55,2200],[-32,2290],[-96,2350],[32,2415],[118,2475],[90,2510],
  [110,2720],[170,2890],[194,3090],[140,3270],[95,3410]];
const smooth = t => { t = Math.min(1,Math.max(0,t)); return t*t*(3-2*t); };
const bell = (x,z,a,b) => Math.exp(-((x/a)**2+(z/b)**2));

export function basinTrailDistance(x,z) {
  if(z<1430 || z>3430 || x<-120 || x>216) return Infinity;
  let best=Infinity;
  for(let i=1;i<BASIN_APPROACH.length;i++){
    const [a,b]=BASIN_APPROACH[i-1],[c,d]=BASIN_APPROACH[i],dx=c-a,dz=d-b;
    const t=Math.max(0,Math.min(1,((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz)));
    best=Math.min(best,Math.hypot(x-a-t*dx,z-b-t*dz));
  }
  return best;
}

export function basinRelief(x,z) {
  if(z<=2050 || z>=4710 || x<=-1140 || x>=1450) return null;
  const weight = smooth((z-2050)/530)*smooth((4710-z)/500)*
    smooth((x+1140)/340)*smooth((1450-x)/370);
  const axis = 120+110*Math.sin((z-2550)/470);
  const cross = x-axis;
  const west = 88*bell(cross+405,z-3035,130,210)+240*bell(cross+570,z-3400,260,750)+125*bell(cross+730,z-3760,160,260);
  const east = 75*bell(cross-470,z-3390,110,270)+174*bell(cross-630,z-3500,335,900)+109*bell(cross-465,z-3180,185,260);
  const headwall = 250*bell(cross+40,z-4150,550,250);
  const saddle = 52*bell(cross,z-2500,500,350);
  const hollow = 96*bell(cross,z-3430,460,710);
  const stone = smooth((west+east+headwall-40)/145);
  const ledges = stone*(8*Math.sin(z/51+cross/68)+3.5*Math.sin(cross/26-z/37));
  return {delta:weight*(west+east+headwall+saddle-hollow+ledges),weight,rock:stone};
}
