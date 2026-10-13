import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {PLAZA_RENDER_PROFILES,plazaRenderProfile} from '../../../qa/plazaRenderProfiles.js';import {renderPlazaLayers} from '../scene/plazaLightingV4.js';
test('each diagnostic profile changes exactly one rendering factor',()=>{
 const control=PLAZA_RENDER_PROFILES.control;for(const id of ['skeleton','morph','matrices','layers'])assert.equal(Object.keys(control).filter(k=>control[k]!==PLAZA_RENDER_PROFILES[id][k]).length,1);assert.equal(plazaRenderProfile('invalid'),control);
});
test('matrix and single-pass comparisons restore all scene policies including exceptions',()=>{
 for(const profile of ['matrices','layers'])for(const throws of [false,true]){
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(),calls=[],background=scene.background=new T.Color('red');camera.layers.set(5);const renderer={autoClear:false,info:{autoReset:true,reset(){}},render(){calls.push({mask:camera.layers.mask,autoUpdate:scene.matrixWorldAutoUpdate});if(throws)throw new Error('synthetic render failure');}};
  if(throws)assert.throws(()=>renderPlazaLayers(renderer,scene,camera,plazaRenderProfile(profile)));else renderPlazaLayers(renderer,scene,camera,plazaRenderProfile(profile));
  assert.equal(camera.layers.mask,32);assert.equal(scene.background,background);assert.equal(scene.matrixWorldAutoUpdate,true);assert.equal(renderer.autoClear,false);assert.equal(renderer.info.autoReset,true);
  if(!throws)assert.equal(calls.length,profile==='layers'?1:3);if(profile==='matrices')assert.ok(calls.every(c=>c.autoUpdate));
 }
});
