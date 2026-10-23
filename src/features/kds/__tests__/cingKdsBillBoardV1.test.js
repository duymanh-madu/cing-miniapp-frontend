import test from 'node:test';import assert from 'node:assert/strict';
import {buildKdsBillBoardV1} from '../cingKdsBillBoardV1.js';
import {createKdsOperationsSessionV1} from '../cingKdsOperationsSessionV1.js';
import {consumeKdsEventsV1} from '../cingKdsEventStreamV1.js';
const branch={pos_parent:'BRAND-DQIR',pos_id:'109664'};
const cup=(id,status='pending',order='bill-1')=>({cup_id:id,order_id:order,tran_no:'123',table_name:'Bàn 4',item_name:'Tea',item_group:'Tea',status,version:0,elapsed_minutes:3,severity:'normal'});
const snapshot=()=>({success:true,branch,preparation:[cup('a'),cup('b')],serving:[cup('c','prepared')],bills:[{order_id:'bill-1',tran_no:'123',table_name:'Bàn 4',cups:[cup('a'),cup('b'),cup('c','prepared'),cup('d','served')]}],sampled_at:'2026-10-23T05:00:00Z',capabilities:{transitions_enabled:true},history:[],alerts:[],performance:[]});
test('invoice progress counts every cup including already served; preparation clears only completed cups',()=>{
 const s=snapshot();let rows=buildKdsBillBoardV1({...s});assert.equal(rows.length,1);assert.equal(rows[0].total,4);assert.equal(rows[0].completed,2);assert.equal(rows[0].served,1);assert.equal(rows[0].visibleCups.length,2);
 rows=buildKdsBillBoardV1({...s,mode:'serving'});assert.equal(rows[0].visibleCups.length,4);assert.equal(rows[0].progress,'Đã pha một phần');
});
test('serving shows wholly unprepared invoices; invoice identity does not merge repeated bill numbers',()=>{
 const rows=buildKdsBillBoardV1({preparation:[cup('a'),cup('b','pending','bill-2')],mode:'serving'});
 assert.equal(rows.length,2);assert.ok(rows.every(x=>x.progress==='Chờ pha'));assert.equal(rows[0].total,1);
});
test('search by table/card and group preserves full invoice progress denominator',()=>{
 const s=snapshot();s.preparation[0].item_group='Coffee';s.bills[0].cups[0].item_group='Coffee';
 const rows=buildKdsBillBoardV1({...s,group:'Coffee',query:'bàn 4'});assert.equal(rows[0].visibleCups.length,1);assert.equal(rows[0].total,4);
});
test('stream mode never schedules browser polling, background manual refresh keeps buttons operable',async()=>{
 let accept,offline,state,resolver;const scheduled=[];
 const api={events:async(b,h,signal,onData,onOffline)=>{accept=onData;offline=onOffline;},snapshot:()=>new Promise(r=>{resolver=r;}),transition:async()=>({success:true})};
 const session=createKdsOperationsSessionV1({api,branch,onState:s=>state=s,schedule:fn=>scheduled.push(fn),cancel:()=>{}});
 session.start();await accept(snapshot());const before=state.snapshot;const refresh=session.refresh();assert.equal(state.loading,false);assert.equal(state.snapshot,before);
 resolver(snapshot());await refresh;assert.equal(scheduled.length,0);offline();assert.ok(state.snapshot);assert.equal(state.connectionState,"offline");session.stop();
});
test('two different cups may finish concurrently; duplicate click on same cup is locked',async()=>{
 let accept,state;const pending=[];
 const api={events:async(b,h,s,onData)=>{accept=onData;},snapshot:async()=>snapshot(),transition:async(b,p)=>new Promise(r=>pending.push({p,r}))};
 const session=createKdsOperationsSessionV1({api,branch,onState:s=>state=s,actionKey:()=> 'idempotent-test-action'});
 session.start();await accept(snapshot());const cmd=id=>({cup_id:id,order_id:'bill-1',target_status:'prepared'});
 const one=session.transition(cmd('a')),two=session.transition(cmd('b'));
 await assert.rejects(session.transition(cmd('a')));assert.deepEqual(state.busyCupIds,['a','b']);assert.equal(pending.length,2);
 pending.forEach(x=>x.r({success:true}));await Promise.all([one,two]);assert.deepEqual(state.busyCupIds,[]);session.stop();
});
test('late HTTP snapshot cannot overwrite newer pushed state',async()=>{
 let accept,resolver,state;const api={events:async(b,h,s,onData)=>{accept=onData;},snapshot:()=>new Promise(r=>resolver=r)};
 const session=createKdsOperationsSessionV1({api,branch,onState:s=>state=s});session.start();await accept(snapshot());const pending=session.refresh();
 const newer={...snapshot(),sampled_at:'2026-10-23T05:01:00Z'};await accept(newer);resolver(snapshot());await pending;
 assert.equal(state.snapshot.sampled_at,newer.sampled_at);session.stop();
});
test('SSE parser handles chunk boundaries, heartbeat, disconnect; token is only a header',async()=>{
 const controller=new AbortController();const frames=['event: snapshot\nda','ta: {"value":1}\n\nevent: heartbeat\ndata: {}\n\n'];let snapshots=0,offline=0;
 await consumeKdsEventsV1({url:()=>'/events?pos_id=109664',headers:{Authorization:'Bearer test'},signal:controller.signal,
  onSnapshot:async value=>{assert.equal(value.value,1);snapshots++;},onOffline:()=>{offline++;controller.abort();},
  fetchFn:async(url,options)=>{assert.ok(!url.includes('Bearer'));assert.equal(options.headers.Authorization,'Bearer test');
   let index=0;return {ok:true,headers:new Headers({'Content-Type':'text/event-stream'}),body:{getReader:()=>({read:async()=>index<frames.length?{value:new TextEncoder().encode(frames[index++])}:{done:true},cancel:async()=>{}})}};}
 });assert.equal(snapshots,1);assert.equal(offline,1);
});
