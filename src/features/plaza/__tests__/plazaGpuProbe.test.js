import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {probePlazaAvatarGpu,countPlazaProbePixels} from '../../../qa/plazaAvatarGpuProbe.js';
test('probe counts alpha pixels and restores scene/renderer even when readback fails',()=>{
 assert.equal(countPlazaProbePixels(new Uint8Array([0,0,0,0,255,255,255,255])),1);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),background=new T.Color('red'),override=new T.MeshBasicMaterial();scene.background=background;scene.overrideMaterial=override;camera.layers.set(2);let target=null,color=new T.Color('blue'),alpha=.7;
 const renderer={capabilities:{maxSamples:4},autoClear:false,info:{autoReset:false,reset(){},render:{}},getRenderTarget:()=>target,setRenderTarget:v=>{target=v;},getClearColor:v=>v.copy(color),getClearAlpha:()=>alpha,setClearColor:(v,a)=>{color=new T.Color(v);alpha=a;},clear(){},render(){},readRenderTargetPixels(){throw new Error('readback failure');}};
 const r=probePlazaAvatarGpu(renderer,scene,camera);assert.equal(r.error,'readback failure');assert.equal(target,null);assert.equal(scene.background,background);assert.equal(scene.overrideMaterial,override);assert.equal(camera.layers.mask,4);assert.equal(renderer.autoClear,false);assert.equal(color.getHexString(),'0000ff');assert.equal(alpha,.7);
});
