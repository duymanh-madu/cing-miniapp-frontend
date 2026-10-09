import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3,Spherical} from 'three';
import {enforcePlazaCameraV8,groundFootprintV8,plazaCameraLimitV8} from '../scene/plazaCameraV8.js';
import {selectPlazaRoomChatV8} from '../pages/plazaChatScopeV8.js';
test('wide camera keeps every ground corner inside the map, including gate and corners',()=>{
 const bounds={minX:-19.8,maxX:38.8,minZ:-37.5,maxZ:12.8};
 for(const aspect of [.46,1,2.16])for(const point of [[0,1,0],[-19,1,12],[38,1,-37]])for(const angle of [0,1.5,3,4.5]){
  const camera=new PerspectiveCamera(45,aspect,.08,120),controls={target:new Vector3(...point),minDistance:2.2,maxDistance:plazaCameraLimitV8(aspect)};
  camera.position.copy(controls.target).add(new Vector3().setFromSpherical(new Spherical(40,Math.PI*.47,angle)));
  enforcePlazaCameraV8(camera,controls,bounds);const box=groundFootprintV8(camera);assert.ok(box);
  assert.ok(box.min.x>=bounds.minX+.49&&box.max.x<=bounds.maxX-.49);
  assert.ok(box.min.z>=bounds.minZ+.49&&box.max.z<=bounds.maxZ-.49);
 }
});
test('wide view is available while close view keeps its distance',()=>{
 const c=new PerspectiveCamera(45,.46,.08,120),target=new Vector3(5,1,-10),controls={target,minDistance:2.2,maxDistance:42};
 c.position.copy(target).add(new Vector3(0,25,20));enforcePlazaCameraV8(c,controls,{minX:-19.8,maxX:38.8,minZ:-37.5,maxZ:12.8});assert.ok(c.position.distanceTo(target)>15);
 c.position.copy(target).add(new Vector3(0,2,2));const distance=c.position.distanceTo(target);enforcePlazaCameraV8(c,controls,{minX:-19.8,maxX:38.8,minZ:-37.5,maxZ:12.8});assert.ok(Math.abs(c.position.distanceTo(target)-distance)<1e-8);
});
test('All channel cannot expose another room history or lobby history',()=>{
 const messages=[{messageId:'a',roomId:'room1'},{messageId:'b',roomId:'room2'},{messageId:'c'}];
 assert.deepEqual(selectPlazaRoomChatV8({roomId:'room1'},messages),[messages[0]]);
 assert.deepEqual(selectPlazaRoomChatV8(null,messages),[]);
 assert.deepEqual(selectPlazaRoomChatV8({roomId:'room2'},messages),[messages[1]]);
});
