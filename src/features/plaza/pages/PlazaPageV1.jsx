import React, {
  useEffect, useRef, useState, useSyncExternalStore, lazy, Suspense,
} from "react";
import { createDefaultPlazaClientV1 } from "../runtime/createDefaultPlazaClientV1.js";
import "./PlazaPageV1.css";
import "./PlazaShellV7.css";
import PlazaLobbyV7 from "./PlazaLobbyV7.jsx";
import {MessageCircle} from "lucide-react";
import PlazaLoadingV11 from "./PlazaLoadingV11.jsx";
import PlazaPhotoAlbumV11 from "./PlazaPhotoAlbumV11.jsx";
import PlazaChatV7 from "./PlazaChatV7.jsx";

const PlazaSceneV1 = lazy(() => import("../scene/PlazaSceneV1.jsx"));

const EMPTY = Object.freeze({
  status: "idle", room: null, rooms: Object.freeze([]), messages: Object.freeze([]),
});
const subscribeEmpty = () => () => {};
const getEmpty = () => EMPTY;

const STATUS = {
  idle: "Chưa kết nối",
  connecting: "Đang kết nối…",
  connected: "Đã kết nối",
  disconnected: "Mất kết nối — đang thử lại",
  "connection-error": "Chưa kết nối được Plaza",
  disposed: "Đã ngắt kết nối",
};

const ERRORS = {
 PLAZA_BADGE_NOT_OWNED:"Bạn chưa sở hữu danh hiệu này.",
 PLAZA_IDENTITY_UNAVAILABLE:"Chưa tải được danh hiệu. Hãy thử lại.",
 PLAZA_BADGE_SAVE_FAILED:"Chưa lưu được danh hiệu. Hãy thử lại.",
  PLAZA_SERVER_NOT_CONFIGURED: "Plaza chưa sẵn sàng.",
  PLAZA_INVALID_SERVER_URL: "Plaza chưa sẵn sàng.",
  PLAZA_UNAVAILABLE: "Plaza hiện chưa mở. Cing iu quay lại sau nhé.",
  PLAZA_ROOM_FULL: "Phòng đã đủ người. Hãy chọn phòng khác nhé.",
  PLAZA_ROOM_NOT_FOUND: "Phòng đã đóng. Hãy cập nhật danh sách phòng.",
  PLAZA_ALREADY_IN_ROOM: "Hãy rời phòng hiện tại trước khi tạo phòng mới.",
  PLAZA_CHAT_LOCKED: "Tài khoản hiện đang bị khóa gửi tin nhắn.",
  PLAZA_MEMBER_BLOCKED: "Tài khoản hiện chưa được phép tham gia.",
  PLAZA_SESSION_REPLACED: "Tài khoản đã vào Plaza từ một phiên khác.",
  PLAZA_INVALID_TOKEN: "Phiên đăng nhập hết hạn. Hãy đăng nhập lại.",
  PLAZA_UNAUTHORIZED: "Hãy đăng nhập để tham gia Plaza.",
  PLAZA_PASSWORD_REQUIRED: "Phòng này cần mật khẩu.",
  PLAZA_WRONG_PASSWORD: "Mật khẩu chưa đúng. Hãy nhập lại.",
  PLAZA_INVALID_PASSWORD: "Mật khẩu cần từ 4 đến 64 ký tự, không chứa ký tự điều khiển.",
  PLAZA_PASSWORD_BUSY: "Đang có nhiều lượt vào phòng. Hãy thử lại sau vài giây.",
  PLAZA_SERVER_FULL: "Plaza đang đông. Hãy thử lại sau.",
  PLAZA_CONNECTION_LIMIT: "Plaza đang đông. Hãy thử lại sau.",
  PLAZA_INVALID_ROOM_NAME: "Tên phòng cần từ 1 đến 60 ký tự.",
  PLAZA_INVALID_MESSAGE: "Tin nhắn cần từ 1 đến 500 ký tự.",
  PLAZA_RATE_LIMITED: "Cing iu thao tác hơi nhanh. Chờ một chút nhé.",
  PLAZA_DISCONNECTED: "Kết nối đang gián đoạn.",
  PLAZA_OUTCOME_UNKNOWN:
    "Chưa nhận được xác nhận. Hãy kiểm tra trạng thái trước khi thử lại.",
};

function explain(error) {
  return ERRORS[error?.code] || "Chưa hoàn tất thao tác. Hãy thử lại sau.";
}

export default function PlazaPageV1({
  enabled = false, checking = false,
  onClose,
  createClient = createDefaultPlazaClientV1,
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [albumOpen,setAlbumOpen]=useState(false),[sceneReady,setSceneReady]=useState(false);
  const [client, setClient] = useState(null);

  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState({ roomId: null, messages: [] });
  const sending = useRef(null);
  const alive = useRef(false);
  const actionBusy = useRef(false);

  const state = useSyncExternalStore(
    client?.subscribe || subscribeEmpty,
    client?.getSnapshot || getEmpty,
    getEmpty,
  );
  const characterChoice=state.profile?.character;
  const connected = state.status === "connected";
  const room = state.room;
  useEffect(()=>{setSceneReady(false);setAlbumOpen(false);},[room?.roomId]);
  const rooms = state.rooms || [];

  useEffect(() => {
    alive.current = true;
    if (!enabled) {
      setClient(null);
      return () => { alive.current = false; };
    }
    let instance;
    try {
      instance = createClient();
      setClient(instance);
      instance.connect();
    } catch (error) {
      setNotice(explain(error));
      instance?.dispose();
    }
    return () => {
      alive.current = false;
      instance?.dispose();
    };
  }, [enabled, createClient]);

  async function act(work) {
    if (!client || actionBusy.current) return;
    actionBusy.current = true;
    setBusy(true);
    setNotice("");
    try {
      await work();
      return true;
    } catch (error) {
      if (alive.current) setNotice(explain(error));
      return false;
    } finally {
      actionBusy.current = false;
      if (alive.current) setBusy(false);
    }
  }

  async function refreshRooms() {
    const result = await client.listRooms();
    return result;
  }

  useEffect(() => {
    if (!client || !connected) return;
    let cancelled = false;
    client.getProfile().catch(error=>{if(!cancelled)setNotice(explain(error));});
    client.listRooms().catch(error => {
      if (!cancelled) setNotice(explain(error));
    });
    return () => { cancelled = true; };
  }, [client, connected]);

  useEffect(() => {
    setHistory({ roomId: null, messages: [] });
    setDraft("");
    sending.current = null;
    if (!client || !room?.roomId) return;
    let cancelled = false;
    const roomId = room.roomId;
    client.getHistory().then(result => {
      if (!cancelled) {
        setHistory({ roomId, messages: result.messages || [] });
      }
    }).catch(error => {
      if (!cancelled) setNotice(explain(error));
    });
    return () => { cancelled = true; };
  }, [client, room?.roomId]);

  const messageMap = new Map();
  const previous = history.roomId === room?.roomId ? history.messages : [];
  for (const message of [...previous, ...state.messages]) {
    if (message.roomId === room?.roomId) {
      messageMap.set(message.messageId, message);
    }
  }
  const messages = [...messageMap.values()]
    .sort((a, b) => a.createdAt - b.createdAt ||
      a.messageId.localeCompare(b.messageId))
    .slice(-100);



  async function submitMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !room) return;
    await act(async () => {
      // Keep the same ID when retrying the same text after an uncertain ACK.
      if (!sending.current || sending.current.body !== body ||
          sending.current.roomId !== room.roomId) {
        if (typeof globalThis.crypto?.randomUUID !== "function") {
          throw new Error("Message identity unavailable");
        }
        sending.current = {
          id: globalThis.crypto.randomUUID(), body, roomId: room.roomId,
        };
      }
      await client.sendMessage(sending.current.id, body);
      sending.current = null;
      if (alive.current &&
          client.getSnapshot().room?.roomId === room.roomId) setDraft("");
    });
  }

  return <main className={`cing-plaza cing-plaza--immersive ${room?'cing-plaza--room':'cing-plaza--lobby'} plaza-v7`}>
    {notice&&<p className="plaza-v7-notice" role="alert">{notice}</p>}
    {checking?<PlazaLoadingV11/>:!enabled?<div className="plaza-v7-loading">Plaza hiện chưa mở.</div>:room?<>
      {sceneReady&&<div className="cing-plaza__room-hud"><button disabled={busy} onClick={()=>act(async()=>{await client.leaveRoom();setChatOpen(false);await refreshRooms();await client.getProfile();})}>‹ Sảnh</button><div><strong>{room.name}</strong><span>Cing Plaza {room.roomNumber||""} · {room.memberCount}/{room.capacity}</span></div><button aria-label="Mở trò chuyện" aria-expanded={chatOpen} onClick={()=>setChatOpen(v=>!v)}><MessageCircle size={22}/></button></div>}
      {characterChoice&&<Suspense fallback={<PlazaLoadingV11/>}><PlazaSceneV1 key={room.roomId} onReadyChange={setSceneReady} interactionPaused={chatOpen||albumOpen} onAlbum={()=>setAlbumOpen(true)} roomId={room.roomId} messages={messages} identity={state.identity} initialCharacter={state.members?.find(v=>v.memberId===state.selfId)?.character||characterChoice} correction={state.correction} tables={state.tables||[]} realtimeClient={client} members={state.members||[]} selfId={state.selfId}/></Suspense>}
    </>:<PlazaLobbyV7 onAlbum={()=>setAlbumOpen(true)} identity={state.identity} onChooseBadge={key=>act(()=>client.chooseBadge(key))} profile={state.profile} connected={connected} busy={busy} rooms={rooms} onClose={onClose} onChat={()=>setChatOpen(true)} choose={key=>act(()=>client.chooseCharacter(key))} onRefresh={()=>act(async()=>{await refreshRooms();await client.getProfile();})} onCreate={(name,password)=>act(async()=>{await client.createRoom(name,password);})} onJoin={(id,password)=>act(()=>client.joinRoom(id,password))}/>}
    {albumOpen&&<PlazaPhotoAlbumV11 key={state.identity?.memberId||state.selfId} ownerId={state.identity?.memberId||state.selfId} onClose={()=>setAlbumOpen(false)}/>}
    {chatOpen&&<PlazaChatV7 room={room} messages={messages} draft={draft} setDraft={setDraft} submit={submitMessage} connected={connected} busy={busy} onClose={()=>setChatOpen(false)}/>}
  </main>;
}
