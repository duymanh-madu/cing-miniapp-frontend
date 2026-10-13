import test from 'node:test';import assert from 'node:assert/strict';
import {plazaNameplateScaleV19} from '../scene/plazaNameplateScaleV19.js';
import {installPlazaRoomTouchGuardV19} from '../scene/plazaRoomTouchGuardV19.js';
test('overhead badge and name scale with actor perspective rather than remaining fixed',()=>{
 const value={depth:8,fov:45,viewportHeight:800};const near=plazaNameplateScaleV19(value),far=plazaNameplateScaleV19({...value,depth:16});assert.ok(Math.abs(near/far-2)<1e-10);
 assert.ok(plazaNameplateScaleV19({...value,fov:60})<near);assert.ok(plazaNameplateScaleV19({...value,viewportHeight:400})<near);assert.equal(plazaNameplateScaleV19({...value,depth:-1}),0);
});
test('room guard blocks edge defaults and bubbling while preserving editable chat and interior touches',()=>{
 const listeners=new Map(),root={addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k),getBoundingClientRect:()=>({left:0,right:400})};
 const cleanup=installPlazaRoomTouchGuardV19(root);let prevented=0,stopped=0;
 const event={type:'touchstart',cancelable:true,touches:[{clientX:8}],target:{closest:()=>null},preventDefault:()=>prevented++,stopPropagation:()=>stopped++};
 listeners.get('touchstart')(event);assert.equal(prevented,1);assert.equal(stopped,1);
 listeners.get('touchstart')({...event,touches:[{clientX:150}]});assert.equal(prevented,1);assert.equal(stopped,2);
 listeners.get('touchstart')({...event,target:{closest:()=>({})}});assert.equal(prevented,1);assert.equal(stopped,2);
 cleanup();assert.equal(listeners.size,0);
});
