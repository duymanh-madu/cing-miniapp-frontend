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
test('room selection is cancelled, editable input selection remains, listeners clean up',()=>{
 const previousDocument=globalThis.document,previousSelection=globalThis.getSelection;const docListeners=new Map(),listeners=new Map();let removed=0,editable=false;
 globalThis.document={addEventListener:(k,f)=>docListeners.set(k,f),removeEventListener:k=>docListeners.delete(k)};
 globalThis.getSelection=()=>({rangeCount:1,anchorNode:{parentElement:{closest:()=>editable?{}:null}},removeAllRanges:()=>removed++});
 const root={addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k),contains:()=>true,getBoundingClientRect:()=>({left:0,right:400})};
 try{const cleanup=installPlazaRoomTouchGuardV19(root);docListeners.get('selectionchange')();assert.equal(removed,1);editable=true;docListeners.get('selectionchange')();assert.equal(removed,1);let prevented=0;listeners.get('selectstart')({target:{closest:()=>null},preventDefault:()=>prevented++});assert.equal(prevented,1);cleanup();assert.equal(docListeners.size,0);assert.equal(listeners.size,0);}finally{globalThis.document=previousDocument;globalThis.getSelection=previousSelection;}
});
