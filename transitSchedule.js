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
 {id:'M1',name:'Maglev · Pobřežní okruh',mode:'Maglev',interval:30,start:0,dwell:3,platform:'01',stops:[{id:'valley',offset:0},{id:'haven',offset:7},{id:'nova',offset:17},{id:'valley',offset:25}]},
 {id:'A2',name:'Antigrav · Přístavní spoj',mode:'Antigrav',interval:20,start:5,platform:'02',stops:[{id:'valley',offset:0},{id:'spaceport',offset:8},{id:'valley',offset:16}]},
 {id:'O1',name:'Orbitální shuttle',mode:'Loď',interval:60,start:15,platform:'A',stops:[{id:'spaceport',offset:0},{id:'orion',offset:20},{id:'spaceport',offset:45}]},
 {id:'S4',name:'Lunární expres',mode:'Loď',interval:120,start:30,platform:'B',stops:[{id:'orion',offset:0},{id:'nyx',offset:35},{id:'orion',offset:80}]}
];
// The repeated final stop is an arrival/terminus, not a second departure.
export function departures(stopId,nowMinutes,horizon=180){
 if(!Number.isFinite(nowMinutes)||!STOPS[stopId])return [];
 const rows=[];for(const l of LINES){for(let i=0;i<l.stops.length-1;i++){
 const s=l.stops[i];if(s.id!==stopId)continue;const origin=l.start+s.offset+(i===0?0:(l.dwell||1)),first=Math.ceil((nowMinutes-origin-1e-9)/l.interval);
 for(let n=first;n*l.interval+origin<=nowMinutes+horizon;n++){const at=n*l.interval+origin;rows.push({line:l.id,mode:l.mode,at,wait:Math.max(0,at-nowMinutes),platform:l.platform,next:l.stops[i+1].id,destination:l.stops[l.stops.length-1].id,route:l.stops.slice(i+1).map(x=>x.id),service:serviceStatus(l.id,stopId)})}}}
 return rows.sort((a,b)=>a.at-b.at||a.line.localeCompare(b.line));
}
export function formatClock(minutes){const m=((Math.floor(minutes)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
export function arrivals(stopId,nowMinutes,horizon=180){const rows=[];if(!Number.isFinite(nowMinutes)||!STOPS[stopId])return rows;for(const l of LINES)for(let i=1;i<l.stops.length;i++){const s=l.stops[i];if(s.id!==stopId)continue;const origin=l.start+s.offset;for(let n=Math.ceil((nowMinutes-origin-1e-9)/l.interval);n*l.interval+origin<=nowMinutes+horizon;n++)rows.push({line:l.id,at:n*l.interval+origin,from:l.stops[i-1].id,platform:l.platform,service:serviceStatus(l.id,stopId)})}return rows.sort((a,b)=>a.at-b.at||a.line.localeCompare(b.line))}

// Intermediate stops have configured dwell (M1: three minutes; default: one). Terminus layovers last until
// the next interval; each line has one continuously simulated vehicle.
export function serviceStatus(line,stop){return line==='M1'&&['valley','haven'].includes(stop)?'passenger':line==='A2'&&stop==='valley'?'demo':'planned'}
export function vehicleState(lineId,minute){
 const l=LINES.find(x=>x.id===lineId);if(!l||!Number.isFinite(minute))return null;
 const cycle=Math.floor((minute-l.start)/l.interval),origin=l.start+cycle*l.interval,phase=minute-origin;
 const last=l.stops[l.stops.length-1];
 if(phase>=last.offset)return {line:l.id,trip:cycle,phase,status:'layover',stop:last.id,next:l.stops[1].id,departure:origin+l.interval,arrival:origin+last.offset,progress:0};
 for(let i=0;i<l.stops.length-1;i++){const a=l.stops[i],b=l.stops[i+1],leave=a.offset+(i?(l.dwell||1):0);
 if(phase<leave)return {line:l.id,trip:cycle,phase,status:'docked',stop:a.id,next:b.id,departure:origin+leave,arrival:origin+a.offset,progress:0};
 if(phase<b.offset)return {line:l.id,trip:cycle,phase,status:'moving',from:a.id,next:b.id,departure:origin+leave,arrival:origin+b.offset,progress:(phase-leave)/(b.offset-leave)};
 }return null;
}
// Local scene representation: approach, dwell, depart. The vehicle continues
// to exist in the timetable when the player is in another region.
export function localVehicle(lineId,stopId,minute,window=1.6){
 const v=vehicleState(lineId,minute);if(!v)return null;
 if(v.stop===stopId)return {...v,local:'docked',distance:0};
 if(v.status==='moving'&&v.from===stopId&&minute-v.departure<window)return {...v,local:'departing',distance:Math.max(0,(minute-v.departure)/window)};
 if(v.status==='moving'&&v.next===stopId&&v.arrival-minute<=window)return {...v,local:'approaching',distance:Math.max(0,(v.arrival-minute)/window)};
 return null;
}
