import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import*as T from'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';import{buildWorldV3}from'../scene/plazaWorldV3.js';import{GARDEN_FENCE_V9}from'../scene/plazaFenceV9.js';
test('front garden fence has eight complete equal bays, nine stone piers/lamps and five balusters per bay',async()=>{
 const b=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url)),l=new GLTFLoader();l.register(()=>({name:'FENCE_TEST',loadTexture:()=>Promise.resolve(new T.Texture())}));const map=(await l.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene,w=buildWorldV3(map,{labelFactory:()=>new T.MeshBasicMaterial()});map.updateMatrixWorld(true);const f=w.fenceV9,{start,end,z,bays}=GARDEN_FENCE_V9;
 assert.equal(f.piers,9);assert.equal(f.balusters,40);assert.equal(f.bays,8);
 for(let i=0;i<=bays;i++){const pier=f.copies.find(o=>o.name.startsWith(`V9_Garden_Pier_${i}_V15_Stone_Balustrade_Pier`)),lamp=f.copies.find(o=>o.name.startsWith(`V9_Garden_Pier_${i}_V15_Lantern_Glass`));assert.ok(pier&&lamp);const c=new T.Box3().setFromObject(pier).getCenter(new T.Vector3());assert.ok(Math.abs(c.x-(start+(end-start)*i/bays))<.001);assert.ok(Math.abs(c.z-z)<.001);}
 const rails=f.copies.filter(o=>o.name.startsWith('V9_Garden_V15_Balustrade_Continuous_Rail'));assert.equal(rails.length,2);for(const o of rails){const b=new T.Box3().setFromObject(o);assert.ok(Math.abs(b.min.x-start)<.001&&Math.abs(b.max.x-end)<.001);}
 for(let i=0;i<bays;i++)for(let j=0;j<5;j++)assert.ok(map.getObjectByName(`V9_Garden_Baluster_${i}_${j}`));
 assert.equal(w.pondV7.sides,4);assert.ok(map.getObjectByName('V15_Lantern_Glass023'));
});
