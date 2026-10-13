import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {MToonMaterial} from '@pixiv/three-vrm';import {refinePlazaAvatarSurfaceV10} from '../scene/plazaAvatarSurfaceV10.js';
test('MToon uses authored alpha cutoff without coverage while preserving texture and shading',()=>{
 const texture=new T.Texture(),material=new MToonMaterial({map:texture,alphaTest:.5,alphaToCoverage:true}),mesh=new T.Mesh(new T.PlaneGeometry(),material);const color=material.color.clone(),shade=material.shadeColorFactor.clone();refinePlazaAvatarSurfaceV10(mesh);assert.equal(material.alphaToCoverage,false);assert.equal(material.alphaTest,.5);assert.equal(material.map,texture);assert.ok(material.color.equals(color));assert.ok(material.shadeColorFactor.equals(shade));
});
