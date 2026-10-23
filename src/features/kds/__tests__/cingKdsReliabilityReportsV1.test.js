import test from 'node:test';import assert from 'node:assert/strict';
import {buildKdsCsvReportV1} from '../cingKdsCsvReportsV1.js';
import {createKdsOperationsSessionV1,adaptKdsOperationsSnapshotV1} from '../cingKdsOperationsSessionV1.js';
const branch={pos_parent:'BRAND-DQIR',pos_id:'109664'};
function source(){return {canReport:true,success:true,branch,sampled_at:'2026-10-23T06:00:00Z',history_range:{from:'2026-10-22T00:00:00Z',to:'2026-10-23T00:00:00Z'},history:[],alerts:[],performance:[],policy:{},capabilities:{transitions_enabled:true,can_prepare:true,can_serve:true},serving:[],preparation:[{cup_id:'cup',order_id:'bill',status:'pending',version:0,item_name:'Tea',elapsed_minutes:1,severity:'normal'}]};}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('CSV safely exports Vietnamese names, embedded quotes/newlines and Excel formula-like invoice numbers',()=>{
 const data={...source(),history:[{tran_no:'=HYPERLINK("evil")',order_id:'invoice',started_at:source().history_range.from,completed_at:source().history_range.to,duration_minutes:10,cup_count:3,sla_severity:'warning'}]};
 const csv=buildKdsCsvReportV1(data);assert.equal(csv[0],'\ufeff');assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('""evil""'));assert.ok(csv.includes('Số phần/món'));assert.ok(csv.includes('23/10/2026'));
 const summary=buildKdsCsvReportV1(data,'summary');assert.ok(summary.includes('"Tổng phần/món","3"'));assert.ok(summary.includes('"P90 phút","10"'));
});
test('CSV active report counts unprepared/prepared/served independently and never merges duplicate invoice numbers',()=>{
 const data={...source(),bills:[{order_id:'a',tran_no:'123',cups:[{status:'pending'},{status:'prepared'},{status:'served'}]},{order_id:'b',tran_no:'123',cups:[{status:'pending'}]}]};
 const csv=buildKdsCsvReportV1(data,'active');assert.match(csv,/"123","a"/);assert.match(csv,/"123","b"/);assert.match(csv,/"3","1","1","1"/);
});
test('CSV requires authoritative range; empty completion report remains a valid zero summary',()=>{
 assert.throws(()=>buildKdsCsvReportV1({...source(),history_range:null}));assert.ok(buildKdsCsvReportV1(source(),'summary').includes('"Tổng phần\/món","0"'));
});
test('granular preparation and serving capability independently locks each queue',()=>{
 const data=source();data.capabilities.can_prepare=false;
 data.serving=[{...data.preparation[0],cup_id:'other',status:'prepared'}];
 const value=adaptKdsOperationsSnapshotV1(data,branch);assert.equal(value.preparation[0].transition_ready,false);assert.equal(value.serving[0].transition_ready,true);
});
test('transient stream loss keeps rows; fresh HTTP recovery restores actions without starting normal polling',async()=>{
 let accept,offline,state,calls=0;const scheduled=[];
 const api={events:async(b,h,s,onData,onOffline)=>{accept=onData;offline=onOffline;},snapshot:async()=>{calls++;return source();}};
 const session=createKdsOperationsSessionV1({api,branch,onState:x=>state=x,schedule:fn=>{scheduled.push(fn);return scheduled.length;},cancel:()=>{}});
 session.start();await accept(source());const previous=state.snapshot;offline({code:'KDS_STREAM_TRANSPORT'});assert.equal(state.snapshot,previous);assert.equal(state.connectionState,'offline');
 await flush();assert.equal(calls,1);assert.equal(state.connectionState,'online');assert.ok(state.syncNotice.includes('dự phòng'));assert.equal(scheduled.length,1);
 await accept(source());assert.equal(state.syncNotice,'');session.stop();
});
test('authority denial clears rows immediately even during reconnect, and cannot authorize a mutation',async()=>{
 let accept,offline,state;const api={events:async(b,h,s,onData,onOffline)=>{accept=onData;offline=onOffline;},snapshot:async()=>{throw {response:{data:{code:'KDS_OPS_FORBIDDEN'}}};}};
 const session=createKdsOperationsSessionV1({api,branch,onState:x=>state=x,schedule:()=>1,cancel:()=>{}});session.start();await accept(source());offline({code:'KDS_OPS_FORBIDDEN'});
 assert.equal(state.snapshot,null);await flush();assert.equal(state.error,'KDS_OPS_FORBIDDEN');await assert.rejects(session.transition({cup_id:'cup',order_id:'bill',target_status:'prepared'}));session.stop();
});

test('CSV export requires explicit report capability, even if history was previously loaded',()=>{assert.throws(()=>buildKdsCsvReportV1({...source(),canReport:false}));});
