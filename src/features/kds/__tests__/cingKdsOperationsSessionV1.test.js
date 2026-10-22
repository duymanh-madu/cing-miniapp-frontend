import test from "node:test";import assert from "node:assert/strict";
import {createKdsOperationsSessionV1,adaptKdsOperationsSnapshotV1} from "../cingKdsOperationsSessionV1.js";
const branch={pos_parent:"BRAND-DQIR",pos_id:"109664"};
function data(){return {success:true,branch,sampled_at:"2026-10-23T01:00:00Z",history:[],alerts:[],performance:[],
  capabilities:{transitions_enabled:true},policy:{},serving:[],preparation:[{
    cup_id:"cup-test",order_id:"order-test",status:"pending",version:1,
    item_name:"Test",elapsed_minutes:1,severity:"normal"}]};}
function setup(api){let state;const scheduled=[];const session=createKdsOperationsSessionV1({api,branch,onState:x=>{state=x;},
  schedule:fn=>{scheduled.push(fn);return scheduled.length;},cancel:()=>{},actionKey:()=>"stable-action-key-test"});
  return {session,get state(){return state;},scheduled};}
test("branch mismatch and missing queues never publish",()=>{
  assert.throws(()=>adaptKdsOperationsSnapshotV1({...data(),branch:{...branch,pos_id:"999"}},branch));
  assert.throws(()=>adaptKdsOperationsSnapshotV1({...data(),serving:null},branch));
});
test("server capability plus version required; old read adapter remains non-authorizing",()=>{
  assert.equal(adaptKdsOperationsSnapshotV1(data(),branch).preparation[0].transition_ready,true);
  assert.equal(adaptKdsOperationsSnapshotV1({...data(),capabilities:{}},branch).preparation[0].transition_ready,false);
});
test("failed refresh clears stale rows and reconnect restores a fresh snapshot",async()=>{
  let fail=false;const x=setup({snapshot:async()=>{if(fail)throw Error();return data();}});
  await x.session.start();assert.equal(x.state.connectionState,"online");
  fail=true;await x.session.refresh();assert.equal(x.state.snapshot,null);assert.equal(x.state.connectionState,"offline");
  fail=false;await x.session.refresh();assert.equal(x.state.connectionState,"online");x.session.stop();
});
test("overlapping refresh is serialized and invalidation requests one fresh follow-up",async()=>{
  let resolve,calls=0,active=0,max=0;
  const x=setup({snapshot:async()=>{calls++;max=Math.max(max,++active);if(calls===1)await new Promise(r=>{resolve=r;});active--;return data();}});
  const first=x.session.start();const second=x.session.refresh();resolve();await first;await second;
  assert.equal(max,1);assert.equal(calls,2);x.session.stop();
});
test("stopping discards late responses and schedules nothing",async()=>{
  let resolve;const x=setup({snapshot:()=>new Promise(r=>{resolve=r;})});
  const first=x.session.start();x.session.stop();resolve(data());await first;
  assert.equal(x.state.snapshot,null);assert.equal(x.scheduled.length,0);
});
test("ambiguous mutation retries reuse exact action key and expected version, with no optimistic update",async()=>{
  const requests=[];let fail=true;
  const x=setup({snapshot:async()=>data(),transition:async(b,p)=>{requests.push({...p});if(fail)throw Error("timeout");return {success:true};}});
  await x.session.start();const command={cup_id:"cup-test",order_id:"order-test",target_status:"preparing"};
  await assert.rejects(x.session.transition(command));assert.equal(x.state.snapshot.preparation[0].status,"pending");
  fail=false;await x.session.transition(command);assert.deepEqual(requests[0],requests[1]);assert.equal(requests[0].expected_version,1);
  x.session.stop();
});
test("stale status, missing capability or wrong order blocks mutation",async()=>{
  let mutations=0;const x=setup({snapshot:async()=>data(),transition:()=>{mutations++;}});await x.session.start();
  await assert.rejects(x.session.transition({cup_id:"cup-test",order_id:"forged",target_status:"preparing"}));
  await assert.rejects(x.session.transition({cup_id:"cup-test",order_id:"order-test",target_status:"served"}));
  assert.equal(mutations,0);x.session.stop();
});
test("offline clears rows immediately and reconnect discards pre-disconnect response",async()=>{
  let resolve,calls=0;const x=setup({snapshot:async()=>{calls++;if(calls===2)return new Promise(r=>{resolve=r;});return data();}});
  await x.session.start();const pending=x.session.refresh();x.session.disconnect();
  assert.equal(x.state.snapshot,null);assert.equal(x.state.connectionState,"offline");
  resolve(data());await pending;assert.equal(x.state.snapshot,null);
  await x.session.refresh();assert.equal(x.state.connectionState,"online");x.session.stop();
});
