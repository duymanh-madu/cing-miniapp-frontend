function failure(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

export function createPlazaRealtimeClientV1({
  url,
  ioFactory,
  getToken,
  timeoutMs = 6000,
} = {}) {
  if (typeof ioFactory !== "function" || typeof getToken !== "function" ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new TypeError("PLAZA_CLIENT_DEPENDENCIES_REQUIRED");
  }

  let endpoint;
  try { endpoint = new URL(url); } catch (_) {
    throw failure("PLAZA_SERVER_NOT_CONFIGURED");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);
  if ((endpoint.protocol !== "https:" &&
       !(local && endpoint.protocol === "http:")) ||
      endpoint.username || endpoint.password ||
      endpoint.search || endpoint.hash || endpoint.pathname !== "/") {
    throw failure("PLAZA_INVALID_SERVER_URL");
  }

  let disposed = false, resumeNeeded = false;
  let sequence = 0;
  let snapshot = Object.freeze({
    status: "idle", room: null, rooms: Object.freeze([]), tables:Object.freeze([]), selfId: null, members: Object.freeze([]), messages: Object.freeze([]),
  });
  const listeners = new Set();
  const pending = new Map();

  function update(patch) {
    snapshot = Object.freeze({ ...snapshot, ...patch });
    for (const listener of listeners) {
      try { listener(); } catch (_) {}
    }
  }

  const socket = ioFactory(`${endpoint.origin}/plaza`, {
    autoConnect: false,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: timeoutMs,
    // Read current token for every handshake, including reconnect.
    auth: callback => {
      let token = "";
      try { token = getToken() || ""; } catch (_) {}
      callback({ token });
    },
  });

  function rejectPending() {
    for (const entry of [...pending.values()]) {
      entry.finish(failure(
        entry.mutation ? "PLAZA_OUTCOME_UNKNOWN" : "PLAZA_DISCONNECTED"
      ));
    }
  }

  const handlers = {
    connect: () => {
      if (!disposed) {
        update({ status: "connected" });
        if(resumeNeeded){resumeNeeded=false;request("plaza:resume",{}).catch(()=>{});}
      }
    },
    disconnect: () => {
      if (disposed) return;
      resumeNeeded=Boolean(snapshot.room);
      rejectPending();
      update({
        status: "disconnected", room: null, rooms: Object.freeze([]), tables:Object.freeze([]),selfId:null,members:Object.freeze([]), messages: Object.freeze([]),
      });
    },
    connect_error: () => {
      if (!disposed) update({ status: "connection-error" });
    },
    "plaza:tables":payload=>{if(!disposed && payload?.roomId===snapshot.room?.roomId && Array.isArray(payload.tables))update({tables:Object.freeze(payload.tables)});},
    "plaza:correction": payload => {if(!disposed && payload?.roomId===snapshot.room?.roomId)update({correction:payload.value});},
    "plaza:presence": payload => {
      if(disposed || !payload || payload.roomId !== snapshot.room?.roomId || !Array.isArray(payload.members))return;
      const next=new Map(payload.full?[]:snapshot.members.map(v=>[v.memberId,v]));
      for(const id of payload.removed || [])next.delete(id);
      for(const v of payload.members) {
        if(typeof v?.memberId!=="string" || !Number.isSafeInteger(v.seq))continue;
        const old=next.get(v.memberId);
        if(!old || (v.presenceId && old.presenceId!==v.presenceId) || v.seq>old.seq || (v.seq===old.seq && (v.motion==="idle" || v.motion==="sit" || v.seatId!==old.seatId)))next.set(v.memberId,{...old,...v});
      }
      update({selfId:payload.selfId,members:Object.freeze([...next.values()])});
    },
    "plaza:rooms": payload => {
      if (!disposed && Array.isArray(payload?.rooms)) {
        update({ rooms: Object.freeze(payload.rooms.filter(room =>
          typeof room?.roomId === "string" && room.memberCount > 0)) });
      }
    },
    "plaza:room": payload => {
      if (disposed || !payload || !("room" in payload)) return;
      const room = payload.room;
      if (room !== null &&
          (typeof room !== "object" || typeof room.roomId !== "string")) return;
      const changedRoom = snapshot.room?.roomId !== room?.roomId;
      update({
        room,
        ...(changedRoom ? { tables:Object.freeze([]),messages: Object.freeze([]), members: Object.freeze([]), selfId: null, correction:null } : {}),
      });
    },
    "plaza:chat:message": payload => {
      if (disposed) return;
      const message = payload?.message;
      if (!snapshot.room || message?.roomId !== snapshot.room.roomId ||
          typeof message.messageId !== "string" ||
          typeof message.body !== "string") return;
      if (snapshot.messages.some(item =>
        item.messageId === message.messageId
      )) return;
      update({
        messages: Object.freeze(
          [...snapshot.messages, message].slice(-100)
        ),
      });
    },
  };

  for (const [event, handler] of Object.entries(handlers)) {
    socket.on(event, handler);
  }

  function request(event, payload, mutation = false) {
    if (disposed) return Promise.reject(failure("PLAZA_CLIENT_DISPOSED"));
    if (socket.connected !== true) {
      return Promise.reject(failure("PLAZA_DISCONNECTED"));
    }
    if (pending.size >= 16) {
      return Promise.reject(failure("PLAZA_QUEUE_FULL"));
    }

    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => finish(failure(
        mutation ? "PLAZA_OUTCOME_UNKNOWN" : "PLAZA_REQUEST_TIMEOUT"
      )), timeoutMs);

      function finish(error, data) {
        if (!pending.has(id)) return;
        clearTimeout(timer);
        pending.delete(id);
        if (error) reject(error);
        else resolve(data);
      }

      pending.set(id, { finish, mutation });
      try {
        socket.emit(event, payload, response => {
          if (response?.ok === true) finish(null, response.data);
          else finish(failure(
            typeof response?.error?.code === "string"
              ? response.error.code : "PLAZA_INVALID_RESPONSE"
          ));
        });
      } catch (_) {
        finish(failure(mutation
          ? "PLAZA_OUTCOME_UNKNOWN" : "PLAZA_REQUEST_FAILED"));
      }
    });
  }

  return Object.freeze({
    getSnapshot: () => snapshot,
    subscribe: listener => {
      if (typeof listener !== "function") {
        throw new TypeError("PLAZA_LISTENER_REQUIRED");
      }
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    connect: () => {
      if (disposed) throw failure("PLAZA_CLIENT_DISPOSED");
      update({ status: "connecting" });
      socket.connect();
    },
    listRooms: async () => {
      const data = await request("plaza:list", {});
      if (!disposed && Array.isArray(data?.rooms)) update({ rooms: Object.freeze(data.rooms) });
      return data;
    },
    createRoom: (name, password) => request("plaza:create", { name, ...(password !== undefined ? { password } : {}) }, true),
    joinRoom: (roomId, password) => request("plaza:join", { roomId, ...(password !== undefined ? { password } : {}) }, true),
    leaveRoom: () => request("plaza:leave", {}, true),
    closeRoom: roomId => request("plaza:close", { roomId }, true),
    tableAction: payload => request("plaza:table",{...payload,commandId:payload.commandId||globalThis.crypto.randomUUID()},true),
    sendState: value => {
      if(disposed || socket.connected !== true || !snapshot.room)return false;
      socket.volatile.emit("plaza:state",value);return true;
    },
    getHistory: () => request("plaza:chat:history", {}),
    sendMessage: (clientMessageId, body) => request(
      "plaza:chat:send", { clientMessageId, body }, true
    ),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      rejectPending();
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }
      socket.disconnect();
      update({
        status: "disposed", room: null, rooms: Object.freeze([]), tables:Object.freeze([]),selfId:null,members:Object.freeze([]), messages: Object.freeze([]),
      });
      listeners.clear();
    },
  });
}
