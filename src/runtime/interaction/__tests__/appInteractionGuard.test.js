import test from 'node:test';import assert from 'node:assert/strict';import {installAppInteractionGuard} from '../appInteractionGuard.js';
function fixture(){const handlers=new Map();let cleared=0;const doc={addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:(name,fn)=>{assert.equal(handlers.get(name),fn);handlers.delete(name);}};const win={getSelection:()=>({rangeCount:1,anchorNode:{parentElement:{closest:()=>null}},removeAllRanges:()=>cleared++})};return {handlers,doc,win,cleared:()=>cleared};}
const target=editable=>({closest:()=>editable?{}:null});
test('left-edge defaults are cancelled; ordinary page scrolling is untouched',()=>{
 const f=fixture(),off=installAppInteractionGuard(f.doc,f.win);let prevented=0;
 f.handlers.get('touchstart')({target:target(false),touches:[{clientX:8}],cancelable:true,preventDefault:()=>prevented++});
 f.handlers.get('touchmove')({cancelable:true,preventDefault:()=>prevented++});assert.equal(prevented,2);
 f.handlers.get('touchend')();f.handlers.get('touchstart')({target:target(false),touches:[{clientX:150}],cancelable:true,preventDefault:()=>prevented++});f.handlers.get('touchmove')({cancelable:true,preventDefault:()=>prevented++});assert.equal(prevented,2);off();assert.equal(f.handlers.size,0);
});
test('press-to-copy and callouts are blocked outside editable fields; editing is preserved',()=>{
 const f=fixture(),off=installAppInteractionGuard(f.doc,f.win);let prevented=0;
 for(const name of ['contextmenu','selectstart','copy','cut','dragstart']){f.handlers.get(name)({target:target(false),preventDefault:()=>prevented++});f.handlers.get(name)({target:target(true),preventDefault:()=>prevented++});}
 assert.equal(prevented,5);f.handlers.get('selectionchange')();assert.equal(f.cleared(),1);off();
});
