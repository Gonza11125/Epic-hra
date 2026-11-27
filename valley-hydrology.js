// NEXUS 0.1.4.7 Living Waters – hydrologie Údolí 07. Engine-neutral, bez importů (žádný Three.js).
// Souřadnice: lokální metry údolí (x = východ, z = sever); výšky v metrech nad základní výškou údolí
// (valleyManifest().baseElevationMeters). Vše deterministické: stejný terén => stejná vodní síť.
//
// Postup (viz tools/valley-water-design.mjs): trasy toků byly vedeny po NEUPRAVENÉM terénu – pramenný potok
// nejstrmějším spádem z východního svahu do přirozené sníženiny Rokle, odtok minimax cestou (priority-flood)
// k nejnižšímu místu severního dna. Jezírko leží v přirozené pánvi (přeliv 50,07 m); hladina 50,0 m
// je pod přelivem, voda odtéká jen zářezem koryta. Úpravy reliéfu = pouze ZAHLOUBENÍ (min) podél koryt.
export const WATER_DESIGN={
 revision:1,
 stationMeters:2,       // krok staničení podél toku
 minGradient:.0012,     // minimální spád hladiny potoka (m/m) – voda vždy teče z kopce
 surfaceMargin:.06,     // hladina potoka pod nejnižším terénem příčného řezu (m)
 bankOffset:1,          // kontrola břehu: vzdálenost za okrajem koryta (m)
 bankSlope:.5,          // sklon vykopaných břehů (1 : 2)
 fordBankSlope:.12,     // mírné nájezdy brodu
 maxInfluence:48,       // max. dosah úpravy terénu od okraje koryta (m)
 gravity:9.414384,      // herní gravitace Elyry (planet-physics.js WALK.gravity)
 lakes:[
  {id:'ravine-lake',name:'Jezírko v Rokli',kind:'lake',level:50,seed:[610,920],bbox:[490,684,776,1006],cell:2,outflow:'ravine-brook'},
  {id:'north-marsh',name:'Severní mokřad',kind:'wetland',level:16,seed:[-84,1804],bbox:[-146,43,1733,1865],cell:3,outflow:null,terminal:true}],
 reaches:[
  {id:'spring-brook',name:'Pramenný potok',kind:'inflow',source:{kind:'spring',x:850,z:1000},to:'ravine-lake',width:2,discharge:.2,
   waterfall:{id:'ravine-falls',name:'Vodopád Rokle',at:[735.1,995],height:10,poolLength:14,poolDepth:1.4,poolWiden:.8},
   points:[[850,1000],[842.1,1001.2],[834.2,1002.3],[826.2,1003.2],[818.2,1003.8],[810.2,1004.1],[802.2,1004.1],[794.2,1004],[786.3,1003.7],[778.3,1003.1],[770.3,1002.2],[762.4,1000.9],[754.6,999.2],[746.8,997.4],[739,995.7],[731.1,994.4],[723.2,993.2],[715.3,992],[707.4,990.7],[699.6,989.2],[691.7,987.5],[683.9,985.7],[676.3,983.5],[669.1,979.9],[662.9,974.9],[657.1,969.4],[651.3,963.8],[645.6,958.2],[639.7,952.9],[632.9,948.6],[629.3,946.9]]},
  {id:'ravine-brook',name:'Rokelský potok',kind:'outflow',from:'ravine-lake',to:'north-marsh',width:2.8,discharge:.18,points:[[560,872],[552.8,868.6],[545.3,865.8],[537.4,864.3],[529.4,864],[521.4,864],[513.5,864.3],[505.6,865.8],[497.7,865],[489.8,863.9],[481.8,863.2],[473.9,862],[466,861.2],[458,861.7],[450.1,863],[442.2,864.1],[434.2,865],[426.6,867.5],[420.1,872.1],[414.4,877.6],[408.7,883.3],[403,889],[397.4,894.6],[391.7,900.3],[386.1,905.9],[380.4,911.6],[374.8,917.2],[369.1,922.9],[363.4,928.6],[357.8,934.2],[352.1,939.9],[346.4,945.4],[340.3,950.6],[333.6,955],[326.2,957.8],[318.2,958.1],[310.2,957.4],[302.3,958.2],[294.7,960.8],[287.9,964.9],[281.8,970.2],[276.2,975.8],[270.5,981.5],[264.9,987.1],[259.2,992.8],[253.6,998.4],[247.9,1004.1],[242.2,1009.8],[236.6,1015.4],[230.9,1021.1],[225.2,1026.6],[219,1031.7],[212.3,1036.1],[205.5,1040.2],[199.3,1045.3],[193.9,1051.2],[188.6,1057.2],[183.4,1063.2],[179,1069.9],[176.4,1077.5],[175,1085.3],[174.4,1093.3],[175.2,1101.3],[178,1108.7],[182.5,1115.3],[187.6,1121.5],[192.2,1128],[196.3,1134.9],[200.7,1141.6],[204.9,1148.4],[207.6,1155.9],[208.2,1163.8],[206.1,1171.5],[202.2,1178.4],[198.5,1185.5],[194.5,1192.4],[189.7,1198.8],[185.9,1205.8],[183.6,1213.5],[181.7,1221.2],[180.1,1229.1],[178.2,1236.8],[175.6,1244.4],[172.5,1251.8],[168.4,1258.6],[163.3,1264.7],[159,1271.5],[155.8,1278.8],[154,1286.6],[153.7,1294.5],[154.2,1302.5],[154.5,1310.5],[154.3,1318.5],[153.8,1326.5],[153.6,1334.5],[154.8,1342.4],[158.7,1349.2],[164.6,1354.6],[169.4,1360.8],[171.3,1368.5],[172.6,1376.4],[174.6,1384.1],[175.9,1392],[176,1400],[175,1407.9],[173.1,1415.7],[170.1,1423.1],[166.2,1430.1],[161.8,1436.8],[157.5,1443.5],[154.7,1450.9],[154.8,1458.9],[157.5,1466.3],[161.9,1473],[166.1,1479.8],[167.9,1487.5],[166.1,1495.2],[162,1502],[156.8,1508.2],[151.7,1514.3],[147.5,1521.1],[144.8,1528.6],[144.1,1536.6],[145.1,1544.5],[147.2,1552.2],[149.6,1559.8],[151.6,1567.6],[152.4,1575.5],[151.5,1583.4],[148.6,1590.9],[143.5,1597],[137,1601.6],[130.4,1606.1],[124.2,1611.2],[118.2,1616.5],[113,1622.5],[108.8,1629.3],[104.8,1636.3],[100,1642.7],[94.4,1648.3],[88.5,1653.8],[82.6,1659.1],[76.6,1664.4],[70.8,1670],[65.4,1675.8],[60.1,1681.8],[54.8,1687.8],[49.5,1693.8],[44.1,1699.7],[38.5,1705.5],[32.9,1711.1],[27.2,1716.8],[21.6,1722.4],[15.9,1728.1],[10.2,1733.8],[4.6,1739.4],[-1.1,1745.1],[-6.7,1750.7],[-12.4,1756.4],[-18,1762],[-23.7,1767.7],[-28.7,1773.9],[-33.3,1780.5],[-39.3,1785.7],[-46.6,1789],[-54,1791.9],[-61.3,1795.2],[-68.6,1798.4],[-76.1,1801.2],[-83.7,1803.9]]}]
};
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
// Catmull-Rom přes řídicí body a převzorkování po délce oblouku.
function densify(points,step){const fine=[];const n=points.length;for(let i=0;i<n-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(n-1,i+2)];for(let k=0;k<8;k++){const t=k/8,t2=t*t,t3=t2*t;fine.push([0,1].map(c=>.5*(2*p1[c]+(-p0[c]+p2[c])*t+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*t2+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*t3)))}}fine.push(points[n-1].slice());
 const out=[[fine[0][0],fine[0][1],0]];let s=0,next=step;for(let i=1;i<fine.length;i++){const [a,b]=fine[i-1],[c,d]=fine[i],L=Math.hypot(c-a,d-b);while(s+L>=next){const t=(next-s)/L;out.push([a+(c-a)*t,b+(d-b)*t,next]);next+=step}s+=L}const last=fine[fine.length-1];if(s-out[out.length-1][2]>step*.3)out.push([last[0],last[1],s]);return out}
function manningDepth(Q,w,S,n){let lo=.005,hi=4;for(let k=0;k<60;k++){const d=(lo+hi)/2,A=w*d,R=A/(w+2*d);(A*Math.pow(R,2/3)*Math.sqrt(S)/n>Q)?hi=d:lo=d}return (lo+hi)/2}
function segDist(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
// height(x,z): NEUPRAVENÝ povrch (m nad základnou). routes: [{id,points,width}]. platform: {half} kolem (0,0).
export function deriveWaterNetwork({height,routes=[],platform={half:120},design=WATER_DESIGN}){
 const P=design,lakes=new Map(),net={revision:P.revision,lakes:[],reaches:[],waterfalls:[],crossings:[],params:P};
 for(const L of P.lakes){const lake=buildLake(L,height);lakes.set(L.id,lake);net.lakes.push(lake)}
 for(const R of P.reaches){
  let st=densify(R.points,P.stationMeters).map(([x,z,s])=>({x,z,s,h:height(x,z)}));
  // Zkrácení na břehy jezer: odtok začíná prvním staničením nad hladinou, přítok končí posledním nad hladinou.
  const up=R.from?lakes.get(R.from):null,down=R.to?lakes.get(R.to):null;
  if(up){const i=st.findIndex(p=>p.h>=up.level&&!lakeContains(up,p.x,p.z));st=st.slice(Math.max(0,i))}
  if(down){const i=st.findIndex((p,k)=>k>2&&(p.h<down.level||lakeContains(down,p.x,p.z)));if(i>0)st=st.slice(0,i)}
  const s0=st[0].s;for(const p of st)p.s-=s0;
  // Vodopád: lom (hrana) na nejbližším staničení k návrhovému bodu, další staničení 0,6 m za hranou.
  let fall=-1;if(R.waterfall){let best=Infinity;st.forEach((p,i)=>{const d=Math.hypot(p.x-R.waterfall.at[0],p.z-R.waterfall.at[1]);if(d<best){best=d;fall=i}});const a=st[fall],b=st[fall+1],t=.6/(b.s-a.s);st.splice(fall+1,0,{x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),s:a.s+.6,h:height(lerp(a.x,b.x,t),lerp(a.z,b.z,t))})}
  // Tečny a normály (normála = vlevo po proudu).
  for(let i=0;i<st.length;i++){const a=st[Math.max(0,i-1)],b=st[Math.min(st.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;st[i].tx=(b.x-a.x)/l;st[i].tz=(b.z-a.z)/l;st[i].nx=-st[i].tz;st[i].nz=st[i].tx}
  if(fall>=0){const a=st[fall],b=st[fall+1];for(const p of [a,b]){const l=Math.hypot(b.x-a.x,b.z-a.z);p.tx=(b.x-a.x)/l;p.tz=(b.z-a.z)/l;p.nx=-p.tz;p.nz=p.tx}}
  const fallS=fall>=0?st[fall].s:NaN,phase=R.id.length*1.37;
  // Křížení s trasami => brod (mělký, mírné břehy).
  for(const p of st){p.ford=null;for(const route of routes)for(let i=1;i<route.points.length;i++)if(segDist(p.x,p.z,route.points[i-1],route.points[i])<route.width/2+R.width/2+3){p.ford=route.id}}
  // Šířka: návrhová ± deterministické zvlnění; tůň pod vodopádem a brody širší.
  for(const p of st){let w=R.width*(1+.1*Math.sin(p.s/23+phase)+.06*Math.sin(p.s/7.3+1.1));const k=p.s-fallS;if(k>.3&&k<=R.waterfall.poolLength)w*=1+R.waterfall.poolWiden*(1-Math.max(0,k-.6)/R.waterfall.poolLength);if(p.ford)w*=1.6;p.w=w}
  // Nejnižší terén příčného řezu (střed a oba břehy).
  for(const p of st){const o=p.w/2+P.bankOffset;p.cross=Math.min(p.h,height(p.x+p.nx*o,p.z+p.nz*o),height(p.x-p.nx*o,p.z-p.nz*o))}
  // Hladina: monotónně klesající, vždy pod terénem příčného řezu; na hraně vodopádu skok o jeho výšku.
  for(let i=0;i<st.length;i++){const p=st[i];if(i===0){p.ws=up?Math.min(up.level-.005,p.cross-P.surfaceMargin):p.cross-P.surfaceMargin;continue}const q=st[i-1],ds=p.s-q.s;let ws=Math.min(q.ws-P.minGradient*ds,p.cross-P.surfaceMargin);if(i===fall+1)ws=Math.min(ws,q.ws-R.waterfall.height);p.ws=ws}
  // Ústí do jezera/mokřadu: hladina potoka nesmí klesnout pod hladinu příjemce (jinak by tekl do kopce).
  if(down){const end=st[st.length-1].s;for(const p of st)p.ws=Math.max(p.ws,down.level+.005+.002*(end-p.s))}
  // Hloubka a rychlost: Manningova rovnice pro průtok Q, sklon hladiny v okně ±6 m (bez přechodu přes vodopád).
  for(let i=0;i<st.length;i++){const p=st[i];let a=i,b=i;const lo=fall>=0&&i>fall?fall+1:0,hi=fall>=0&&i<=fall?fall:st.length-1;while(a>lo&&p.s-st[a-1].s<=6)a--;while(b<hi&&st[b+1].s-p.s<=6)b++;const S=Math.max(P.minGradient,a<b?(st[a].ws-st[b].ws)/(st[b].s-st[a].s):P.minGradient),n=.035+.07*Math.min(1,S/.4);let d=clamp(manningDepth(R.discharge,p.w,S,n),.06,1.2);const k=p.s-fallS;if(k>.3&&k<=R.waterfall.poolLength)d=Math.max(d,R.waterfall.poolDepth*(1-Math.max(0,k-.6)/R.waterfall.poolLength)+.15);if(p.ford)d=Math.min(d,.25);p.depth=d;p.slope=S;p.speed=Math.min(4,R.discharge/(p.w*d));p.bed=p.ws-d;p.bank=p.ford?P.fordBankSlope:P.bankSlope}
  const reach={id:R.id,name:R.name,kind:R.kind,from:R.from||null,to:R.to||null,source:R.source||null,discharge:R.discharge,fallIndex:fall,stations:st,length:st[st.length-1].s};
  reach.chunks=[];for(let a=0;a<st.length-1;a+=12){const b=Math.min(st.length-1,a+12);let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity,m=0;for(let i=a;i<=b;i++){x0=Math.min(x0,st[i].x);x1=Math.max(x1,st[i].x);z0=Math.min(z0,st[i].z);z1=Math.max(z1,st[i].z);m=Math.max(m,st[i].w/2)}const e=m+P.maxInfluence;reach.chunks.push({a,b,x0:x0-e,x1:x1+e,z0:z0-e,z1:z1+e})}
  reach.bbox=[Math.min(...reach.chunks.map(c=>c.x0)),Math.max(...reach.chunks.map(c=>c.x1)),Math.min(...reach.chunks.map(c=>c.z0)),Math.max(...reach.chunks.map(c=>c.z1))];
  net.reaches.push(reach);
  if(fall>=0){const a=st[fall],b=st[fall+1],D=a.ws-b.ws,v0=a.speed,t=Math.sqrt(2*D/P.gravity);net.waterfalls.push({id:R.waterfall.id,name:R.waterfall.name,reach:R.id,x:a.x,z:a.z,top:a.ws,bottom:b.ws,height:D,width:a.w,dirX:a.tx,dirZ:a.tz,exitSpeed:v0,impactSpeed:Math.sqrt(v0*v0+2*P.gravity*D),throwMeters:v0*t,fallSeconds:t})}
  // Data brodů pro pozdější model: střed, šířka brodu (podél trasy), délka (přes tok), hloubka.
  let run=null;st.forEach((p,i)=>{if(p.ford&&!run)run={route:p.ford,a:i};if(run&&(!p.ford||i===st.length-1)){const b=p.ford?i:i-1,m=st[Math.round((run.a+b)/2)],route=routes.find(r=>r.id===run.route);net.crossings.push({id:R.id+'×'+run.route,reach:R.id,route:run.route,type:m.depth<=.3&&m.speed<1.5?'ford':'footbridge',x:m.x,z:m.z,width:route.width+2,length:Math.max(...st.slice(run.a,b+1).map(q=>q.w))+2,waterDepth:m.depth,waterLevel:m.ws,flowSpeed:m.speed,deckLevel:m.ws+.8});run=null}});
 }
 net.platform=platform;return net;
}
// Jezero: maska zaplavených buněk z neupraveného terénu, znaménková vzdálenost od břehu, obrys (marching squares).
function buildLake(L,height){const c=L.cell,[x0,x1,z0,z1]=L.bbox,nx=Math.round((x1-x0)/c)+1,nz=Math.round((z1-z0)/c)+1,N=nx*nz,h=new Float64Array(N),mask=new Uint8Array(N);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)h[j*nx+i]=height(x0+i*c,z0+j*c);
 const si=Math.round((L.seed[0]-x0)/c),sj=Math.round((L.seed[1]-z0)/c),stack=[sj*nx+si];let contained=true;if(h[stack[0]]>=L.level)throw Error('Lake seed above level: '+L.id);mask[stack[0]]=1;
 while(stack.length){const k=stack.pop(),i=k%nx,j=(k-i)/nx;if(i===0||j===0||i===nx-1||j===nz-1)contained=false;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const q=jj*nx+ii;if(!mask[q]&&h[q]<L.level){mask[q]=1;stack.push(q)}}}
 // Chamfer vzdálenost (m): kladná uvnitř, záporná vně.
 const dist=m=>{const d=new Float64Array(N).fill(1e9);for(let k=0;k<N;k++)if(!m[k])d[k]=0;const a=c,b=c*Math.SQRT2;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(i>0)d[k]=Math.min(d[k],d[k-1]+a);if(j>0){d[k]=Math.min(d[k],d[k-nx]+a);if(i>0)d[k]=Math.min(d[k],d[k-nx-1]+b);if(i<nx-1)d[k]=Math.min(d[k],d[k-nx+1]+b)}}for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;if(i<nx-1)d[k]=Math.min(d[k],d[k+1]+a);if(j<nz-1){d[k]=Math.min(d[k],d[k+nx]+a);if(i<nx-1)d[k]=Math.min(d[k],d[k+nx+1]+b);if(i>0)d[k]=Math.min(d[k],d[k+nx-1]+b)}}return d};
 const inside=dist(mask),outside=dist(mask.map(v=>v?0:1)),sd=new Float32Array(N);for(let k=0;k<N;k++)sd[k]=mask[k]?inside[k]-c/2:-(outside[k]-c/2);
 let area=0,maxDepth=0,volume=0;for(let k=0;k<N;k++)if(mask[k]){area+=c*c;maxDepth=Math.max(maxDepth,L.level-h[k]);volume+=(L.level-h[k])*c*c}
 // Obrys: marching squares na poli (hladina - terén) omezeném na masku.
 const f=k=>mask[k]?Math.max(L.level-h[k],1e-4):Math.min(L.level-h[k],-1e-4),segs=new Map(),edgeKey=(i,j,dir)=>i+','+j+','+dir;
 const pt=(i,j,dir)=>{const k0=j*nx+i,k1=dir?k0+nx:k0+1,a=f(k0),b=f(k1),t=a/(a-b);return dir?[x0+i*c,z0+(j+t)*c]:[x0+(i+t)*c,z0+j*c]};
 const links=[];for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const v=[f(j*nx+i)>0,f(j*nx+i+1)>0,f((j+1)*nx+i+1)>0,f((j+1)*nx+i)>0];const e=[edgeKey(i,j,0),edgeKey(i+1,j,1),edgeKey(i,j+1,0),edgeKey(i,j,1)],cut=[0,1,2,3].filter(q=>v[q]!==v[(q+1)%4]);
  if(cut.length===2)links.push([e[cut[0]],e[cut[1]]]);else if(cut.length===4){links.push([e[0],e[1]],[e[2],e[3]])}}
 for(const [a,b] of links){if(!segs.has(a))segs.set(a,[]);if(!segs.has(b))segs.set(b,[]);segs.get(a).push(b);segs.get(b).push(a)}
 const used=new Set(),loops=[];for(const startKey of segs.keys()){if(used.has(startKey))continue;const loop=[];let k=startKey,prev=null;while(k&&!used.has(k)){used.add(k);loop.push(k);const nb=segs.get(k).filter(q=>q!==prev&&!used.has(q));prev=k;k=nb[0]}loops.push(loop)}
 const toPt=key=>{const [i,j,dir]=key.split(',').map(Number);return pt(i,j,dir)};let outline=loops.sort((a,b)=>b.length-a.length)[0].map(toPt);
 const shoelace=p=>p.reduce((s,q,i)=>{const r=p[(i+1)%p.length];return s+q[0]*r[1]-r[0]*q[1]},0)/2;if(shoelace(outline)<0)outline.reverse();
 return {id:L.id,name:L.name,kind:L.kind,level:L.level,outflow:L.outflow,terminal:!!L.terminal,bbox:L.bbox,cell:c,nx,nz,x0,z0,contained,area,maxDepth,meanDepth:volume/area,volume,outline,outlineArea:shoelace(outline),mask,sd,terrain:h};
}
export function lakeSignedDistance(lake,x,z){const fx=(x-lake.x0)/lake.cell,fz=(z-lake.z0)/lake.cell;if(fx<0||fz<0||fx>lake.nx-1||fz>lake.nz-1)return -1e9;const i=Math.min(lake.nx-2,Math.floor(fx)),j=Math.min(lake.nz-2,Math.floor(fz)),a=fx-i,b=fz-j,k=j*lake.nx+i,d=lake.sd;return (d[k]*(1-a)+d[k+1]*a)*(1-b)+(d[k+lake.nx]*(1-a)+d[k+lake.nx+1]*a)*b}
export function lakeContains(lake,x,z){return lakeSignedDistance(lake,x,z)>0}
function cross(r,ws,w,d,bank,infl){const e=r-w/2;if(e<=0)return ws-d*(1-(2*r/w)**2);return e<infl?ws+bank*e:Infinity}
// Výška upraveného terénu (koryta, tůň, hrana vodopádu) nebo Infinity mimo dosah. Výsledný terén = min(terén, carve).
export function carveHeight(net,x,z){let best=Infinity;const infl=net.params.maxInfluence;
 for(const R of net.reaches){const bb=R.bbox;if(x<bb[0]||x>bb[1]||z<bb[2]||z>bb[3])continue;const st=R.stations;
  for(const c of R.chunks){if(x<c.x0||x>c.x1||z<c.z0||z>c.z1)continue;
   for(let i=c.a;i<c.b;i++){const A=st[i],B=st[i+1],dx=B.x-A.x,dz=B.z-A.z,L2=dx*dx+dz*dz,t=((x-A.x)*dx+(z-A.z)*dz)/L2;if(t<0||t>1)continue;const r=Math.hypot(x-A.x-t*dx,z-A.z-t*dz),T=cross(r,lerp(A.ws,B.ws,t),lerp(A.w,B.w,t),lerp(A.depth,B.depth,t),Math.min(A.bank,B.bank),infl);if(T<best)best=T}
   // Klíny na vnější straně ohybů a konce toku: bod leží za koncem předchozího i před začátkem dalšího úseku.
   // (Nikdy nesahá proti proudu přes hranu vodopádu, takže hrana zůstane ostrá.)
   for(let i=c.a;i<=c.b;i++){const A=st[i],ax=x-A.x,az=z-A.z;if(i>0){const P=st[i-1],dx=A.x-P.x,dz=A.z-P.z;if(ax*dx+az*dz<0)continue}if(i<st.length-1){const B=st[i+1];if(ax*(B.x-A.x)+az*(B.z-A.z)>0)continue}const T=cross(Math.hypot(ax,az),A.ws,A.w,A.depth,A.bank,infl);if(T<best)best=T}}}
 return best;
}
// Vodní hladina v bodě: {kind,id,surface,speed,dirX,dirZ,shore} nebo null. Hloubku dopočítá volající z terénu.
export function waterSurfaceAt(net,x,z){let out=null;
 for(const L of net.lakes){const d=lakeSignedDistance(L,x,z);if(d>0)return {kind:L.kind,id:L.id,surface:L.level,speed:0,dirX:0,dirZ:0,shore:d}}
 let bestR=Infinity;for(const R of net.reaches){const bb=R.bbox;if(x<bb[0]||x>bb[1]||z<bb[2]||z>bb[3])continue;const st=R.stations;
  for(let i=0;i<st.length-1;i++){const A=st[i],B=st[i+1],dx=B.x-A.x,dz=B.z-A.z,L2=dx*dx+dz*dz,t=clamp(((x-A.x)*dx+(z-A.z)*dz)/L2,0,1),r=Math.hypot(x-A.x-t*dx,z-A.z-t*dz),w=lerp(A.w,B.w,t);if(r<w/2&&r<bestR){bestR=r;out={kind:i===R.fallIndex?'waterfall':'stream',id:R.id,surface:lerp(A.ws,B.ws,t),speed:lerp(A.speed,B.speed,t),dirX:A.tx,dirZ:A.tz,shore:w/2-r}}}}
 return out;
}
// Pravidlo pro vegetaci: false = v okruhu r (+ rezerva) je voda nebo břeh.
export function waterClear(net,x,z,r=0,margin=2){for(const L of net.lakes)if(lakeSignedDistance(L,x,z)>-(r+margin+1))return false;
 const e=r+margin;for(const R of net.reaches){const bb=R.bbox;if(x<bb[0]||x>bb[1]||z<bb[2]||z>bb[3])continue;const st=R.stations;for(const c of R.chunks){if(x<c.x0||x>c.x1||z<c.z0||z>c.z1)continue;for(let i=c.a;i<c.b;i++){const A=st[i],B=st[i+1];if(Math.abs(x-A.x)>A.w+e+4||Math.abs(z-A.z)>A.w+e+4)continue;if(segDist(x,z,[A.x,A.z],[B.x,B.z])<Math.max(A.w,B.w)/2+e)return false}}}
 return true;
}
