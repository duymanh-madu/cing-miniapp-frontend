import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {readFile} from 'node:fs/promises';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {applyMobileFoliagePack,splitFoliageSpatially,removeBackgroundRefraction,simplifyBackgroundMaterials,representativePlazaSurface} from '../scene/plazaMobileSceneV20.js';
import {createPlazaLightingV4} from '../scene/plazaLightingV4.js';
import {plazaFrameSecondsV20,movePlazaInSubsteps,updatePlazaVrmInSubsteps} from '../scene/plazaFrameStepsV20.js';

test('real mobile foliage pack reduces background triangles while leaving protected mesh buffers untouched',async()=>{
 const b=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url)),l=new GLTFLoader();l.register(()=>({name:'TEST_TEXTURE_PLACEHOLDERS',loadTexture:()=>Promise.resolve(new T.Texture())}));
 const gltf=await l.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');const protectedMeshes=[];gltf.scene.traverse(o=>{if(o.isMesh&&/Chair_|Table_|Logo|Checkin|Sign|Stage_Name/.test(o.name))protectedMeshes.push([o,o.geometry]);});
 const manifest=JSON.parse(await readFile(new URL('../../../../public/cing-plaza/assets/mobile-scene/foliage.json',import.meta.url),'utf8')),binary=await readFile(new URL('../../../../public/cing-plaza/assets/mobile-scene/foliage.bin',import.meta.url));
 for(const e of manifest.meshes){assert.ok(e.componentsAfter>=e.componentsBefore*.995,e.name);assert.ok(e.triangles>0);}
 const result=applyMobileFoliagePack(gltf.scene,manifest,binary.buffer.slice(binary.byteOffset,binary.byteOffset+binary.byteLength));assert.equal(result.matched,16);assert.ok(result.trianglesAfter<result.trianglesBefore*.5);
 for(const [mesh,geometry] of protectedMeshes)assert.equal(mesh.geometry,geometry,mesh.name);
});

test('spatial foliage split preserves transformed triangles and leaves protected furniture unchanged',()=>{
 const root=new T.Group();root.position.x=3;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,1,0,1,1,0,0,1,1,20,1,0,21,1,0,20,1,1],3));g.computeVertexNormals();const source=new T.Mesh(g,new T.MeshStandardMaterial());source.name='V15_Thousands_Of_Folded_Leaves_1';source.position.z=4;root.add(source);
 const chair=new T.Mesh(new T.BoxGeometry(),source.material);chair.name='V15_Chair_Test';root.add(chair);const original=chair.geometry;const stats=splitFoliageSpatially(root,6);assert.equal(stats.trianglesBefore,2);assert.equal(stats.trianglesAfter,2);assert.equal(stats.chunks,2);assert.equal(chair.geometry,original);assert.equal(chair.parent,root);
 const chunks=root.children.filter(o=>o.userData.mobileFoliage);for(const chunk of chunks){assert.ok(chunk.geometry.boundingBox.getSize(new T.Vector3()).x<=1);assert.equal(chunk.geometry.attributes.position.getZ(0),4);}
});

test('background refraction uses private material copies and does not change furniture sharing the source',()=>{
 const root=new T.Group(),material=new T.MeshPhysicalMaterial({transmission:.28,roughness:.48});material.onBeforeCompile=()=>{};const glass=new T.Mesh(new T.BoxGeometry(),material);glass.name='V15_Lantern_Glass';const chair=new T.Mesh(glass.geometry,material);chair.name='V15_Chair_Test';root.add(glass,chair);const result=removeBackgroundRefraction(root);assert.equal(result.materialsChanged,1);assert.equal(glass.material.transmission,0);assert.equal(chair.material.transmission,.28);assert.equal(chair.material,material);assert.equal(glass.material.onBeforeCompile,material.onBeforeCompile);assert.equal(glass.material.roughness,.48);
});

test('mobile world lighting reuses four lights and follows nearby anchors without lighting the avatar layer',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),avatar=new T.Group();avatar.position.x=100;camera.position.set(100,5,4);const lighting=createPlazaLightingV4(scene,camera,avatar,{mobileBudget:true});
 const anchors=Array.from({length:24},(_,i)=>new T.Vector3(i<8?i:95+i-8,2,0));lighting.attachWorld({lampAnchors:anchors,nightMaterials:[]});assert.equal(lighting.lamps.length,4);const ids=lighting.lamps.map(l=>l.id);
 lighting.apply({sun:.2,hemisphere:.5,light:new T.Color('white'),exposure:1,environment:.2},new T.HemisphereLight(),{toneMappingExposure:1},new T.DirectionalLight());for(let i=0;i<180;i++)lighting.update(1/60);
 assert.deepEqual(lighting.lamps.map(l=>l.id),ids);assert.ok(lighting.lamps.every(l=>Math.abs(l.position.x-100)<5));assert.ok(lighting.lamps.every(l=>(l.layers.mask&2)===0));assert.equal(lighting.budget.anchorCount,24);
});

test('background materials drop procedural work using authored pigments while furniture retains its shader',async()=>{
 const data=JSON.parse(await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-materials.json',import.meta.url),'utf8')),definition=data.materials.find(m=>m.name==='V15_Blue_Grey_Cut_Stone'),surface=representativePlazaSurface(definition);
 assert.ok(surface.color.every(v=>v>=0&&v<=1));const material=new T.MeshPhysicalMaterial({roughness:1});material.name=definition.name;material.onBeforeCompile=()=>{};
 const wall=new T.Mesh(new T.BoxGeometry(),material),chair=new T.Mesh(wall.geometry,material);wall.name='Facade_Wall';chair.name='V15_Chair_Test';const root=new T.Group();root.add(wall,chair);const result=simplifyBackgroundMaterials(root,data);
 assert.equal(result.proceduralMaterials,1);assert.equal(wall.material.isMeshPhysicalMaterial,undefined);assert.ok(wall.material.isMeshStandardMaterial);assert.notEqual(wall.material.onBeforeCompile,material.onBeforeCompile);assert.deepEqual(wall.material.color.toArray(),surface.color);assert.equal(chair.material,material);assert.equal(chair.material.roughness,1);
});

test('slow frames keep travel speed while bounded collision and spring steps prevent a large jump',()=>{
 const dt=plazaFrameSecondsV20(1100,1000),position={x:0,z:0},velocity={x:1,z:0},distances=[];
 const moved=movePlazaInSubsteps(position,velocity,1.5,dt,(x,z)=>{distances.push(Math.hypot(x-position.x,z-position.z));position.x=x;position.z=z;return true;});assert.ok(moved);assert.ok(Math.abs(position.x-.15)<1e-10);assert.ok(distances.every(d=>d<=.075+1e-10));
 position.x=0;movePlazaInSubsteps(position,velocity,1.5,.2,(x,z)=>{if(x>.1)return false;position.x=x;position.z=z;return true;});assert.ok(position.x<=.1);
 const spring=[];updatePlazaVrmInSubsteps({update:dt=>spring.push(dt)},.1);assert.equal(spring.length,2);assert.ok(spring.every(dt=>dt<=.05));assert.equal(plazaFrameSecondsV20(9999,0),.2);assert.equal(plazaFrameSecondsV20(NaN,0),0);
});
