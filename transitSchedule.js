// Deterministic public transit timetable, independent of renderer.
// All times are in the existing 24-hour local game clock.
export const STOPS={
 valley:{name:'Údolí 07',kind:'surface',region:'frontier'},
 haven:{name:'Haven',kind:'surface',region:'haven'},
 nova:{name:'Nova Aster',kind:'surface',region:'capital'},
 spaceport:{name:'Elyra Spaceport',kind:'surface'},
 orion:{name:'Orion',kind:'orbit'},
 nyx:{name:'Nyx',kind:'moon'}
};
export const LINES=[
 {id:'M1',name:'Maglev · Pobřežní okruh',mode:'Maglev',interval:30,start:0,platform:'01',stops:[{id:'valley',offset:0},{id:'haven',offset:7},{id:'nova',offset:17},{id:'valley',offset:25}]},
 {id:'A2',name:'Antigrav · Přístavní spoj',mode:'Antigrav',interval:20,start:5,platform:'02',stops:[{id:'valley',offset:0},{id:'spaceport',offset:8},{id:'valley',offset:16}]},
 {id:'O1',name:'Orbitální shuttle',mode:'Loď',interval:60,start:15,platform:'A',stops:[{id:'spaceport',offset:0},{id:'orion',offset:20},{id:'spaceport',offset:45}]},
 {id:'S4',name:'Lunární expres',mode:'Loď',interval:120,start:30,platform:'B',stops:[{id:'orion',offset:0},{id:'nyx',offset:35},{id:'orion',offset:80}]}
];
// The repeated final stop is an arrival/terminus, not a second departure.
export function departures(stopId,nowMinutes,horizon=180){
 if(!Number.isFinite(nowMinutes)||!STOPS[stopId])return [];
 const rows=[];for(const l of LINES){for(let i=0;i<l.stops.length-1;i++){
 const s=l.stops[i];if(s.id!==stopId)continue;const origin=l.start+s.offset,first=Math.ceil((nowMinutes-origin-1e-9)/l.interval);
 for(let n=first;n*l.interval+origin<=nowMinutes+horizon;n++){const at=n*l.interval+origin;rows.push({line:l.id,mode:l.mode,at,wait:Math.max(0,at-nowMinutes),platform:l.platform,next:l.stops[i+1].id,destination:l.stops[l.stops.length-1].id,route:l.stops.slice(i+1).map(x=>x.id),service:'planned'})}}}
 return rows.sort((a,b)=>a.at-b.at||a.line.localeCompare(b.line));
}
export function formatClock(minutes){const m=((Math.floor(minutes)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
export function arrivals(stopId,nowMinutes,horizon=180){const rows=[];if(!Number.isFinite(nowMinutes)||!STOPS[stopId])return rows;for(const l of LINES)for(let i=1;i<l.stops.length;i++){const s=l.stops[i];if(s.id!==stopId)continue;const origin=l.start+s.offset;for(let n=Math.ceil((nowMinutes-origin-1e-9)/l.interval);n*l.interval+origin<=nowMinutes+horizon;n++)rows.push({line:l.id,at:n*l.interval+origin,from:l.stops[i-1].id,platform:l.platform,service:'planned'})}return rows.sort((a,b)=>a.at-b.at||a.line.localeCompare(b.line))}
