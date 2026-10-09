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

test("canonical character profile survives rejected reselection; payload has no identity",async()=>{const s=setup();s.client.connect();const first=s.client.chooseCharacter('boy');assert.deepEqual(s.sent[0].payload,{character:'boy'});s.sent[0].ack({ok:true,data:{profile:{character:'girl',revision:1}}});await first;assert.equal(s.client.getSnapshot().profile.character,'girl');const read=s.client.getProfile();s.sent[1].ack({ok:true,data:{profile:{character:'girl',revision:1}}});await read;s.handlers.get('disconnect')();assert.equal(s.client.getSnapshot().profile,undefined);s.client.dispose();});
