import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { TierBadge } from "@/membership/components/TierBadge";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";

injectTierBadgeStyles();

const fmt = n => new Intl.NumberFormat("vi-VN").format(n || 0);

const TIER_BG = {
  member:        { headerBg:"linear-gradient(135deg,#d3d1c7,#b4b2a9)", dark:false },
  loyal:         { headerBg:"linear-gradient(135deg,#9fe1cb,#5dcaa5)", dark:false },
  silver:        { headerBg:"linear-gradient(135deg,#c0d4e8,#85b7eb)", dark:false },
  gold:          { headerBg:"linear-gradient(135deg,#fac775,#ef9f27)", dark:false },
  partner:       { headerBg:"linear-gradient(135deg,#afa9ec,#7f77dd)", dark:false },
  diamond:       { headerBg:"linear-gradient(150deg,#04101e,#061828,#0d2244)", dark:true },
  loyal_partner: { headerBg:"linear-gradient(150deg,#120608,#1e0a14,#200c28)", dark:true },
};

export default function ProfilePage() {
  const navigate     = useNavigate();
  const { userId }   = useParams();
  const profile      = useAuthStore(s => s.profile);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  const resolvedPhone = (() => {
    const src = userId || runtimePhone || profile?.phone || "";
    return src.replace(/\D/g,"").replace(/^84/,"0");
  })();

  const isOwn = !userId || userId === resolvedPhone;

  const [member,   setMember]   = useState(null);
  const [champion, setChampion] = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!resolvedPhone) { setLoading(false); return; }
    Promise.all([
      apiClient.get(`/membership/${resolvedPhone}`).catch(() => null),
      apiClient.get(`/leaderboard/top-games/chess-wins`).catch(() => null),
    ]).then(([mRes, lbRes]) => {
      if (mRes?.data?.data) setMember(mRes.data.data);
      const top = lbRes?.data?.data?.[0];
      if (top) {
        const topPhone = String(top.user_id).replace(/\D/g,"").replace(/^84/,"0");
        if (topPhone === resolvedPhone) setChampion(true);
      }
    }).finally(() => setLoading(false));
  }, [resolvedPhone]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f5" }}>
      <p style={{ color:"#bbb", fontSize:14 }}>⏳ Đang tải hồ sơ...</p>
    </div>
  );

  if (!resolvedPhone || !member) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f5f5f5", padding:24 }}>
      <p style={{ fontSize:48, margin:"0 0 12px" }}>👤</p>
      <p style={{ fontSize:15, fontWeight:700, color:"#666" }}>Không tìm thấy hồ sơ</p>
      <button onClick={() => navigate(-1)} style={{ marginTop:16, padding:"10px 24px", borderRadius:12, border:"none", background:"#D4531C", color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>← Quay lại</button>
    </div>
  );

  const tierKey  = member.tierKey || "member";
  const tierCfg  = TIER_BG[tierKey] || TIER_BG.member;
  const isDark   = tierCfg.dark;
  const textColor = isDark ? "white" : "#1a1a1a";
  const subColor  = isDark ? "rgba(255,255,255,.55)" : "#999";

  const displayName   = member.name || profile?.name || "Cing iu";
  const avatarUrl     = isOwn ? (profile?.avatar || null) : null;
  const points        = member.points || 0;
  const eatTimes      = member.eatTimes || 0;
  const paymentAmount = member.paymentAmount || 0;

  return (
    <div style={{ minHeight:"100vh", background: isDark ? tierCfg.headerBg.split(",")[0].replace("linear-gradient(150deg","").replace("(","").trim() : "#f5f5f5", paddingBottom:100 }}>

      {/* Header */}
      <div style={{ background:tierCfg.headerBg, padding:"calc(env(safe-area-inset-top,0px) + 14px) 20px 36px", position:"relative", overflow:"hidden" }}>
        {isDark && <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 7px)", pointerEvents:"none" }}/>}

        <button onClick={() => navigate(-1)} style={{ background:"rgba(0,0,0,.2)", border:"none", borderRadius:8, padding:"6px 14px", color:"rgba(255,255,255,.8)", fontSize:14, cursor:"pointer", marginBottom:20 }}>←</button>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>

          {/* Avatar */}
          <div style={{ position:"relative" }}>
            <div style={{ width:96, height:96, borderRadius:48, border:"3px solid rgba(255,255,255,.4)", overflow:"hidden", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, fontWeight:900, color:"white", boxShadow:"0 4px 20px rgba(0,0,0,.25)" }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : displayName[0]?.toUpperCase()
              }
            </div>
            {champion && (
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#8a6000,#ffd700,#c47a00)", borderRadius:10, padding:"2px 8px", border:"1.5px solid #ffd700", boxShadow:"0 0 10px rgba(255,210,0,.7)", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:9, fontWeight:900, color:"#120c00" }}>♟️ KIỆN TƯỚNG</span>
              </div>
            )}
          </div>

          {/* Tên + badge nhỏ */}
          <div style={{ textAlign:"center" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:8 }}>
              <h1 style={{ color:"white", fontSize:22, fontWeight:900, margin:0 }}>{displayName}</h1>
              <TierBadge tierKey={tierKey} isChampion={champion} size="sm"/>
            </div>
            <TierBadge tierKey={tierKey} isChampion={champion} size="md" showLabel={true}/>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"0 16px", marginTop:-16 }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
          {[
            { label:"Điểm tích lũy",  value:fmt(points),           icon:"⭐" },
            { label:"Lần ghé thăm",   value:fmt(eatTimes),          icon:"🧋" },
            { label:"Chi tiêu",       value:fmt(paymentAmount)+"đ", icon:"💰" },
          ].map((s,i) => (
            <div key={i} style={{ background: isDark?"rgba(255,255,255,.08)":"white", borderRadius:14, padding:"14px 8px", textAlign:"center", border: isDark?"1px solid rgba(255,255,255,.1)":"1px solid #f0f0f0", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
              <p style={{ fontSize:20, margin:"0 0 4px" }}>{s.icon}</p>
              <p style={{ color:textColor, fontSize:14, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:subColor, fontSize:9, margin:0, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Champion card */}
        {champion && (
          <div style={{ borderRadius:16, padding:"16px 18px", marginBottom:14, background:"linear-gradient(135deg,#1e1400,#2a1c04)", border:"1.5px solid #ffd700", boxShadow:"0 0 20px rgba(186,117,23,.35)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,210,0,.025) 0,rgba(255,210,0,.025) 1px,transparent 1px,transparent 7px)", pointerEvents:"none" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:32 }}>♟️</span>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <p style={{ color:"#ffd700", fontSize:15, fontWeight:900, margin:0 }}>Kiện tướng cờ vua</p>
                  <span style={{ background:"rgba(255,0,0,.85)", borderRadius:4, padding:"1px 6px", fontSize:8, fontWeight:900, color:"#fff", animation:"liveFlash 1.2s ease-in-out infinite" }}>LIVE</span>
                </div>
                <p style={{ color:"#c47a00", fontSize:11, margin:0 }}>Đang giữ ngôi vị Top 1 bảng xếp hạng cờ vua</p>
              </div>
            </div>
          </div>
        )}

        {/* Hạng thành viên */}
        <div style={{ background: isDark?"rgba(255,255,255,.07)":"white", borderRadius:16, padding:"18px", marginBottom:14, border: isDark?"1px solid rgba(255,255,255,.1)":"1px solid #f0f0f0", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
          <p style={{ color:subColor, fontSize:10, fontWeight:700, letterSpacing:1.5, margin:"0 0 14px", textTransform:"uppercase" }}>Hạng thành viên</p>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <TierBadge tierKey={tierKey} size="lg" showLabel={false}/>
            <div>
              <p style={{ color:textColor, fontSize:17, fontWeight:900, margin:"0 0 6px" }}>{member.tierName || "Hội viên"}</p>
              <TierBadge tierKey={tierKey} size="md" showLabel={false}/>
              {member.firstVisit && (
                <p style={{ color:subColor, fontSize:10, margin:"6px 0 0" }}>
                  Thành viên từ {new Date(member.firstVisit).toLocaleDateString("vi-VN", { month:"long", year:"numeric" })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions — chỉ hiện với profile chính mình */}
        {isOwn && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"⭐ Điểm tích lũy", path:"/loyalty", bg:"#D4531C" },
              { label:"📦 Lịch sử đơn",  path:"/orders",  bg:"#2196F3" },
            ].map((a,i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{ background:a.bg, border:"none", borderRadius:12, padding:"13px", color:"white", fontSize:13, fontWeight:800, cursor:"pointer" }}>
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
