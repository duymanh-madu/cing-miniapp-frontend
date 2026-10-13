import {samplePresence} from './plazaPresenceMotionV2.js';
// Learn moving-packet gaps only when new immutable samples arrive. Playback
// never rewinds or predicts beyond accepted coordinates; normal delay is 120ms.
export function createPlazaPresenceClockV19(){let presence=null,seat=null,delay=120,target=null,seenSamples=null;
 return {get delay(){return delay;},sample(samples,now){
  if(!samples.length)return null;const latest=samples.at(-1),nextSeat=latest.value.seatId||null;
  if(latest.value.presenceId!==presence||nextSeat!==seat){presence=latest.value.presenceId;seat=nextSeat;delay=120;target=null;seenSamples=null;}
  if(samples!==seenSamples){seenSamples=samples;
   for(let i=1;i<samples.length;i++)if(samples[i-1].value.motion==='walk'&&samples[i].value.motion==='walk'){
    const gap=samples[i].time-samples[i-1].time;if(gap>0&&gap<=500)delay=Math.max(delay,Math.min(240,gap+20));
   }
  }
  target=Math.min(latest.time,Math.max(target??-Infinity,now-delay));
  return samplePresence(samples,target+delay,delay);
 }};
}
