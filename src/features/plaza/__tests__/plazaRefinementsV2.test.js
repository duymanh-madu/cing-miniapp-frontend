import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { joystickVector, vietnamHour, timePalette, findTapPath, refinePlazaMap } from '../scene/plazaRefinementsV2.js';
test('joystick uses continuous angles, radius clamp and dead zone', () => {
 const r={left:0,top:0,width:100,height:100};
 assert.deepEqual(joystickVector(51,51,r),{x:0,z:0});
 const v=joystickVector(90,30,r); assert.ok(Math.abs(v.x/v.z-2)<1e-9); assert.ok(Math.abs(Math.hypot(v.x,v.z)-1)<1e-9);
});
test('Vietnam clock and smooth readable night lighting',()=>{
 assert.equal(vietnamHour(new Date('2026-10-07T12:30:00Z')),19.5);
 assert.ok(timePalette(1).sun<timePalette(12).sun); assert.ok(timePalette(1).hemisphere>=.6);
 const distance=(a,b)=>Math.hypot(a.r-b.r,a.g-b.g,a.b-b.b);
 assert.ok(distance(timePalette(18.999).background,timePalette(19).background)<.01);
 assert.ok(distance(timePalette(23.999).background,timePalette(0).background)<.01);
});
test('tap paths avoid obstacles and reject blocked destinations',()=>{
 const walkable=(x,z)=>Math.abs(x)<4&&Math.abs(z)<4&&!(x>.5&&x<1.5&&Math.abs(z)<.7);
 const path=findTapPath({x:0,z:0},{x:2,z:0},walkable);
 assert.ok(path&&path.some(p=>Math.abs(p.z)>=.7)); assert.deepEqual(path.at(-1),{x:2,z:0});
 assert.equal(findTapPath({x:0,z:0},{x:1,z:0},walkable),null);
 assert.equal(findTapPath({x:0,z:0},{x:2,z:0},()=>false),null);
});
test('only QR plaques removed; both rails meet oval centerline',()=>{
 const root=new THREE.Group(),mat=new THREE.MeshStandardMaterial();
 for(const name of ['V15_Table_Menu_Book','V15_Table_Menu_Book001','V15_Table_Polished_Wood_Top','Tea_Cup']) {const o=new THREE.Mesh(new THREE.BoxGeometry(),mat);o.name=name;root.add(o);}
 for(const side of [-1,1]) {const g=new THREE.BoxGeometry(.04,.7,.04);g.translate(side*.2,.8,-.2);const o=new THREE.Mesh(g,mat);o.name=`V15_Chair_Curved_Back_Support${side<0?'002':'003'}`;root.add(o);}
 const rim=new THREE.Mesh(new THREE.BoxGeometry(),mat);rim.name='V15_Chair_Oval_Black_Wood_Rim.001';root.add(rim);
 assert.deepEqual(refinePlazaMap(root),{plaquesRemoved:2,chairSupports:2,chairBacks:1});
 assert.ok(root.getObjectByName('Tea_Cup'));assert.ok(root.getObjectByName('V15_Table_Polished_Wood_Top'));assert.equal(root.getObjectByName('V15_Table_Menu_Book'),undefined);
 rim.geometry.computeBoundingBox();
 for(const o of root.children.filter(o=>/Support/.test(o.name))) {o.geometry.computeBoundingBox();assert.ok(o.geometry.boundingBox.intersectsBox(rim.geometry.boundingBox));const p=o.geometry.parameters.path.getPoint(1);assert.ok(Math.abs((p.x/.232)**2+((p.y-1.13)/.32)**2-1)<1e-6);}
});

test('actual V17 GLB repairs all 9 plaques and all 27 chairs after loader renames nodes',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
 const bytes=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url));
 const loader=new GLTFLoader();
 // Geometry-only audit: Node does not have browser image decoding.
 loader.register(()=>({name:'TEST_GEOMETRY_ONLY',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 assert.deepEqual(refinePlazaMap(gltf.scene),{plaquesRemoved:9,chairSupports:54,chairBacks:27});
});
