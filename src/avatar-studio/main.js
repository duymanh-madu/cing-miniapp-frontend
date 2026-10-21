import {createFashionCacheV29} from '../features/plaza/scene/plazaFashionV29.js';
import {createWardrobeFitting,wardrobeBase,WARDROBE_STYLES} from './wardrobeV34.js';
import {softenPlazaSkin} from '../features/plaza/scene/plazaAppearanceV27.js';
import {applyPlazaSeatedPose} from '../features/plaza/scene/plazaSeatedPoseV3.js';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';
import {VRMAnimationLoaderPlugin,createVRMAnimationClip} from '@pixiv/three-vrm-animation';
const host=document.querySelector('#stage'),status=document.querySelector('#status');
const ui=Object.fromEntries(['gender','expression','hair','skin','outfit','top','bottom','shoes'].map(k=>[k,document.querySelector('#'+k)]));
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'default'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#eee8df');const camera=new T.PerspectiveCamera(35,1,.05,30);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.95,0);controls.minDistance=1.5;controls.maxDistance=5;controls.maxPolarAngle=Math.PI*.6;
function view(angle=0){camera.position.set(Math.sin(angle)*3.5,1.13,Math.cos(angle)*3.5);controls.target.set(0,.95,0);controls.update();}view();
scene.add(new T.HemisphereLight('#ffffff','#aa9688',1.7));const light=new T.DirectionalLight('#fff1e0',1.8);light.position.set(2,3,4);scene.add(light);
const loader=new GLTFLoader();loader.register(p=>new VRMLoaderPlugin(p));loader.register(p=>new VRMAnimationLoaderPlugin(p));
let vrm=null,mixer=null,actions={},current=null,generation=0,abort=null,disposed=false,raf=0,last=0,blinkTime=0,garment=null,seated=false,paused=false;
const garmentRoots=[],motionButtons=['wave','original','idle','hold','walk','sit','pause'];
const base=new URL('/cing-plaza/assets/',location.origin);
function release(root){const geometry=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.skeleton)skeletons.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const x of Object.values(m))if(x?.isTexture)textures.add(x);}});geometry.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());textures.forEach(x=>{x.dispose();x.source?.data?.close?.();});skeletons.forEach(x=>x.dispose());root.removeFromParent();}
async function load(file,signal){const response=await fetch(new URL(file,base),{signal});if(!response.ok)throw Error('Không tải được mẫu');const buffer=await response.arrayBuffer();if(signal.aborted)throw new DOMException('Aborted','AbortError');const gltf=await loader.parseAsync(buffer,base.href);if(signal.aborted||disposed){release(gltf.scene);throw new DOMException('Aborted','AbortError');}return gltf;}
function appearance(){if(!vrm)return;const skin=new T.Color(ui.skin.value),hair=new T.Color(ui.hair.value);vrm.scene.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.color){if(!m.userData.studioOriginalColor)m.userData.studioOriginalColor=m.color.clone();const tint=/HAIR/.test(m.name)?hair:/SKIN/.test(m.name)?skin:null;if(tint){m.color.copy(m.userData.studioOriginalColor).multiply(tint);if(/SKIN/.test(m.name))softenPlazaSkin(m);}}});const e=vrm.expressionManager;for(const key of ['happy','relaxed','blinkLeft','blinkRight','blink'])e?.setValue(key,0);e?.setValue('happy',ui.expression.value==='sweet'?.55:ui.expression.value==='wink'?.35:.12);e?.setValue('relaxed',ui.expression.value==='calm'?.3:0);if(ui.expression.value==='wink')e?.setValue('blinkLeft',.95);}
function play(name){const next=actions[name];if(!next)return;seated=false;paused=false;document.querySelector('#pause').textContent='Tạm dừng';next.paused=false;next.reset().play();if(current&&current!==next)next.crossFadeFrom(current,.25,false);current=next;}
function clearActor(){garment?.dispose();garment=null;garmentRoots.splice(0).forEach(release);mixer?.stopAllAction();if(vrm){mixer?.uncacheRoot(vrm.scene);release(vrm.scene);}vrm=null;mixer=null;actions={};current=null;}
async function fit(){if(!vrm||!garment)return;const mine=generation;status.textContent='Đang thay trang phục…';try{await garment.apply(Object.fromEntries(['top','bottom','shoes'].map(k=>[k,ui[k].value])));if(mine===generation)status.textContent='Sẵn sàng · '+({campus:'Campus',royal:'Royal',street:'Street',original:'Trang phục gốc',mixed:'Phối riêng'}[ui.outfit.value]||'Phối riêng')+' · '+(ui.gender.value==='boy'?'Nam':'Nữ')+' V34';}catch(e){if(mine===generation&&e.name!=='AbortError')status.textContent='Chưa thay được đồ. Hãy chọn lại.';}}
async function change(){const mine=++generation;abort?.abort();abort=new AbortController();const signal=abort.signal;motionButtons.forEach(id=>document.querySelector('#'+id).disabled=true);clearActor();status.textContent='Đang tải nhân vật…';seated=false;paused=false;const sex=ui.gender.value;
for(const id of ['outfit','top','bottom','shoes'])ui[id].disabled=false;
try{const file=await load(wardrobeBase(sex),signal);if(mine!==generation){release(file.scene);return;}vrm=file.userData.vrm;if(!vrm){release(file.scene);throw Error('Model thiếu dữ liệu');}VRMUtils.rotateVRM0(vrm);vrm.scene.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});scene.add(vrm.scene);mixer=new T.AnimationMixer(vrm.scene);
for(const [key,path] of [['idle',`cing-${sex}-idle.vrma`],['wave',sex==='boy'?'v28/cing-boy-wave-idle-v28.vrma':`cing-${sex}-wave.vrma`],['original',`cing-${sex}-wave.vrma`],['walk',sex==='boy'?'v8/cing-boy-walk-v8.vrma':'v7/cing-girl-walk-v7.vrma']]){const f=await load(path,signal);if(mine!==generation){release(f.scene);return;}const animation=f.userData.vrmAnimations?.[0];if(!animation)throw Error('Clip không hợp lệ');const action=mixer.clipAction(createVRMAnimationClip(animation,vrm));if(key==='wave'||key==='original'){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;}actions[key]=action;}
mixer.addEventListener('finished',()=>{if(!seated)play('idle');});play('idle');appearance();
garment=createWardrobeFitting(vrm.scene,createFashionCacheV29(async file=>{const f=await load(file,signal);garmentRoots.push(f.scene);return f;}),{character:sex});await fit();
if(mine===generation)motionButtons.forEach(id=>document.querySelector('#'+id).disabled=false);
}catch(e){if(mine===generation&&e.name!=='AbortError'){clearActor();status.textContent='Chưa tải được mẫu. Hãy chọn lại nhân vật.';}}}
ui.outfit.onchange=()=>{for(const key of ['top','bottom','shoes'])ui[key].value=ui.outfit.value;fit();};
for(const key of ['top','bottom','shoes'])ui[key].onchange=()=>{ui.outfit.value=[...WARDROBE_STYLES,'original'].find(style=>['top','bottom','shoes'].every(k=>ui[k].value===style))||'mixed';fit();};
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(host);resize();
function tick(t){raf=0;if(disposed||document.hidden)return;const dt=Math.min(.05,last?(t-last)/1000:0);last=t;if(!paused)mixer?.update(dt);if(vrm){if(seated)applyPlazaSeatedPose(vrm);if(!paused){blinkTime+=dt;const phase=blinkTime%4.1;vrm.expressionManager?.setValue('blink',ui.expression.value==='wink'?0:phase<.15?Math.sin(Math.PI*phase/.15)**2:0);vrm.update(dt);}}renderer.render(scene,camera);raf=requestAnimationFrame(tick);}
function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf&&!disposed){last=0;raf=requestAnimationFrame(tick);}}document.addEventListener('visibilitychange',visibility);
ui.gender.onchange=change;for(const id of ['expression','hair','skin'])ui[id].onchange=appearance;for(const id of ['wave','original','idle','walk'])document.querySelector('#'+id).onclick=()=>play(id);
document.querySelector('#sit').onclick=()=>{play('idle');seated=true;};
document.querySelector('#hold').onclick=()=>{const action=actions.wave;if(!action)return;seated=false;mixer.stopAllAction();action.reset().play();action.time=action.getClip().duration*.5;action.paused=true;mixer.update(0);vrm.update(0);current=action;};
document.querySelector('#pause').onclick=()=>{paused=!paused;document.querySelector('#pause').textContent=paused?'Tiếp tục':'Tạm dừng';};
document.querySelector('#reset').onclick=()=>view();document.querySelector('#side').onclick=()=>view(Math.PI*.5);document.querySelector('#back').onclick=()=>view(Math.PI);
window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;abort?.abort();generation++;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();clearActor();renderer.dispose();renderer.forceContextLoss();document.removeEventListener('visibilitychange',visibility);});
raf=requestAnimationFrame(tick);change();

if(import.meta.env.DEV && new URLSearchParams(location.search).has('audit')){
 import('./inspectionV34.js').then(({installInspection})=>installInspection({renderer,scene,camera,controls,ui,host,status,play,getActor:()=>vrm,getMixer:()=>mixer,getActions:()=>actions,freeze:()=>{paused=true;},fit,change,seat:()=>{seated=true;}}));
}
