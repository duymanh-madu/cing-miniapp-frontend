'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

let modulePromise;
function clientModule(){
  return modulePromise ||= (async()=>{
    const file=process.env.CING_BLOCK08C04_TARGET || path.join(__dirname,'..','runtime','plazaRealtimeClientV1.js');
    return import(pathToFileURL(file).href);
  })();
}
const delay=(ms=8)=>new Promise(resolve=>setTimeout(resolve,ms));
class FakeLifecycle{
  constructor(){this.hidden=false;this.listeners=new Map();}
  addEventListener(e,cb){this.listeners.set(e,cb);}
  removeEventListener(e,cb){if(this.listeners.get(e)===cb)this.listeners.delete(e);}
  visible(hidden){this.hidden=hidden;this.listeners.get('visibilitychange')?.();}
}
class FakeSocket{
  constructor(){
    this.connected=false;
    this.active=false;
    this.handlers=new Map();
    this.handlersLog=[];
    this.connectCount=0;
    this.disconnectCount=0;
    this.reconnectSetting=true;
    this.authTokens=[];
    this.requests=[];
    this.responses=new Map();
    this.defaultResume={ok:true,data:{room:null}};
    this.volatile={emit:(event,payload)=>this.emit(event,payload)};
    this.io={reconnection:(flag)=>{
      if(flag===undefined)return this.reconnectSetting;
      this.reconnectSetting=flag;
      return this.io;
    }};
  }
  on(event,cb){this.handlers.set(event,cb);}
  off(event,cb){if(this.handlers.get(event)===cb)this.handlers.delete(event);}
  fire(event,...args){this.handlers.get(event)?.(...args);}
  connect(){
    this.connectCount++;
    this.active=true;
    this.options.auth(x=>this.authTokens.push(x?.token));
    // Transport is externally controlled in tests.
    return this;
  }
  accept(){this.connected=true;this.active=true;this.fire('connect');}
  drop(reason='transport close'){
    this.connected=false;
    this.active=reason==='transport close';
    this.fire('disconnect',reason);
  }
  disconnect(){
    this.disconnectCount++;
    if(this.connected){this.connected=false;this.active=false;this.fire('disconnect','io client disconnect');}
  }
  emit(event,payload,ack){
    this.requests.push({event,payload});
    if(typeof ack!=='function')return;
    if(this.responses.has(event)){
      const behavior=this.responses.get(event);
      if(typeof behavior==='function')behavior(ack);
      else queueMicrotask(()=>ack(behavior));
    }else if(event==='plaza:resume')queueMicrotask(()=>ack(this.defaultResume));
    else queueMicrotask(()=>ack({ok:true,data:{}}));
  }
}
async function setup(options={}) {
 const {createPlazaRealtimeClientV1}=await clientModule();
 const socket=new FakeSocket();
 const lifecycle=new FakeLifecycle();
 let token='initial-valid-token';
 const client=createPlazaRealtimeClientV1({
   url:'https://plaza.example.test/',
   ioFactory:(url,config)=>{socket.url=url;socket.options=config;return socket;},
   getToken:()=>token,
   timeoutMs:60,
   recoveryDelayMs:2,
   lifecycle,
   ...options,
 });
 return {socket,lifecycle,client,setToken:v=>{token=v;}};
}
function room(id='room-kinhbac'){return {roomId:id, name:'Đình Bảng', memberCount:2};}

// These tests reproduce the true Socket.IO `io server disconnect` condition
// (automatic reconnect disabled), rather than only ordinary network drops.
test('io server disconnect triggers an authenticated manual reconnect without evicting local room',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());
 x.client.connect();x.socket.accept();await delay();
 const old=room();x.socket.fire('plaza:room',{room:old});
 x.socket.defaultResume={ok:true,data:{room:old}};
 const before=x.socket.connectCount;
 x.socket.drop('io server disconnect');
 assert.equal(x.client.getSnapshot().room,old);
 assert.equal(x.client.getSnapshot().status,'disconnected');
 await delay(15);
 assert.ok(x.socket.connectCount>before,'must call connect, Socket.IO does not retry this reason');
 x.socket.accept();await delay();
 assert.equal(x.client.getSnapshot().status,'connected');
 assert.equal(x.client.getSnapshot().room?.roomId,old.roomId);
});

test('transient network drop is handled by Socket.IO manager, no duplicate app reconnect timer',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 const before=x.socket.connectCount;
 x.socket.drop('transport close');await delay(15);
 assert.equal(x.socket.connectCount,before);
 assert.equal(x.client.getSnapshot().status,'disconnected');
});

test('authoritative resume room:null clears membership only after server ack',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 x.socket.fire('plaza:room',{room:room()});x.socket.drop('io server disconnect');
 await delay(10);x.socket.defaultResume={ok:true,data:{room:null}};
 x.socket.accept();await delay();
 assert.equal(x.client.getSnapshot().room,null);
});

test('auth token refreshed at each reconnection handshake',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 x.setToken('fresh-auth-after-drop');x.socket.drop('io server disconnect');await delay(15);
 assert.equal(x.socket.authTokens.at(-1),'fresh-auth-after-drop');
});

test('PLAZA_UNAUTHORIZED handshake blocks further retries, does not bypass server',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();
 x.socket.fire('connect_error',{data:{code:'PLAZA_UNAUTHORIZED'},message:'bad token'});
 const prior=x.socket.connectCount;await delay(20);
 assert.equal(x.socket.connectCount,prior);
 assert.equal(x.socket.reconnectSetting,false);
 assert.equal(x.client.getSnapshot().lastError,'PLAZA_UNAUTHORIZED');
});

test('server admin-disabled unavailable handshake must not be retried automatically',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();
 x.socket.fire('connect_error',{message:'PLAZA_UNAVAILABLE'});
 const before=x.socket.connectCount;await delay(20);
 assert.equal(x.socket.connectCount,before);
 assert.equal(x.socket.reconnectSetting,false);
});

test('temporary handshake PLAZA_AUTH_BUSY retries with bounded delay',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();
 x.socket.active=false; // Socket.IO middleware rejection is non-active.
 x.socket.fire('connect_error',{message:'PLAZA_AUTH_BUSY'});
 const before=x.socket.connectCount;await delay(15);
 assert.ok(x.socket.connectCount>before);
});

test('temporary plaza:resume timeout does not clear room or remount 3D',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 const original=room();x.socket.fire('plaza:room',{room:original});
 x.socket.responses.set('plaza:resume',()=>{/* deliberately no ACK */});
 x.socket.drop('io server disconnect');await delay(12);x.socket.accept();
 await delay(77);
 assert.equal(x.client.getSnapshot().room,original);
 assert.ok(['resuming','connection-error'].includes(x.client.getSnapshot().status));
});

test('temporary server PLAZA_UNAVAILABLE during resume stays retryable, never invents eviction',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 const original=room();x.socket.fire('plaza:room',{room:original});
 x.socket.responses.set('plaza:resume',{ok:false,error:{code:'PLAZA_UNAVAILABLE'}});
 x.socket.drop('io server disconnect');await delay(12);x.socket.accept();await delay(10);
 assert.equal(x.client.getSnapshot().room,original);
 assert.equal(x.socket.reconnectSetting,true);
 assert.ok(x.socket.requests.filter(v=>v.event==='plaza:resume').length>=2);
});

test('session-replaced authoritative resume clears room and stops retries',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 x.socket.fire('plaza:room',{room:room()});
 x.socket.responses.set('plaza:resume',{ok:false,error:{code:'PLAZA_SESSION_REPLACED'}});
 x.socket.drop('io server disconnect');await delay(12);x.socket.accept();await delay(8);
 assert.equal(x.client.getSnapshot().room,null);
 assert.equal(x.client.getSnapshot().lastError,'PLAZA_SESSION_REPLACED');
 assert.equal(x.socket.reconnectSetting,false);
});

test('visibility background suppresses retry then foreground can reconnect',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 x.socket.fire('plaza:room',{room:room()});
 x.lifecycle.visible(true);
 x.socket.drop('io server disconnect');const prior=x.socket.connectCount;await delay(15);
 assert.equal(x.socket.connectCount,prior);
 x.lifecycle.visible(false);assert.ok(x.socket.connectCount>prior);
});

test('dispose removes socket handlers, pending retries, and cannot reconnect',async()=>{
 const x=await setup();x.client.connect();x.socket.accept();await delay();
 x.socket.drop('io server disconnect');const before=x.socket.connectCount;
 x.client.dispose();await delay(12);
 assert.equal(x.socket.connectCount,before);
 assert.equal(x.client.getSnapshot().status,'disposed');
 assert.equal(x.socket.handlers.size,0);
 assert.equal(x.lifecycle.listeners.size,0);
});

test('socket options bound retry attempts and preserve WebView auth-on-handshake',async()=>{
 const x=await setup();
 assert.equal(x.socket.options.reconnectionAttempts,50);
 assert.equal(x.socket.options.autoConnect,false);
 assert.equal(typeof x.socket.options.auth,'function');
 x.client.dispose();
});

test('bounded retry budget ends after 50 errors and never spins forever',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.active=false;
 for(let i=0;i<51;i++)x.socket.fire('connect_error',{message:'PLAZA_AUTH_BUSY'});
 const before=x.socket.connectCount;await delay(15);
 assert.equal(x.client.getSnapshot().lastError,'PLAZA_RECOVERY_EXHAUSTED');
 assert.equal(x.socket.reconnectSetting,false);
 assert.equal(x.socket.connectCount,before);
});

test('client-initiated disconnect never schedules reconnect automatically',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 const before=x.socket.connectCount;x.socket.drop('io client disconnect');await delay(15);
 assert.equal(x.socket.connectCount,before);
});

test('duplicate server disconnect events coalesce into one scheduled reconnect',async t=>{
 const x=await setup();t.after(()=>x.client.dispose());x.client.connect();x.socket.accept();await delay();
 const before=x.socket.connectCount;
 x.socket.drop('io server disconnect');x.socket.drop('io server disconnect');await delay(15);
 assert.equal(x.socket.connectCount,before+1);
});

// Regression fence: the initial explicit connect must not generate a
// redundant reconnection(true); the existing V19 visibility contract expects
// exactly false on background and true when foregrounded.
test('initial connect preserves existing enabled reconnect setting; only background and foreground toggle it', async t=>{
 const x=await setup();t.after(()=>x.client.dispose());
 const calls=[];
 const original=x.socket.io.reconnection;
 x.socket.io.reconnection=flag=>{if(flag!==undefined)calls.push(flag);return original(flag);};
 x.client.connect();
 assert.deepEqual(calls,[]);
 x.lifecycle.visible(true);
 x.lifecycle.visible(false);
 assert.deepEqual(calls,[false,true]);
});

test('explicit user retry reenables a previously blocked reconnect Manager exactly once', async t=>{
 const x=await setup();t.after(()=>x.client.dispose());
 const calls=[];
 const original=x.socket.io.reconnection;
 x.socket.io.reconnection=flag=>{if(flag!==undefined)calls.push(flag);return original(flag);};
 x.client.connect();
 x.socket.fire('connect_error',{data:{code:'PLAZA_UNAUTHORIZED'}});
 assert.deepEqual(calls,[false]);
 assert.equal(x.socket.reconnectSetting,false);
 x.client.connect();
 assert.deepEqual(calls,[false,true]);
 assert.equal(x.socket.reconnectSetting,true);
 x.client.connect();
 assert.deepEqual(calls,[false,true]);
});
