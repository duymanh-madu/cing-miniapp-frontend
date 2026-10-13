import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {applyPlazaMaterialsV1,PLAZA_FILTERED_NOISE} from '../scene/plazaMaterialsV1.js';
test('procedural coordinates include each instance transform and distinct shader cache profiles',()=>{
 const root=new T.Group(),material=new T.MeshStandardMaterial();material.name='Test';root.add(new T.Mesh(new T.PlaneGeometry(),material));const data={materials:[{name:'Test',nodes:[{name:'P',type:'ShaderNodeBsdfPrincipled',inputs:[{id:'Base Color',value:[.1,.2,.3]},{id:'Roughness',value:.7},{id:'Metallic',value:0}]}],links:[]}]};
 const resource=applyPlazaMaterialsV1(root,data,{filteredNoise:true});const shader={uniforms:{},vertexShader:'#include <worldpos_vertex>',fragmentShader:'#include <map_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>'};material.onBeforeCompile(shader);assert.match(shader.vertexShader,/USE_INSTANCING/);assert.match(shader.vertexShader,/instanceMatrix\*plazaWorldPosition/);assert.match(shader.fragmentShader,/textureGrad/);assert.match(material.customProgramCacheKey(),/:true$/);resource.dispose();
});
test('filtered tail uses the existing highest mip and explicit gradients outside divergent branches',()=>{
 assert.match(PLAZA_FILTERED_NOISE,/textureLod\(plazaNoiseVolume,vec3\(0\.5\),6\.0\)/);assert.match(PLAZA_FILTERED_NOISE,/gradientX=dFdx\(p\),gradientY=dFdy\(p\)/);assert.match(PLAZA_FILTERED_NOISE,/footprint>=64\.0/);assert.match(PLAZA_FILTERED_NOISE,/textureGrad/);
});
