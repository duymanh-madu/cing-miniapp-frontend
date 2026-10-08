import React, {
  useEffect, useRef, useState, useSyncExternalStore, lazy, Suspense,
} from "react";
import { createDefaultPlazaClientV1 } from "../runtime/createDefaultPlazaClientV1.js";
import "./PlazaPageV1.css";

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
  enabled = false,
  onClose,
  createClient = createDefaultPlazaClientV1,
}) {
  const [client, setClient] = useState(null);
  const [characterChoice,setCharacterChoice]=useState("girl");
  const [password, setPassword] = useState("");
  const [locked, setLocked] = useState(false);
  const [joining, setJoining] = useState(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState({ roomId: null, messages: [] });
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const sending = useRef(null);
  const alive = useRef(false);
  const actionBusy = useRef(false);
  const endRef = useRef(null);

  const state = useSyncExternalStore(
    client?.subscribe || subscribeEmpty,
    client?.getSnapshot || getEmpty,
    getEmpty,
  );
  const connected = state.status === "connected";
  const room = state.room;
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
    } catch (error) {
      if (alive.current) setNotice(explain(error));
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [room?.roomId, messages.at(-1)?.messageId]);

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

  return (
    <main className="cing-plaza">
      <header className="cing-plaza__header">
        <div>
          <span className="cing-plaza__eyebrow">CING HU TANG KINH BẮC</span>
          <h1>Cing Plaza</h1>
          <p>Một nơi gặp gỡ, một câu chuyện mới.</p>
        </div>
        {onClose && (
          <button className="cing-plaza__quiet" onClick={onClose}>
            Quay lại
          </button>
        )}
      </header>

      {enabled && room && (
        <Suspense fallback={<p role="status">Đang mở không gian Plaza…</p>}>
          <PlazaSceneV1 initialCharacter={state.members?.find(v=>v.memberId===state.selfId)?.character || characterChoice} correction={state.correction} tables={state.tables || []} realtimeClient={client} members={state.members || []} selfId={state.selfId} />
        </Suspense>
      )}

      {!enabled ? (
        <section className="cing-plaza__panel">
          <h2>Hẹn gặp Cing iu tại Plaza</h2>
          <p>Không gian giao lưu hiện chưa mở.</p>
        </section>
      ) : (
        <>
          <div className="cing-plaza__connection" role="status">
            <span className={connected ? "is-connected" : ""} />
            {STATUS[state.status] || STATUS.idle}
          </div>
          {notice && (
            <p className="cing-plaza__notice" role="alert">{notice}</p>
          )}

          {!room ? (
            <>
              <section className="cing-plaza__panel">
                <span className="cing-plaza__eyebrow">PHÒNG CỦA CING IU</span>
                <h2>Mời bạn bè vào trò chuyện</h2>
                <form onSubmit={event => {
                  event.preventDefault();
                  act(async () => {
                    const result = await client.createRoom(undefined, locked ? password : "");
                    if (alive.current) {
                      setCreatedRoomId(result.room?.roomId || null);
                      setPassword(""); setLocked(false);
                    }
                  });
                }}>
                  <label htmlFor="cing-plaza-character">Nhân vật</label>
                  <select id="cing-plaza-character" value={characterChoice} onChange={event=>setCharacterChoice(event.target.value)}><option value="girl">Girl</option><option value="boy">Boy</option></select>
                  <label className="cing-plaza__password-choice">
                    <input type="checkbox" checked={locked}
                      onChange={event => { setLocked(event.target.checked); setPassword(""); }} />
                    Đặt mật khẩu phòng
                  </label>
                  <div className="cing-plaza__form-row">
                    {locked && <input id="cing-plaza-create-password" type="password"
                      aria-label="Mật khẩu phòng mới" value={password}
                      onChange={event => setPassword(event.target.value)}
                      minLength={4} maxLength={64} autoComplete="new-password"
                      placeholder="Mật khẩu: 4–64 ký tự" required />}
                    <button disabled={!connected || busy || (locked && password.length < 4)}>
                      Tạo phòng mới
                    </button>
                  </div>
                  <p className="cing-plaza__hint">Tối đa 30 người mỗi phòng.</p>
                </form>
              </section>

              <section>
                <div className="cing-plaza__section-title">
                  <h2>Phòng đang có người</h2>
                  <button className="cing-plaza__quiet"
                    disabled={!connected || busy}
                    onClick={() => act(refreshRooms)}>Cập nhật</button>
                </div>
                <div className="cing-plaza__rooms">
                  {rooms.map(item => (
                    <article className="cing-plaza__room-card" key={item.roomId}>
                      <h3>{item.name} {item.hasPassword && <svg aria-label="Phòng có mật khẩu" role="img" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4" /></svg>}</h3>
                      <p>{item.memberCount} / {item.capacity} người</p>
                      <button disabled={!connected || busy ||
                          item.memberCount >= item.capacity}
                        onClick={() => {
                          if (item.hasPassword) { setJoining(item); setJoinPassword(""); }
                          else act(() => client.joinRoom(item.roomId));
                        }}>
                        {item.memberCount >= item.capacity ? "Full" : "Vào phòng"}
                      </button>
                    </article>
                  ))}
                </div>
                {joining && <form className="cing-plaza__panel" onSubmit={event => {
                  event.preventDefault();
                  act(async () => {
                    await client.joinRoom(joining.roomId, joinPassword);
                    if (alive.current) { setJoining(null); setJoinPassword(""); }
                  });
                }}>
                  <h3>Vào {joining.name}</h3>
                  <label htmlFor="cing-plaza-join-password">Mật khẩu phòng</label>
                  <input id="cing-plaza-join-password" type="password" value={joinPassword}
                    onChange={event => setJoinPassword(event.target.value)}
                    minLength={4} maxLength={64} autoComplete="off" required />
                  <div className="cing-plaza__form-row">
                    <button disabled={!connected || busy || joinPassword.length < 4}>Vào phòng</button>
                    <button type="button" className="cing-plaza__quiet" disabled={busy}
                      onClick={() => { setJoining(null); setJoinPassword(""); }}>Hủy</button>
                  </div>
                </form>}
                {connected && rooms.length === 0 && (
                  <p className="cing-plaza__empty">
                    Chưa có phòng nào. Cing iu mở cuộc gặp đầu tiên nhé.
                  </p>
                )}
              </section>
            </>
          ) : (
            <section className="cing-plaza__panel cing-plaza__conversation">
              <div className="cing-plaza__section-title">
                <div>
                  <span className="cing-plaza__eyebrow">ĐANG GẶP GỠ</span>
                  <h2>{room.name}</h2>
                  <p>{room.memberCount} / {room.capacity} người</p>
                </div>
                <button className="cing-plaza__quiet" disabled={busy}
                  onClick={() => act(async () => {
                    await client.leaveRoom();
                    setCreatedRoomId(null);
                    await refreshRooms();
                  })}>Rời phòng</button>
              </div>

              <div className="cing-plaza__messages"
                aria-label="Tin nhắn trong phòng">
                {messages.length === 0 && (
                  <p className="cing-plaza__empty">Bắt đầu bằng một lời chào nhé.</p>
                )}
                {messages.map(message => (
                  <article className="cing-plaza__message"
                    key={message.messageId}>
                    <div className="cing-plaza__message-meta">
                      <strong>{message.author?.displayName || "Cing iu"}</strong>
                      <time dateTime={new Date(message.createdAt).toISOString()}>
                        {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p>{message.body}</p>
                  </article>
                ))}
                <div ref={endRef} />
              </div>

              <form className="cing-plaza__composer" onSubmit={submitMessage}>
                <label className="cing-plaza__sr-only"
                  htmlFor="cing-plaza-message">Tin nhắn</label>
                <textarea id="cing-plaza-message" value={draft}
                  onChange={event => setDraft(event.target.value)}
                  maxLength={1000} rows={2}
                  placeholder="Nhắn một lời với Cing iu…"
                  disabled={!connected} />
                <button disabled={!connected || busy || !draft.trim() ||
                    [...draft.trim()].length > 500}>
                  {busy ? "Đang gửi…" : "Gửi"}
                </button>
              </form>
              {createdRoomId === room.roomId && (
                <button className="cing-plaza__close-room" disabled={busy}
                  onClick={() => act(async () => {
                    await client.closeRoom(room.roomId);
                    setCreatedRoomId(null);
                    await refreshRooms();
                  })}>Đóng phòng của tôi</button>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
