// NEXUS universe: stable IDs, deterministic data, no rendering dependency.
import {validateRide} from './passenger.js?v=01365';
export const VERSION=4;
export const UNIVERSE={id:'nexus',galaxies:[{id:'aurelia',name:'Aurelia',systems:[{id:'solaris',name:'Solaris',star:'G2V',bodies:[
{id:'elyra',name:'Elyra',type:'planet',kind:'Obyvatelná planeta',radiusKm:6310,gravity:0.96,dayHours:27,climate:'Mírné pásmo',color:'#74a99d',orbit:1,regions:[{id:'frontier',name:'Údolí 07',kind:'Pohraniční osada',playable:true,seed:61201},{id:'haven',name:'Pobřeží Haven',kind:'Přírodní rezervace',playable:true,seed:74121},{id:'capital',name:'Nova Aster',kind:'Hlavní město',playable:false,seed:8172}]},
{id:'nyx',name:'Nyx',type:'moon',parent:'elyra',kind:'Ledový měsíc',radiusKm:1720,gravity:.18,dayHours:54,color:'#aabfdb',orbit:1.17,regions:[]},
{id:'vesta',name:'Vesta',type:'planet',kind:'Pouštní planeta',radiusKm:4900,gravity:.71,dayHours:31,color:'#c99464',orbit:1.8,regions:[]},
{id:'orion',name:'Orion',type:'station',kind:'Orbitální stanice',color:'#e4d5ad',orbit:1.3,regions:[]}
]}]}]};
export const regionIds=['frontier','haven'];
export const regionInfo=id=>UNIVERSE.galaxies[0].systems[0].bodies[0].regions.find(r=>r.id===id);
export const spawn=id=>id==='haven'?{x:0,z:25,yaw:0,pitch:0}:{x:4,z:23,yaw:0,pitch:0};
export function freshState(){return {schema:VERSION,region:'frontier',stage:0,...spawn('frontier'),time:8.3,logs:[],elapsed:0,visited:['frontier'],survey:[],ride:null,positions:{},identity:{id:'player-1',name:'Cestovatel'},civilizations:{elyra:'elyran-union'}}}
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function position(s,id){const d=spawn(id);return {x:Number.isFinite(s?.x)?clamp(s.x,-96,96):d.x,z:Number.isFinite(s?.z)?clamp(s.z,-96,96):d.z,yaw:Number.isFinite(s?.yaw)?s.yaw:d.yaw,pitch:Number.isFinite(s?.pitch)?clamp(s.pitch,-1.4,1.4):d.pitch}}
const unique=(a,valid)=>Array.isArray(a)?[...new Set(a.filter(valid))]:[];
export function migrate(s){if(!s||typeof s!=='object'||!Number.isInteger(s.stage)||s.stage<0||s.stage>5)return null;if(s.schema>VERSION)return null;const base=freshState(),region=regionIds.includes(s.region)?s.region:'frontier';return {...base,...position(s,region),region,stage:s.stage,ride:validateRide(s.ride),time:Number.isFinite(s.time)?((s.time%24)+24)%24:8.3,elapsed:Number.isFinite(s.elapsed)?Math.max(0,s.elapsed):0,logs:unique(s.logs,x=>Number.isInteger(x)&&x>=0&&x<4),survey:unique(s.survey,x=>['ridge','lake','relay'].includes(x)),visited:unique([...(Array.isArray(s.visited)?s.visited:[]),'frontier',region],x=>regionIds.includes(x)),positions:Object.fromEntries(regionIds.filter(id=>s.positions?.[id]).map(id=>[id,position(s.positions[id],id)])),identity:{id:'player-1',name:typeof s.identity?.name==='string'?s.identity.name.slice(0,40):'Cestovatel'}}}
export function readState(storage){for(const key of ['nexus-world-v4','nexus-world-v3','nexus-save-010']){try{const raw=storage.getItem(key);if(raw){const s=migrate(JSON.parse(raw));if(s)return s}}catch(e){}}return null}
export function writeState(storage,state){try{storage.setItem('nexus-world-v4',JSON.stringify(state));return true}catch(e){return false}}
export function travel(state,id){if(state.ride||!regionIds.includes(id)||id===state.region)return false;state.positions[state.region]=position(state,state.region);state.region=id;Object.assign(state,state.positions[id]||spawn(id));if(!state.visited.includes(id))state.visited.push(id);return true}
