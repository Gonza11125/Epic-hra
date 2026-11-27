// Návrh trasy toků v Údolí 07 z NEUPRAVENÉHO terénu (bez koryt): pramenný přítok sleduje nejstrmější spád,
// odtok z jezírka sleduje minimax cestu (priority-flood od koncového mokřadu). Výstup = řídicí body pro
// WATER_DESIGN ve valley-hydrology.js. Použití: node tools/valley-water-design.mjs
import * as GEO from '../elyra-geography.js?v=4';
const {surfaceSample,valleyDirection,valleyManifest}=GEO,valleyUncarvedHeight=GEO.valleyUncarvedHeight;
const base=valleyManifest().baseElevationMeters;
const H=valleyUncarvedHeight||((x,z)=>surfaceSample(valleyDirection(x,z)).surfaceElevationKm*1000-base);
const round=p=>p.map(([x,z])=>[+x.toFixed(1),+z.toFixed(1)]);
function resample(pts,step){const out=[pts[0]];let carry=0;for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i],L=Math.hypot(c-a,d-b);let t=step-carry;while(t<=L){out.push([a+(c-a)*t/L,b+(d-b)*t/L]);t+=step}carry=L-(t-step)}const last=pts[pts.length-1],q=out[out.length-1];if(Math.hypot(last[0]-q[0],last[1]-q[1])>step*.4)out.push(last);return out}
function chaikin(pts,n){for(let k=0;k<n;k++){const o=[pts[0]];for(let i=0;i<pts.length-1;i++){const [a,b]=pts[i],[c,d]=pts[i+1];o.push([.75*a+.25*c,.75*b+.25*d],[.25*a+.75*c,.25*b+.75*d])}o.push(pts[pts.length-1]);pts=o}return pts}
// 1) Pramenný přítok: gradientní sestup z pramene do jezírka (hladina 50 m).
function descend(x,z,stopLevel){const p=[[x,z]];for(let i=0;i<600;i++){const e=1.5,gx=(H(x+e,z)-H(x-e,z))/(2*e),gz=(H(x,z+e)-H(x,z-e))/(2*e),g=Math.hypot(gx,gz);if(g<.005)break;x-=gx/g*2;z-=gz/g*2;p.push([x,z]);if(H(x,z)<stopLevel-1.5)break}return p}
const inflow=round(resample(descend(850,1000,50),8));
// 2) Odtok: priority-flood ze dna koncového mokřadu, sledování ukazatelů z nitra jezírka.
const S=4,x0=-300,x1=900,z0=600,z1=1900,nx=(x1-x0)/S+1,nz=(z1-z0)/S+1,N=nx*nz,G=new Float64Array(N);
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)G[j*nx+i]=H(x0+i*S,z0+j*S);
const idx=(x,z)=>Math.round((z-z0)/S)*nx+Math.round((x-x0)/S),from=new Int32Array(N).fill(-1),done=new Uint8Array(N),heap=[];
const push=(k,h)=>{heap.push([h,k]);let c=heap.length-1;while(c>0){const p=(c-1)>>1;if(heap[p][0]<=heap[c][0])break;[heap[p],heap[c]]=[heap[c],heap[p]];c=p}};
const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let c=0;for(;;){let l=2*c+1,r=l+1,m=c;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===c)break;[heap[m],heap[c]]=[heap[c],heap[m]];c=m}}return top};
const sink=idx(-84,1804);done[sink]=1;push(sink,G[sink]);
while(heap.length){const [h,k]=pop();const i=k%nx,j=(k-i)/nx;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const q=jj*nx+ii;if(done[q])continue;done[q]=1;from[q]=k;push(q,Math.max(G[q],h)+1e-4*Math.hypot(a,b))}}
let k=idx(560,872);const raw=[];while(k>=0){const i=k%nx,j=(k-i)/nx;raw.push([x0+i*S,z0+j*S]);k=from[k]}
// Vyhlazení schodů mřížky D8 a mírné meandry jen na plochém dně (sklon < 1,2 %), deterministicky podle staničení.
const smooth=resample(chaikin(resample(raw,20),3),4);let s=0;const meander=smooth.map((p,i)=>{if(i)s+=Math.hypot(p[0]-smooth[i-1][0],p[1]-smooth[i-1][1]);const a=smooth[Math.max(0,i-3)],b=smooth[Math.min(smooth.length-1,i+3)],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1,slope=Math.abs(H(a[0],a[1])-H(b[0],b[1]))/l,flat=Math.max(0,Math.min(1,(.012-slope)/.006)),edge=Math.min(1,s/60,(smooth.length-1-i)*4/60),o=5*flat*edge*Math.sin(s/15);return [p[0]-tz/l*o,p[1]+tx/l*o]});
const outflow=round(resample(chaikin(resample(meander,8),1),8));
console.log(JSON.stringify({inflow,outflow}));
console.error('inflow',inflow.length,'bodu; odtok',outflow.length,'bodu');
