import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { TierBadge } from "@/membership/components/TierBadge";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";
import { useMembership } from "@/features/home/hooks/useMembership";
injectTierBadgeStyles();

export default function CommunityChat({ onClose }) {
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [users,      setUsers]      = useState([]);
  const [voiceState, setVoiceState] = useState("idle");
  const [speaker,    setSpeaker]    = useState(null);
  const [tab,        setTab]        = useState("chat");
  const addLog = (msg) => {};  // debug removed
  const [myId,       setMyId]       = useState("");
  const navigate = useNavigate();

  const sockRef    = useRef(null);
  const chatEndRef = useRef(null);
  const audioRef   = useRef(null);
  const peerRef    = useRef(null);
  const streamRef  = useRef(null);
  const myIdRef    = useRef("");

  const runtimePhone  = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const runtimeName   = useRuntimeCustomerIdentityStore(s => s.identity?.fullName);
  const runtimeAvatar = useRuntimeCustomerIdentityStore(s => s.identity?.avatar);
  const profile       = useAuthStore(s => s.profile);

  const memberPhone = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();
  const { data: membershipData } = useMembership(memberPhone);
  const myTierKey = membershipData?.tierKey || "member";
  const [championId, setChampionId] = useState("");

  // Fetch top 1 chess để hiển thị danh hiệu Kiện tướng
  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE_URL||"https://cing-backend-production.up.railway.app/api") + "/leaderboard/top-games/chess")
      .then(r => r.json())
      .then(d => { if (d?.data?.[0]?.user_id) setChampionId(String(d.data[0].user_id)); })
      .catch(() => {});
  }, []);
  const tierKeyRef = useRef("member");
  useEffect(() => {
    tierKeyRef.current = myTierKey;
    console.log('[TIER] myTierKey updated:', myTierKey, 'memberPhone:', memberPhone, 'membershipData:', membershipData?.tierKey);
  }, [myTierKey]);

  const getMyInfo = useCallback(() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return {
        phone: n,
        name:  runtimeName || profile?.name || "Cing iu",
        avatar: runtimeAvatar || profile?.avatar || "",
      };
    }
    return { phone: "", name: runtimeName || profile?.name || "Cing iu", avatar: runtimeAvatar || profile?.avatar || "" };
  }, [runtimePhone, runtimeName, runtimeAvatar, profile]);

  useEffect(() => {
    // Dùng main socket đã connected thay vì tạo socket mới
    let attempts = 0;
    let intervalId = null;

    const attachEvents = (s) => {
      sockRef.current = s;
      const info = getMyInfo();
      const uid = info.phone || ("guest-" + s.id);
      myIdRef.current = uid;
      setMyId(uid);
      addLog(`✅ Connected: ${uid}`);
      s.emit("community:join", { userId: uid, name: info.name, avatar: info.avatar, tierKey: tierKeyRef.current });

      s.on("community:history", (history) => {
      setMessages(history || []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    });

    s.on("community:chat", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    });

    s.on("community:users", (list) => {
      // Merge tierKey: nếu là chính mình thì dùng tierKeyRef.current (đúng hơn server)
      const merged = list.map(u =>
        u.userId === myIdRef.current ? { ...u, tierKey: tierKeyRef.current || u.tierKey } : u
      );
      setUsers(merged);
    });
    s.on("community:user_joined",  (u) => setUsers(prev => [...prev.filter(p=>p.userId!==u.userId), u]));
    s.on("community:user_updated", (u) => setUsers(prev => prev.map(p => p.userId===u.userId ? {...p, tierKey:u.tierKey} : p)));
    s.on("community:user_left",    (u) => setUsers(prev => prev.filter(p=>p.userId!==u.userId)));
    s.on("community:voice_start", ({userId}) => { setSpeaker(userId); if (userId !== myIdRef.current) setVoiceState("others_speaking"); });
    s.on("community:voice_end",   ()    => { setSpeaker(null); setVoiceState("idle"); });

    s.on("community:signal", async ({ signal }) => {
      if (!peerRef.current) return;
      try {
        if (signal.type === "offer") {
          await peerRef.current.setRemoteDescription(signal);
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          s.emit("community:signal", { userId: myIdRef.current, signal: answer });
        } else if (signal.type === "answer") {
          await peerRef.current.setRemoteDescription(signal);
        } else if (signal.candidate) {
          await peerRef.current.addIceCandidate(signal);
        }
      } catch(e) {}
    });

    };

    const init = () => {
      const s = getRuntimeSocket();
      if (s?.connected) {
        clearInterval(intervalId);
        attachEvents(s);
      } else {
        addLog(`⏳ Waiting socket... ${attempts}`);
        if (attempts++ > 20) { clearInterval(intervalId); addLog("❌ Socket not available"); }
      }
    };

    intervalId = setInterval(init, 1000);
    init();

    return () => {
      clearInterval(intervalId);
      const s = getRuntimeSocket();
      if (s) {
        s.off('community:history');
        s.off('community:chat');
        s.off('community:users');
        s.off('community:user_joined');
        s.off('community:user_left');
        s.off('community:voice_start');
        s.off('community:voice_end');
        s.off('community:signal');
      }
    };
  }, []);

  // Khi phone resolve — emit join với đúng phone
  useEffect(() => {
    const info = getMyInfo();
    if (!info.phone || !sockRef.current?.connected) return;
    if (myIdRef.current === info.phone) return;
    myIdRef.current = info.phone;
    setMyId(info.phone);
    sockRef.current.emit("community:join", { userId: info.phone, name: info.name, avatar: info.avatar, tierKey: tierKeyRef.current });
  }, [runtimePhone, getMyInfo]);

  // Re-emit khi avatar load xong — cập nhật avatar đúng cho tất cả client
  useEffect(() => {
    if (!profile?.avatar || !sockRef.current?.connected || !myIdRef.current) return;
    sockRef.current.emit("community:join", {
      userId: myIdRef.current,
      name:   runtimeName || profile?.name || "Cing iu",
      avatar: profile.avatar,
      tierKey: tierKeyRef.current,
    });
  }, [profile?.avatar]);

  // Re-emit khi tierKey resolve từ API — cập nhật badge cho tất cả client
  useEffect(() => {
    if (!membershipData) return;
    const emitWithRetry = (attempts = 0) => {
      if (sockRef.current?.connected && myIdRef.current) {
        const info = getMyInfo();
        sockRef.current.emit("community:join", {
          userId:  myIdRef.current,
          name:    info.name,
          avatar:  info.avatar,
          tierKey: myTierKey,
        });
        // Tự update state local vì server dùng broadcast (không gửi lại cho chính mình)
        setUsers(prev => prev.map(u =>
          u.userId === myIdRef.current ? { ...u, tierKey: myTierKey } : u
        ));
      } else if (attempts < 15) {
        setTimeout(() => emitWithRetry(attempts + 1), 800);
      }
    };
    emitWithRetry();
  }, [membershipData]);

  const sendChat = () => {
    addLog(`Send: connected=${sockRef.current?.connected} myId=${myIdRef.current}`);
    if (!input.trim() || !sockRef.current?.connected) return;
    const info = getMyInfo();
    const uid  = myIdRef.current || info.phone || ("guest-" + Date.now());
    sockRef.current.emit("community:chat", {
      userId:  uid,
      name:    info.name,
      avatar:  info.avatar,
      message: input.trim(),
      tierKey: tierKeyRef.current,
    });
    setInput("");
  };

  const startVoice = async () => {
    if (speaker && speaker !== myIdRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      streamRef.current = stream;
      const pc = new RTCPeerConnection({ iceServers:[{ urls:"stun:stun.l.google.com:19302" }] });
      peerRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.onicecandidate = e => { if (e.candidate) sockRef.current?.emit("community:signal", { userId: myIdRef.current, signal: e.candidate }); };
      pc.ontrack = e => { if (audioRef.current) audioRef.current.srcObject = e.streams[0]; };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sockRef.current?.emit("community:signal",     { userId: myIdRef.current, signal: offer });
      sockRef.current?.emit("community:voice_start", { userId: myIdRef.current });
      setVoiceState("speaking");
      setSpeaker(myIdRef.current);
    } catch(e) { console.warn("Voice failed:", e.message); }
  };

  const endVoice = () => {
    peerRef.current?.close(); peerRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    sockRef.current?.emit("community:voice_end", { userId: myIdRef.current });
    setVoiceState("idle"); setSpeaker(null);
  };

  const isMe = (uid) => uid === myId || uid === myIdRef.current;
  const speakerUser = users.find(u => u.userId === speaker);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"#080810", display:"flex", flexDirection:"column" }}>
      <audio ref={audioRef} autoPlay style={{ display:"none" }}/>

      {/* Header */}
      <div style={{ padding:"calc(env(safe-area-inset-top,0px) + 12px) 16px 12px", background:"#0d0d18", borderBottom:"1px solid rgba(255,215,0,0.15)", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>←</button>
        <div style={{ flex:1 }}>
          <p style={{ color:"#FFD700", fontSize:15, fontWeight:900, margin:0 }}>💬 Cộng đồng "Cing iu"</p>
          <p style={{ color:"#555", fontSize:11, margin:0 }}>{users.length} người đang online</p>
        </div>
        <button
          onPointerDown={e => { e.currentTarget.style.transform="scale(0.93)"; e.currentTarget.style.boxShadow="0 0 16px rgba(24,119,242,0.7)"; }}
          onPointerUp={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(24,119,242,0.4)"; }}
          onPointerLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(24,119,242,0.4)"; }}
          onClick={() => window.parent.postMessage({ type:"OPEN_OUT_APP", url:"https://www.facebook.com/groups/2210684146435472" }, "*")}
          style={{ background:"linear-gradient(135deg,#1877F2,#0a5dc2)", border:"none", borderRadius:10,
            padding:"6px 12px", color:"white", fontSize:11, fontWeight:800, cursor:"pointer",
            display:"flex", alignItems:"center", gap:5, flexShrink:0,
            boxShadow:"0 2px 8px rgba(24,119,242,0.4)",
            transition:"transform 0.15s ease, box-shadow 0.15s ease" }}>
          <span style={{ fontSize:13 }}>👥</span> Gia nhập
        </button>
        <div style={{ display:"flex", gap:4 }}>
          {[{k:"chat",l:"💬 Chat"},{k:"users",l:`👥 ${users.length}`}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
              background: tab===t.k ? "#D4531C" : "rgba(255,255,255,0.06)",
              color: tab===t.k ? "white" : "#888",
            }}>{t.l}</button>
          ))}
        </div>
      </div>



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
              {!isMe(m.userId) && <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3, marginLeft:8,
              cursor:"pointer" }} onClick={() => navigate(`/profile/${m.userId}`)}>
              <p style={{ color:"#888", fontSize:10, margin:0, textDecoration:"underline", textDecorationColor:"rgba(255,255,255,.15)" }}>{m.name}</p>
              <TierBadge tierKey={m.tierKey || "member"} size="sm"/>
              {championId && String(m.userId) === championId && (
                <TierBadge tierKey="member" isChampion={true} size="sm"/>
              )}
            </div>}
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, flexDirection: isMe(m.userId)?"row-reverse":"row" }}>
                {!isMe(m.userId) && (
                  <div style={{ width:28, height:28, borderRadius:14, background:"#1a1a2e", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#666" }}>
                    {m.avatar ? <img src={m.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (m.name||"?")[0]}
                  </div>
                )}
                <div style={{ background: isMe(m.userId)?"#D4531C":"rgba(255,255,255,0.1)", borderRadius: isMe(m.userId)?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"8px 14px", maxWidth:"70%", marginRight: isMe(m.userId)?8:0, marginLeft: isMe(m.userId)?0:8 }}>
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
                <div style={{ display:"flex", alignItems:"center", gap:5, cursor: isMe(u.userId)?"default":"pointer" }}
                  onClick={() => !isMe(u.userId) && navigate(`/profile/${u.userId}`)}>
                <p style={{ color: isMe(u.userId)?"#FFD700":"white", fontSize:13, fontWeight:700, margin:0,
                  textDecoration: isMe(u.userId)?"none":"underline", textDecorationColor:"rgba(255,255,255,.2)" }}>
                  {u.name}{isMe(u.userId)?" (bạn)":""}
                </p>
                <TierBadge tierKey={u.tierKey || "member"} size="sm"/>
                {championId && String(u.userId) === championId && (
                  <TierBadge tierKey="member" isChampion={true} size="sm"/>
                )}
              </div>
                {speaker===u.userId && <p style={{ color:"#00c864", fontSize:10, margin:0 }}>🎙️ Đang nói</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom */}
      <div style={{ padding:"8px 16px calc(env(safe-area-inset-bottom,0px) + 8px)", background:"#0d0d18", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:8, alignItems:"center" }}>

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
