import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { TierBadge } from "@/membership/components/TierBadge";
import { TierCard } from "@/membership/components/TierCard";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";

injectTierBadgeStyles();

const fmt = n => new Intl.NumberFormat("vi-VN").format(n || 0);

const TIER_THEME = {
  member:        { header:"linear-gradient(160deg,#2c2c2a,#444441)", card:"rgba(255,255,255,.08)", border:"rgba(255,255,255,.1)",  text:"#f1efe8", sub:"Top 888780", accent:"#d3d1c7" },
  loyal:         { header:"linear-gradient(160deg,#04342c,#0f6e56)", card:"rgba(255,255,255,.09)", border:"rgba(159,225,203,.2)", text:"#e1f5ee", sub:"#9fe1cb", accent:"#5dcaa5" },
  silver:        { header:"linear-gradient(160deg,#042c53,#0c447c)", card:"rgba(255,255,255,.09)", border:"rgba(133,183,235,.2)", text:"#e6f1fb", sub:"#85b7eb", accent:"#378add" },
  gold:          { header:"linear-gradient(160deg,#412402,#854f0b)", card:"rgba(255,255,255,.09)", border:"rgba(250,199,117,.2)", text:"#faeeda", sub:"#fac775", accent:"#ef9f27" },
  partner:       { header:"linear-gradient(160deg,#26215c,#534ab7)", card:"rgba(255,255,255,.09)", border:"rgba(175,169,236,.2)", text:"#eeedfe", sub:"#afa9ec", accent:"#7f77dd" },
  diamond:       { header:"linear-gradient(160deg,#020810,#061828,#0d2244)", card:"rgba(255,255,255,.07)", border:"rgba(58,138,223,.25)", text:"#e0f4ff", sub:"#64b4ff", accent:"#3a8adf", royal:true },
  loyal_partner: { header:"linear-gradient(160deg,#0a0308,#1e0a14,#200c28)", card:"rgba(255,255,255,.07)", border:"rgba(212,83,126,.25)", text:"#ffe0f0", sub:"#ff90c0", accent:"#d4537e", royal:true },
};



export default function ProfilePage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const backToGame   = location.state?.backToGame;
  const { userId }   = useParams();
  const profile      = useAuthStore(s => s.profile);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  const resolvedPhone = (() => {
    const src = userId || runtimePhone || profile?.phone || "";
    return src.replace(/\D/g,"").replace(/^84/,"0");
  })();

  const myPhone = (runtimePhone || profile?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
  const isOwn = !userId || (myPhone && userId.replace(/\D/g,"").replace(/^84/,"0") === myPhone);

  const [member,   setMember]   = useState(null);
  const [champion, setChampion] = useState(false);
  const [hofRank, setHofRank] = useState(null); // null | "hof_1" | "hof_2" | "hof_3"
  const [primaryBadge, setPrimaryBadge] = useState(null); // null = auto (tier/champion/hof)
  const [showBadgePicker, setShowBadgePicker] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [giftSending, setGiftSending] = useState(false);
  const [giftResult, setGiftResult] = useState(null);

  const GIFTS = [
    { id:"cafe_nau",    name:"Cà phê nâu",          icon:"☕", points:5,   charm:5   },
    { id:"chanh_tuyet", name:"Chanh tuyết bạc hà",  icon:"🥤", points:10,  charm:10  },
    { id:"olong_khoi",  name:"Ô long khói rang",     icon:"🍵", points:20,  charm:20  },
    { id:"tra_sen",     name:"Trà sen vàng",         icon:"🪷", points:50,  charm:50  },
    { id:"sua_tuoi",    name:"Sữa tươi nướng TCDD", icon:"🧋", points:100, charm:100 },
  ];

  const sendGift = async (gift) => {
    setGiftSending(true);
    try {
      // Lấy phone mới nhất tại thời điểm bấm
      const freshPhone = useRuntimeCustomerIdentityStore.getState().identity?.phone
        || useAuthStore.getState().profile?.phone || myPhone;
      const senderPhone = (freshPhone || "").replace(/\D/g,"").replace(/^84/,"0");
      if (!senderPhone) { setGiftResult({ gift, success: false, error: "Không xác định được tài khoản" }); setGiftSending(false); return; }
      const res = await apiClient.post("/game/chess/tip", {
        fromUserId: senderPhone,
        toUserId: resolvedPhone,
        amount: gift.points, charm: gift.charm,
        giftId: gift.id, giftName: gift.name, giftIcon: gift.icon,
      });
      if (res.data?.success !== false) {
        setGiftResult({ gift, success: true });
        setTimeout(() => { setGiftResult(null); setShowGift(false); }, 3000);
      }
    } catch(e) {
      setGiftResult({ gift, success: false, error: e.message });
    }
    setGiftSending(false);
  };
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!resolvedPhone) { setLoading(false); return; }
    Promise.all([
      apiClient.get(`/membership/${resolvedPhone}`).catch(() => null),
      apiClient.get(`/game/chess/leaderboard`).catch(() => null),
      apiClient.get(`/leaderboard/alltime-top3`).catch(() => null),
      apiClient.get(`/profile-update/profile/${resolvedPhone}`).catch(() => null),
    ]).then(([mRes, lbRes, pRes, atRes]) => {
      const memberData = mRes?.data?.data || {};
      // Merge avatar từ players table
      const playerAvatar = pRes?.data?.data?.avatar || null;
      setMember({ ...memberData, avatar: playerAvatar });
      const top = lbRes?.data?.data?.topWins?.[0] || lbRes?.data?.topWins?.[0];
      if (top) {
        const topPhone = String(top.user_id).replace(/\D/g,"").replace(/^84/,"0");
        if (topPhone === resolvedPhone) setChampion(true);
      }
      // Check HOF alltime top3
      const atTop = atRes?.data?.data || [];
      atTop.forEach((p, i) => {
        const ph = String(p.user_id).replace(/\D/g,"").replace(/^84/,"0");
        if (ph === resolvedPhone) setHofRank(`hof_${i+1}`);
      });
    }).finally(() => setLoading(false));
  }, [resolvedPhone]);

  // Debug — xóa sau
  useEffect(() => {
  }, [member]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"Top 555", fontSize:14 }}>Đang tải hồ sơ...</p>
    </div>
  );

  if (!resolvedPhone || !member) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <p style={{ fontSize:48, margin:"0 0 12px" }}>👤</p>
      <p style={{ fontSize:15, fontWeight:700, color:"Top 666" }}>Không tìm thấy hồ sơ</p>
      <button onClick={() => navigate(-1)} style={{ marginTop:16, padding:"10px 24px", borderRadius:12, border:"none", background:"#D4531C", color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>← Quay lại</button>
    </div>
  );

  const tierKey = member.tierKey || "member";
  const theme   = TIER_THEME[tierKey] || TIER_THEME.member;

  // Nếu xem profile mình: dùng profile.name (custom) + profile.avatar (custom)
  // Nếu xem profile người khác: dùng member.name + member.avatar từ API
  const displayName = isOwn
    ? (profile?.name || profile?.displayName || member.name || "Cing iu")
    : (member.name || "Cing iu");
  const avatarUrl = isOwn
    ? (profile?.avatar || null)
    : (member.avatar || null);
  const points        = member.points || 0;
  const eatTimes      = member.eatTimes || 0;
  const paymentAmount = member.paymentAmount || 0;

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", paddingBottom:100 }}>

      {/* Header */}
      <div style={{ background:theme.header, padding:"calc(env(safe-area-inset-top,0px) + 14px) 20px 48px", position:"relative", overflow:"hidden" }}>


        <button onClick={() => navigate(-1)} style={{ background:"rgba(0,0,0,.3)", border:"none", borderRadius:8, padding:"6px 14px", color:"rgba(255,255,255,.75)", fontSize:14, cursor:"pointer", marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
          ← {backToGame ? "Quay lại ván cờ" : ""}
        </button>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
          {/* Avatar */}
          <div style={{ position:"relative" }}>
            <div style={{ width:96, height:96, borderRadius:48, border:`2.5px solid ${theme.accent}`, overflow:"hidden", background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, fontWeight:900, color:"white", boxShadow:`0 4px 24px rgba(0,0,0,.4), 0 0 0 1px ${theme.border}` }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : displayName[0]?.toUpperCase()
              }
            </div>
            {champion && (
              <div style={{ position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#8a6000,#ffd700,#c47a00)", borderRadius:10, padding:"2px 10px", border:"1.5px solid #ffd700", boxShadow:"0 0 12px rgba(255,210,0,.7)", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:9, fontWeight:900, color:"#120c00" }}>♟️ KIỆN TƯỚNG</span>
              </div>
            )}
          </div>

          {/* Tên */}
          <div style={{ textAlign:"center" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
              <h1 style={{ color:"white", fontSize:24, fontWeight:900, margin:0, textShadow:"0 2px 8px rgba(0,0,0,.5)" }}>{displayName}</h1>
              <TierBadge tierKey={tierKey} isChampion={champion} size="sm"/>
            </div>
            <TierBadge tierKey={tierKey} isChampion={champion} size="md" showLabel={true}/>
          </div>
        </div>
      </div>

      {/* Body — nổi lên trên header */}
      <div style={{ padding:"0 16px", marginTop:-20 }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
          {[
            { label:"Điểm tích lũy",  value:fmt(points),           icon:"⭐", accent:"#D4531C" },
            { label:"Lần ghé thăm",   value:fmt(eatTimes),          icon:"🧋", accent:"#2196F3" },
            { label:"Chi tiêu",       value:fmt(paymentAmount)+"đ", icon:"💰", accent:"#4CAF50" },
          ].map((s,i) => (
            <div key={i} style={{ background:theme.card, borderRadius:16, padding:"16px 8px", textAlign:"center", border:`1px solid ${theme.border}`, backdropFilter:"blur(10px)" }}>
              <p style={{ fontSize:22, margin:"0 0 6px" }}>{s.icon}</p>
              <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 3px" }}>{s.value}</p>
              <p style={{ color:theme.sub, fontSize:9, margin:0, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* PRIMARY BADGE */}
        {(() => {
          const auto = hofRank || (champion ? "champion" : tierKey);
          const display = primaryBadge || auto;
          return (
            <div style={{ marginBottom:14 }}>
              {display === "champion"
                ? <TierCard isChampion={true} firstVisit={member.firstVisit}/>
                : display?.startsWith("hof_")
                ? <TierCard tierKey={display} firstVisit={member.firstVisit}/>
                : <TierCard tierKey={display} tierName={member.tierName} firstVisit={member.firstVisit}/>
              }
            </div>
          );
        })()}

        {/* Nút chọn danh hiệu */}
        {(hofRank || champion) && (
          <div style={{ marginBottom:14 }}>
            <button onClick={() => setShowBadgePicker(p => !p)}
              style={{ width:"100%", padding:"10px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.7)", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <span>🎖</span> Chọn danh hiệu hiển thị chính
              <span style={{ marginLeft:"auto", opacity:.5 }}>{showBadgePicker ? "▲" : "▼"}</span>
            </button>
            {showBadgePicker && (
              <div style={{ marginTop:8, background:"rgba(0,0,0,.4)", borderRadius:14, padding:12, border:"1px solid rgba(255,255,255,.1)" }}>
                {[
                  ...(hofRank ? [{ key: hofRank, label: hofRank === "hof_1" ? "Vương Giả" : hofRank === "hof_2" ? "Phú Hào" : "Địa Chủ", sub: hofRank === "hof_1" ? "#1 Alltime · Ruby" : hofRank === "hof_2" ? "#2 Alltime · Sapphire" : "#3 Alltime · Emerald", color: hofRank === "hof_1" ? "#ff80a0" : hofRank === "hof_2" ? "#80a0ff" : "#40ee80" }] : []),
                  ...(champion ? [{ key: "champion", label: "Kiện tướng", sub: "Top 1 Cờ vua · Live", color: "#ffd700" }] : []),
                  { key: tierKey, label: member.tierName || "Hạng thành viên", sub: "Hạng thành viên", color: "#aaa" },
                ].map(opt => {
                  const current = primaryBadge || hofRank || (champion ? "champion" : tierKey);
                  return (
                    <div key={opt.key} onClick={() => { setPrimaryBadge(opt.key === current ? null : opt.key); setShowBadgePicker(false); }}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, marginBottom:6, cursor:"pointer", border: current === opt.key ? `1.5px solid ${opt.color}` : "1px solid rgba(255,255,255,.1)", background: current === opt.key ? "rgba(255,255,255,.08)" : "transparent" }}>
                      <TierBadge tierKey={opt.key === "champion" ? tierKey : opt.key} isChampion={opt.key === "champion"} size="sm"/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:800, color:opt.color, margin:0 }}>{opt.label}</p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", margin:0 }}>{opt.sub}</p>
                      </div>
                      {current === opt.key && <span style={{ color:opt.color, fontSize:16 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Danh hiệu phụ */}
        {hofRank && champion && (primaryBadge || hofRank) !== "champion" && (
          <div style={{ marginBottom:14 }}>
            <TierCard isChampion={true} firstVisit={member.firstVisit}/>
          </div>
        )}
        {hofRank && primaryBadge && !primaryBadge.startsWith("hof_") && (
          <div style={{ marginBottom:14 }}>
            <TierCard tierKey={hofRank} firstVisit={member.firstVisit}/>
          </div>
        )}

        {/* Actions */}
        {isOwn && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"⭐ Điểm tích lũy", path:"/loyalty", bg:"#D4531C" },
              { label:"📦 Lịch sử đơn",  path:"/orders",  bg:"#185fa5" },
            ].map((a,i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{ background:a.bg, border:"none", borderRadius:14, padding:"14px", color:"white", fontSize:13, fontWeight:800, cursor:"pointer", boxShadow:`0 4px 12px ${a.bg}55` }}>
                {a.label}
              </button>
            ))}
          </div>
        )}
        {!isOwn && (
          <button onClick={() => setShowGift(true)}
            style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#8a0030,#cc0055,#ff2060)", color:"white", fontSize:14, fontWeight:900, cursor:"pointer", boxShadow:"0 4px 20px rgba(255,0,80,.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 }}>
            🎁 Tặng vật phẩm cho {member.name || "người này"}
          </button>
        )}
      </div>

      <style>{`@keyframes liveFlash{0%,100%{opacity:1}50%{opacity:.35}}`}</style>

      {/* Gift Modal */}
      {showGift && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:9999, display:"flex", alignItems:"flex-end" }}
          onClick={() => { setShowGift(false); setGiftResult(null); }}>
          <div style={{ background:"#0f0f18", borderRadius:"24px 24px 0 0", width:"100%", padding:"24px 20px 48px", border:"1px solid rgba(255,80,120,.2)" }}
            onClick={e => e.stopPropagation()}>
            {giftResult ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <p style={{ fontSize:40 }}>{giftResult.success ? "🎉" : "❌"}</p>
                <p style={{ fontSize:15, fontWeight:900, color: giftResult.success ? "#ff80a0" : "#f44336", margin:"8px 0 4px" }}>
                  {giftResult.success ? `Đã tặng ${giftResult.gift.icon} ${giftResult.gift.name}!` : "Không đủ điểm"}
                </p>
                {giftResult.success && <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", margin:0 }}>+{giftResult.gift.charm} điểm quyến rũ cho {member.name}</p>}
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                  <div style={{ width:44, height:44, borderRadius:22, overflow:"hidden", background:"rgba(255,255,255,.1)", flexShrink:0 }}>
                    {member.avatar ? <img src={member.avatar} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>}
                  </div>
                  <div>
                    <p style={{ fontSize:16, fontWeight:900, color:"white", margin:0 }}>🎁 Tặng vật phẩm</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,.4)", margin:0 }}>cho {member.name} · Dùng điểm tích lũy</p>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {GIFTS.map(g => (
                    <button key={g.id} disabled={giftSending} onClick={() => sendGift(g)}
                      style={{ padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,80,120,.2)", background:"rgba(255,255,255,.04)", color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", textAlign:"left" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:26 }}>{g.icon}</span>
                        <span>
                          <span style={{ display:"block", fontSize:13, fontWeight:800 }}>{g.name}</span>
                          <span style={{ display:"block", fontSize:10, color:"rgba(255,255,255,.4)", marginTop:2 }}>✦ +{g.charm} điểm quyến rũ</span>
                        </span>
                      </span>
                      <span style={{ color:"#ff80a0", fontSize:13, fontWeight:800, flexShrink:0 }}>{g.points} điểm →</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowGift(false)}
                  style={{ width:"100%", marginTop:12, padding:"10px", borderRadius:10, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"rgba(255,255,255,.4)", cursor:"pointer", fontSize:13 }}>
                  Huỷ
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
