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
  member:        { header:"linear-gradient(160deg,#2c2c2a,#444441)", card:"rgba(255,255,255,.08)", border:"rgba(255,255,255,.1)",  text:"#f1efe8", sub:"#888780", accent:"#d3d1c7" },
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

  const isOwn = !userId || userId === resolvedPhone;
  console.log('[PROFILE] userId:', userId, 'resolvedPhone:', resolvedPhone, 'isOwn:', isOwn, 'runtimePhone:', runtimePhone, 'profile.phone:', profile?.phone);

  const [member,   setMember]   = useState(null);
  const [champion, setChampion] = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!resolvedPhone) { setLoading(false); return; }
    Promise.all([
      apiClient.get(`/membership/${resolvedPhone}`).catch(() => null),
      apiClient.get(`/game/chess/leaderboard`).catch(() => null),
      apiClient.get(`/profile-update/profile/${resolvedPhone}`).catch(() => null),
    ]).then(([mRes, lbRes, pRes]) => {
      const memberData = mRes?.data?.data || {};
      // Merge avatar từ players table
      const playerAvatar = pRes?.data?.data?.avatar || null;
      setMember({ ...memberData, avatar: playerAvatar });
      const top = lbRes?.data?.data?.topWins?.[0] || lbRes?.data?.topWins?.[0];
      if (top) {
        const topPhone = String(top.user_id).replace(/\D/g,"").replace(/^84/,"0");
        if (topPhone === resolvedPhone) setChampion(true);
      }
    }).finally(() => setLoading(false));
  }, [resolvedPhone]);

  // Debug — xóa sau
  useEffect(() => {
    if (member) console.log('[PROFILE] member:', JSON.stringify({ name: member.name, avatar: member.avatar, tierKey: member.tierKey }), 'isOwn:', isOwn, 'displayName will be:', isOwn ? 'profile.name' : member.name);
  }, [member]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#555", fontSize:14 }}>Đang tải hồ sơ...</p>
    </div>
  );

  if (!resolvedPhone || !member) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <p style={{ fontSize:48, margin:"0 0 12px" }}>👤</p>
      <p style={{ fontSize:15, fontWeight:700, color:"#666" }}>Không tìm thấy hồ sơ</p>
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

        {/* Champion card — dùng TierCard isChampion để đúng thiết kế */}
        {champion && (
          <div style={{ marginBottom:14 }}>
            <TierCard isChampion={true} firstVisit={member.firstVisit}/>
          </div>
        )}

        {/* Hạng thành viên — full hiệu ứng theo thiết kế */}
        <div style={{ marginBottom:14 }}>
          <TierCard tierKey={tierKey} tierName={member.tierName} firstVisit={member.firstVisit}/>
        </div>

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
      </div>

      <style>{`@keyframes liveFlash{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    </div>
  );
}
