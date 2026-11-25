import {valleyLandscape,valleyDirection,surfaceSample,valleyManifest,VALLEY_ROUTES,VALLEY_POINTS} from './elyra-geography.js?v=3';
import {BASIN_POINTS,BASIN_APPROACH} from './northern-basin.js';
import {valleyWater} from './valley-waters.js';

export function installFieldMap(canvas,panel,toggle,areaControl) {
  const width=canvas.width,height=canvas.height,ctx=canvas.getContext('2d');
  const charts=new Map();
  const frames={valley:{x:0,z:0,w:2500,h:3500},north:{x:110,z:3150,w:2500,h:3500}};
  const datum=valleyManifest().baseElevationMeters;
  function project(x,z,frame){return [(x-frame.x)/frame.w*width+width/2,height/2-(z-frame.z)/frame.h*height]}
  function chart(area){
    if(charts.has(area))return charts.get(area);
    const frame=frames[area],base=document.createElement('canvas');base.width=width;base.height=height;
    const g=base.getContext('2d');
    for(let j=0;j<height;j+=3)for(let i=0;i<width;i+=3){
      const x=(i/width-.5)*frame.w+frame.x,z=(.5-j/height)*frame.h+frame.z;
      const h=area==='north'?surfaceSample(valleyDirection(x,z)).surfaceElevationKm*1000-datum:valleyLandscape(x,z).heightMeters;
      const t=Math.max(0,Math.min(1,h/520)),contour=Math.floor((h+3)/24)!==Math.floor(h/24)?9:0;
      g.fillStyle=(valleyWater(x,z)?.edge??-1)>0?'#4f9eae':`rgb(${68+t*112-contour},${99+t*80-contour},${83+t*90-contour})`;
      g.fillRect(i,j,3,3);
    }
    function path(points,color){
      g.strokeStyle=color;g.lineWidth=1.35;g.beginPath();
      points.forEach(([x,z],i)=>{const p=project(x,z,frame);if(i)g.lineTo(...p);else g.moveTo(...p)});g.stroke();
    }
    function pin(x,z,title){
      const [px,py]=project(x,z,frame);
      if(px<0||px>width||py<0||py>height)return;
      g.fillStyle='#f6ddaa';g.beginPath();g.arc(px,py,2.6,0,Math.PI*2);g.fill();
      g.font='bold 10px system-ui';g.lineWidth=2.8;g.strokeStyle='#32483d';
      const tx=Math.min(px+5,width-g.measureText(title).width-2),ty=Math.max(12,py-4);
      g.strokeText(title,tx,ty);g.fillText(title,tx,ty);
    }
    for(const route of VALLEY_ROUTES)path(route.points,'#dbc8a7');
    path(BASIN_APPROACH,'#f4c77b');
    if(area==='valley'){
      VALLEY_POINTS.forEach((p,i)=>pin(p.x,p.z,['Osada','Jih','Průchod','Vyhlídka','Rokle'][i]));
      const [px,py]=project(216,-178,frame);
      g.fillStyle='#91d4da';g.font='10px system-ui';g.fillText('Jezero',px+3,py+11);
    } else {
      pin(-35,1450,'K průchodu');
      BASIN_POINTS.forEach((p,i)=>pin(p.x,p.z,i?'Dno kotliny':'Sedlo'));
    }
    charts.set(area,base);return base;
  }
  let last={x:0,z:0};
  function draw(q=last){
    last=q;if(panel.hidden)return;
    const area=areaControl.value,frame=frames[area];ctx.drawImage(chart(area),0,0);
    const [x,y]=project(q.x,q.z,frame);
    if(x>=0&&x<width&&y>=0&&y<height){
      ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fillStyle='white';ctx.fill();
      ctx.strokeStyle='#183737';ctx.lineWidth=1;ctx.stroke();
    }
  }
  areaControl.onchange=()=>draw();
  toggle.onclick=()=>{panel.hidden=!panel.hidden;areaControl.value=last.z>1800?'north':'valley';draw()};
  return draw;
}
