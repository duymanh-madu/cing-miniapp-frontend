import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { TierBadge } from "@/membership/components/TierBadge";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";
import { useMembership } from "@/features/home/hooks/useMembership";
import {
  CharmChatBadge,
  getHighestCharmBadge,
} from "@/features/game-center/components/chat-badges";

export default function CommunityChat({ onClose }) {
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [users,      setUsers]      = useState([]);
  const [voiceState, setVoiceState] = useState("idle");
  const [speaker,    setSpeaker]    = useState(null);
  const [tab,        setTab]        = useState("chat");
  const [showRules, setShowRules] = useState(false);
  const [myId,       setMyId]       = useState("");
  const navigate = useNavigate();

  const sockRef    = useRef(null);
  const chatEndRef = useRef(null);
  const audioRef   = useRef(null);
  const peerRef    = useRef(null);
  const streamRef  = useRef(null);
  const myIdRef    = useRef("");

  const runtimePhone  = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const [chatLocked, setChatLocked] = useState(null);
  useEffect(() => { injectTierBadgeStyles(); }, []);
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
  const [myCharmBadgeKey, setMyCharmBadgeKey] = useState(null);
  const charmBadgeRef = useRef(null);
  const [championId, setChampionId] = useState("");

  // Fetch top 1 chess để hiển thị danh hiệu Kiện tướng
  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE_URL||"https://cing-backend-production.up.railway.app/api") + "/game/chess/leaderboard")
      .then(r => r.json())
      .then(d => { const top = d?.topWins?.[0] || d?.data?.topWins?.[0]; if (top?.user_id) setChampionId(String(top.user_id)); })
      .catch(() => {});
  }, []);
  const tierKeyRef = useRef("member");
  useEffect(() => {
    tierKeyRef.current = myTierKey;
  }, [myTierKey]);

  useEffect(() => {
    const phone = String(memberPhone || "")
      .replace(/\D/g, "")
      .replace(/^84/, "0");

    if (!phone) return;

    let cancelled = false;
    const base = import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api";

    fetch(`${base}/profile-update/profile/${phone}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;

        const badges = d?.data?.custom_badges || [];
        const badgeKey = getHighestCharmBadge(badges);

        charmBadgeRef.current = badgeKey;
        setMyCharmBadgeKey(badgeKey);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [memberPhone]);

  const getMyInfo = useCallback(() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return {
        phone: n,
        name:  runtimeName || profile?.name || "Cing iu",
        avatar: profile?.avatar || runtimeAvatar || "",
      };
    }
    return { phone: "", name: runtimeName || profile?.name || "Cing iu", avatar: profile?.avatar || runtimeAvatar || "" };
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
      s.emit("community:join", { userId: uid, name: info.name, avatar: info.avatar, tierKey: tierKeyRef.current, charmBadgeKey: charmBadgeRef.current });

      s.on("community:history", (history) => {
      const info = getMyInfo();
      setMessages((history || []).map(m =>
        m?.userId === myIdRef.current
          ? {
              ...m,
              name: m?.name || info.name,
              avatar: m?.avatar || info.avatar,
              tierKey: m?.tierKey || tierKeyRef.current,
              charmBadgeKey: m?.charmBadgeKey || charmBadgeRef.current,
            }
          : m
      ));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    });

    s.on("community:chat", (msg) => {
      const info = getMyInfo();
      const isMine = msg?.userId === myIdRef.current;

      const normalized = isMine
        ? {
            ...msg,
            name: msg?.name || info.name,
            avatar: msg?.avatar || info.avatar,
            tierKey: msg?.tierKey || tierKeyRef.current,
            charmBadgeKey: msg?.charmBadgeKey || charmBadgeRef.current,
          }
        : msg;

      setMessages(prev => [...prev, normalized]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    });

    s.on("community:users", (list) => {
      // Merge tierKey: nếu là chính mình thì dùng tierKeyRef.current (đúng hơn server)
      const merged = list.map(u =>
        u.userId === myIdRef.current ? { ...u, tierKey: tierKeyRef.current || u.tierKey, charmBadgeKey: charmBadgeRef.current || u.charmBadgeKey } : u
      );
      setUsers(merged);
    });
    s.on("community:user_joined",  (u) => setUsers(prev => [...prev.filter(p=>p.userId!==u.userId), u]));
    s.on("community:user_updated", (u) => {
      setUsers(prev => prev.map(p => p.userId===u.userId ? {...p, tierKey:u.tierKey, charmBadgeKey:u.charmBadgeKey} : p));
      // Cũng update tierKey trong messages
      setMessages(prev => prev.map(m => m.userId===u.userId ? {...m, tierKey:u.tierKey, charmBadgeKey:u.charmBadgeKey} : m));
    });
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

  // Check chat lock khi phone resolve
  useEffect(() => {
    const info = getMyInfo();
    if (!info.phone) return;
    const base = import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api";
    fetch(`${base}/profile-update/profile/${info.phone}`)
      .then(r => r.json())
      .then(d => {
        const p = d?.data;
        if (!p) return;
        if (p.is_blocked) { setChatLocked(new Date(Date.now() + 999*86400000)); return; }
        if (p.chat_locked_until) {
          const until = new Date(p.chat_locked_until);
          if (until > new Date()) setChatLocked(until);
        }
      })
      .catch(() => {});
  }, [runtimePhone, getMyInfo]);

  // Khi phone resolve — emit join với đúng phone
  useEffect(() => {
    const info = getMyInfo();
    if (!info.phone || !sockRef.current?.connected) return;
    if (!info.phone || myIdRef.current === info.phone) return;
    myIdRef.current = info.phone;
    setMyId(info.phone);
    setMyId(info.phone);
    sockRef.current.emit("community:join", { userId: info.phone, name: info.name, avatar: info.avatar, tierKey: tierKeyRef.current, charmBadgeKey: charmBadgeRef.current });
  }, [runtimePhone, getMyInfo]);

  // Re-emit khi avatar load xong — cập nhật avatar đúng cho tất cả client
  useEffect(() => {
    if (!profile?.avatar || !sockRef.current?.connected || !myIdRef.current) return;
    sockRef.current.emit("community:join", {
      userId: myIdRef.current,
      name:   runtimeName || profile?.name || "Cing iu",
      avatar: profile.avatar,
      tierKey: tierKeyRef.current,
      charmBadgeKey: charmBadgeRef.current,
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
          charmBadgeKey: charmBadgeRef.current,
        });
        // Tự update state local vì server dùng broadcast (không gửi lại cho chính mình)
        setUsers(prev => prev.map(u =>
          u.userId === myIdRef.current ? { ...u, tierKey: myTierKey, charmBadgeKey: charmBadgeRef.current || u.charmBadgeKey } : u
        ));
      } else if (attempts < 15) {
        setTimeout(() => emitWithRetry(attempts + 1), 800);
      }
    };
    emitWithRetry();
  }, [membershipData]);

  // Charm badge helper
  const getCharmBadge = (charmPoints) => {
    if (!charmPoints) return null;
    if (charmPoints >= 20000) return { label:"Minh tinh", color:"#ff80b0", bg:"linear-gradient(135deg,#8a0030,#cc0055)" };
    if (charmPoints >= 10000) return { label:"Ngôi sao", color:"#ffd700", bg:"linear-gradient(135deg,#7a5000,#c09000)" };
    if (charmPoints >= 5000)  return { label:"Idol", color:"#b090ff", bg:"linear-gradient(135deg,#3a2080,#6040c0)" };
    return null;
  };

  const sendChat = () => {
    if (chatLocked && chatLocked > new Date()) return;
    if (!input.trim() || !sockRef.current?.connected) return;
    const info = getMyInfo();
    const uid  = myIdRef.current || info.phone || ("guest-" + Date.now());
    sockRef.current.emit("community:chat", {
      userId:  uid,
      name:    info.name,
      avatar:  info.avatar,
      message: input.trim(),
      tierKey: tierKeyRef.current,
      charmBadgeKey: charmBadgeRef.current,
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

  const RULES_TEXT = [
    { type:"intro", text:"Gửi tất cả các \"Cing iu\"!" },
    { type:"body",  text:"Admin hiểu rằng nếu không có sự ủng hộ của các bạn, Cing Hu Tang Kinh Bắc sẽ không thể đi tới ngày hôm nay. Thay mặt tất cả nhân sự của nhà Cing Hu Tang Kinh Bắc, Admin xin gửi lời cảm ơn sâu sắc tới toàn thể \"Cing iu\" đã, đang và sẽ còn ủng hộ Cing Hu Tang Kinh Bắc!" },
    { type:"body",  text:"Dự án này là tâm huyết đã ấp ủ từ rất lâu của chúng mình. Đây không phải là một app bình thường. Đây là nơi lắng nghe và vinh danh mọi sự ủng hộ của các bạn. Cũng là nơi để gắn kết cộng đồng \"Cing iu\" lại gần nhau hơn. Và cộng đồng nào thì cũng phải có nội quy thì mới bền lâu được, cộng đồng \"Cing iu\" nhà mình cũng không ngoại lệ, Admin xin phổ biến một số nội quy của cộng đồng để các \"Cing iu\" nắm được:" },
    { type:"rule",  num:1, text:'Không văng tục, chửi bậy trong nhóm chat cộng đồng "Cing iu" cũng như trong group cộng đồng: "Những Cing iu vui tính của nhà Cing Hu Tang Kinh Bắc".' },
    { type:"rule",  num:2, text:'Không gây thù hằn giữa các cá nhân trong cộng đồng. Chúng ta là những "Cing iu" vui tính, game chơi thắng không kiêu, thua không cay cú.' },
    { type:"rule",  num:3, text:'Không tuyên truyền những tôn giáo không chính thống, không làm những việc trái với pháp luật. Chúng ta là những công dân Việt Nam gương mẫu. Chỉ làm những việc pháp luật cho phép.' },
    { type:"penalty", text:"Vi phạm nội quy lần đầu sẽ bị cấm chat 1 ngày, vi phạm lần 2 sẽ bị cấm chat 3 ngày, vi phạm lần 3 sẽ bị cấm chat 7 ngày, vi phạm lần 4 sẽ bị cấm chat 30 ngày và vi phạm lần 5 sẽ bị cấm chat vĩnh viễn." },
    { type:"outro", text:'Admin hi vọng không phải cấm chat bất kỳ "Cing iu" nào. Hãy tham gia vào group "Những Cing iu vui vẻ của nhà Cing Hu Tang Kinh Bắc" để được giao lưu, kết bạn và hơn hết là thoải mái flex những kỹ năng chơi game đỉnh cao của mình nhé các "Cing iu"!' },
    { type:"sign",  text:"Trân trọng! 🧋 Cing Hu Tang Kinh Bắc" },
  ];

  return (
    <>
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
            display:"none", alignItems:"center", gap:4, flexShrink:0,
            boxShadow:"0 2px 8px rgba(24,119,242,0.4)",
            transition:"transform 0.15s ease, box-shadow 0.15s ease" }}>
          <span style={{ fontSize:13 }}>👥</span> Gia nhập
        </button>
        <button onClick={() => setShowRules(true)}
          style={{ background:"linear-gradient(135deg,#D4531C,#FF6B35)", border:"none", borderRadius:10,
            padding:"6px 12px", color:"white", fontSize:11, fontWeight:800, cursor:"pointer",
            display:"flex", alignItems:"center", gap:4, flexShrink:0,
            boxShadow:"0 2px 8px rgba(212,83,28,0.4)" }}>
          <span style={{ fontSize:13 }}>📜</span> Nội quy
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
              {<div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3, marginLeft:8,
              cursor: /^(0|84)\d{8,10}$/.test(String(m.userId)) ? "pointer" : "default" }} onClick={() => {
                if (/^(0|84)\d{8,10}$/.test(String(m.userId))) navigate(`/profile/${m.userId}`);
              }}>
              {(() => {
                const cb = getCharmBadge(m.charmPoints);
                return cb ? (
                  <span style={{ fontSize:9, fontWeight:900, padding:"1px 6px", borderRadius:8, background:cb.bg, color:cb.color, border:`1px solid ${cb.color}55`, whiteSpace:"nowrap" }}>{cb.label}</span>
                ) : null;
              })()}
              <p style={{ color:"#888", fontSize:10, margin:0, textDecoration:"underline", textDecorationColor:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", gap:4 }}>
                {m.charmBadgeKey && <CharmChatBadge badgeKey={m.charmBadgeKey} compact={true}/>}
                <span>{m.name}</span>
              </p>
              <TierBadge tierKey={m.tierKey || "member"} size="sm"/>
              {championId && String(m.userId) === championId && (
                <TierBadge tierKey="member" isChampion={true} size="sm"/>
              )}
            </div>}
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, flexDirection: isMe(m.userId)?"row-reverse":"row" }}>
                {!isMe(m.userId) && (
                  <div style={{ width:28, height:28, borderRadius:14, background:"#1a1a2e", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#666" }}>
                    {m.avatar ? <img src={m.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (m.name||"?")[0]}
                  </div>
                )}
                <div style={{ background: isMe(m.userId)?"#D4531C":"rgba(255,255,255,0.1)", borderRadius: isMe(m.userId)?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"8px 14px", maxWidth:"95%", marginRight: isMe(m.userId)?8:0, marginLeft: isMe(m.userId)?0:8 }}>
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
            <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width:36, height:36, borderRadius:18, background:"#1a1a2e", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#666", position:"relative" }}>
                {u.avatar ? <img src={u.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (u.name||"?")[0]}
                <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:5, background:"#00c864", border:"2px solid #0d0d18" }}/>
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:4, cursor: isMe(u.userId)?"default":"pointer" }}
                  onClick={() => {
                    if (!isMe(u.userId) && /^(0|84)\d{8,10}$/.test(String(u.userId))) navigate(`/profile/${u.userId}`);
                  }}>
                <p style={{ color: isMe(u.userId)?"#FFD700":"white", fontSize:13, fontWeight:700, margin:0,
                  textDecoration: isMe(u.userId)?"none":"underline", textDecorationColor:"rgba(255,255,255,.2)" }}>
                  {u.charmBadgeKey && <CharmChatBadge badgeKey={u.charmBadgeKey} compact={true}/>}
                  <span>{u.name}{isMe(u.userId)?" (bạn)":""}</span>
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
      <div style={{ padding:"8px 16px calc(env(safe-area-inset-bottom,0px) + 8px)", background:"#0d0d18", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        {chatLocked && chatLocked > new Date() ? (
          <div style={{ padding:"12px 16px", background:"rgba(244,67,54,.12)", borderRadius:12, border:"1px solid rgba(244,67,54,.35)", textAlign:"center" }}>
            <p style={{ fontSize:13, fontWeight:800, color:"#f44336", margin:"0 0 4px" }}>🔇 Bạn đã bị khoá chat</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.5)", margin:"0 0 4px" }}>Lý do: Vi phạm nội quy cộng đồng</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", margin:0 }}>
              Mở khoá lúc: {chatLocked.toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
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
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>

    {/* MODAL NỘI QUY */}
    {showRules && (
      <div onClick={() => setShowRules(false)}
        style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.85)",
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
        <div onClick={e => e.stopPropagation()}
          style={{ background:"linear-gradient(180deg,#1a0805,#0d0402)", width:"100%", maxWidth:500,
            borderRadius:"24px 24px 0 0", maxHeight:"88vh", display:"flex", flexDirection:"column",
            border:"1px solid rgba(212,83,28,0.3)", boxShadow:"0 -8px 40px rgba(0,0,0,0.9)" }}>

          {/* Header */}
          <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#D4531C,#FF6B35)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📜</div>
              <div>
                <p style={{ color:"#FFD700", fontSize:13, fontWeight:900, margin:0, letterSpacing:1 }}>NỘI QUY CỘNG ĐỒNG</p>
                <p style={{ color:"#888", fontSize:10, margin:0 }}>Cing Hu Tang Kinh Bắc</p>
              </div>
            </div>
            <button onClick={() => setShowRules(false)}
              style={{ background:"rgba(255,255,255,0.06)", border:"none", color:"#aaa",
                borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* Content */}
          <div style={{ overflowY:"auto", flex:1, padding:"16px 20px 32px" }}>
            {RULES_TEXT.map((item, i) => {
              if (item.type === "intro") return (
                <p key={i} style={{ color:"#FFD700", fontSize:16, fontWeight:900, margin:"0 0 12px",
                  textAlign:"center", letterSpacing:0.5 }}>{item.text}</p>
              );
              if (item.type === "body") return (
                <p key={i} style={{ color:"rgba(255,255,255,0.8)", fontSize:13, lineHeight:1.7,
                  margin:"0 0 14px", textAlign:"justify" }}>{item.text}</p>
              );
              if (item.type === "rule") return (
                <div key={i} style={{ display:"flex", gap:4, marginBottom:12,
                  background:"rgba(212,83,28,0.08)", borderRadius:12, padding:"12px 14px",
                  border:"1px solid rgba(212,83,28,0.2)" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#D4531C,#FF6B35)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"white", fontSize:13, fontWeight:900, flexShrink:0 }}>{item.num}</div>
                  <p style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.6, margin:0 }}>{item.text}</p>
                </div>
              );
              if (item.type === "penalty") return (
                <div key={i} style={{ background:"rgba(244,67,54,0.08)", border:"1px solid rgba(244,67,54,0.25)",
                  borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
                  <p style={{ color:"#FFD700", fontSize:11, fontWeight:800, margin:"0 0 6px", letterSpacing:1 }}>⚠️ HÌNH THỨC XỬ PHẠT</p>
                  <p style={{ color:"rgba(255,180,180,0.9)", fontSize:12, lineHeight:1.7, margin:0 }}>{item.text}</p>
                </div>
              );
              if (item.type === "outro") return (
                <p key={i} style={{ color:"rgba(255,255,255,0.7)", fontSize:13, lineHeight:1.7,
                  margin:"0 0 16px", textAlign:"justify", fontStyle:"italic" }}>{item.text}</p>
              );
              if (item.type === "sign") return (
                <p key={i} style={{ color:"#D4531C", fontSize:14, fontWeight:900, margin:0,
                  textAlign:"right", letterSpacing:0.5 }}>{item.text}</p>
              );
              return null;
            })}
          </div>
        </div>
      </div>
    )}
    </>
  );
}