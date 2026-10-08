import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import*as T from'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';
import{buildWorldV3,WORLD_TEXT,WORLD_V3}from'../scene/plazaWorldV3.js';import{refinePlazaMap}from'../scene/plazaRefinementsV2.js';import{batchPlazaMapV1}from'../scene/batchPlazaMapV1.js';
async function scene(){const b=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url)),l=new GLTFLoader();l.register(()=>({name:'GEOMETRY_TEST_ONLY',loadTexture:()=>Promise.resolve(new T.Texture())}));const g=await l.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');refinePlazaMap(g.scene);return g.scene;}
const labels=()=>new T.MeshBasicMaterial();
test('store doubles depth and gets matching rear arch with passable entry',async()=>{
 const map=await scene(),front=map.getObjectByName('V15_Facade_With_Continuous_Inset_Arch'),before=new T.Box3().setFromObject(front),world=buildWorldV3(map,{labelFactory:labels});
 assert.equal(new T.Box3().setFromObject(map.getObjectByName('Cafe_Floor_Ground')).getSize(new T.Vector3()).z,12);
 assert.equal(map.getObjectByName('Cafe_Back_Wall'),undefined);assert.ok(new T.Box3().setFromObject(front).equals(before));assert.equal(front.userData.plazaCollision,false);
 const rear=map.getObjectByName('V3_Rear_V15_Facade_With_Continuous_Inset_Arch');assert.ok(rear);assert.ok(Math.abs(new T.Box3().setFromObject(rear).getCenter(new T.Vector3()).z+13)<.001);
 assert.equal(world.doors.length,2);assert.equal(map.getObjectByName('V4_Ground_Glass_1'),undefined);
});
test('both automatic doors open and wait before closing',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels});
 world.updateDoors(new T.Vector3(-9,0,0),-1);assert.equal(world.doors[0].openness,0);
 for(const door of world.doors){assert.ok(world.doorBlocked(-9,door.z,.276));for(let i=0;i<60;i++)world.updateDoors(new T.Vector3(-9,0,door.z+.8),1/60);assert.ok(door.openness>.98);assert.equal(world.doorBlocked(-9,door.z,.276),false);for(let i=0;i<30;i++)world.updateDoors(new T.Vector3(0,0,5),1/60);assert.ok(door.openness>.98);for(let i=0;i<240;i++)world.updateDoors(new T.Vector3(0,0,5),1/60);assert.ok(door.openness<.01);}
});
test('exact check-in text, local fonts, ramps and complete enclosure',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels});assert.deepEqual(map.getObjectByName('V3_Cafe_Checkin').userData.lines,WORLD_TEXT.cafeRoad);assert.equal(WORLD_TEXT.cafe[3],'我会在 Cing Hu Tang 等你');assert.deepEqual(map.getObjectByName('V3_Dinh_Checkin').userData.lines,WORLD_TEXT.dinhRoad);
 for(const ramp of world.floors.filter(o=>/^V3_Cafe_Entry_Ramp_/.test(o.name))){const b=new T.Box3().setFromObject(ramp);assert.ok(Math.abs(b.max.y-.276)<1e-6);assert.ok(b.min.y<.02);}
 for(const side of ['West','East','North','SouthLeft','SouthRight'])assert.ok(world.boundarySources.includes(`V3_Boundary_${side}_Plaster`));assert.equal(WORLD_V3.bounds.minX,-19.8);
 for(const name of ['sign','serif','chinese'])assert.ok((await readFile(new URL(`../../../../public/cing-plaza/assets/v3/${name}.woff`,import.meta.url))).length>1000);
});
test('batching preserves articulated door meshes',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels});await batchPlazaMapV1(map,{preserved:world.preserved});for(const o of world.preserved)assert.ok(o.parent);world.updateDoors(new T.Vector3(-9,0,0),.3);assert.ok(Math.abs(world.doors[0].leaves[0].pivot.rotation.y)>1);
});
