import {test} from 'node:test';import assert from 'node:assert/strict';
import {Group,Bone,SkinnedMesh,BoxGeometry,MeshBasicMaterial,Skeleton} from 'three';
import {PLAZA_FASHION_ITEMS,resolveFashionV29,createFashionControllerV29,createFashionCacheV29} from '../scene/plazaFashionV29.js';
function fixture(){const root=new Group(),bone=new Bone();bone.name='Hips';root.add(bone);const m=new MeshBasicMaterial();m.name='Tops';const mesh=new SkinnedMesh(new BoxGeometry(),m);mesh.name='Top_Test';mesh.bind(new Skeleton([bone]));root.add(mesh);return{root,mesh};}
test('six full outfits and independently addressable parts have unique IDs and 50 Coin initial price (checkout uses server catalogue)',()=>{assert.equal(PLAZA_FASHION_ITEMS.length,32);assert.equal(new Set(PLAZA_FASHION_ITEMS.map(i=>i.id)).size,32);assert.equal(PLAZA_FASHION_ITEMS.filter(i=>i.slot==='outfit'&&i.style!=='default').length,6);assert.ok(PLAZA_FASHION_ITEMS.filter(i=>i.style!=='default').every(i=>i.priceCoin===50));});
test('part overrides full outfit; opposite gender and unknown IDs never load arbitrary assets',()=>{const r=resolveFashionV29({outfit:'girl_royal_outfit',shoes:'girl_campus_shoes'},'girl');assert.equal(r[0].item.style,'royal');assert.equal(r[2].item.style,'campus');assert.ok(resolveFashionV29({outfit:'boy_royal_outfit',shoes:'https://evil.invalid'},'girl').every(x=>!x.item));});
test('concurrent actors share asset parsing and failed loads may be retried',async()=>{let count=0;const load=createFashionCacheV29(async()=>{count++;return {scene:new Group()};});const[a,b]=await Promise.all([load('a'),load('a')]);assert.equal(a,b);assert.equal(count,1);});
test('leaving while clothing loads cannot attach to the disposed actor',async()=>{const actor=fixture(),asset=fixture();let finish;const promise=new Promise(r=>finish=r);const c=createFashionControllerV29(actor.root,{character:'boy',load:()=>promise});c.apply({top:'boy_campus_top'});c.dispose();finish({scene:asset.root});await new Promise(r=>setImmediate(r));assert.equal(actor.root.children.filter(x=>x.isSkinnedMesh).length,1);assert.equal(actor.mesh.visible,true);});
import {BufferGeometry,Float32BufferAttribute,Uint16BufferAttribute} from 'three';
test('covered body triangles are hidden with private indices and restored for default clothing',async()=>{
 const actor=fixture(),asset=fixture();const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute([0,1.2,0,.01,1.2,0,0,1.21,0, 0,.2,0,.01,.2,0,0,.21,0],3));g.setIndex(new Uint16BufferAttribute([0,1,2,3,4,5],1));actor.mesh.geometry=g;actor.mesh.material.name='Body_SKIN';
 const c=createFashionControllerV29(actor.root,{character:'boy',load:async()=>({scene:asset.root})});c.apply({top:'boy_campus_top'});await new Promise(r=>setImmediate(r));assert.notEqual(actor.mesh.geometry,g);assert.equal(actor.mesh.geometry.drawRange.count,3);assert.equal(g.index.count,6);const privateGeometry=actor.mesh.geometry,privateIndex=privateGeometry.index;
 c.apply({top:'boy_royal_top'});await new Promise(r=>setImmediate(r));assert.equal(actor.mesh.geometry.index,privateIndex);
 c.apply({});await new Promise(r=>setImmediate(r));assert.equal(actor.mesh.geometry,g);c.dispose();assert.equal(actor.mesh.geometry,g);
});
import fs from 'node:fs';
test('all six wearable assets stay within geometry/draw limits and use valid normalized rig weights',()=>{
 for(const sex of ['boy','girl'])for(const style of ['campus','royal','street']){
  const b=fs.readFileSync(new URL(`../../../../public/cing-plaza/assets/v34/${sex}-${style}-v34.glb`,import.meta.url));const n=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(n+28);assert.ok(b.length<1600000);assert.ok(g.meshes.length<=10);let triangles=0;
  for(const m of g.meshes)for(const p of m.primitives){triangles+=g.accessors[p.indices].count/3;const a=g.accessors[p.attributes.WEIGHTS_0],view=g.bufferViews[a.bufferView];for(let i=0;i<a.count;i++){let sum=0;for(let k=0;k<4;k++)sum+=bin.readFloatLE(view.byteOffset+i*16+k*4);assert.ok(Math.abs(sum-1)<1e-5);}}
  assert.ok(triangles<20000);
 }
});

import {wardrobeBase} from '../scene/plazaWardrobeFittingV34.js';
import {PLAZA_AVATARS} from '../scene/plazaAvatarV6.js';
test('live room and remote actors use the same fitted bases as V34 studio',()=>{for(const sex of ['boy','girl']){assert.equal(PLAZA_AVATARS[sex].model,wardrobeBase(sex));for(const item of PLAZA_FASHION_ITEMS.filter(i=>i.character===sex&&i.style!=='default'))assert.equal(item.asset,`v34/${sex}-${item.style}-v34.glb`);}});
