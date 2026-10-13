import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {instancePlazaStaticMeshes} from '../scene/plazaStaticInstancesV19.js';
import {resolvePlazaCameraOcclusion} from '../scene/plazaCameraOcclusionV19.js';
test('instances preserve transformed vertices, layers and shadows',()=>{
 const root=new T.Group();root.position.set(7,2,3);root.rotation.y=.3;const material=new T.MeshStandardMaterial(),original=[];
 for(let i=0;i<5;i++){const m=new T.Mesh(new T.BoxGeometry(1,2,1),material);m.position.set(i,0,0);m.rotation.y=i*.1;m.layers.set(2);m.castShadow=true;root.add(m);original.push(m);}
 root.updateMatrixWorld(true);const expected=original.map(m=>new T.Vector3().fromBufferAttribute(m.geometry.attributes.position,0).applyMatrix4(m.matrixWorld));assert.equal(instancePlazaStaticMeshes(root).drawCallsSaved,4);const batch=root.children[0];assert.ok(batch.isInstancedMesh);assert.equal(batch.layers.mask,4);assert.equal(batch.castShadow,true);root.updateMatrixWorld(true);
 expected.forEach((p,i)=>{const mat=new T.Matrix4();batch.getMatrixAt(i,mat);const v=new T.Vector3().fromBufferAttribute(batch.geometry.attributes.position,0).applyMatrix4(mat).applyMatrix4(batch.matrixWorld);assert.ok(v.distanceTo(p)<1e-6);});
});
test('preserved and mirrored geometry stays separate',()=>{
 const root=new T.Group(),material=new T.MeshStandardMaterial(),keep=new Set();for(let i=0;i<3;i++){const m=new T.Mesh(new T.BoxGeometry(1,1,1),material);root.add(m);keep.add(m);}assert.equal(instancePlazaStaticMeshes(root,{preserved:keep}).drawCallsSaved,0);root.children.forEach(m=>m.scale.x=-1);assert.equal(instancePlazaStaticMeshes(root).drawCallsSaved,0);
});
test('camera stops before obstructing wall while preserving target',()=>{
 const target=new T.Vector3(0,1,0),desired=new T.Vector3(0,2,10),wall=new T.Box3(new T.Vector3(-2,0,4),new T.Vector3(2,5,5));const safe=resolvePlazaCameraOcclusion(target,desired,[wall]);assert.ok(safe.z<4&&safe.z>3);assert.deepEqual(target.toArray(),[0,1,0]);assert.ok(resolvePlazaCameraOcclusion(target,desired,[]).distanceTo(desired)<1e-9);
});
