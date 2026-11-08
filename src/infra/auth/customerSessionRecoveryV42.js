// A bounded retry owner for late shell boot and transient cold-start failures.
// Only the existing backend-auth methods may create/restore a session.
export function createCustomerSessionRecoveryV42({open,restore,reconcile=()=>{},clearRejected=()=>{},resolved=()=>{},authenticated=()=>false,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let running=null,timer=null,tries=0,stopped=false,pending=false;
 const delays=[1500,4000,10000];
 function clear(){if(timer!==null)clearTimer(timer);timer=null;}
 function schedule(){clear();if(stopped||authenticated()||tries>=delays.length)return;const delay=delays[tries++];timer=setTimer(()=>{timer=null;void trigger(false);},delay);timer?.unref?.();}
 async function attempt(){
  let result=await open();if(stopped)return;
  if(result==='auth_rejected'){clearRejected();result='no_access_token';}
  if(result==='no_access_token'){
   await reconcile();if(stopped)return;
   const restored=await restore();if(stopped)return;
   if(restored)result=await open();
  }
  if(stopped)return;
  if(result==='authenticated'){clear();tries=0;resolved(result);return;}
  if(result==='no_access_token'||result==='auth_rejected')resolved(result);
  schedule();
 }
 function trigger(reset=true){
  if(stopped||authenticated())return Promise.resolve();
  if(reset){tries=0;clear();}
  if(running){pending=true;return running;}
  running=Promise.resolve().then(attempt).catch(()=>schedule()).finally(()=>{running=null;if(pending&&!stopped){pending=false;void trigger(false);}});
  return running;
 }
 return {trigger,stop(){stopped=true;clear();pending=false;}};
}
