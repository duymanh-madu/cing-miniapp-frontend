import { mergePlazaPresenceV19 } from "./plazaPresenceMergeV19.js";
// A refusal by server authority is not a transport interruption. Never turn
// authentication, an administrator disable, or a replaced session into an
// unbounded reconnect loop.
const TERMINAL_CONNECT_CODES = new Set([
  "PLAZA_INVALID_TOKEN", "PLAZA_UNAUTHORIZED", "PLAZA_MEMBER_BLOCKED",
  "PLAZA_SESSION_REPLACED", "PLAZA_IDENTITY_CHANGED", "PLAZA_UNAVAILABLE",
]);
const TERMINAL_RESUME_CODES = new Set([
  ...[...TERMINAL_CONNECT_CODES].filter(code => code !== "PLAZA_UNAVAILABLE"),
  "PLAZA_ROOM_NOT_FOUND", "PLAZA_ROOM_MEMBERSHIP_REQUIRED",
]);
const MAX_RECOVERY_RETRIES = 50; // bounded; membership retention is server authority

function plazaErrorCode(error) {
  const code = error?.data?.code || error?.code || error?.message;
  return typeof code === "string" && /^PLAZA_[A-Z0-9_]{1,64}$/.test(code)
    ? code : "PLAZA_CONNECTION_ERROR";
}

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
  lifecycleWindow = globalThis.window,
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
  let retryTimer = null, retryCount = 0, recoveryBlocked = false;
  // Socket.IO starts with reconnection:true. Only notify its Manager when the
  // desired state ACTUALLY changes (avoids redundant initial connect toggles).
  let reconnectAllowed = true;
  function setReconnectAllowed(value) {
    const allowed = value === true;
    if (reconnectAllowed === allowed) return;
    reconnectAllowed = allowed;
    socket.io?.reconnection?.(allowed);
  }

  function clearRecoveryRetry(){clearTimeout(retryTimer);retryTimer=null;}
  function scheduleRecoveryRetry(){
    clearRecoveryRetry();
    if(disposed || recoveryBlocked || lifecycle?.hidden)return;
    if(retryCount >= MAX_RECOVERY_RETRIES){
      update({status:"connection-error", lastError:"PLAZA_RECOVERY_EXHAUSTED"});
      setReconnectAllowed(false);
      return;
    }
    const delay=Math.min(5000,recoveryDelayMs * 2 ** Math.min(retryCount++,3));
    retryTimer=setTimeout(()=>{
      retryTimer=null;
      if(disposed || recoveryBlocked || lifecycle?.hidden)return;
      if(socket.connected)void recover();
      else if(socket.active !== true)socket.connect();
      // While Socket.IO owns automatic reconnect, do not duplicate its timer.
    },delay);
  }
  function blockRecovery(code){
    recoveryBlocked=true;
    clearRecoveryRetry();
    setReconnectAllowed(false);
    update({status:"connection-error",lastError:code});
  }
  let sequence = 0;
  let snapshot = Object.freeze({
    socialRevision:0,socialMessages:Object.freeze([]),roomMembers:Object.freeze([]),profile:undefined,identity:null, status: "idle", room: null, rooms: Object.freeze([]), tables:Object.freeze([]), selfId: null, members: Object.freeze([]), messages: Object.freeze([]),
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
    reconnectionAttempts: MAX_RECOVERY_RETRIES,
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
      if (disposed) return;
      if(lifecycle?.hidden){socket.disconnect();return;}
      if(recoveryBlocked)return; // only an explicit connect/foreground can retry auth
      if(resumeOnConnect || resumeNeeded)void recover();
      else {retryCount=0;update({status:"connected",lastError:null});}
    },
    disconnect: reason => {
      if (disposed) return;
      clearRecoveryRetry();
      resumeNeeded=Boolean(snapshot.room);
      rejectPending();
      recovery++;
      // A transport drop is not authoritative room eviction: keep WebGL mounted.
      update({status:"disconnected",rooms:Object.freeze([])});
      if(reason==="io server disconnect") {
        // Socket.IO does NOT auto-reconnect after the server disconnects it.
        // A new handshake must pass the server gate and token authority again.
        scheduleRecoveryRetry();
      }
      // Socket.IO handles other network interruptions via its own backoff.
      // Never reconnect after our intentional client disconnect.
    },
    connect_error: error => {
      if(disposed)return;
      const code=plazaErrorCode(error);
      if(TERMINAL_CONNECT_CODES.has(code))blockRecovery(code);
      else {update({status:"connection-error",lastError:code});scheduleRecoveryRetry();}
    },
    "plaza:social":payload=>{if(disposed||!Array.isArray(payload?.messages))return;const next=new Map(snapshot.socialMessages.map(m=>[m.messageId,m]));for(const m of payload.messages.slice(0,100)){if(typeof m?.messageId!=='string'||!['world','pm'].includes(m.channel)||typeof m.body!=='string'||!Number.isSafeInteger(m.sequence))continue;next.set(m.messageId,Object.freeze({...m}));}update({socialRevision:snapshot.socialRevision+(payload.refresh?1:0),socialMessages:Object.freeze([...next.values()].sort((a,b)=>a.sequence-b.sequence).slice(-150))});},
    "plaza:members":payload=>{
      if(disposed || payload?.roomId!==snapshot.room?.roomId || !Array.isArray(payload.members))return;
      update({roomMembers:Object.freeze(payload.members.filter(v=>typeof v?.memberId==="string").slice(0,50).map(v=>Object.freeze({memberId:v.memberId,displayName:String(v.displayName||"Cing iu").slice(0,80),selectedBadge:typeof v.selectedBadge==="string"?v.selectedBadge:null,character:["boy","girl"].includes(v.character)?v.character:null,isOwner:v.isOwner===true,background:v.background===true})))});
    },
    "plaza:tables":payload=>{if(!disposed && payload?.roomId===snapshot.room?.roomId && Array.isArray(payload.tables))update({tables:Object.freeze(payload.tables)});},
    "plaza:correction": payload => {if(!disposed && payload?.roomId===snapshot.room?.roomId)update({correction:payload.value});},
    "plaza:presence": payload => {
      if(disposed || !payload || payload.roomId !== snapshot.room?.roomId || !Array.isArray(payload.members))return;
      const change=mergePlazaPresenceV19(snapshot,payload);
      if(change)update(change);
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
      retryCount=0;resumeNeeded=false;recoveryBlocked=false;
      update({status:"connected",lastError:null});
    } catch(error) {
      if(disposed || attempt!==recovery)return;
      if(error?.code==="PLAZA_CHARACTER_REQUIRED"){
        // The authenticated member may choose a first character in the lobby.
        // Never bypass the server's create/join admission authority.
        handlers["plaza:room"]({room:null});
        retryCount=0;
        resumeNeeded=false;
        update({status:"connected",profile:undefined});
        return;
      }
      const code=plazaErrorCode(error);
      if(TERMINAL_RESUME_CODES.has(code)) {
        // Only authoritative server rejection can evict the old local room.
        if(["PLAZA_SESSION_REPLACED","PLAZA_ROOM_NOT_FOUND",
            "PLAZA_ROOM_MEMBERSHIP_REQUIRED"].includes(code))
          handlers["plaza:room"]({room:null});
        blockRecovery(code);
      } else {
        // Temporary service, ACK timeout, rate limit, or transport disruption.
        // Keep the scene and retry with a bounded backoff.
        update({status:"connection-error",lastError:code});
        scheduleRecoveryRetry();
      }
    }
  }
  function visibility() {
    if(disposed)return;
    setReconnectAllowed(!lifecycle.hidden);
    if(lifecycle.hidden){
      clearRecoveryRetry();recovery++;
      if(snapshot.room && socket.connected)request("plaza:background",{}).catch(()=>{});
    } else {
      // Fresh token is read through socket.auth on each new handshake.
      recoveryBlocked=false;retryCount=0;
      if(socket.connected)void recover();
      else socket.connect();
    }
  }
  lifecycle?.addEventListener?.("visibilitychange",visibility);
  const foreground=()=>{if(!lifecycle?.hidden)visibility();};
  lifecycleWindow?.addEventListener?.("pageshow",foreground);
  lifecycleWindow?.addEventListener?.("online",foreground);

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
      recoveryBlocked=false;retryCount=0;
      clearRecoveryRetry();
      setReconnectAllowed(lifecycle?.hidden !== true);
      update({ status: "connecting",lastError:null });
      if(socket.connected)void recover();else socket.connect();
    },
    getProfile:async()=>{
      const attempt=recovery;
      const data=await request("plaza:profile:get",{});
      if(disposed || attempt!==recovery || !socket.connected)
        throw failure("PLAZA_PROFILE_STALE");
      update({profile:data.profile,identity:data.identity});
      return data;
    },
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
      lifecycleWindow?.removeEventListener?.("pageshow",foreground);
      lifecycleWindow?.removeEventListener?.("online",foreground);
      rejectPending();
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }
      socket.disconnect();
      update({
        status: "disposed", socialMessages:Object.freeze([]), roomMembers:Object.freeze([]), room: null, rooms: Object.freeze([]), tables:Object.freeze([]),selfId:null,members:Object.freeze([]), messages: Object.freeze([]),
      });
      listeners.clear();
    },
  });
}
