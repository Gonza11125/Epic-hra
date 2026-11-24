// Independent of the historical settlement saves. Save the global pose after landing.
const key='nexus-elyra-explorer-v1';
function vector(v){return Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)&&Math.abs(Math.hypot(...v)-1)<1e-4}
export function readExplorer(storage){
  try {
    const s=JSON.parse(storage.getItem(key));
    if(s?.version!==1||!vector(s.position)||!vector(s.tangent)||Math.abs(s.position.reduce((a,x,i)=>a+x*s.tangent[i],0))>.0001||
       !Number.isFinite(s.pitch)||Math.abs(s.pitch)>85||typeof s.third!=='boolean')return null;
    return s;
  }catch{return null}
}
export function writeExplorer(storage,position,tangent,pitch,third){
  try{storage.setItem(key,JSON.stringify({version:1,position,tangent,pitch,third}));return true}catch{return false}
}
