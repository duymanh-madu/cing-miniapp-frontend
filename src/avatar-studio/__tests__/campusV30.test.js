import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Group,Bone,SkinnedMesh,BoxGeometry,MeshBasicMaterial,Skeleton,BufferGeometry,Float32BufferAttribute} from 'three';
import {createCampusFitting} from '../campusV30.js';
function actor(){const root=new Group(),bone=new Bone();bone.name='hips';root.add(bone);for(const slot of ['top','bottom','shoes']){const material=new MeshBasicMaterial();const mesh=new SkinnedMesh(new BoxGeometry(),material);mesh.name=slot+'_sample';mesh.userData.cingAppearanceSlot=slot;mesh.bind(new Skeleton([bone]));root.add(mesh);}return root;}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('late fitting results never attach after leaving or switching back to the currently worn recipe',async()=>{
 const root=actor(),asset=actor();let done;const promise=new Promise(resolve=>done=resolve);const fitting=createCampusFitting(root,()=>promise);
 await fitting.apply({});const pending=fitting.apply({top:'campus'});await fitting.apply({});done({scene:asset});await pending;assert.equal(root.children.filter(x=>x.isMesh).length,3);assert.ok(root.children.filter(x=>x.isMesh).every(x=>x.visible));
 let done2;const f2=createCampusFitting(root,()=>new Promise(resolve=>done2=resolve));const leaving=f2.apply({top:'campus'});f2.dispose();done2({scene:asset});await leaving;assert.equal(root.children.filter(x=>x.isMesh).length,3);fitting.dispose();
});
test('repeated independent swaps restore original clothes and skin without retaining cloned meshes',async()=>{
 const root=actor(),asset=actor(),body=new SkinnedMesh(new BufferGeometry(),new MeshBasicMaterial());body.material.name='Body_SKIN';body.geometry.setAttribute('position',new Float32BufferAttribute([0,1.2,0,.02,1.2,0,0,1.22,0,0,1.47,0,.02,1.47,0,0,1.48,0],3));body.geometry.setIndex([0,1,2,3,4,5]);root.add(body);const original=body.geometry;const fitting=createCampusFitting(root,async()=>({scene:asset}));
 for(let i=0;i<12;i++){await fitting.apply({top:'campus',bottom:'campus',shoes:'campus'});assert.equal(root.children.filter(x=>x.isMesh).length,7);assert.equal(body.geometry.drawRange.count,3);await fitting.apply({shoes:'campus'});assert.equal(root.children.filter(x=>x.isMesh).length,5);assert.equal(body.geometry,original);await fitting.apply({});assert.equal(root.children.filter(x=>x.isMesh).length,4);}
 fitting.dispose();assert.equal(body.geometry,original);assert.ok(root.children.filter(x=>x.isMesh).every(x=>x.visible));await settle();
});
function glb(file){const b=fs.readFileSync(new URL('../../../public/cing-plaza/assets/v30/'+file,import.meta.url)),n=b.readUInt32LE(12);return {b,g:JSON.parse(b.subarray(20,20+n)),bin:b.subarray(28+n)};}
test('Campus export has bounded geometry, finite normals and normalized weights on the original raw rig',()=>{
 const {b,g,bin}=glb('boy-campus-v30.glb');assert.ok(b.length<650000);assert.ok(g.meshes.length<=8);let triangles=0;
 for(const mesh of g.meshes)for(const p of mesh.primitives){triangles+=g.accessors[p.indices].count/3;for(const name of ['POSITION','NORMAL','WEIGHTS_0']){const a=g.accessors[p.attributes[name]],v=g.bufferViews[a.bufferView],width=name==='WEIGHTS_0'?4:3;for(let i=0;i<a.count;i++){let sum=0;for(let k=0;k<width;k++){const value=bin.readFloatLE(v.byteOffset+i*width*4+k*4);assert.ok(Number.isFinite(value));sum+=name==='NORMAL'?value*value:value;}if(name==='WEIGHTS_0')assert.ok(Math.abs(sum-1)<1e-5);if(name==='NORMAL')assert.ok(sum>.5&&sum<1.5);}}
 const a=g.accessors[p.attributes.JOINTS_0],v=g.bufferViews[a.bufferView];for(let i=0;i<a.count*4;i++)assert.ok(bin.readUInt16LE(v.byteOffset+i*2)<g.skins[0].joints.length);
 }
 assert.ok(triangles<8500);assert.equal(g.skins[0].joints.length,140);assert.ok(g.nodes.some(n=>n.name==='J_Bip_R_UpperArm'));
});
test('studio base retains every original body triangle while correctly classifying the original shorts',()=>{
 const {g}=glb('cing-boy-modular-v30.vrm');const original=g.meshes[1].primitives.reduce((sum,p)=>sum+g.accessors[p.indices].count,0);let grouped=0;
 for(const node of g.nodes)if(node.extras?.cingAppearanceSlot){for(const p of g.meshes[node.mesh].primitives){grouped+=g.accessors[p.indices].count;if([12,13].includes(p.material))assert.equal(node.extras.cingAppearanceSlot,'bottom');if(p.material===10)assert.equal(node.extras.cingAppearanceSlot,'top');}}
 assert.equal(grouped,original);assert.equal(g.nodes[140].name,'Face');assert.equal(g.extensions.VRMC_vrm.humanoid.humanBones.head.node, g.skins[0].joints.find(i=>g.nodes[i].name==='J_Bip_C_Head'));
});
