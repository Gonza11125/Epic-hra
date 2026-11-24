// LUMEN R24 soundscape: procedural WebAudio (no audio files) + Czech station announcements.
// Levitation hum follows speed, door release / slide / warning / lock sounds follow the door cycle,
// announcements use a gong, on-screen subtitles and a Czech speech voice when the device has one.
import {platformSide,motionLevel} from './regionalTrain.js?v=01364';

export function createLumenAudio(getCtx){
 let built=null,voice=null,speechReady=false;
 const speech=typeof window!=='undefined'&&'speechSynthesis' in window?window.speechSynthesis:null;
 function pickVoice(){if(!speech)return;const list=speech.getVoices()||[];voice=list.find(v=>/^cs/i.test(v.lang))||null}
 if(speech){pickVoice();try{speech.addEventListener('voiceschanged',pickVoice)}catch(e){}}
 function build(ctx){
  if(built&&built.ctx===ctx)return built;
  const out=ctx.createGain();out.gain.value=.9;out.connect(ctx.destination);
  // cabin filter: inside the train the hum and air rush are muffled by the body
  const cabin=ctx.createBiquadFilter();cabin.type='lowpass';cabin.frequency.value=4200;cabin.Q.value=.4;const hum=ctx.createGain();hum.gain.value=0;hum.connect(cabin).connect(out);
  const low=ctx.createOscillator();low.type='sawtooth';low.frequency.value=48;const lowF=ctx.createBiquadFilter();lowF.type='lowpass';lowF.frequency.value=180;const lowG=ctx.createGain();lowG.gain.value=.5;low.connect(lowF).connect(lowG).connect(hum);
  const sub=ctx.createOscillator();sub.type='sine';sub.frequency.value=96;const subG=ctx.createGain();subG.gain.value=.35;sub.connect(subG).connect(hum);
  const whine=ctx.createOscillator();whine.type='triangle';whine.frequency.value=320;const whineF=ctx.createBiquadFilter();whineF.type='bandpass';whineF.frequency.value=320;whineF.Q.value=6;const whineG=ctx.createGain();whineG.gain.value=0;whine.connect(whineF).connect(whineG).connect(hum);
  const len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const air=ctx.createBufferSource();air.buffer=buf;air.loop=true;const airF=ctx.createBiquadFilter();airF.type='bandpass';airF.frequency.value=650;airF.Q.value=.7;const airG=ctx.createGain();airG.gain.value=0;air.connect(airF).connect(airG).connect(hum);
  for(const o of [low,sub,whine,air])o.start();
  built={ctx,out,cabin,hum,low,sub,whine,whineF,whineG,airF,airG,noise:buf};return built;
 }
 const now=()=>{const ctx=getCtx();return ctx?build(ctx):null};
 // level 0..1 (distance/presence), speed 0..1, inside = muffled cabin
 function setHum(level,speed=0,inside=false){const B=now();if(!B)return;const t=B.ctx.currentTime,s=Math.max(0,Math.min(1,speed)),l=Math.max(0,Math.min(1,level));
  B.hum.gain.setTargetAtTime(l*(.05+.05*s),t,.25);B.low.frequency.setTargetAtTime(46+s*34,t,.4);B.sub.frequency.setTargetAtTime(92+s*68,t,.4);
  B.whine.frequency.setTargetAtTime(300+s*1250,t,.5);B.whineF.frequency.setTargetAtTime(300+s*1250,t,.5);B.whineG.gain.setTargetAtTime(.05+s*.35,t,.4);
  B.airG.gain.setTargetAtTime(s*s*1.6,t,.5);B.airF.frequency.setTargetAtTime(500+s*900,t,.5);B.cabin.frequency.setTargetAtTime(inside?900:4200,t,.2)}
 function tone(freq,at,dur,gain,type='sine',slide=0){const B=now();if(!B||gain<=.001)return;const o=B.ctx.createOscillator(),g=B.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);if(slide)o.frequency.exponentialRampToValueAtTime(freq*slide,at+dur);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g).connect(B.out);o.start(at);o.stop(at+dur+.02)}
 function noise(at,dur,gain,from,to,q=1.2){const B=now();if(!B||gain<=.001)return;const s=B.ctx.createBufferSource(),f=B.ctx.createBiquadFilter(),g=B.ctx.createGain();s.buffer=B.noise;f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(from,at);f.frequency.exponentialRampToValueAtTime(to,at+dur);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+dur*.25);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.connect(f).connect(g).connect(B.out);s.start(at,Math.random());s.stop(at+dur+.02)}
 const at=()=>{const B=now();return B?B.ctx.currentTime+.01:0};
 // magnetic latch click + two-tone "doors released" signal
 function doorRelease(gain=1){const t=at();if(!t)return;noise(t,.06,.25*gain,2400,1800,3);tone(784,t+.06,.26,.12*gain);tone(988,t+.24,.4,.12*gain)}
 function doorSlide(gain=1,closing=false){const t=at();if(!t)return;noise(t,.7,.14*gain,closing?1300:420,closing?420:1300,.9);tone(closing?160:120,t,.6,.04*gain,'triangle',closing?.7:1.4)}
 // fast alternating warning tones before the doors close (EN 14752 style)
 function doorWarning(gain=1){const t=at();if(!t)return;for(let i=0;i<6;i++)tone(i%2?880:1175,t+i*.16,.13,.1*gain,'square')}
 function doorLocked(gain=1){const t=at();if(!t)return;tone(95,t,.28,.18*gain,'sine',.6);noise(t,.08,.3*gain,900,300,2)}
 function gong(gain=1){const t=at();if(!t)return;[[784,0],[1046.5,.32],[1318.5,.64]].forEach(([f,o])=>{tone(f,t+o,1.1,.11*gain);tone(f*2.01,t+o,.5,.025*gain)})}
 function speak(text){if(!speech||!voice||!getCtx())return false;try{speech.cancel();const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang;u.rate=.98;u.pitch=1.02;u.volume=.9;speech.speak(u);return true}catch(e){return false}}
 // iOS only allows speech after a user gesture: call from the first tap / key press.
 function unlock(){if(speechReady||!speech)return;speechReady=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speech.speak(u)}catch(e){}}
 function announce(text,{gain=1,onSubtitle}={}){if(!getCtx())return false;gong(gain);onSubtitle?.(text);if(gain>.35)setTimeout(()=>speak(text),1250);return true}
 function silence(){const B=built;if(B)B.hum.gain.setTargetAtTime(0,B.ctx.currentTime,.1);try{speech?.cancel()}catch(e){}}
 return {setHum,doorRelease,doorSlide,doorWarning,doorLocked,gong,announce,unlock,silence,hasVoice:()=>!!voice};
}

// Pure announcement texts (testable without audio).
const SIDE={'-1':'vlevo','1':'vpravo'};
export function announcementFor(kind,{line,stop,next,stops,platform,welcome}){
 const name=id=>stops?.[id]?.name||'—';
 if(kind==='departure')return (welcome?'Vítejte ve vlaku LUMEN linky '+line+'. ':'')+'Příští zastávka: '+name(next)+'.'+(next==='nova'?' Stanice zatím není otevřena pro výstup.':'');
 if(kind==='arrival'){if(next==='nova')return 'Nova Aster. Stanice zatím není otevřena pro výstup, pokračujte prosím dál.';return name(next)+'. Výstup '+SIDE[String(platformSide(line,next))]+' ve směru jízdy.'}
 if(kind==='platform')return 'Vlak linky '+line+' směr '+name(next)+' přijíždí k nástupišti '+platform+'. Pozor při příjezdu vlaku.';
 return '';
}

// Where an arriving train continues after this stop (circular lines restart after the terminus).
export function nextAfter(schedule,lineId,stop){const l=schedule.LINES.find(x=>x.id===lineId);if(!l)return null;const st=l.stops;for(let i=1;i<st.length;i++)if(st[i].id===stop)return i===st.length-1?st[1].id:st[i+1].id;return null}

// Connects the timetable/door state of all LUMEN trains to the audio engine.
export function createTransitSoundscape(audio,{schedule,notify}){
 const lastPhase=new WeakMap(),said=new Set();let welcomed=null,quiet=0;
 const STOP_REGION={valley:'frontier',haven:'haven'};
 const platformOf=line=>schedule.LINES.find(l=>l.id===line)?.platform||'';
 function once(key,text,gain){if(said.has(key))return;said.add(key);if(said.size>80)said.delete(said.values().next().value);if(audio.announce(text,{gain,onSubtitle:gain>.35?s=>notify?.('Hlášení: '+s):null}))quiet=2.2}
 function update(dt,{entries,region,x,z,ride,minute,active}){
  if(!active){audio.setHum(0,0,false);return}
  quiet=Math.max(0,quiet-dt);
  let humLevel=0,humSpeed=0,inside=false;
  // trains visible in the player's region (or the one the player rides in)
  for(const e of entries){
   if(e.line==='A2'||!e.state||!e.model.group.visible)continue;
   const own=!!ride&&ride.line===e.line;if(!own&&STOP_REGION[e.stop]!==region)continue;
   let gain=1;if(!own){const p=e.model.group.position,dz=Math.max(0,Math.abs(z-p.z)-12),dist=Math.hypot(x-p.x,dz);gain=Math.pow(Math.max(0,1-dist/48),2)}
   if(ride&&!own)gain*=.35;
   const speed=e.state.local==='docked'?0:Math.min(1,.2+e.state.distance*1.2);
   if(gain*(.45+speed)>humLevel*(.45+humSpeed)){humLevel=gain;humSpeed=speed;inside=own}
   const ph=e.door?.phase||'closed',prev=lastPhase.get(e);lastPhase.set(e,ph);
   if(prev!==undefined&&prev!==ph&&gain>.02){
    if((ph==='released'||ph==='opening')&&prev==='closed'){audio.doorRelease(gain);audio.doorSlide(gain*.8)}
    else if(ph==='warning')audio.doorWarning(gain);
    else if(ph==='closing')audio.doorSlide(gain*.8,true);
    else if(ph==='closed'&&prev==='closing')audio.doorLocked(gain)}
   // platform announcement for an approaching train
   if(!ride&&e.state.local==='approaching'&&gain>.12&&quiet<=0)once('pl:'+e.line+':'+e.stop+':'+e.state.trip,announcementFor('platform',{line:e.line,next:nextAfter(schedule,e.line,e.stop),stops:schedule.STOPS,platform:platformOf(e.line)}),Math.min(1,gain*1.6))
  }
  // on board: announcements follow the vehicle state even between regions
  if(ride){const v=schedule.vehicleState(ride.line,minute);
   if(v){inside=true;if(v.status==='moving'){humLevel=1;humSpeed=Math.max(.15,motionLevel(v))}else if(!humLevel){humLevel=1;humSpeed=0}
    if(v.status==='moving'&&quiet<=0){const leg=ride.line+':'+v.trip+':'+v.next;
     if(minute-v.departure<1.2){const welcome=welcomed!==ride;welcomed=ride;once('dep:'+leg,announcementFor('departure',{line:ride.line,next:v.next,stops:schedule.STOPS,welcome}),1)}
     else if(v.arrival-minute<1.5)once('arr:'+leg,announcementFor('arrival',{line:ride.line,next:v.next,stops:schedule.STOPS}),1)}}
  }else welcomed=null;
  audio.setHum(humLevel,humSpeed,inside);
 }
 return {update};
}
