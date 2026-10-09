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
  lifecycle = globalThis.document,
  resumeOnConnect = true,
  recoveryDelayMs = 1000,
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

  let disposed = false, resumeNeeded = false, recovery = 0;
  let retryTimer = null, retryCount = 0;
  function clearRecoveryRetry(){clearTimeout(retryTimer);retryTimer=null;}
  function scheduleRecoveryRetry(){
    clearRecoveryRetry();
    if(disposed || lifecycle?.hidden)return;
    retryTimer=setTimeout(()=>{retryTimer=null;if(disposed || lifecycle?.hidden)return;
      if(socket.connected)void recover();else socket.connect();
    },Math.min(5000,recoveryDelayMs * 2 ** Math.min(retryCount++,3)));
  }
  let sequence = 0;
  let snapshot = Object.freeze({
    roomMembers:Object.freeze([]),profile:undefined,identity:null, status: "idle", room: null, rooms: Object.freeze([]), tables:Object.freeze([]), selfId: null, members: Object.freeze([]), messages: Object.freeze([]),
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
    reconnectionAttempts: Infinity,
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
        if(lifecycle?.hidden){socket.disconnect();return;}
        if(resumeOnConnect || resumeNeeded)void recover();
        else update({status:"connected"});
      }
    },
    disconnect: () => {
      if (disposed) return;
      clearRecoveryRetry();
      resumeNeeded=Boolean(snapshot.room);
      rejectPending();
      recovery++;
      // Keep the room and scene mounted until the server confirms expiry/leave.
      // A transport drop is not an authoritative eviction.
      update({status:"disconnected",rooms:Object.freeze([])});
    },
    connect_error: () => {
      if (!disposed) {update({ status: "connection-error" });scheduleRecoveryRetry();}
    },
    "plaza:members":payload=>{
      if(disposed || payload?.roomId!==snapshot.room?.roomId || !Array.isArray(payload.members))return;
      update({roomMembers:Object.freeze(payload.members.filter(v=>typeof v?.memberId==="string").slice(0,50).map(v=>Object.freeze({memberId:v.memberId,displayName:String(v.displayName||"Cing iu").slice(0,80),selectedBadge:typeof v.selectedBadge==="string"?v.selectedBadge:null,character:["boy","girl"].includes(v.character)?v.character:null,isOwner:v.isOwner===true,background:v.background===true})))});
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
        if(!old || (v.presenceId && old.presenceId!==v.presenceId) || v.seq>old.seq || (v.seq===old.seq && (v.motion==="idle" || v.motion==="sit" || v.seatId!==old.seatId || v.identityRevision!==old.identityRevision)))next.set(v.memberId,{...old,...v});
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
        ...(changedRoom ? { roomMembers:Object.freeze([]),tables:Object.freeze([]),messages: Object.freeze([]), members: Object.freeze([]), selfId: null, correction:null } : {}),
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

  async function recover() {
    if(disposed || !socket.connected || lifecycle?.hidden)return;
    clearRecoveryRetry();
    const attempt=++recovery;
    update({status:"resuming"});
    try {
      const data=await request("plaza:resume",{});
      if(disposed || attempt!==recovery || !socket.connected)return;
      handlers["plaza:room"]({room:data?.room??null});
      retryCount=0;resumeNeeded=false;update({status:"connected"});
    } catch(error) {
      if(disposed || attempt!==recovery)return;
      update({status:"connection-error"});
      if(["PLAZA_REQUEST_TIMEOUT","PLAZA_DISCONNECTED","PLAZA_QUEUE_FULL"].includes(error.code))scheduleRecoveryRetry();
    }
  }
  function visibility() {
    if(disposed)return;
    socket.io?.reconnection?.(!lifecycle.hidden);
    if(lifecycle.hidden){
      clearRecoveryRetry();recovery++;
      if(snapshot.room && socket.connected)request("plaza:background",{}).catch(()=>{});
    } else if(socket.connected)void recover();
    else socket.connect();
  }
  lifecycle?.addEventListener?.("visibilitychange",visibility);

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
    getProfile:async()=>{const data=await request("plaza:profile:get",{});if(!disposed)update({profile:data.profile,identity:data.identity});return data;},
    chooseBadge:async key=>{const data=await request("plaza:badge:choose",{key},true);if(!disposed)update({identity:data.identity});return data;},
    chooseCharacter:async character=>{if(!["boy","girl"].includes(character))throw failure("PLAZA_INVALID_CHARACTER");const data=await request("plaza:profile:choose",{character},true);if(!disposed)update({profile:data.profile});return data;},
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
      if(disposed || socket.connected !== true || snapshot.status !== "connected" || !snapshot.room)return false;
      socket.volatile.emit("plaza:state",value);return true;
    },
    getHistory: () => request("plaza:chat:history", {}),
    sendMessage: (clientMessageId, body) => request(
      "plaza:chat:send", { clientMessageId, body }, true
    ),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      clearRecoveryRetry();recovery++;lifecycle?.removeEventListener?.("visibilitychange",visibility);
      rejectPending();
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }
      socket.disconnect();
      update({
        status: "disposed", roomMembers:Object.freeze([]), room: null, rooms: Object.freeze([]), tables:Object.freeze([]),selfId:null,members:Object.freeze([]), messages: Object.freeze([]),
      });
      listeners.clear();
    },
  });
}
