import {createPlazaSceneV1} from '../features/plaza/scene/createPlazaSceneV1.js';
import {createPlazaF10Recorder} from './plazaF10Recorder.js';
const recorder=createPlazaF10Recorder(),host=document.querySelector('#scene'),readout=document.querySelector('#readout'),status=document.querySelector('#status');
let instance=null,generation=0,lastInput={x:0,z:0};
const metadata={createdAt:new Date().toISOString(),userAgent:navigator.userAgent,devicePixelRatio:window.devicePixelRatio,screen:{width:screen.width,height:screen.height},viewport:{width:innerWidth,height:innerHeight},pageVisibility:document.visibilityState};
function event(type,data){recorder.record(type,data);}
function resetInput(){lastInput={x:0,z:0};instance?.setInput(lastInput);instance?.stop();document.querySelector('#knob').style.transform='';}
async function open(){
 const mine=++generation;resetInput();instance?.dispose();const character=document.querySelector('#character').value,density=document.querySelector('#density').value;
 event('scene-open',{character,density});
 instance=createPlazaSceneV1(host,{character,qaFixedPixelRatio:density==='fixed'?2:Number(density),
  onProgress:value=>{if(mine!==generation)return;event('progress',value);readout.textContent=value.error||value.text||(value.ready?'Cảnh đã sẵn sàng':'Đang mở cảnh');},
  onStats:value=>{if(mine!==generation)return;const state=instance?.getQAState();event('frame',{...value,diagnostics:state});readout.textContent=`FPS ${value.fps??'…'} • DPR ${value.dpr??'…'} • MSAA ${state?.samples??'…'}\n${value.motion??'idle'} • WebGL ${state?.contextLost?'mất':'hoạt động'} • bone lỗi ${state?.nonFiniteBoneValues??'…'} • Remote ${value.remoteAvatars??0}`;},
  onQAEvent:(type,data)=>event(type,data),
 });
 try{await instance.ready;if(mine===generation)event('scene-ready',instance.getQAState());}catch(error){event('load-error',{name:error.name,message:error.message});}
}
const stick=document.querySelector('#joystick');let pointer=null;
function input(e){const rect=stick.getBoundingClientRect();let x=(e.clientX-rect.left-rect.width/2)/40,z=-(e.clientY-rect.top-rect.height/2)/40;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}lastInput={x,z};instance?.setInput(lastInput);document.querySelector('#knob').style.transform=`translate(${x*30}px,${-z*30}px)`;}
stick.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;stick.setPointerCapture(pointer);input(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)input(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,e=>{if(e.pointerId===pointer){pointer=null;resetInput();}});
document.querySelector('#restart').onclick=open;for(const id of ['character','density','peers'])document.querySelector('#'+id).onchange=open;
document.querySelector('#mark').onclick=()=>{recorder.mark();const diagnostics=instance?.getQAState(),gpuProbe=instance?.probeQAAvatarPixels();event('failure-mark',{input:lastInput,diagnostics,gpuProbe});status.textContent=gpuProbe?.error?'Đã đánh dấu • phép đo GPU chưa khả dụng':'Đã đánh dấu • pixel nhân vật: '+gpuProbe?.passes.map(p=>`${p.mode}/${p.samples}: ${p.pixels}`).join(', ');};
document.querySelector('#download').onclick=()=>{const blob=new Blob([JSON.stringify(recorder.export(metadata),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`cing-plaza-f14-${Date.now()}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Đã tạo báo cáo';};
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
