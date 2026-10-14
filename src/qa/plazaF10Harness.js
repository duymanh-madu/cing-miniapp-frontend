import {createPlazaSceneV1} from '../features/plaza/scene/createPlazaSceneV1.js';
import {createPlazaF10Recorder} from './plazaF10Recorder.js';
const recorder=createPlazaF10Recorder(),host=document.querySelector('#scene'),readout=document.querySelector('#readout'),status=document.querySelector('#status');
const mobileGround=new URLSearchParams(location.search).get('ground')!=='original',mobileSceneBudget=new URLSearchParams(location.search).get('budget')!=='off';
let instance=null,generation=0,lastInput={x:0,z:0};
const metadata={mobileGround,mobileSceneBudget,createdAt:new Date().toISOString(),userAgent:navigator.userAgent,devicePixelRatio:window.devicePixelRatio,screen:{width:screen.width,height:screen.height},viewport:{width:innerWidth,height:innerHeight},pageVisibility:document.visibilityState};
function event(type,data){recorder.record(type,data);if((type==='comparison-complete'||type==='soak-complete')&&location.hostname==='127.0.0.1')fetch('http://127.0.0.1:5208/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(recorder.export(metadata))}).then(r=>{if(!r.ok)throw new Error('REPORT_SAVE_FAILED');status.textContent='So sánh hoàn tất • báo cáo đã lưu trên máy';}).catch(()=>{status.textContent='So sánh hoàn tất • hãy lưu báo cáo';});}
function resetInput(){lastInput={x:0,z:0};instance?.setInput(lastInput);instance?.stop();document.querySelector('#knob').style.transform='';}
async function open(){
 const mine=++generation;resetInput();instance?.dispose();const character=document.querySelector('#character').value,density=document.querySelector('#density').value,profile=document.querySelector('#profile').value;
 event('scene-open',{character,density,profile});
 instance=createPlazaSceneV1(host,{character,mobileGround,mobileSceneBudget,qaRenderProfile:'control',qaBudgetSwitchable:true,subpixelGroundDetail:['ground','combined'].includes(profile),filteredMaterialNoise:false,qaTransmissionScale:1,adaptiveRefraction:['refraction','combined'].includes(profile),qaFixedPixelRatio:density==='fixed'?2:Number(density),
  onProgress:value=>{if(mine!==generation)return;event('progress',value);readout.textContent=value.error||value.text||(value.ready?'Cảnh đã sẵn sàng':'Đang mở cảnh');},
  onStats:value=>{if(mine!==generation)return;const state=instance?.getQAState();event('frame',{...value,diagnostics:state});readout.textContent=`FPS ${value.fps??'…'} • DPR ${value.dpr??'…'} • MSAA ${state?.samples??'…'}\n${value.motion??'idle'} • WebGL ${state?.contextLost?'mất':'hoạt động'} • bone lỗi ${state?.nonFiniteBoneValues??'…'} • Remote ${value.remoteAvatars??0}`;},
  onQAEvent:(type,data)=>event(type,{...data,sceneGeneration:mine,profile:document.querySelector('#profile').value}),
 });
 try{await instance.ready;if(mine===generation)event('scene-ready',instance.getQAState());}catch(error){event('load-error',{name:error.name,message:error.message});}
}
const stick=document.querySelector('#joystick');let pointer=null;
function input(e){const rect=stick.getBoundingClientRect();let x=(e.clientX-rect.left-rect.width/2)/40,z=-(e.clientY-rect.top-rect.height/2)/40;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}lastInput={x,z};instance?.setInput(lastInput);document.querySelector('#knob').style.transform=`translate(${x*30}px,${-z*30}px)`;}
stick.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;stick.setPointerCapture(pointer);input(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)input(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,e=>{if(e.pointerId===pointer){pointer=null;resetInput();}});
document.querySelector('#restart').onclick=open;for(const id of ['character','density'])document.querySelector('#'+id).onchange=open;
document.querySelector('#peers').onchange=()=>event('qa-peer-count',{count:Number(document.querySelector('#peers').value)});
document.querySelector('#profile').onchange=()=>{if(!instance?.setQABudgetProfile(document.querySelector('#profile').value))status.textContent='Cảnh chưa sẵn sàng để đổi chế độ';};
document.querySelector('#mark').onclick=()=>{recorder.mark();const diagnostics=instance?.getQAState(),gpuProbe=instance?.probeQAAvatarPixels();event('failure-mark',{input:lastInput,diagnostics,gpuProbe});status.textContent=gpuProbe?.error?'Đã đánh dấu • phép đo GPU chưa khả dụng':'Đã đánh dấu • pixel nhân vật: '+gpuProbe?.passes.map(p=>`${p.mode}/${p.samples}: ${p.pixels}`).join(', ');};
document.querySelector('#download').onclick=()=>{const blob=new Blob([JSON.stringify(recorder.export(metadata),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`cing-plaza-f22-${Date.now()}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Đã tạo báo cáo';};
for(const name of ['pageshow','pagehide','online','offline','focus','blur','resize'])window.addEventListener(name,()=>{event(name,{hidden:document.hidden,online:navigator.onLine,width:innerWidth,height:innerHeight});if(name==='blur'||name==='pagehide')resetInput();});
document.addEventListener('visibilitychange',()=>{event('visibilitychange',{hidden:document.hidden});if(document.hidden)resetInput();});
window.addEventListener('error',e=>event('window-error',{message:e.message}));window.addEventListener('unhandledrejection',e=>event('unhandled-rejection',{message:String(e.reason?.message||e.reason)}));
let seq=0,simulationEpoch=performance.now();
setInterval(()=>{
 if(document.hidden)return;const count=Number(document.querySelector('#peers').value),seconds=(performance.now()-simulationEpoch)/1000;
 const members=Array.from({length:count},(_,i)=>({memberId:`qa-peer-${i}`,presenceId:`qa-session-${i}`,seq:++seq,character:i%2?'boy':'girl',x:3+Math.sin(seconds*.45+i)*2,z:-2+Math.cos(seconds*.45+i)*2,y:.04,heading:Math.atan2(Math.cos(seconds*.45+i),-Math.sin(seconds*.45+i)),motion:'walk',speed:.9,phase:seconds%1,gesture:0,displayName:`QA ${i+1}`,seatId:null}));
 instance?.setMembers(members,'qa-local');
},100);
const proof=document.createElement('button');proof.textContent='Ảnh đối chiếu trên máy';proof.hidden=location.hostname!=='127.0.0.1';document.querySelector('details').appendChild(proof);proof.onclick=()=>{resetInput();instance.setQAOrbit(.5651494400067594,1.2157482084168285,5.177837386399847);event('comparison-profile-end',{profile:'control',waterViewPNG:{near:instance.captureQACurrentView()}});event('comparison-complete',{});};
if(mobileSceneBudget)document.querySelector('#profile').closest('label').hidden=true;
const landmark=document.createElement('button');landmark.textContent='Đến cây đa';document.querySelector('details').appendChild(landmark);landmark.onclick=()=>{resetInput();instance.correct({x:22.7,y:.067,z:-3.5,heading:0,seq:0});instance.setQAOrbit(0,1.62,24);event('qa-landmark',{name:'banyan'});};
const resetView=document.createElement('button');resetView.textContent='Về điểm bắt đầu';document.querySelector('details').appendChild(resetView);resetView.onclick=()=>{resetInput();instance.reset();event('qa-landmark',{name:'spawn'});};
const treePhoto=document.createElement('button');treePhoto.textContent='Ảnh cây đa trên máy';treePhoto.hidden=location.hostname!=='127.0.0.1';document.querySelector('details').appendChild(treePhoto);treePhoto.onclick=()=>{event('comparison-profile-end',{profile:'combined',waterViewPNG:{near:instance.captureQACurrentView()}});event('comparison-complete',{});};
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
document.querySelector('#compare').hidden=true;
document.querySelector('#compare').onclick=async()=>{
 const token=++comparisonToken;clearInterval(sweepTimer);resetInput();document.querySelector('details').open=false;
 const selectors=['character','density','peers','profile','restart','sweep','compare','soak'];selectors.forEach(id=>document.querySelector('#'+id).disabled=true);
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const profiles=['control','ground','refraction','combined'];
 const poses=[5.8,20,42].flatMap(radius=>(radius===5.8?[1.15]:[.85,1.45]).flatMap(pitch=>Array.from({length:4},(_,i)=>({yaw:i*Math.PI/2,pitch,radius}))));
 event('comparison-start',{profiles,poses,scope:'four-simulated-peers-no-server-fixed-cameras'});
 try{
  document.querySelector('#peers').value='4';await instance.ready;
  for(const profile of profiles){
   if(token!==comparisonToken||document.hidden)throw new Error('COMPARISON_STOPPED');
   document.querySelector('#profile').value=profile;status.textContent='Đang so sánh: '+profile;if(!instance.setQABudgetProfile(profile))throw new Error('SCENE_UNAVAILABLE');
   const mine=generation;if(!instance?.getQAState().loaded)throw new Error('SCENE_NOT_READY');
   const waitStarted=performance.now();while((instance.getStats().remoteAvatars||0)<4){if(token!==comparisonToken||document.hidden)throw new Error('COMPARISON_STOPPED');if(performance.now()-waitStarted>15000)throw new Error('REMOTE_ASSETS_NOT_READY');await pause(100);}
   instance.prewarmQABudget();await pause(3000);if(instance.getQAState().contextLost)throw new Error('WEBGL_CONTEXT_LOST');simulationEpoch=performance.now();event('comparison-profile-start',{profile,remoteAvatars:instance.getStats().remoteAvatars});
   for(const pose of poses){
    if(token!==comparisonToken||mine!==generation||document.hidden)throw new Error('COMPARISON_STOPPED');
    instance.setQAOrbit(pose.yaw,pose.pitch,pose.radius);event('comparison-pose',{profile,...pose});await pause(1500);
   }
   // Record state without synchronous readbacks or extra full-scene renders.
   instance.setQAOrbit(poses.at(-1).yaw,poses.at(-1).pitch,poses.at(-1).radius);
   event('comparison-profile-end',{profile,diagnostics:instance.getQAState()});
  }
  status.textContent='So sánh hoàn tất • hãy lưu báo cáo';event('comparison-complete',{});
 }catch(error){event('comparison-stopped',{reason:error.message});status.textContent='So sánh đã dừng • có thể lưu báo cáo';}
 finally{selectors.forEach(id=>document.querySelector('#'+id).disabled=false);}
};

let soakTimer=null;
document.querySelector('#soak').onclick=()=>{
 if(!instance?.getQAState().loaded){status.textContent='Đợi cảnh tải xong rồi thử';return;}
 const token=++comparisonToken,mine=generation;clearInterval(sweepTimer);clearInterval(soakTimer);resetInput();instance.reset();instance.prewarmQABudget();
 const started=performance.now(),profile=document.querySelector('#profile').value,selectors=['character','density','peers','profile','restart','sweep','compare','soak'];selectors.forEach(id=>document.querySelector('#'+id).disabled=true);document.querySelector('details').open=false;
 event('soak-start',{profile,seconds:300});
 soakTimer=setInterval(()=>{
  const elapsed=(performance.now()-started)/1000;
  if(token!==comparisonToken||mine!==generation||document.hidden||instance.getQAState().contextLost||elapsed>=300){clearInterval(soakTimer);resetInput();selectors.forEach(id=>document.querySelector('#'+id).disabled=false);const completed=elapsed>=300&&token===comparisonToken&&!document.hidden&&!instance.getQAState().contextLost;status.textContent=completed?'Thử 5 phút hoàn tất • hãy lưu báo cáo':'Thử ổn định đã dừng';event(completed?'soak-complete':'soak-stopped',{profile,elapsedSeconds:elapsed});return;}
  const heading=elapsed*.22;instance.setInput({x:Math.sin(heading)*.65,z:Math.cos(heading)*.65});
  const distance=[5.8,20,42][Math.floor(elapsed/10)%3];instance.setQAOrbit(elapsed*.12,.75+.8*(.5+.5*Math.sin(elapsed*.11)),distance);
  status.textContent='Đang thử ổn định: '+Math.floor(elapsed)+'/300 giây';
 },200);
};

// One renderer, identical camera poses; each exclusion is diagnostic only.
const auditButton=document.createElement('button');auditButton.textContent='Đo tải từng nhóm cảnh (2 phút)';document.querySelector('details').appendChild(auditButton);
auditButton.onclick=async()=>{
 if(!instance?.getQAState().loaded){status.textContent='Đợi cảnh tải xong';return;}
 const token=++comparisonToken,mine=generation,groups=['none','foliage','treeWood','roof','railLights','architecture','none'];
 clearInterval(sweepTimer);clearInterval(soakTimer);resetInput();instance.reset();document.querySelector('details').open=false;
 const controls=[...document.querySelectorAll('details button:not(#cancelCompare),details select')];controls.forEach(o=>o.disabled=true);
 event('comparison-audit-start',{groups,peers:Number(document.querySelector('#peers').value),note:'Exclusions measure contribution; not a shipping visual mode.'});
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 try{
  const waitStarted=performance.now(),expected=Number(document.querySelector('#peers').value);
  while((instance.getStats().remoteAvatars||0)<expected){if(performance.now()-waitStarted>60000||token!==comparisonToken||document.hidden)throw Error('PEERS_NOT_READY');status.textContent='Đang chờ đủ nhân vật tải xong…';await pause(200);}
  for(const group of groups){
   if(token!==comparisonToken||mine!==generation||document.hidden||instance.getQAState().contextLost)throw Error('AUDIT_STOPPED');
   instance.setQAAuditHidden(group);simulationEpoch=performance.now();event('comparison-audit-group-start',{group});
   for(const [index,pose] of [[0,{yaw:0,pitch:.85,radius:29.7}],[1,{yaw:Math.PI/2,pitch:.85,radius:29.7}],[2,{yaw:Math.PI,pitch:1.25,radius:20}],[3,{yaw:3*Math.PI/2,pitch:1.15,radius:5.8}]]){
    instance.setQAOrbit(pose.yaw,pose.pitch,pose.radius);event('comparison-audit-pose',{group,index,...pose});status.textContent=`Đang đo nhóm ${groups.indexOf(group)+1}/7 • góc ${index+1}/4`;await pause(4000);
    if(token!==comparisonToken||mine!==generation||document.hidden||instance.getQAState().contextLost)throw Error('AUDIT_STOPPED');
   }
   event('comparison-audit-group-end',{group});
  }
  event('comparison-complete',{scope:'group-audit'});status.textContent='Đo tải hoàn tất • hãy lưu báo cáo';
 }catch(e){event('comparison-audit-stopped',{reason:e.message});status.textContent='Đo tải đã dừng • hãy lưu báo cáo';}
 finally{if(mine===generation)instance.setQAAuditHidden('none');controls.forEach(o=>o.disabled=false);}
};
