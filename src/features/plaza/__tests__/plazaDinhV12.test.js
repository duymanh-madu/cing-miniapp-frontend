import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import*as T from'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';import{buildWorldV3}from'../scene/plazaWorldV3.js';
async function build(){const b=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url)),l=new GLTFLoader();l.register(()=>({name:'DINH_V12_TEST',loadTexture:()=>Promise.resolve(new T.Texture())}));const map=(await l.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;return{map,w:buildWorldV3(map,{labelFactory:()=>new T.MeshBasicMaterial()})};}
test('reference facade uses nine bays, solid side doors, open centre and elevated timber over an actual clear void',async()=>{
 const{map,w}=await build(),d=w.dinhV12;assert.equal(d.columns.length,60);assert.equal(d.closed.length,32);assert.equal(map.getObjectByName('V15_Dinh_Foundation'),undefined);assert.equal(map.getObjectByName('V15_Dinh_Front_Upper_Lattice_Rib'),undefined);
 for(const side of [-1,1]){const b=new T.Box3().setFromObject(map.getObjectByName('V12_Dinh_Raised_Floor_'+side));assert.ok(Math.abs(b.max.y-1.02)<1e-6);assert.ok(b.min.y-.24>.65);const ray=new T.Raycaster(new T.Vector3(5,.65,-19),new T.Vector3(0,0,-1),0,3);assert.equal(ray.intersectObject(map.getObjectByName('V12_Dinh_Raised_Floor_'+side),false).length,0);}
 for(const o of d.closed){const b=new T.Box3().setFromObject(o);assert.ok(b.max.x<12.5||b.min.x>16.5,'central entrance obstructed');assert.ok(o.material.map&&o.material.bumpMap&&o.material.roughness>.8);}
 const ray=new T.Raycaster(new T.Vector3(14.5,2,-20.3),new T.Vector3(0,-1,0),0,3),hit=ray.intersectObjects(d.floors,false)[0];assert.ok(hit&&Math.abs(hit.point.y-.24)<1e-5,'lower central aisle lost');
 let count=0;map.traverse(o=>{if(/^V15_Wood_Railing_Ornamental_Loop/.test(o.name)){const b=new T.Box3().setFromObject(o);if(Math.abs(b.getCenter(new T.Vector3()).x-21.1)<.2&&b.min.z<-4)count++;}});assert.equal(count,0,'old fence ornament remains across stairs');
});

test('both raised side floors connect to the lower aisle through continuous walkable internal stairs',async()=>{
 const{w}=await build(),ray=new T.Raycaster(),floors=w.dinhV12.floors;
 for(const side of [-1,1]){let y=.24;for(let k=0;k<=80;k++){const x=14.5+side*k*.03;ray.set(new T.Vector3(x,y+.25,-23.9),new T.Vector3(0,-1,0));ray.far=2;const hit=ray.intersectObjects(floors,false)[0];assert.ok(hit,'gap in internal stair');assert.ok(hit.point.y-y<=.24+1e-6,'internal stair too high');assert.ok(y-hit.point.y<.25,'internal stair drops away');y=hit.point.y;}assert.ok(Math.abs(y-1.02)<1e-5);}
});
