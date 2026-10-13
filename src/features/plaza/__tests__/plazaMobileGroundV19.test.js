import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {rebuildMobileGroundV19,mobileGroundGeometry} from '../scene/plazaMobileGroundV19.js';
import {POND_V7} from '../scene/plazaGroundV7.js';
test('mobile floor partitions the courtyard without pond coverage and with continuous world UVs',()=>{
 const map=new T.Group(),source=new T.Mesh(new T.BoxGeometry(),new T.MeshPhysicalMaterial({color:0xaabbcc,roughness:.48}));source.name='V17_Courtyard_Bricks';map.add(source);
 const bounds={minX:-19.8,maxX:28.3,minZ:-24.8,maxZ:12.8},color=new T.Texture(),normal=new T.Texture(),ao=new T.Texture(),floor=rebuildMobileGroundV19(map,bounds,{color,normal,ao});
 let area=0;for(const mesh of floor.meshes){const box=mesh.geometry.boundingBox;area+=(box.max.x-box.min.x)*(box.max.z-box.min.z);assert.ok(box.max.x<=POND_V7.minX+.002||box.min.x>=POND_V7.maxX-.002||box.max.z<=POND_V7.minZ+.002||box.min.z>=POND_V7.maxZ-.002);assert.equal(mesh.material.map,color);assert.equal(mesh.material.normalMap,normal);assert.equal(mesh.material.aoMap,ao);assert.equal(ao.channel,0);assert.equal(mesh.material.roughness,.48);assert.equal(mesh.geometry.index.count,6);}
 assert.ok(Math.abs(area-((bounds.maxX-bounds.minX)*(bounds.maxZ-bounds.minZ)-(POND_V7.maxX-POND_V7.minX)*(POND_V7.maxZ-POND_V7.minZ)))<.01);assert.ok(floor.triangles<100);assert.equal(floor.walk.visible,false);assert.equal(source.parent,null);
 const left=mobileGroundGeometry({minX:0,maxX:8,minZ:0,maxZ:8},bounds),right=mobileGroundGeometry({minX:8,maxX:16,minZ:0,maxZ:8},bounds);assert.equal(left.attributes.uv.getX(3),right.attributes.uv.getX(0));assert.equal(left.attributes.uv.getY(3),right.attributes.uv.getY(0));
});
