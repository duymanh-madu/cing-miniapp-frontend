function record(list,value){if(Number.isFinite(value)&&value>=0){list.push(value);if(list.length>180)list.shift();}}
function summary(list){if(!list.length)return null;const sorted=[...list].sort((a,b)=>a-b);return {samples:list.length,medianMs:sorted[Math.floor(sorted.length/2)],p95Ms:sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)]};}
export function createPlazaFrameProfiler(gl,clock=()=>performance.now()){
 const ext=gl.getExtension?.('EXT_disjoint_timer_query_webgl2'),cpu=[],render=[],gpu=[],interval=[],pending=[];let active=null,start=0,renderStart=0,last=null,frame=0,status=ext?'warming':'unsupported';
 function poll(){if(!ext)return;if(gl.getParameter(ext.GPU_DISJOINT_EXT)){for(const q of pending)gl.deleteQuery(q);pending.length=0;gpu.length=0;status='disjoint';return;}
  while(pending.length&&gl.getQueryParameter(pending[0],gl.QUERY_RESULT_AVAILABLE)){const q=pending.shift();record(gpu,gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);gl.deleteQuery(q);status='available';}}
 return {beginFrame(t){start=clock();if(last!==null&&t-last<1000)record(interval,t-last);last=t;poll();},
 beginRender(){renderStart=clock();if(ext&&++frame%15===0&&pending.length<3){active=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,active);}},
 endRender(){if(active){gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(active);active=null;}record(render,clock()-renderStart);},
 endFrame(){record(cpu,clock()-start);},reset(){cpu.length=render.length=gpu.length=interval.length=0;last=null;for(const q of pending)gl.deleteQuery(q);pending.length=0;frame=0;status=ext?'warming':'unsupported';},snapshot(){return {cpuFrame:summary(cpu),cpuRenderSubmission:summary(render),frameInterval:summary(interval),gpuRender:summary(gpu),gpuTimerStatus:status};},
 dispose(){if(active){gl.endQuery(ext.TIME_ELAPSED_EXT);gl.deleteQuery(active);active=null;}for(const q of pending)gl.deleteQuery(q);pending.length=0;},};
}
