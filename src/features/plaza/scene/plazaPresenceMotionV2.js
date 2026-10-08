// Receipt timestamps use the viewer's monotonic clock; no clock sync assumption.
export function addPresenceSample(samples, value, time) {
 const old=samples.at(-1);
 if(old&&old.value.presenceId===value.presenceId&&(old.value.seq>value.seq || (old.value.seq===value.seq && old.value.motion===value.motion && old.value.seatId===value.seatId)))return samples;
 if(old&&(old.value.presenceId!==value.presenceId || old.value.seatId!==value.seatId))samples=[];
 return [...samples,{time,value}].slice(-8);
}
export function samplePresence(samples,time,delay=120) {
 if(!samples.length)return null;
 const target=time-delay;
 let a=samples[0],b=a;
 for(let i=1;i<samples.length;i++){b=samples[i];if(b.time>=target)break;a=b;}
 if(a===b || b.time<=a.time)return {...b.value};
 const t=Math.max(0,Math.min(1,(target-a.time)/(b.time-a.time)));
 const turn=Math.atan2(Math.sin(b.value.heading-a.value.heading),Math.cos(b.value.heading-a.value.heading));
 return {...(t<.5?a.value:b.value),x:a.value.x+(b.value.x-a.value.x)*t,y:a.value.y+(b.value.y-a.value.y)*t,z:a.value.z+(b.value.z-a.value.z)*t,heading:a.value.heading+turn*t};
}
