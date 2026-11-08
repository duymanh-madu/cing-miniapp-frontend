// Bounded, presentation-only incident observations. No identity, token, chat or URLs.
const KEY='cing.plaza.room-trace.v24';
const EVENTS=new Set(['connect','disconnect','connect-error','recover-start','recover-ok','recover-error','room-enter','room-update','room-lost','peer-load-start','peer-load-ok','peer-load-error','render-error','context-lost','context-restored','page-hide','page-show']);
const REASONS=new Set(['ping timeout','transport close','transport error','io server disconnect','io client disconnect']);
export function safePlazaTraceV24(event,detail={}){
 if(!EVENTS.has(event))return null;
 const data={event};
 for(const key of ['count','before','after','ms','loaded'])if(Number.isSafeInteger(detail[key])&&detail[key]>=0&&detail[key]<=3600000)data[key]=detail[key];
 if(typeof detail.code==='string'&&/^PLAZA_[A-Z0-9_]{1,64}$/.test(detail.code))data.code=detail.code;
 if(REASONS.has(detail.reason))data.reason=detail.reason;
 if(['boy','girl'].includes(detail.character))data.character=detail.character;
 if(['TypeError','RangeError','ReferenceError','Error','AbortError'].includes(detail.error))data.error=detail.error;
 return data;
}
export function createPlazaRoomTraceV24({storage=null,now=Date.now}={}){
 let queue=[],sink=null,inflight=false,next=1;
 try{const saved=JSON.parse(storage?.getItem(KEY)||'[]');if(Array.isArray(saved))for(const item of saved.slice(-64)){const data=safePlazaTraceV24(item.event,item);if(data&&Number.isSafeInteger(item.at)&&Math.abs(now()-item.at)<3600000)queue.push({...data,at:item.at,id:next++});}}catch{}
 function persist(){try{storage?.setItem(KEY,JSON.stringify(queue));}catch{}}
 function flush(){if(!sink||inflight||!queue.length)return;inflight=true;const batch=queue.slice(0,12),ids=new Set(batch.map(e=>e.id));try{sink(batch.map(({id,...e})=>e),ok=>{inflight=false;if(ok){queue=queue.filter(e=>!ids.has(e.id));persist();}});}catch{inflight=false;}}
 return {record(event,detail){const data=safePlazaTraceV24(event,detail);if(!data)return;queue.push({...data,at:now(),id:next++});queue=queue.slice(-64);persist();flush();},setSink(value){sink=value;inflight=false;flush();},flush,pending:()=>queue.length};
}
const inert={record(){},setSink(){},flush(){},pending:()=>0};
let trace;
export function plazaRoomTraceV24(){if(typeof window==='undefined'||typeof document==='undefined')return inert;if(!trace){let storage;try{storage=globalThis.localStorage;}catch{}trace=createPlazaRoomTraceV24({storage});}return trace;}
