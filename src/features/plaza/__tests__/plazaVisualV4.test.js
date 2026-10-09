import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import*as T from'three';import{GLTFLoader}from'three/addons/loaders/GLTFLoader.js';
import{buildWorldV3,WORLD_TEXT,WORLD_V3}from'../scene/plazaWorldV3.js';import{createPlazaLightingV4,renderPlazaLayers}from'../scene/plazaLightingV4.js';import{timePalette}from'../scene/plazaRefinementsV2.js';
async function scene(){const b=await readFile(new URL('../../../../public/cing-plaza/assets/cing-plaza-map-v17.glb',import.meta.url)),l=new GLTFLoader();l.register(()=>({name:'GEOMETRY_ONLY',loadTexture:()=>Promise.resolve(new T.Texture())}));return(await l.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;}
const labels=()=>new T.MeshStandardMaterial();
test('rebuilt communal house has a long uninterrupted roof clearing cafe and stage, on enlarged grounds',async()=>{
 const map=await scene(),w=buildWorldV3(map,{labelFactory:labels}),roof=new T.Box3();for(const o of w.dinhV12.roof)roof.union(new T.Box3().setFromObject(o));
 const cafe=new T.Box3().setFromObject(map.getObjectByName('Cafe_Roof'));assert.ok(roof.min.x-cafe.max.x>4);assert.ok(roof.max.z<-17);assert.ok(roof.getSize(new T.Vector3()).x>30);assert.equal(map.getObjectByName('V17_Dinh_Central_Carved_Pediment'),undefined);assert.equal(WORLD_V3.bounds.maxX,38.8);assert.equal(WORLD_V3.bounds.minZ,-37.5);
 const ground=new T.Box3().setFromObject(w.groundV7.walk);assert.ok(ground.max.x>=38.7&&ground.min.z<=-37.4);
});
test('reference-style boards are small rounded blue/white panels on one post above head height',async()=>{
 const map=await scene();const calls=[];const world=buildWorldV3(map,{labelFactory:(lines,options)=>{calls.push({lines,options});return labels();}});
 assert.equal(world.roadSigns.length,2);for(const sign of world.roadSigns){assert.equal(sign.userData.dimensions.width,1.76);assert.equal(sign.userData.dimensions.height,.7);assert.equal(sign.userData.dimensions.posts,1);assert.equal(sign.children.filter(o=>o.name.endsWith('_Single_Post')).length,1);assert.ok(sign.position.y-.35>1.7);assert.ok(world.preserved.has(sign.getObjectByName(sign.name+'_Text')));}
 assert.deepEqual(calls.filter(c=>c.options.road).map(c=>c.lines),[WORLD_TEXT.cafeRoad,WORLD_TEXT.dinhRoad]);
});
test('old orange obstruction and exterior wing are absent; both logos and lamps sit inside cafe symmetrically',async()=>{
 const map=await scene(),world=buildWorldV3(map,{labelFactory:labels,logo:new T.Texture()});assert.equal(map.getObjectByName('ART_Orange_Logo_Panel'),undefined);assert.equal(map.getObjectByName('V3_Cing_Checkin_Wing'),undefined);assert.equal(map.getObjectByName('V3_Exterior_Cing_Logo'),undefined);assert.equal(world.logoRoots.length,2);
 for(const logo of world.logoRoots){assert.ok(logo.position.x>-12.1&&logo.position.x<-5.9);assert.ok(logo.position.z>-13&&logo.position.z<-1);const bulbs=logo.userData.bulbs;assert.equal(bulbs.length,2);assert.equal(bulbs[0].position.x,-bulbs[1].position.x);assert.equal(bulbs[0].position.y,bulbs[1].position.y);assert.ok(Math.abs(bulbs[0].position.x)>1.675);const photo=logo.getObjectByName(logo.name+'_Photo');assert.ok(photo.position.z>.055);}
});
test('night lighting gives neutral portrait fill and local sign light without extra shadows; day dims them',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),avatar=new T.Group(),hemi=new T.HemisphereLight(),renderer={};camera.position.set(0,3,5);scene.add(avatar);const lighting=createPlazaLightingV4(scene,camera,avatar);const face=new T.MeshBasicMaterial();face.name='V4_Road_Sign_Face';lighting.attachWorld({lampAnchors:[new T.Vector3(1,2,3)],nightMaterials:[face]});lighting.apply(timePalette(21),hemi,renderer);lighting.update();
 assert.ok(lighting.fill.intensity>=1);assert.ok(lighting.portrait.intensity>=.4&&lighting.portrait.intensity<=.6);assert.ok(lighting.rim.intensity>0);assert.equal(lighting.rim.castShadow,false);assert.equal(lighting.rim.layers.mask,2);assert.ok(renderer.toneMappingExposure>=.9);assert.ok(lighting.lamps[0].intensity>0);assert.ok(face.color.r>=.99);assert.equal(lighting.fill.castShadow,false);assert.equal(lighting.lamps[0].castShadow,false);
 lighting.apply(timePalette(12),hemi,renderer);assert.equal(lighting.lamps[0].intensity,0);assert.ok(face.color.r<.95);assert.ok(lighting.fill.intensity<.3);
});

test('layered rendering preserves world depth, draws glass after avatar, and restores renderer state',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera();scene.background=new T.Color('#123456');const sky=scene.background;camera.layers.mask=7;const calls=[];const renderer={autoClear:true,info:{autoReset:true,reset(){}},render(s,c){calls.push({mask:c.layers.mask,clear:this.autoClear,background:s.background});}};
 renderPlazaLayers(renderer,scene,camera);assert.deepEqual(calls.map(c=>c.mask),[1,2,4]);assert.deepEqual(calls.map(c=>c.clear),[true,false,false]);assert.equal(calls[0].background,sky);assert.equal(calls[1].background,null);assert.equal(camera.layers.mask,7);assert.equal(scene.background,sky);assert.equal(renderer.autoClear,true);assert.equal(renderer.info.autoReset,true);
 renderer.render=()=>{throw Error('context loss');};assert.throws(()=>renderPlazaLayers(renderer,scene,camera),/context loss/);assert.equal(camera.layers.mask,7);assert.equal(scene.background,sky);assert.equal(renderer.autoClear,true);assert.equal(renderer.info.autoReset,true);
});
