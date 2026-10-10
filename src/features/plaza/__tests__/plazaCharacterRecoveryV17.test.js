
import test from "node:test";
import assert from "node:assert/strict";
import {createPlazaRealtimeClientV1} from
  "../runtime/plazaRealtimeClientV1.js";

const flush=()=>new Promise(resolve=>setImmediate(resolve));

function setup(){
  const handlers=new Map();
  const calls=[];
  const lifecycle=new EventTarget();
  lifecycle.hidden=false;

  const socket={
    connected:false,
    io:{reconnection:()=>{}},
    volatile:{emit:()=>{}},
    on:(event,fn)=>handlers.set(event,fn),
    off:(event,fn)=>{
      if(handlers.get(event)===fn)handlers.delete(event);
    },
    emit:(event,payload,ack)=>calls.push({event,payload,ack}),
    connect(){
      socket.connected=true;
      handlers.get("connect")?.();
    },
    disconnect(){
      socket.connected=false;
      handlers.get("disconnect")?.();
    }
  };

  const client=createPlazaRealtimeClientV1({
    url:"https://plaza.example",
    getToken:()=>"synthetic-token",
    ioFactory:()=>socket,
    lifecycle,
    timeoutMs:1000,
    recoveryDelayMs:50
  });

  return {client,socket,calls,handlers,lifecycle};
}

function next(s,event){
  const item=s.calls.at(-1);
  assert.equal(item?.event,event);
  return item;
}

test("first-time member can load profile after resume character gate",async()=>{
  const s=setup();
  try{
    s.client.connect();

    next(s,"plaza:resume").ack({
      ok:false,
      error:{code:"PLAZA_CHARACTER_REQUIRED"}
    });

    await flush();

    assert.equal(s.client.getSnapshot().status,"connected");
    assert.equal(s.client.getSnapshot().room,null);

    const profile=s.client.getProfile();
    next(s,"plaza:profile:get").ack({
      ok:true,
      data:{profile:null,identity:{memberId:"synthetic"}}
    });

    await profile;
    assert.equal(s.client.getSnapshot().profile,null);

    const choice=s.client.chooseCharacter("girl");
    next(s,"plaza:profile:choose").ack({
      ok:true,
      data:{profile:{character:"girl"}}
    });

    await choice;
    assert.equal(
      s.client.getSnapshot().profile.character,"girl"
    );
  }finally{
    s.client.dispose();
  }
});

test("an unrelated resume rejection remains fail closed",async()=>{
  const s=setup();
  try{
    s.client.connect();

    next(s,"plaza:resume").ack({
      ok:false,
      error:{code:"PLAZA_MEMBER_BLOCKED"}
    });

    await flush();

    assert.equal(
      s.client.getSnapshot().status,
      "connection-error"
    );
  }finally{
    s.client.dispose();
  }
});

test("late old-profile ACK cannot overwrite foreground recovery",async()=>{
  const s=setup();
  try{
    s.client.connect();

    next(s,"plaza:resume").ack({
      ok:true,
      data:{room:{roomId:"room-01"}}
    });

    await flush();

    const old=s.client.getProfile();
    const oldAck=next(s,"plaza:profile:get").ack;

    s.lifecycle.hidden=true;
    s.lifecycle.dispatchEvent(new Event("visibilitychange"));

    s.lifecycle.hidden=false;
    s.lifecycle.dispatchEvent(new Event("visibilitychange"));

    const resume=next(s,"plaza:resume");
    resume.ack({
      ok:true,
      data:{room:{roomId:"room-01"}}
    });

    await flush();

    oldAck({
      ok:true,
      data:{
        profile:{character:"girl"},
        identity:{memberId:"old"}
      }
    });

    await assert.rejects(old,/PLAZA_PROFILE_STALE/);

    const fresh=s.client.getProfile();
    next(s,"plaza:profile:get").ack({
      ok:true,
      data:{
        profile:{character:"boy"},
        identity:{memberId:"current"}
      }
    });

    await fresh;

    assert.equal(
      s.client.getSnapshot().profile.character,
      "boy"
    );
    assert.equal(
      s.client.getSnapshot().identity.memberId,
      "current"
    );
  }finally{
    s.client.dispose();
  }
});

test("room restoration precedes profile without inventing a character",async()=>{
  const s=setup();
  try{
    s.client.connect();

    next(s,"plaza:resume").ack({
      ok:true,
      data:{room:{roomId:"room-02"}}
    });

    await flush();

    assert.equal(
      s.client.getSnapshot().room.roomId,
      "room-02"
    );
    assert.equal(s.client.getSnapshot().profile,undefined);

    const read=s.client.getProfile();
    next(s,"plaza:profile:get").ack({
      ok:true,
      data:{
        profile:{character:"girl"},
        identity:{memberId:"synthetic"}
      }
    });

    await read;

    assert.equal(
      s.client.getSnapshot().profile.character,
      "girl"
    );
  }finally{
    s.client.dispose();
  }
});
