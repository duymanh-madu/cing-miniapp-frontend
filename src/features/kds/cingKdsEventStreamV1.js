// Authenticated streaming fetch: bearer stays in a header, never URL/local storage.
export async function consumeKdsEventsV1({url,headers,signal,onSnapshot,onOffline,fetchFn=fetch,
  wait=(ms,signal)=>new Promise(resolve=>{const done=()=>{clearTimeout(timer);signal.removeEventListener("abort",done);resolve();};const timer=setTimeout(done,ms);signal.addEventListener("abort",done,{once:true});})}){
  let failures=0;
  while(!signal.aborted){
    const request=new AbortController();
    const abort=()=>request.abort();signal.addEventListener("abort",abort,{once:true});
    let watchdog=setTimeout(abort,45000),reader;
    const healthy=()=>{clearTimeout(watchdog);watchdog=setTimeout(abort,45000);};
    try{
      const response=await fetchFn(url(),{headers,signal:request.signal,cache:"no-store"});
      if(!response.ok){let code="KDS_STREAM_UNAVAILABLE";try{const result=await response.json();if(/^KDS_OPS_[A-Z_]+$/.test(result.code||""))code=result.code;}catch{}throw Object.assign(Error(code),{code});}
      if(!response.headers.get("content-type")?.includes("text/event-stream"))throw Error("KDS_STREAM_UNAVAILABLE");
      reader=response.body.getReader();let buffer="";const decoder=new TextDecoder();
      while(!signal.aborted){const {done,value}=await reader.read();if(done)throw Error("KDS_STREAM_CLOSED");
        buffer+=decoder.decode(value,{stream:true}).replace(/\r/g,"");
        if(buffer.length>8*1024*1024)throw Error("KDS_STREAM_LIMIT");
        let end;
        while((end=buffer.indexOf("\n\n"))>=0){const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);
          const event=/^event: (.+)$/m.exec(frame)?.[1];const raw=frame.split("\n").filter(x=>x.startsWith("data: ")).map(x=>x.slice(6)).join("\n");
          if(event==="snapshot"){await onSnapshot(JSON.parse(raw));failures=0;healthy();}
          else if(event==="heartbeat"){failures=0;healthy();}
          else if(event==="hold")throw Object.assign(Error("KDS_STREAM_HOLD"),{code:JSON.parse(raw).code});
        }
      }
    }catch(error){if(!signal.aborted)onOffline({code:error?.code||"KDS_STREAM_TRANSPORT"});}
    finally{clearTimeout(watchdog);signal.removeEventListener("abort",abort);request.abort();try{await reader?.cancel();}catch{}}
    if(!signal.aborted)await wait(Math.min(15000,1000*2**Math.min(failures++,4)),signal);
  }
}
