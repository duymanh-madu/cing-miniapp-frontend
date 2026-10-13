import test from 'node:test';
import assert from 'node:assert/strict';
import { addPresenceSample, samplePresence } from '../scene/plazaPresenceMotionV2.js';
import { mergePlazaPresenceV19 } from '../runtime/plazaPresenceMergeV19.js';
import { createPlazaRealtimeClientV1 } from '../runtime/plazaRealtimeClientV1.js';

const actor=(seq,x=seq,id='session-1',extra={})=>({memberId:'member-1',presenceId:id,seq,x,y:0,z:0,heading:0,motion:'walk',speed:1,seatId:null,...extra});
const samples=(tuples)=>tuples.reduce((all,[seq,x,time])=>addPresenceSample(all,actor(seq,x),time),[]);
const snapshot=(members=[],selfId='viewer')=>({members,selfId});

test('ordinary 100ms server samples preserve original 120ms interpolation',()=>{
 const points=samples([[1,0,0],[2,1,100]]);
 assert.equal(samplePresence(points,170).x,.5);
 assert.equal(samplePresence(points,10000).x,1);
});
test('long silent period cannot cause instant 88% positional jump at packet receipt',()=>{
 const points=samples([[1,0,0],[2,10,1000]]);
 assert.equal(samplePresence(points,1000).x,0);
});
test('long gap catches up continuously over bounded interval without overshoot',()=>{
 const points=samples([[1,0,0],[2,10,1000]]);
 assert.ok(Math.abs(samplePresence(points,1060).x-5)<1e-9);
 assert.equal(samplePresence(points,1120).x,10);
 assert.equal(samplePresence(points,2000).x,10);
});
test('long gap never predicts server-external location even with heading wrap',()=>{
 let s=addPresenceSample([],actor(1,2,'p',{heading:3}),0);
 s=addPresenceSample(s,actor(2,8,'p',{heading:-3}),1000);
 for(const clock of [1000,1030,1050,1080,1100,1120,2000]){
  const value=samplePresence(s,clock);
  assert.ok(value.x>=2 && value.x<=8);
  assert.ok(Number.isFinite(value.heading));
 }
});
test('a position burst following long outage remains bounded to accepted snapshots',()=>{
 let s=samples([[1,0,0],[2,8,900],[3,9,1000]]);
 for(let t=900;t<=1250;t+=10){const v=samplePresence(s,t);assert.ok(v.x>=0 && v.x<=9);}
});
test('stale and duplicate motion packets preserve queue identity',()=>{
 let s=addPresenceSample([],actor(3,2),3);
 assert.equal(addPresenceSample(s,actor(2,10),4),s);
 assert.equal(addPresenceSample(s,actor(3,2),5),s);
});
test('seat change resets history rather than visually walking across the room',()=>{
 let s=addPresenceSample([],actor(1,1),0);
 s=addPresenceSample(s,actor(2,20,'session-1',{seatId:'seat-1',motion:'sit'}),100);
 assert.equal(s.length,1);
 assert.equal(samplePresence(s,100).x,20);
});
test('new incarnation resets samples; another user has independent timeline',()=>{
 let s=addPresenceSample([],actor(2,2),10);
 const other=addPresenceSample([],actor(2,4,'other'),11);
 s=addPresenceSample(s,actor(0,0,'session-2'),20);
 assert.equal(s.length,1);assert.equal(s[0].value.x,0);
 assert.equal(other[0].value.x,4);
});
test('motion samples keep bounded history at eight entries',()=>{
 const points=Array.from({length:30},(_,i)=>[i, i*0.1,i*100]);
 assert.equal(samples(points).length,8);
});
test('shortest heading turn across pi remains stable in normal 100ms case',()=>{
 let s=addPresenceSample([],actor(1,0,'p',{heading:3}),0);
 s=addPresenceSample(s,actor(2,1,'p',{heading:-3}),100);
 assert.ok(Math.abs(samplePresence(s,170).heading-Math.PI)<1e-3);
});

test('unchanged delta presence returns null, preventing React notifications',()=>{
 const prior=actor(1,1,'p',{motion:'idle'});
 assert.equal(mergePlazaPresenceV19(snapshot([prior]),{roomId:'room',selfId:'viewer',members:[{...prior}]}),null);
});
test('new position and sequence produces immutable new membership',()=>{
 const prior=actor(1,1);const change=mergePlazaPresenceV19(snapshot([prior]),{selfId:'viewer',members:[actor(2,2)]});
 assert.equal(change.members[0].x,2);assert.equal(change.members[0].seq,2);
 assert.notEqual(change.members[0],prior);assert.ok(Object.isFrozen(change.members));
});
test('stale deltas are ignored without restarting remote motion',()=>{
 assert.equal(mergePlazaPresenceV19(snapshot([actor(3,3)]),{selfId:'viewer',members:[actor(1,1)]}),null);
});
test('same-sequence idle metadata update is retained when genuinely changed',()=>{
 const old=actor(2,2,'p',{motion:'idle',identityRevision:1});
 const value=actor(2,2,'p',{motion:'idle',identityRevision:2});
 const next=mergePlazaPresenceV19(snapshot([old]),{selfId:'viewer',members:[value]});
 assert.equal(next.members[0].identityRevision,2);
});
test('identical authoritative full snapshot reuses existing actor references',()=>{
 const old=actor(2,3);
 assert.equal(mergePlazaPresenceV19(snapshot([old]),{selfId:'viewer',full:true,members:[{...old}]}),null);
});
test('full snapshot removes missing players and publishes one change',()=>{
 const next=mergePlazaPresenceV19(snapshot([actor(1),{...actor(1),memberId:'member-2'}]),{selfId:'viewer',full:true,members:[actor(1)]});
 assert.equal(next.members.length,1);
});
test('removal of another actor retains unchanged actor object identity',()=>{
 const one=actor(1,1);const two={...actor(1,2),memberId:'member-2'};
 const next=mergePlazaPresenceV19(snapshot([one,two]),{selfId:'viewer',members:[],removed:['member-2']});
 assert.deepEqual(next.members,[one]);assert.equal(next.members[0],one);
});
test('self membership identity change is never silently suppressed',()=>{
 const old=actor(1,1);
 const next=mergePlazaPresenceV19(snapshot([old]),{selfId:'other',members:[{...old}]});
 assert.equal(next.selfId,'other');assert.equal(next.members[0],old);
});
test('two players: one moves; unchanged other preserves reference',()=>{
 const left=actor(1,1);const right={...actor(1,1,'session-right'),memberId:'member-right'};
 const next=mergePlazaPresenceV19(snapshot([left,right]),{selfId:'viewer',members:[{...right,seq:2,x:3}]});
 assert.equal(next.members[0],left);assert.equal(next.members[1].x,3);
});
test('malformed packet and bad member ID do not overwrite state',()=>{
 assert.equal(mergePlazaPresenceV19(snapshot([actor(1,1)]),{selfId:'viewer',members:[{memberId:5,seq:3}]}),null);
 assert.equal(mergePlazaPresenceV19(snapshot([]),{selfId:'viewer',members:'bad'}),null);
});
test('actual realtime client emits no snapshot event for duplicate idle packet',()=>{
 const handlers=new Map();let notificationCount=0;
 const socket={connected:false,active:false,io:{reconnection:()=>{}},on:(event,fn)=>handlers.set(event,fn),off:(event)=>handlers.delete(event),disconnect:()=>{},connect:()=>{},volatile:{emit:()=>{}}};
 const client=createPlazaRealtimeClientV1({url:'https://plaza.example/',ioFactory:()=>socket,getToken:()=>'',lifecycle:null});
 const unsub=client.subscribe(()=>notificationCount++);
 handlers.get('plaza:room')({room:{roomId:'one'}});
 const data={roomId:'one',selfId:'viewer',members:[actor(1,1,'p',{motion:'idle'})]};
 handlers.get('plaza:presence')(data);
 const afterFirst=notificationCount;
 handlers.get('plaza:presence')({...data,members:data.members.map(v=>({...v}))});
 assert.equal(notificationCount,afterFirst);
 handlers.get('plaza:presence')({...data,members:[actor(2,2,'p',{motion:'walk'})]});
 assert.equal(notificationCount,afterFirst+1);
 unsub();client.dispose();
});
