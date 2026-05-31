import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";

const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || "https://cing-backend-production.up.railway.app";

export default function CommunityChat({ onClose }) {
  console.log("[COMMUNITY] CommunityChat rendering...");
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [users,       setUsers]       = useState([]);
  const [voiceState,  setVoiceState]  = useState("idle"); // idle | speaking | others_speaking
  const [speaker,     setSpeaker]     = useState(null);
  const [unread,      setUnread]      = useState(0);
  const [tab,         setTab]         = useState("chat"); // chat | users

  const sockRef      = useRef(null);
  const chatEndRef   = useRef(null);
  const peerRef      = useRef(null);
  const streamRef    = useRef(null);
  const audioRef     = useRef(null);

  const runtimePhone  = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const runtimeName   = useRuntimeCustomerIdentityStore(s => s.identity?.fullName);
  const runtimeAvatar = useRuntimeCustomerIdentityStore(s => s.identity?.avatar);
  const profile       = useAuthStore(s => s.profile);

  const myPhone = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();
  const myName   = runtimeName   || profile?.name || "Cing iu";
  const myAvatar = runtimeAvatar || profile?.avatar || "";

  useEffect(() => {
    const s = io(`${GAME_SERVER}/community`, { transports:["websocket"] });
    sockRef.current = s;

    s.on("connect", () => {
      if (myPhone) s.emit("community:join", { userId: myPhone, name: myName, avatar: myAvatar });
    });

    s.on("community:chat", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    });

    s.on("community:users", (list) => setUsers(list));
    s.on("community:user_joined", (u) => setUsers(prev => [...prev.filter(p=>p.userId!==u.userId), u]));
    s.on("community:user_left",   (u) => setUsers(prev => prev.filter(p=>p.userId!==u.userId)));

    s.on("community:voice_start", ({ userId }) => {
      setSpeaker(userId);
      if (userId !== myPhone) {
        setVoiceState("others_speaking");
        // Nhận audio stream từ speaker
      }
    });

    s.on("community:voice_end", () => {
      setSpeaker(null);
      setVoiceState("idle");
      // Dừng nhận audio
    });

    s.on("community:signal", async ({ userId, signal }) => {
      if (!peerRef.current) return;
      try {
        if (signal.type === "offer") {
          await peerRef.current.setRemoteDescription(signal);
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          s.emit("community:signal", { userId: myPhone, signal: answer });
        } else if (signal.type === "answer") {
          await peerRef.current.setRemoteDescription(signal);
        } else if (signal.candidate) {
          await peerRef.current.addIceCandidate(signal);
        }
      } catch(e) {}
    });

    return () => s.disconnect();
  }, [myPhone]);

  // Push-to-talk: giữ để nói
  const startVoice = async () => {
    if (speaker && speaker !== myPhone) return; // Người khác đang nói
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // Tạo peer connections đến tất cả user
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peerRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) sockRef.current?.emit("community:signal", { userId: myPhone, signal: e.candidate });
      };
      pc.ontrack = (e) => {
        if (audioRef.current) audioRef.current.srcObject = e.streams[0];
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sockRef.current?.emit("community:signal", { userId: myPhone, signal: offer });
      sockRef.current?.emit("community:voice_start", { userId: myPhone });
      setVoiceState("speaking");
      setSpeaker(myPhone);
    } catch(e) {
      console.warn("Voice failed:", e.message);
    }
  };

  const endVoice = () => {
    peerRef.current?.close();
    peerRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    sockRef.current?.emit("community:voice_end", { userId: myPhone });
    setVoiceState("idle");
    setSpeaker(null);
  };

  const sendChat = () => {
    if (!input.trim() || !myPhone) return;
    sockRef.current?.emit("community:chat", { userId: myPhone, name: myName, avatar: myAvatar, message: input.trim() });
    setInput("");
  };

  const isMe = (uid) => uid === myPhone;
  const speakerUser = users.find(u => u.userId === speaker);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.92)", display:"flex", flexDirection:"column" }}>
      <audio ref={audioRef} autoPlay style={{ display:"none" }}/>

      {/* Header */}
      <div style={{ padding:"calc(env(safe-area-inset-top,0px) + 12px) 16px 12px", background:"#0d0d18", borderBottom:"1px solid rgba(255,215,0,0.15)", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>←</button>
        <div style={{ flex:1 }}>
          <p style={{ color:"#FFD700", fontSize:15, fontWeight:900, margin:0 }}>💬 Cộng đồng Cing</p>
          <p style={{ color:"#555", fontSize:11, margin:0 }}>{users.length} người đang online</p>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["chat","users"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
              background: tab===t ? "#D4531C" : "rgba(255,255,255,0.06)",
              color: tab===t ? "white" : "#888",
            }}>{t === "chat" ? "💬 Chat" : `👥 ${users.length}`}</button>
          ))}
        </div>
      </div>

      {/* Voice status */}
      {speaker && (
        <div style={{ padding:"8px 16px", background: voiceState==="speaking" ? "rgba(0,200,100,0.15)" : "rgba(255,100,0,0.1)", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:4, background: voiceState==="speaking"?"#00c864":"#FF6B35", animation:"pulse 1s infinite" }}/>
          <p style={{ color: voiceState==="speaking"?"#00c864":"#FF6B35", fontSize:12, fontWeight:700, margin:0 }}>
            {voiceState==="speaking" ? "🎙️ Bạn đang nói..." : `🎙️ ${speakerUser?.name||speaker} đang nói...`}
          </p>
        </div>
      )}

      {/* Content */}
      {tab === "chat" ? (
        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#444" }}>
              <p style={{ fontSize:32, margin:"0 0 8px" }}>💬</p>
              <p style={{ fontSize:13 }}>Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: isMe(m.userId)?"flex-end":"flex-start" }}>
              {!isMe(m.userId) && <p style={{ color:"#555", fontSize:10, margin:"0 0 3px 8px" }}>{m.name}</p>}
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, flexDirection: isMe(m.userId)?"row-reverse":"row" }}>
                {!isMe(m.userId) && (
                  <div style={{ width:28, height:28, borderRadius:14, background:"#1a1a2e", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#666" }}>
                    {m.avatar ? <img src={m.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (m.name||"?")[0]}
                  </div>
                )}
                <div style={{ background: isMe(m.userId)?"#D4531C":"rgba(255,255,255,0.08)", borderRadius: isMe(m.userId)?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"8px 12px", maxWidth:"72%" }}>
                  <p style={{ color:"white", fontSize:13, margin:0, lineHeight:1.4 }}>{m.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef}/>
        </div>
      ) : (
        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
          {users.map((u, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width:36, height:36, borderRadius:18, background:"#1a1a2e", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#666", position:"relative" }}>
                {u.avatar ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (u.name||"?")[0]}
                <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:5, background:"#00c864", border:"2px solid #0d0d18" }}/>
              </div>
              <div>
                <p style={{ color: isMe(u.userId)?"#FFD700":"white", fontSize:13, fontWeight:700, margin:0 }}>{u.name}{isMe(u.userId)?" (bạn)":""}</p>
                {speaker === u.userId && <p style={{ color:"#00c864", fontSize:10, margin:0 }}>🎙️ Đang nói</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom: input + voice */}
      <div style={{ padding:"8px 16px calc(env(safe-area-inset-bottom,0px) + 8px)", background:"#0d0d18", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:8, alignItems:"center" }}>
        {/* Voice button — giữ để nói */}
        <button
          onPointerDown={startVoice}
          onPointerUp={endVoice}
          onPointerLeave={endVoice}
          disabled={!!(speaker && speaker !== myPhone)}
          style={{
            width:44, height:44, borderRadius:22, border:"none", cursor: (speaker && speaker !== myPhone)?"not-allowed":"pointer", flexShrink:0,
            background: voiceState==="speaking" ? "#00c864" : speaker ? "rgba(255,100,0,0.3)" : "rgba(255,255,255,0.08)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          }}>
          {voiceState==="speaking" ? "🔴" : "🎙️"}
        </button>

        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && sendChat()}
          placeholder="Nhập tin nhắn..." maxLength={200}
          style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"10px 16px", color:"white", fontSize:13, outline:"none" }}/>

        <button onClick={sendChat} disabled={!input.trim()}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer", flexShrink:0,
            background: input.trim()?"#D4531C":"rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
          ➤
        </button>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
