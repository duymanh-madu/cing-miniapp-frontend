export const QA_BASELINE='9a5f64fe08a8ebbd996fcea90c31ee1987d9228b';
export function createPlazaF10Recorder({limit=900,clock=()=>performance.now()}={}) {
 const start=clock();let samples=[];const markers=[],comparisonEvents=[];
 return {
  record(type,data={}){const entry={elapsedMs:Math.round(clock()-start),type,data};if(type.startsWith('comparison-')){comparisonEvents.push(entry);if(comparisonEvents.length>300)comparisonEvents.shift();return;}samples.push(entry);if(samples.length>limit)samples=samples.slice(-limit);},
  mark(label='visual-failure'){markers.push({elapsedMs:Math.round(clock()-start),label});},
  export(metadata={}){return {schema:'cing-plaza-qa-f17-v1',baseline:QA_BASELINE,scope:'render-with-simulated-presence-no-server',metadata,comparisonEvents:comparisonEvents.map(e=>({...e})),markers:markers.map(m=>({...m})),samples:samples.map(s=>({...s}))};},
 };
}
