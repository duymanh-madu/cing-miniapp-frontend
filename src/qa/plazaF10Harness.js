import {createPlazaSceneV1} from '../features/plaza/scene/createPlazaSceneV1.js';
import {createPlazaF10Recorder} from './plazaF10Recorder.js';
const recorder=createPlazaF10Recorder(),host=document.querySelector('#scene'),readout=document.querySelector('#readout'),status=document.querySelector('#status');
let instance=null,generation=0,lastInput={x:0,z:0};
const metadata={createdAt:new Date().toISOString(),userAgent:navigator.userAgent,devicePixelRatio:window.devicePixelRatio,screen:{width:screen.width,height:screen.height},viewport:{width:innerWidth,height:innerHeight},pageVisibility:document.visibilityState};
function event(type,data){recorder.record(type,data);}
function resetInput(){lastInput={x:0,z:0};instance?.setInput(lastInput);instance?.stop();document.querySelector('#knob').style.transform='';}
async function open(){
 const mine=++generation;resetInput();instance?.dispose();const character=document.querySelector('#character').value,density=document.querySelector('#density').value,profile=document.querySelector('#profile').value;
 event('scene-open',{character,density,profile});
 instance=createPlazaSceneV1(host,{character,qaRenderProfile:profile,qaFixedPixelRatio:density==='fixed'?2:Number(density),
  onProgress:value=>{if(mine!==generation)return;event('progress',value);readout.textContent=value.error||value.text||(value.ready?'Cảnh đã sẵn sàng':'Đang mở cảnh');},
  onStats:value=>{if(mine!==generation)return;const state=instance?.getQAState();event('frame',{...value,diagnostics:state});readout.textContent=`FPS ${value.fps??'…'} • DPR ${value.dpr??'…'} • MSAA ${state?.samples??'…'}\n${value.motion??'idle'} • WebGL ${state?.contextLost?'mất':'hoạt động'} • bone lỗi ${state?.nonFiniteBoneValues??'…'} • Remote ${value.remoteAvatars??0}`;},
  onQAEvent:(type,data)=>event(type,{...data,sceneGeneration:mine,profile}),
 });
 try{await instance.ready;if(mine===generation)event('scene-ready',instance.getQAState());}catch(error){event('load-error',{name:error.name,message:error.message});}
}
const stick=document.querySelector('#joystick');let pointer=null;
function input(e){const rect=stick.getBoundingClientRect();let x=(e.clientX-rect.left-rect.width/2)/40,z=-(e.clientY-rect.top-rect.height/2)/40;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}lastInput={x,z};instance?.setInput(lastInput);document.querySelector('#knob').style.transform=`translate(${x*30}px,${-z*30}px)`;}
stick.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;stick.setPointerCapture(pointer);input(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)input(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,e=>{if(e.pointerId===pointer){pointer=null;resetInput();}});
document.querySelector('#restart').onclick=open;for(const id of ['character','density','peers','profile'])document.querySelector('#'+id).onchange=open;
document.querySelector('#mark').onclick=()=>{recorder.mark();const diagnostics=instance?.getQAState(),gpuProbe=instance?.probeQAAvatarPixels();event('failure-mark',{input:lastInput,diagnostics,gpuProbe});status.textContent=gpuProbe?.error?'Đã đánh dấu • phép đo GPU chưa khả dụng':'Đã đánh dấu • pixel nhân vật: '+gpuProbe?.passes.map(p=>`${p.mode}/${p.samples}: ${p.pixels}`).join(', ');};
document.querySelector('#download').onclick=()=>{const blob=new Blob([JSON.stringify(recorder.export(metadata),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`cing-plaza-f15-${Date.now()}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Đã tạo báo cáo';};
for(const name of ['pageshow','pagehide','online','offline','focus','blur','resize'])window.addEventListener(name,()=>{event(name,{hidden:document.hidden,online:navigator.onLine,width:innerWidth,height:innerHeight});if(name==='blur'||name==='pagehide')resetInput();});
document.addEventListener('visibilitychange',()=>{event('visibilitychange',{hidden:document.hidden});if(document.hidden)resetInput();});
window.addEventListener('error',e=>event('window-error',{message:e.message}));window.addEventListener('unhandledrejection',e=>event('unhandled-rejection',{message:String(e.reason?.message||e.reason)}));
let seq=0;
setInterval(()=>{
 if(document.hidden)return;const count=Number(document.querySelector('#peers').value),seconds=performance.now()/1000;
 const members=Array.from({length:count},(_,i)=>({memberId:`qa-peer-${i}`,presenceId:`qa-session-${i}`,seq:++seq,character:i%2?'boy':'girl',x:3+Math.sin(seconds*.45+i)*2,z:-2+Math.cos(seconds*.45+i)*2,y:.04,heading:Math.atan2(Math.cos(seconds*.45+i),-Math.sin(seconds*.45+i)),motion:'walk',speed:.9,phase:seconds%1,gesture:0,displayName:`QA ${i+1}`,seatId:null}));
 instance?.setMembers(members,'qa-local');
},100);
open();

let sweepTimer=null;
document.querySelector('#sweep').onclick=()=>{
 clearInterval(sweepTimer);resetInput();const mine=generation;let step=0;
 const poses=[5.8,20,42].flatMap(radius=>Array.from({length:12},(_,i)=>({yaw:i*Math.PI/6,pitch:radius===5.8?1.15:.85,radius})));
 event('camera-sweep-start',{profile:document.querySelector('#profile').value,poses});
 sweepTimer=setInterval(()=>{if(mine!==generation||step>=poses.length){clearInterval(sweepTimer);event('camera-sweep-end',{step});return;}if(document.hidden)return;const p=poses[step++];instance?.setQAOrbit(p.yaw,p.pitch,p.radius);event('camera-sweep-pose',p);},800);
};

let comparisonToken=0;
document.querySelector('#cancelCompare').onclick=()=>{comparisonToken++;status.textContent='Đã dừng so sánh';};
document.querySelector('#compare').onclick=async()=>{
 const token=++comparisonToken;clearInterval(sweepTimer);resetInput();
 const selectors=['character','density','peers','profile','restart','sweep','compare'];selectors.forEach(id=>document.querySelector('#'+id).disabled=true);
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const profiles=['control','skeleton','morph','matrices','layers'];
 const poses=[5.8,20,42].flatMap(radius=>Array.from({length:4},(_,i)=>({yaw:i*Math.PI/2,pitch:radius===5.8?1.15:.85,radius})));
 event('comparison-start',{profiles,poses,scope:'local-avatar-no-server-fixed-cameras'});
 try{
  document.querySelector('#peers').value='0';
  for(const profile of profiles){
   if(token!==comparisonToken||document.hidden)throw new Error('COMPARISON_STOPPED');
   document.querySelector('#profile').value=profile;status.textContent='Đang so sánh: '+profile;await open();
   const mine=generation;if(!instance?.getQAState().loaded)throw new Error('SCENE_NOT_READY');
   event('comparison-profile-start',{profile});
   for(const pose of poses){
    if(token!==comparisonToken||mine!==generation||document.hidden)throw new Error('COMPARISON_STOPPED');
    instance.setQAOrbit(pose.yaw,pose.pitch,pose.radius);event('comparison-pose',{profile,...pose});await pause(1500);
   }
   // One probe after performance samples; readback cost is excluded from steady frames.
   instance.setQAOrbit(poses.at(-1).yaw,poses.at(-1).pitch,poses.at(-1).radius);
   event('comparison-profile-end',{profile,diagnostics:instance.getQAState(),gpuProbe:instance.probeQAAvatarPixels()});
  }
  status.textContent='So sánh hoàn tất • hãy lưu báo cáo';event('comparison-complete',{});
 }catch(error){event('comparison-stopped',{reason:error.message});status.textContent='So sánh đã dừng • có thể lưu báo cáo';}
 finally{selectors.forEach(id=>document.querySelector('#'+id).disabled=false);}
};
