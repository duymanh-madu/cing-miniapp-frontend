import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import * as T from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';import {VRMLoaderPlugin} from '@pixiv/three-vrm';
import {preparePlazaAvatarV13,shareActorSkeletonsV13} from '../scene/plazaAvatarResourcesV13.js';
const loader=new GLTFLoader();loader.register(p=>new VRMLoaderPlugin(p));loader.register(()=>({name:'V13_NODE_TEXTURE_STUB',loadTexture:()=>Promise.resolve(new T.Texture())}));
function metrics(root){const skeletons=new Set(),attributes=new Set();let bytes=0,vertices=0,triangles=0;root.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);if(o.isMesh){vertices+=o.geometry.attributes.position.count;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;for(const list of Object.values(o.geometry.morphAttributes))for(const attr of list)if(!attributes.has(attr)){attributes.add(attr);bytes+=attr.array.byteLength;}}});return {skeletons:skeletons.size,morphBytes:bytes,vertices,triangles};}
async function load(name){const b=await readFile(new URL('../../../../public/cing-plaza/assets/'+name,import.meta.url));return (await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).userData.vrm;}
for(const name of ['cing-boy-v01.vrm','cing-girl-v01.vrm'])test(`${name}: preserve geometry/skin/expression, reduce morph memory and skeleton copies`,async()=>{
 const vrm=await load(name);const before=metrics(vrm.scene),base=[];
 vrm.scene.updateMatrixWorld(true);
 vrm.scene.traverse(o=>{if(o.isSkinnedMesh){const i=Math.floor(o.geometry.attributes.position.count/2);base.push({o,i,point:o.applyBoneTransform(i,new T.Vector3().fromBufferAttribute(o.geometry.attributes.position,i)),material:o.material});}});
 // Capture the authored blink deformation independently from its morph layout.
 function blink(){vrm.expressionManager.setValue('blink',1);vrm.expressionManager.update();return base.map(({o,i})=>{const v=new T.Vector3(),a=o.geometry.morphAttributes.position||[];a.forEach((attr,j)=>v.addScaledVector(new T.Vector3().fromBufferAttribute(attr,i),o.morphTargetInfluences[j]||0));return v;});}
 const blinkBefore=blink();preparePlazaAvatarV13(vrm);const after=metrics(vrm.scene),blinkAfter=blink();
 assert.equal(after.vertices,before.vertices);assert.equal(after.triangles,before.triangles);assert.ok(after.morphBytes<before.morphBytes);assert.ok(after.skeletons<before.skeletons);
 base.forEach(({o,i,point,material},j)=>{assert.equal(o.material,material);assert.ok(o.applyBoneTransform(i,new T.Vector3().fromBufferAttribute(o.geometry.attributes.position,i)).distanceTo(point)<1e-5);assert.ok(blinkBefore[j].distanceTo(blinkAfter[j])<1e-5);});
 const actor1=clone(vrm.scene),actor2=clone(vrm.scene);shareActorSkeletonsV13(actor1);shareActorSkeletonsV13(actor2);
 const a=[],b=[];actor1.traverse(o=>{if(o.isSkinnedMesh)a.push(o);});actor2.traverse(o=>{if(o.isSkinnedMesh)b.push(o);});
 assert.equal(metrics(actor1).skeletons,after.skeletons);a.forEach((o,i)=>{assert.equal(o.geometry,b[i].geometry);assert.deepEqual(o.material,b[i].material);assert.notEqual(o.skeleton,b[i].skeleton);assert.notEqual(o.skeleton.bones[0],b[i].skeleton.bones[0]);});
 console.log('V13_RESOURCE_PROOF',name,JSON.stringify({before,after}));
});

test('HUD has lock inside knob, no separate stop/home; members are staged after local assets',async()=>{
 const scene=await readFile(new URL('../scene/PlazaSceneV1.jsx',import.meta.url),'utf8'),create=await readFile(new URL('../scene/createPlazaSceneV1.js',import.meta.url),'utf8');
 assert.match(scene,/stick-knob[^\n]+<LockKeyhole/);assert.doesNotMatch(scene,/<Square|<Home|aria-label="Dừng di chuyển"/);assert.match(scene,/lockedRef.current\)\{event.preventDefault\(\);clearInput/);
 assert.match(create,/if\(loaded\)remote.setMembers/);assert.match(create,/loaded = true; remote.setMembers/);
});

test('three render layers use one world-matrix update and restore scene policy',async()=>{
 const {renderPlazaLayers}=await import('../scene/plazaLightingV4.js');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera();let traversals=0;
 const original=scene.updateMatrixWorld.bind(scene);scene.updateMatrixWorld=(...args)=>{traversals++;return original(...args);};
 const renderer={autoClear:true,info:{autoReset:true,reset(){}},render(s){if(s.matrixWorldAutoUpdate)s.updateMatrixWorld();}};
 renderPlazaLayers(renderer,scene,camera);assert.equal(traversals,1);assert.equal(scene.matrixWorldAutoUpdate,true);assert.equal(renderer.autoClear,true);
});
