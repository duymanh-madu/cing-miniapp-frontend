import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import*as T from'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';import{VRMLoaderPlugin}from'@pixiv/three-vrm';import{VRMAnimationLoaderPlugin,createVRMAnimationClip}from'@pixiv/three-vrm-animation';import{PLAZA_AVATARS}from'../scene/plazaAvatarV6.js';
const loader=new GLTFLoader();loader.register(p=>new VRMLoaderPlugin(p));loader.register(p=>new VRMAnimationLoaderPlugin(p));loader.register(()=>({name:'TEST_TEXTURE_STUB',loadTexture:()=>Promise.resolve(new T.Texture())}));
async function load(name){const b=await readFile(new URL('../../../../public/cing-plaza/assets/'+name,import.meta.url));return loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
test('boy walks taller while preserving foot contact, orientation, hands and original stride timing',async()=>{
 const vrm=(await load('cing-boy-v01.vrm')).userData.vrm;
 const clips=await Promise.all(['cing-boy-walk.vrma',PLAZA_AVATARS.boy.walk].map(async n=>createVRMAnimationClip((await load(n)).userData.vrmAnimations[0],vrm)));
 assert.equal(clips[0].duration,clips[1].duration);let rise=0;
 function sample(clip,t){const mixer=new T.AnimationMixer(vrm.scene),action=mixer.clipAction(clip).play();action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;mixer.setTime(t);vrm.update(0);vrm.scene.updateMatrixWorld(true);const result={};for(const n of ['hips','leftFoot','rightFoot','leftHand','rightHand']){const b=vrm.humanoid.getNormalizedBoneNode(n);result[n]={p:b.getWorldPosition(new T.Vector3()),q:b.getWorldQuaternion(new T.Quaternion())};}mixer.stopAllAction();mixer.uncacheRoot(vrm.scene);return result;}
 for(let i=0;i<120;i++){const t=clips[0].duration*(i+.37)/120,a=sample(clips[0],t),b=sample(clips[1],t);rise+=b.hips.p.y-a.hips.p.y;
  for(const foot of ['leftFoot','rightFoot']){assert.ok(a[foot].p.distanceTo(b[foot].p)<.002);assert.ok(a[foot].q.angleTo(b[foot].q)<.01);}
  for(const hand of ['leftHand','rightHand'])assert.ok(a[hand].q.angleTo(b[hand].q)<.001);
 }
 assert.ok(rise/120>.009,'hips must be visibly taller, not a whole-avatar Y offset');
 const start=sample(clips[1],0),end=sample(clips[1],clips[1].duration);assert.ok(start.hips.p.distanceTo(end.hips.p)<.003,'loop height must not jump');
});
