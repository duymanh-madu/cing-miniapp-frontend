import test from "node:test";
import assert from "node:assert/strict";
import { createPlazaRealtimeClientV1 } from "../runtime/plazaRealtimeClientV1.js";

function setup(options = {}) {
  const handlers = new Map();
  const sent = [];
  const removed = [];
  let captured;
  let token = "first";
  const socket = {
    connected: false,
    on: (event, handler) => handlers.set(event, handler),
    off: (event, handler) => {
      removed.push({ event, handler });
      if (handlers.get(event) === handler) handlers.delete(event);
    },
    connect: () => {
      socket.connected = true;
      handlers.get("connect")?.();
    },
    disconnect: () => { socket.connected = false; },
    emit: (event, payload, ack) => sent.push({ event, payload, ack }),
  };
  const client = createPlazaRealtimeClientV1({
    url: "https://game.example",
    getToken: () => token,
    ioFactory: (url, config) => {
      captured = { url, config };
      return socket;
    },
    ...options,
  });
  return {
    client, socket, handlers, sent, removed,
    captured: () => captured,
    changeToken: () => { token = "second"; },
  };
}

test("separate namespace; no connection at construction; refreshed handshake token", () => {
  const s = setup();
  assert.equal(s.captured().url, "https://game.example/plaza");
  assert.equal(s.captured().config.forceNew, true);
  assert.equal(s.socket.connected, false);
  let first;
  s.captured().config.auth(value => { first = value; });
  assert.deepEqual(first, { token: "first" });
  s.changeToken();
  let second;
  s.captured().config.auth(value => { second = value; });
  assert.deepEqual(second, { token: "second" });
  s.client.dispose();
});

test("invalid production URL rejected; localhost allowed", () => {
  for (const url of [
    undefined, "http://game.example", "https://game.example/chess",
    "https://user:pass@game.example", "https://game.example/?token=bad",
  ]) {
    assert.throws(() => setup({ url }), /PLAZA_/);
  }
  const s = setup({ url: "http://127.0.0.1:3456" });
  s.client.dispose();
});

test("request ACK resolves; server rejection retains code; no client identity sent", async () => {
  const s = setup();
  s.client.connect();
  const created = s.client.createRoom("Cing");
  assert.deepEqual(s.sent[0].payload, { name: "Cing" });
  s.sent[0].ack({ ok: true, data: { room: { roomId: "one" } } });
  assert.deepEqual(await created, { room: { roomId: "one" } });

  const denied = s.client.joinRoom("two");
  s.sent[1].ack({ ok: false, error: { code: "PLAZA_ROOM_FULL" } });
  await assert.rejects(denied, { code: "PLAZA_ROOM_FULL" });
  s.client.dispose();
});

test("mutation timeout has unknown outcome and is never retried automatically", async () => {
  const s = setup({ timeoutMs: 10 });
  s.client.connect();
  await assert.rejects(s.client.createRoom("Cing"), {
    code: "PLAZA_OUTCOME_UNKNOWN",
  });
  assert.equal(s.sent.length, 1);
  s.sent[0].ack({ ok: true, data: { late: true } });
  s.client.dispose();
});

test("room events scope chat; duplicate messages ignored; transfer clears old chat", () => {
  const s = setup();
  const room = id => ({ room: { roomId: id } });
  const message = (id, roomId) => ({
    message: { messageId: id, roomId, body: "Hello" },
  });
  s.handlers.get("plaza:room")(room("one"));
  s.handlers.get("plaza:chat:message")(message("m1", "one"));
  s.handlers.get("plaza:chat:message")(message("m1", "one"));
  s.handlers.get("plaza:chat:message")(message("m2", "other"));
  assert.equal(s.client.getSnapshot().messages.length, 1);
  s.handlers.get("plaza:room")(room("two"));
  assert.equal(s.client.getSnapshot().messages.length, 0);
  s.handlers.get("plaza:chat:message")(message("m3", "one"));
  assert.equal(s.client.getSnapshot().messages.length, 0);
  s.client.dispose();
});

test("disconnect rejects outstanding mutation and clears room state", async () => {
  const s = setup();
  s.client.connect();
  s.handlers.get("plaza:room")({ room: { roomId: "one" } });
  const pending = s.client.sendMessage("client-1", "Hello");
  s.socket.connected = false;
  s.handlers.get("disconnect")();
  await assert.rejects(pending, { code: "PLAZA_OUTCOME_UNKNOWN" });
  assert.equal(s.client.getSnapshot().room, null);
  assert.equal(s.client.getSnapshot().status, "disconnected");
  s.client.dispose();
});

test("dispose removes only owned handlers and settles pending requests", async () => {
  const s = setup();
  s.client.connect();
  const pending = s.client.listRooms();
  s.client.dispose();
  await assert.rejects(pending, { code: "PLAZA_DISCONNECTED" });
  assert.equal(s.socket.connected, false);
  assert.ok(s.removed.every(item => typeof item.handler === "function"));
  assert.equal(s.removed.length, 9);
  assert.throws(() => s.client.connect(), { code: "PLAZA_CLIENT_DISPOSED" });
  await assert.rejects(s.client.listRooms(), { code: "PLAZA_CLIENT_DISPOSED" });
});


test("password payload and live occupied directory; reconnect clears stale list", async () => {
  const s = setup(); s.client.connect();
  const create = s.client.createRoom(undefined, "secret");
  assert.deepEqual(s.sent[0].payload, { name: undefined, password: "secret" });
  s.sent[0].ack({ ok: true, data: { room: { roomId: "one" } } }); await create;
  const join = s.client.joinRoom("one", "secret");
  assert.deepEqual(s.sent[1].payload, { roomId: "one", password: "secret" });
  s.sent[1].ack({ ok: true, data: { room: { roomId: "one" } } }); await join;
  s.handlers.get("plaza:rooms")({ rooms: [{ roomId: "one", memberCount: 2 }, { roomId: "empty", memberCount: 0 }] });
  assert.deepEqual(s.client.getSnapshot().rooms, [{ roomId: "one", memberCount: 2 }]);
  s.handlers.get("disconnect")(); assert.deepEqual(s.client.getSnapshot().rooms, []);
  s.client.dispose();
});


test("presence is room scoped, applies deltas/removals, and replacement incarnation resets sequence", () => {
 const s=setup();s.client.connect();s.handlers.get('plaza:room')({room:{roomId:'one'}});
 const push=(roomId,full,members,removed=[])=>s.handlers.get('plaza:presence')({roomId,full,selfId:'a',members,removed});
 push('other',true,[{memberId:'b',presenceId:'p',seq:1}]);assert.equal(s.client.getSnapshot().members.length,0);
 push('one',true,[{memberId:'b',presenceId:'p',seq:9}]);push('one',false,[{memberId:'b',presenceId:'p',seq:2}]);assert.equal(s.client.getSnapshot().members[0].seq,9);
 push('one',false,[{memberId:'b',presenceId:'new',seq:0}]);assert.equal(s.client.getSnapshot().members[0].seq,0);
 push('one',false,[],['b']);assert.equal(s.client.getSnapshot().members.length,0);s.client.dispose();
});


test("table snapshots stay room scoped; authoritative seat changes accept same sequence", async()=>{
 const s=setup();s.client.connect();s.handlers.get("plaza:room")({room:{roomId:"one"}});
 s.handlers.get("plaza:tables")({roomId:"other",tables:[{tableId:"bad"}]});assert.equal(s.client.getSnapshot().tables.length,0);
 s.handlers.get("plaza:tables")({roomId:"one",tables:[{tableId:"table",seats:[]}]});assert.equal(s.client.getSnapshot().tables[0].tableId,"table");
 s.handlers.get("plaza:presence")({roomId:"one",selfId:"me",full:true,members:[{memberId:"me",seq:1,motion:"idle",presenceId:"p"}]});
 s.handlers.get("plaza:presence")({roomId:"one",selfId:"me",full:false,members:[{memberId:"me",seq:1,motion:"sit",seatId:"seat"}]});assert.equal(s.client.getSnapshot().members[0].seatId,"seat");
 s.handlers.get("plaza:presence")({roomId:"one",selfId:"me",full:false,members:[{memberId:"me",seq:1,motion:"idle",seatId:null}]});assert.equal(s.client.getSnapshot().members[0].seatId,null);
 const p=s.client.tableAction({action:"sit",tableId:"table",seatId:"seat",commandId:"stable"});assert.equal(s.sent.at(-1).event,"plaza:table");assert.equal(s.sent.at(-1).payload.commandId,"stable");assert.equal(s.sent.at(-1).payload.memberId,undefined);s.sent.at(-1).ack({ok:true});await p;
 s.handlers.get("plaza:room")({room:{roomId:"two"}});assert.equal(s.client.getSnapshot().tables.length,0);s.client.dispose();
});

test('title choice sends only key, accepts server identity and updates same-sequence metadata',async()=>{const s=setup();s.client.connect();const choosing=s.client.chooseBadge('gold');assert.deepEqual(s.sent[0].payload,{key:'gold'});s.sent[0].ack({ok:true,data:{identity:{selectedBadge:'gold',ownedBadges:['gold']}}});await choosing;assert.equal(s.client.getSnapshot().identity.selectedBadge,'gold');s.handlers.get('plaza:room')({room:{roomId:'r'}});s.handlers.get('plaza:presence')({roomId:'r',selfId:'self',full:true,members:[{memberId:'self',seq:1,motion:'walk',selectedBadge:'gold',identityRevision:0}]});s.handlers.get('plaza:presence')({roomId:'r',selfId:'self',members:[{memberId:'self',seq:1,motion:'walk',selectedBadge:'idol',identityRevision:1}]});assert.equal(s.client.getSnapshot().members[0].selectedBadge,'idol');s.handlers.get('disconnect')();assert.equal(s.client.getSnapshot().identity,null);s.client.dispose();});
