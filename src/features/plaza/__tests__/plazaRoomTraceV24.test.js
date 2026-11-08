import test from 'node:test';import assert from 'node:assert/strict';
import {safePlazaTraceV24,createPlazaRoomTraceV24} from '../runtime/plazaRoomTraceV24.js';
test('trace drops identity, message, token, URL and arbitrary strings',()=>{
 const detail={count:2,memberId:'private',token:'secret',body:'chat',url:'secret',reason:'user-controlled',error:'secret'};
 assert.deepEqual(safePlazaTraceV24('room-enter',detail),{event:'room-enter',count:2});
 assert.equal(safePlazaTraceV24('private',detail),null);
});
test('offline queue bounded, persists across renderer reload, removes only acknowledged events',()=>{
 let saved='',time=100000;const storage={getItem:()=>saved,setItem:(k,v)=>saved=v};
 let trace=createPlazaRoomTraceV24({storage,now:()=>time});for(let i=0;i<100;i++)trace.record('room-update',{count:2});assert.equal(trace.pending(),64);
 trace=createPlazaRoomTraceV24({storage,now:()=>time});assert.equal(trace.pending(),64);
 let ack;trace.setSink((rows,done)=>{assert.equal(rows.length,12);ack=done;});trace.record('disconnect',{reason:'ping timeout'});ack(true);assert.equal(trace.pending(),53);
 time+=3600001;assert.equal(createPlazaRoomTraceV24({storage,now:()=>time}).pending(),0);
});
test('storage failure and unavailable diagnostics do not throw or change room state',()=>{
 const trace=createPlazaRoomTraceV24({storage:{getItem(){throw Error()},setItem(){throw Error()}}});
 trace.setSink(()=>{throw Error()});assert.doesNotThrow(()=>trace.record('context-lost'));assert.equal(trace.pending(),1);
});
