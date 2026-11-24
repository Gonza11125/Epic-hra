// Local metres, east/north. Three reaches meet at the pond's common water level.
// Outside the bank envelope the historical elevation is identical.
export function valleyWater(east, north) {
  if (east < 110 || east > 390 || north < -345 || north > -60) return null;
  const dx=(east-216)/55, dz=(north+178)/39;
  const ellipse=Math.hypot(dx,dz);
  let best={ edge:(1-ellipse)*39, level:20.4, depth:1.55 };
  const reaches=[
    [350,-90,28, 294,-125,24.1, 9], [294,-125,24.1, 249,-163,20.4, 10],
    [182,-198,20.4, 160,-242,19.2, 10], [160,-242,19.2, 139,-305,17.4, 9]
  ];
  for (const [ax,az,ah,bx,bz,bh,width] of reaches) {
    const x=bx-ax,z=bz-az;
    const t=Math.max(0,Math.min(1,((east-ax)*x+(north-az)*z)/(x*x+z*z)));
    const edge=width-Math.hypot(east-ax-t*x,north-az-t*z);
    if(edge>best.edge) best={edge,level:ah+(bh-ah)*t,depth:.55};
  }
  return best.edge<=-10?null:best;
}
export function sculptBank(height, water) {
  if (!water) return height;
  const {edge,level,depth}=water;
  if (edge>=0) return level-depth*Math.min(1,edge/9);
  const t=Math.min(1,-edge/10);
  return level+(height-level)*t*t*(3-2*t)+.48*Math.sin(Math.PI*t);
}

export function waterTriangles(step=10) {
  const water=[];
  function waterPoint(e,n) {
    const w=valleyWater(e,n);
    return {e,n,d:w?.edge??-10,h:w?.level??null};
  }
  function emitTriangle(points) {
    const clipped=[];
    for(let k=0;k<3;k++){
      const a=points[k],b=points[(k+1)%3];
      if(a.d>0) clipped.push(a);
      if((a.d>0)!==(b.d>0)){
        const t=a.d/(a.d-b.d);
        clipped.push({e:a.e+(b.e-a.e)*t,n:a.n+(b.n-a.n)*t,h:a.h===null?b.h:b.h===null?a.h:a.h+(b.h-a.h)*t});
      }
    }
    for(let k=1;k+1<clipped.length;k++) for(const p of [clipped[0],clipped[k],clipped[k+1]])
      water.push([+p.e.toFixed(3),+p.n.toFixed(3),+(p.h+.025).toFixed(3)]);
  }
  for(let n=-350;n<-60;n+=step)for(let e=110;e<390;e+=step){
    const a=waterPoint(e,n),b=waterPoint(e+step,n),c=waterPoint(e,n+step),d=waterPoint(e+step,n+step);
    emitTriangle([a,b,c]);emitTriangle([b,d,c]);
  }
  return water;
}
