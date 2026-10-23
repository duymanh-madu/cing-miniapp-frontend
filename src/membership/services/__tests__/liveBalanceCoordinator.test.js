import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveBalanceCoordinator } from '../liveBalanceCoordinator.js';
const deferred = () => { let resolve; const promise = new Promise(r => {resolve=r;}); return {promise,resolve}; };
test('a committed mutation fences an older read; follow-up can decrease the balance', async () => {
  const old = deferred(), fresh = deferred(), applied=[]; let calls=0;
  const c=createLiveBalanceCoordinator({currentOwner:()=> 'alice',read:()=> ++calls===1?old.promise:fresh.promise,apply:s=>applied.push(s.points)});
  const p=c.invalidate(); c.invalidate(); c.invalidate();
  old.resolve({points:100}); await Promise.resolve();
  assert.deepEqual(applied,[]); fresh.resolve({points:81}); await p;
  assert.equal(calls,2); assert.deepEqual(applied,[81]);
});
test('account switch discards prior account response and reads new owner', async()=>{
  let owner='alice'; const first=deferred(),applied=[];
  const c=createLiveBalanceCoordinator({currentOwner:()=>owner,read:p=>p==='alice'?first.promise:Promise.resolve({points:20}),apply:(s,p)=>applied.push([p,s.points])});
  const p=c.invalidate(); owner='bob'; c.invalidate();first.resolve({points:999});await p;
  assert.deepEqual(applied,[['bob',20]]);
});
test('network failure keeps last confirmed balance and later retry recovers',async()=>{
  let fail=true;const applied=[];
  const c=createLiveBalanceCoordinator({currentOwner:()=> 'alice',read:async()=>{if(fail)throw Error();return {points:120};},apply:s=>applied.push(s.points)});
  await c.invalidate();assert.deepEqual(applied,[]);fail=false;await c.invalidate();assert.deepEqual(applied,[120]);
});
test('logout and stop prevent pending balance from entering any store',async()=>{
  let owner='alice'; const first=deferred(),applied=[];
  const c=createLiveBalanceCoordinator({currentOwner:()=>owner,read:()=>first.promise,apply:s=>applied.push(s)});
  const p=c.invalidate();owner='';c.invalidate();c.stop();first.resolve({points:99});await p;assert.deepEqual(applied,[]);
});
test('a slow obsolete HTTP read is cancelled so a completed mutation can reconcile promptly',async()=>{
 let calls=0,aborted=false;const applied=[];
 const c=createLiveBalanceCoordinator({currentOwner:()=> 'alice',read:(_owner,{signal})=>{
   if(++calls===1)return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(Error('aborted'));},{once:true}));
   return Promise.resolve({points:81});
 },apply:s=>applied.push(s.points)});
 const p=c.invalidate();c.invalidate();await p;assert.equal(aborted,true);assert.equal(calls,2);assert.deepEqual(applied,[81]);
});
