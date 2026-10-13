export const QA_BASELINE='9a5f64fe08a8ebbd996fcea90c31ee1987d9228b';
export function createPlazaF10Recorder({limit=900,clock=()=>performance.now()}={}) {
 const start=clock();let samples=[];const markers=[];
 return {
  record(type,data={}){samples.push({elapsedMs:Math.round(clock()-start),type,data});if(samples.length>limit)samples=samples.slice(-limit);},
  mark(label='visual-failure'){markers.push({elapsedMs:Math.round(clock()-start),label});},
  export(metadata={}){return {schema:'cing-plaza-qa-f12-v1',baseline:QA_BASELINE,scope:'render-with-simulated-presence-no-server',metadata,markers:markers.map(m=>({...m})),samples:samples.map(s=>({...s}))};},
 };
}
