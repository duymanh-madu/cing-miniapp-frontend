import {remotePoseBudgetV22} from './plazaStaticTransformsV22.js';
import {updatePlazaVrmInSubsteps} from './plazaFrameStepsV20.js';
import {preparePlazaAvatarV13,shareActorSkeletonsV13} from './plazaAvatarResourcesV13.js';
import {refinePlazaAvatarSurfaceV10} from './plazaAvatarSurfaceV10.js';
import {applyPlazaSeatedPose} from './plazaSeatedPoseV3.js';
import * as THREE from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {VRM,VRMHumanoid,VRMUtils} from '@pixiv/three-vrm';
import {createVRMAnimationClip} from '@pixiv/three-vrm-animation';
import {PLAZA_AVATARS,plazaWalkPlaybackRate} from './plazaAvatarV6.js';
import {addPresenceSample} from './plazaPresenceMotionV2.js';
import {createPlazaPresenceClockV19} from './plazaPresenceClockV19.js';

// Clone skeletons, share geometry/materials/textures; each avatar owns its mixer.
export function createPlazaRemoteAvatarsV2({scene,load,onNotice=()=>{},avatarPreparation={},physicsSubsteps=false}) {
 const templates=new Map(),actors=new Map();let wanted=new Map(),disposed=false,buildQueue=Promise.resolve();
 const frustum=new THREE.Frustum(),viewProjection=new THREE.Matrix4(),actorSphere=new THREE.Sphere(new THREE.Vector3(),3);
 const nextFrame=()=>new Promise(resolve=>(globalThis.requestAnimationFrame||((cb)=>setTimeout(cb,0)))(resolve));
 function templateFrom(vrm) {
  const source=[],dest=[];vrm.scene.traverse(x=>source.push(x));
  const root=clone(vrm.scene);shareActorSkeletonsV13(root);root.traverse(x=>dest.push(x));
  const mapping=new Map(source.map((x,i)=>[x,dest[i]]));
  mapping.get(vrm.humanoid.normalizedHumanBonesRoot)?.removeFromParent();
  const bones=Object.fromEntries(Object.entries(vrm.humanoid.rawHumanBones).map(([name,b])=>[name,{node:mapping.get(b.node)}]));
  // Keep a hidden template in the scene so shared resources are freed once by scene cleanup.
  root.visible=false;scene.add(root);
  return {root,bones,meta:vrm.meta,animations:{}};
 }
 function seed(character,vrm){if(!templates.has(character))templates.set(character,Promise.resolve(templateFrom(vrm)));}
 function setAnimation(character,name,animation){templates.get(character)?.then(t=>{t.animations[name]=animation;}).catch(()=>{});}
 async function getTemplate(character) {
  if(!templates.has(character))templates.set(character,(async()=>{
   const config=PLAZA_AVATARS[character],file=await load(config.model),vrm=file.userData.vrm;
   if(!vrm)throw new Error('Không đọc được nhân vật trong phòng.');VRMUtils.rotateVRM0(vrm);preparePlazaAvatarV13(vrm,avatarPreparation);refinePlazaAvatarSurfaceV10(vrm.scene);
   // The original is also hidden for unified GPU cleanup; clone owns only its bones.
   vrm.scene.visible=false;scene.add(vrm.scene);
   const t=templateFrom(vrm);
   for(const name of ['idle','walk','wave','checkin']){
    const file=await load(config[name]);t.animations[name]=file.userData.vrmAnimations?.[0];
    if(!t.animations[name])throw new Error('Không đọc được chuyển động thành viên.');
   }
   return t;
  })());
  return templates.get(character);
 }
 async function build(id,value,holder) {
  try {
   const t=await getTemplate(value.character);if(disposed || actors.get(id)!==holder)return;
   // Animation seeds are populated before local ready/state publication.
   const source=[],dest=[];t.root.traverse(x=>source.push(x));const root=clone(t.root);shareActorSkeletonsV13(root);root.traverse(x=>dest.push(x));
   const mapping=new Map(source.map((x,i)=>[x,dest[i]]));
   const bones=Object.fromEntries(Object.entries(t.bones).map(([name,b])=>[name,{node:mapping.get(b.node)}]));
   const humanoid=new VRMHumanoid(bones);root.add(humanoid.normalizedHumanBonesRoot);root.visible=true;
   const vrm=new VRM({scene:root,humanoid,meta:t.meta}),mixer=new THREE.AnimationMixer(root),actions={};
   for(const name of ['idle','walk','wave','checkin']) {
    if(!t.animations[name])throw new Error('Chuyển động chưa sẵn sàng.');
    const action=mixer.clipAction(createVRMAnimationClip(t.animations[name],vrm));
    action.setLoop(['wave','checkin'].includes(name)?THREE.LoopOnce:THREE.LoopRepeat,['wave','checkin'].includes(name)?1:Infinity);action.clampWhenFinished=true;actions[name]=action;
   }
   root.traverse(o=>{if(o.isMesh){o.layers.set(1);o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false;}});
   const group=new THREE.Group();group.name=`PlazaMember_${id}`;group.add(root);scene.add(group);
   actions.sit=actions.idle;
   Object.assign(holder,{group,vrm,mixer,actions,character:value.character,current:null,accumulated:0,headPosition:new THREE.Vector3()});
  } catch(error){if(!disposed&&actors.get(id)===holder){holder.failed=true;onNotice('Chưa tải được một nhân vật trong phòng. Hãy mở lại cảnh khi mạng ổn định.');}}
 }
 function remove(id) {
  const a=actors.get(id);if(!a)return;actors.delete(id);a.mixer?.stopAllAction();if(a.vrm)a.mixer?.uncacheRoot(a.vrm.scene);
  const skeletons=new Set();a.group?.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);});for(const s of skeletons)s?.dispose();a.group?.removeFromParent();
 }
 function setMembers(members,selfId) {
  if(disposed)return;wanted=new Map((members||[]).filter(v=>v.memberId!==selfId&&PLAZA_AVATARS[v.character]).slice(0,29).map(v=>[v.memberId,v]));
  for(const id of actors.keys())if(!wanted.has(id))remove(id);
  const now=performance.now();
  for(const [id,v]of wanted){let a=actors.get(id);if(a&&a.character&&a.character!==v.character){remove(id);a=null;}
   if(!a){a={samples:[],character:v.character,motionClock:createPlazaPresenceClockV19()};actors.set(id,a);const holder=a;buildQueue=buildQueue.then(async()=>{await nextFrame();if(!disposed&&actors.get(id)===holder)await build(id,v,holder);}).catch(()=>{});}
   a.identity=v;
   a.samples=addPresenceSample(a.samples,v,now);
  }
 }
 function update(dt,camera) {
  const now=performance.now();frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  for(const a of actors.values()) {
   if(!a.group)continue;const v=a.motionClock.sample(a.samples,now);if(!v)continue;
   a.group.position.set(v.x,v.y,v.z);a.group.rotation.y=v.heading;
   const key=`${v.motion}:${v.gesture}:${v.presenceId}`;
   if(a.current!==key){const old=a.action,next=a.actions[v.motion];if(!next)continue;next.reset().play();next.time=Math.min(v.phase,next.getClip().duration);if(old&&old!==next)next.crossFadeFrom(old,.22,false);a.current=key;a.action=next;}
   a.actions.walk.setEffectiveTimeScale(plazaWalkPlaybackRate(PLAZA_AVATARS[a.character],v.speed));
   a.accumulated+=dt;
   actorSphere.center.copy(a.group.position);actorSphere.center.y+=.9;
   const near=frustum.intersectsSphere(actorSphere);a.group.visible=near;
   // Preserve elapsed animation time offscreen; only pose visible actors.
   const poseBudget=physicsSubsteps?remotePoseBudgetV22(near,a.accumulated):null;
   if(physicsSubsteps&&!poseBudget)continue;
   if(near||a.accumulated>=.1){a.mixer.update(a.accumulated);if(v.motion==='sit')applyPlazaSeatedPose(a.vrm);if(physicsSubsteps)updatePlazaVrmInSubsteps(a.vrm,poseBudget.physicsSeconds);else a.vrm.update(a.accumulated);a.accumulated=0;}
  }
 }
 return {seed,setAnimation,setMembers,update,anchors:()=>[...actors.entries()].filter(([,a])=>a.group).map(([memberId,a])=>({memberId,...a.identity,position:a.vrm.humanoid.getNormalizedBoneNode('head')?.getWorldPosition(a.headPosition)||a.headPosition.copy(a.group.position).add(new THREE.Vector3(0,1.4,0))})),positions:()=>[...actors.values()].map(a=>a.group?.position||a.samples.at(-1)?.value).filter(Boolean),dispose:()=>{disposed=true;for(const id of [...actors.keys()])remove(id);wanted.clear();templates.clear();},stats:()=>{let loaded=0,drawn=0,buffer=120;for(const a of actors.values())if(a.group){loaded++;if(a.group.visible)drawn++;buffer=Math.max(buffer,a.motionClock.delay);}return {remoteAvatars:loaded,renderedRemoteAvatars:drawn,presenceBufferMaxMs:buffer};}};
}
