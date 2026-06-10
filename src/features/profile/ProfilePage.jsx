import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { TierBadge } from "@/membership/components/TierBadge";
import { TierCard } from "@/membership/components/TierCard";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";
import CharmChatBadge from "@/features/game-center/components/chat-badges/CharmChatBadge";

injectTierBadgeStyles();

const fmt = n => new Intl.NumberFormat("vi-VN").format(n || 0);

const CHARM_BADGE_META = {
  idol: { key:"idol", label:"Idol" },
  ngoi_sao: { key:"ngoi_sao", label:"Ngôi sao" },
  minh_tinh: { key:"minh_tinh", label:"Minh tinh" },
};

const CHARM_CFG = {
  minh_tinh: {
    border:"linear-gradient(90deg,#6a0020,#cc0055,#ff60a0,#ffe0f0,#ff60a0,#cc0055,#6a0020)",
    inner:"linear-gradient(155deg,#0a0005,#180008,#0a0005)",
    iconBg:"radial-gradient(circle at 35% 35%,#ffb0d0 0%,#ee0055 35%,#880028 65%,#3a0010 100%)",
    color:"#ff80b0",
    glow:"hofGlow1 1.8s ease-in-out infinite",
    icon:"🌟",
    sub:"20.000 điểm quyến rũ",
    rank:"Đỉnh cao quyến rũ",
    svgIcon: (
      <>
        <polygon points="24,2 26.5,15 37,6 30,18 43,20 30,25 40,35 27,30 26,44 24,31 22,44 21,30 8,35 18,25 5,20 18,18 11,6 22,15" fill="#ff60a0" stroke="#cc0044" strokeWidth="0.8"/>
        <polygon points="24,8 26,17 34,10 29,19 38,21 29,24 36,32 26,28 25,38 24,29 23,38 22,28 12,32 19,24 10,21 19,19 14,10 22,17" fill="#ffb0d0" opacity="0.7" stroke="none"/>
        <circle cx="24" cy="24" r="5" fill="white" opacity="0.95"/>
        <circle cx="24" cy="24" r="2.5" fill="#ff4090" opacity="0.8"/>
      </>
    ),
  },
  ngoi_sao: {
    border:"linear-gradient(90deg,#6a4a00,#c09000,#ffd700,#fffacc,#ffd700,#c09000,#6a4a00)",
    inner:"linear-gradient(155deg,#090700,#160e00,#090700)",
    iconBg:"radial-gradient(circle at 35% 35%,#ffe880 0%,#d4a000 35%,#7a5000 65%,#2a1800 100%)",
    color:"#ffd700",
    glow:"ktGlowCard 2s ease-in-out infinite",
    icon:"⭐",
    sub:"10.000 điểm quyến rũ",
    rank:"Ngôi sao tỏa sáng",
    svgIcon: (
      <>
        <polygon points="24,3 29,17 44,17 32,26 37,40 24,31 11,40 16,26 4,17 19,17" fill="#ffd700" stroke="#c09000" strokeWidth="1"/>
        <polygon points="24,8 28,18 39,18 30,24 34,35 24,28 14,35 18,24 9,18 20,18" fill="#fff5a0" opacity="0.7" stroke="none"/>
        <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
      </>
    ),
  },
  idol: {
    border:"linear-gradient(90deg,#2a1060,#6040c0,#a080ff,#e0d0ff,#a080ff,#6040c0,#2a1060)",
    inner:"linear-gradient(155deg,#060318,#0e0628,#060318)",
    iconBg:"radial-gradient(circle at 35% 35%,#d0c0ff 0%,#8060e0 35%,#3a2080 65%,#100840 100%)",
    color:"#b090ff",
    glow:"partnerGlowCard 2s ease-in-out infinite",
    icon:"✨",
    sub:"5.000 điểm quyến rũ",
    rank:"Idol của cộng đồng",
    svgIcon: (
      <>
        <polygon points="24,4 27,20 43,24 27,28 24,44 21,28 5,24 21,20" fill="#c0a0ff" stroke="#8060e0" strokeWidth="1"/>
        <polygon points="24,10 26,20 37,24 26,28 24,38 22,28 11,24 22,20" fill="#e8d8ff" stroke="none" opacity="0.6"/>
        <circle cx="24" cy="24" r="3" fill="white" opacity="0.9"/>
      </>
    ),
  },
};

function CharmMiniBadge({ badgeKey, size = "sm", showLabel = false }) {
  const meta = CHARM_BADGE_META[badgeKey] || CHARM_BADGE_META.idol;
  const cfg = CHARM_CFG[badgeKey] || CHARM_CFG.idol;

  const box = size === "md" ? 34 : 24;
  const icon = size === "md" ? 22 : 15;
  const font = size === "md" ? 14 : 9;

  return (
    <span style={{
      display:"inline-flex",
      alignItems:"center",
      justifyContent:"center",
      gap: showLabel ? 8 : 0,
      color: cfg.color,
      fontSize: font,
      fontWeight: 900,
      lineHeight: 1,
      whiteSpace:"nowrap",
    }}>
      <span style={{
        width: box,
        height: box,
        borderRadius:"50%",
        background: cfg.iconBg,
        display:"inline-flex",
        alignItems:"center",
        justifyContent:"center",
        border:`1.5px solid ${cfg.color}`,
        boxShadow:`0 0 10px ${cfg.color}66`,
        flexShrink:0,
      }}>
        <svg viewBox="0 0 48 48" width={icon} height={icon} style={{ display:"block" }}>
          {cfg.svgIcon}
        </svg>
      </span>
      {showLabel && (
        <span style={{ color: cfg.color, fontWeight:900 }}>
          {meta.label}
        </span>
      )}
    </span>
  );
}

function CharmProfileCard({ badgeKey }) {
  const meta = CHARM_BADGE_META[badgeKey] || CHARM_BADGE_META.idol;
  const cfg = CHARM_CFG[badgeKey] || CHARM_CFG.idol;

  return (
    <div style={{ borderRadius:20, padding:"2.5px", background:cfg.border, backgroundSize:"400% 100%", animation:"royalBorder 1.8s linear infinite" }}>
      <div style={{ borderRadius:18, padding:"18px 16px", background:cfg.inner, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.1),rgba(255,255,255,.2),rgba(255,255,255,.1),transparent)", animation:"tcScan 2.5s ease-in-out infinite", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 30% 50%,${cfg.color}15 0%,transparent 60%)`, pointerEvents:"none", borderRadius:18 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative", zIndex:1 }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:cfg.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, animation:cfg.glow, position:"relative", overflow:"hidden" }}>
            {cfg.svgIcon
              ? <svg viewBox="0 0 48 48" width="40" height="40">{cfg.svgIcon}</svg>
              : <span style={{ fontSize:32 }}>{cfg.icon}</span>
            }
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 60%)" }}/>
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ background:`${cfg.color}22`, borderRadius:20, padding:"3px 10px", marginBottom:6, border:`1px solid ${cfg.color}44`, display:"inline-flex", alignItems:"center", maxWidth:"100%" }}>
              <span style={{ fontSize:10, fontWeight:800, color:cfg.color, letterSpacing:.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cfg.rank}</span>
            </div>
            <p style={{ fontSize:18, fontWeight:900, color:cfg.color, margin:"0 0 5px", textShadow:`0 0 16px ${cfg.color}`, whiteSpace:"nowrap" }}>{meta.label}</p>
            <div style={{ display:"flex", gap:3 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="13" height="13" viewBox="0 0 12 12">
                  <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={cfg.color} stroke={cfg.color} strokeWidth=".5"/>
                </svg>
              ))}
            </div>
          </div>

          <div style={{ textAlign:"right", flexShrink:0, paddingLeft:8 }}>
            <p style={{ fontSize:9, color:"rgba(255,255,255,.35)", margin:"0 0 3px", letterSpacing:1, textTransform:"uppercase" }}>Yêu cầu</p>
            <p style={{ fontSize:12, fontWeight:900, color:cfg.color, margin:0, whiteSpace:"nowrap" }}>{cfg.sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


const TIER_THEME = {
  member:        { header:"linear-gradient(160deg,#2c2c2a,#444441)", card:"rgba(255,255,255,.08)", border:"rgba(255,255,255,.1)",  text:"#f1efe8", sub:"#888780", accent:"#d3d1c7" },
  loyal:         { header:"linear-gradient(160deg,#04342c,#0f6e56)", card:"rgba(255,255,255,.09)", border:"rgba(159,225,203,.2)", text:"#e1f5ee", sub:"#9fe1cb", accent:"#5dcaa5" },
  silver:        { header:"linear-gradient(160deg,#042c53,#0c447c)", card:"rgba(255,255,255,.09)", border:"rgba(133,183,235,.2)", text:"#e6f1fb", sub:"#85b7eb", accent:"#378add" },
  gold:          { header:"linear-gradient(160deg,#412402,#854f0b)", card:"rgba(255,255,255,.09)", border:"rgba(250,199,117,.2)", text:"#faeeda", sub:"#fac775", accent:"#ef9f27" },
  partner:       { header:"linear-gradient(160deg,#26215c,#534ab7)", card:"rgba(255,255,255,.09)", border:"rgba(175,169,236,.2)", text:"#eeedfe", sub:"#afa9ec", accent:"#7f77dd" },
  diamond:       { header:"linear-gradient(160deg,#020810,#061828,#0d2244)", card:"rgba(255,255,255,.07)", border:"rgba(58,138,223,.25)", text:"#e0f4ff", sub:"#64b4ff", accent:"#3a8adf", royal:true },
  loyal_partner: { header:"linear-gradient(160deg,#0a0308,#1e0a14,#200c28)", card:"rgba(255,255,255,.07)", border:"rgba(212,83,126,.25)", text:"#ffe0f0", sub:"#ff90c0", accent:"#d4537e", royal:true },
  champion:      { header:"linear-gradient(160deg,#0e0900,#261800,#3a2200)", card:"rgba(255,255,255,.07)", border:"rgba(255,215,0,.25)", text:"#ffd700", sub:"#c47a00", accent:"#ffd700", royal:true },
  hof_1:         { header:"linear-gradient(160deg,#0a0005,#180008,#250010)", card:"rgba(255,255,255,.07)", border:"rgba(255,0,80,.25)", text:"#ff80a0", sub:"#cc3060", accent:"#ff2060", royal:true },
  hof_2:         { header:"linear-gradient(160deg,#010208,#02040e,#040820)", card:"rgba(255,255,255,.07)", border:"rgba(40,80,255,.25)", text:"#80a0ff", sub:"#2848cc", accent:"#2050ee", royal:true },
  hof_3:         { header:"linear-gradient(160deg,#010802,#020e04,#041008)", card:"rgba(255,255,255,.07)", border:"rgba(20,180,80,.25)", text:"#40ee80", sub:"#0c8840", accent:"#0caa55", royal:true },
  idol:          { header:"linear-gradient(160deg,#060318,#0e0628,#14082e)", card:"rgba(255,255,255,.07)", border:"rgba(160,128,255,.25)", text:"#b090ff", sub:"#6040c0", accent:"#a080ff", royal:true },
  ngoi_sao:      { header:"linear-gradient(160deg,#090700,#160e00,#221500)", card:"rgba(255,255,255,.07)", border:"rgba(255,215,0,.25)", text:"#ffd700", sub:"#c09000", accent:"#d4a000", royal:true },
  minh_tinh:     { header:"linear-gradient(160deg,#0a0005,#180008,#200a10)", card:"rgba(255,255,255,.07)", border:"rgba(255,80,160,.25)", text:"#ff80b0", sub:"#cc0055", accent:"#ff2060", royal:true },
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
    ]).then(([mRes, lbRes, atRes, pRes]) => {
      const memberData = mRes?.data?.data || {};
      // Merge avatar từ players table
      const playerAvatar = pRes?.data?.data?.avatar || null;
      const charmPoints = pRes?.data?.data?.charm_points || 0;
      const selectedBadge = pRes?.data?.data?.selected_badge || null;
      if (selectedBadge) setPrimaryBadge(selectedBadge);
      const customBadges = Array.isArray(pRes?.data?.data?.custom_badges)
        ? pRes.data.data.custom_badges
        : [];
      setMember({ ...memberData, avatar: playerAvatar, charmPoints, customBadges });
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
  const customBadges = Array.isArray(member.customBadges) ? member.customBadges : [];
  const ownedBadges = [
    tierKey,
    ...customBadges,
    ...(champion ? ["champion"] : []),
    ...(hofRank ? [hofRank] : []),
  ].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i);

  const fallbackBadge =
    hofRank ||
    (champion ? "champion" : null) ||
    (customBadges.includes("minh_tinh") ? "minh_tinh" : null) ||
    (customBadges.includes("ngoi_sao") ? "ngoi_sao" : null) ||
    (customBadges.includes("idol") ? "idol" : null) ||
    tierKey;

  const activeBadge = ownedBadges.includes(primaryBadge) ? primaryBadge : fallbackBadge;
  const theme = TIER_THEME[activeBadge] || TIER_THEME[tierKey] || TIER_THEME.member;

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

  const renderBadgeCard = (badgeKey) => {
    if (["idol","ngoi_sao","minh_tinh"].includes(badgeKey)) {
      return <CharmProfileCard badgeKey={badgeKey}/>;
    }

    if (badgeKey === "champion") {
      return <TierCard isChampion={true} firstVisit={member.firstVisit}/>;
    }

    if (badgeKey?.startsWith("hof_")) {
      return <TierCard tierKey={badgeKey} firstVisit={member.firstVisit}/>;
    }

    return <TierCard tierKey={badgeKey} tierName={badgeKey === tierKey ? member.tierName : undefined} firstVisit={member.firstVisit}/>;
  };

  const getBadgeOption = (badgeKey) => {
    if (CHARM_BADGE_META[badgeKey]) {
      const cfg = CHARM_CFG[badgeKey];
      return {
        key: badgeKey,
        label: CHARM_BADGE_META[badgeKey].label,
        sub: "Danh hiệu quyến rũ",
        color: cfg?.color || "#b090ff",
      };
    }

    if (badgeKey === "champion") {
      return { key:"champion", label:"Kiện tướng", sub:"Top 1 Cờ vua · Live", color:"#ffd700" };
    }

    if (badgeKey?.startsWith("hof_")) {
      return {
        key: badgeKey,
        label: badgeKey==="hof_1" ? "Vương Giả" : badgeKey==="hof_2" ? "Phú Hào" : "Địa Chủ",
        sub: badgeKey==="hof_1" ? "Top 1 Alltime" : badgeKey==="hof_2" ? "Top 2 Alltime" : "Top 3 Alltime",
        color: badgeKey==="hof_1" ? "#ff80a0" : badgeKey==="hof_2" ? "#80a0ff" : "#40ee80",
      };
    }

    return {
      key: badgeKey,
      label: badgeKey === tierKey ? (member.tierName || "Hạng thành viên") : badgeKey,
      sub: "Hạng thành viên",
      color: TIER_THEME[badgeKey]?.accent || theme.accent || "#aaa",
    };
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", paddingBottom:100 }}>

      {/* Header */}
      <div style={{ background:theme.header, padding:"calc(env(safe-area-inset-top,0px) + 14px) 20px 48px", position:"relative", overflow:"hidden" }}>


        <button onClick={() => navigate(-1)} style={{ background:"rgba(0,0,0,.3)", border:"none", borderRadius:8, padding:"6px 14px", color:"rgba(255,255,255,.75)", fontSize:14, cursor:"pointer", marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
          ← {backToGame ? "Quay lại ván cờ" : ""}
        </button>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
          {/* Avatar */}
          {(() => {
            // Config nhãn danh hiệu theo activeBadge
            const charmHeader = ["idol","ngoi_sao","minh_tinh"].includes(activeBadge)
              ? CHARM_CFG[activeBadge]
              : null;

            const badgeLabel = charmHeader
              ? {
                  text: CHARM_BADGE_META[activeBadge]?.label?.toUpperCase() || "",
                  useChatBadge: true,
                  bg: "transparent",
                  border: "transparent",
                  shadow: "none",
                  bg: charmHeader.inner,
                  border: charmHeader.color,
                  shadow: `${charmHeader.color}66`,
                  textColor: charmHeader.color,
                  iconBg: charmHeader.iconBg,
                  svgIcon: charmHeader.svgIcon,
                }
              : activeBadge === "champion" ? { icon:"♟️", text:"KIỆN TƯỚNG", bg:"linear-gradient(90deg,#8a6000,#ffd700,#c47a00)", border:"#ffd700", shadow:"rgba(255,210,0,.7)", textColor:"#120c00" }
              : activeBadge === "hof_1" ? { icon:"♦", text:"VƯƠNG GIẢ", bg:"linear-gradient(90deg,#3a0010,#cc0050,#ff2060)", border:"#ff2060", shadow:"rgba(255,0,80,.7)", textColor:"#ffe0ea" }
              : activeBadge === "hof_2" ? { icon:"♦", text:"PHÚ HÀO", bg:"linear-gradient(90deg,#080030,#1840cc,#4060ee)", border:"#2050ee", shadow:"rgba(40,80,255,.7)", textColor:"#c0d8ff" }
              : activeBadge === "hof_3" ? { icon:"♦", text:"ĐỊA CHỦ", bg:"linear-gradient(90deg,#001c0a,#0caa55,#30cc70)", border:"#0caa55", shadow:"rgba(20,180,80,.7)", textColor:"#a0ffcc" }
              : null;
            return (
              <div style={{ position:"relative" }}>
                <div style={{ width:96, height:96, borderRadius:48, border:`2.5px solid ${theme.accent}`, overflow:"hidden", background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, fontWeight:900, color:"white", boxShadow:`0 4px 24px rgba(0,0,0,.4), 0 0 0 1px ${theme.border}` }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    : displayName[0]?.toUpperCase()
                  }
                </div>
                {badgeLabel && (
                  <div style={{
                    position:"absolute",
                    bottom:-12,
                    left:"50%",
                    transform:"translateX(-50%)",
                    zIndex:50,
                    whiteSpace:"nowrap",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    pointerEvents:"none",
                  }}>
                    {badgeLabel.useChatBadge ? (
                      <div className="profile-avatar-charm-badge">
                        <CharmChatBadge badgeKey={activeBadge} compact={true}/>
                      </div>
                    ) : (
                      <div style={{
                        background:badgeLabel.bg,
                        borderRadius:12,
                        padding:"4px 10px",
                        border:`1.5px solid ${badgeLabel.border}`,
                        boxShadow:`0 0 10px ${badgeLabel.shadow}`,
                        minWidth:74,
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                      }}>
                        <span style={{
                          fontSize:9,
                          fontWeight:900,
                          color:badgeLabel.textColor,
                          display:"inline-flex",
                          alignItems:"center",
                          justifyContent:"center",
                          gap:5,
                          lineHeight:1,
                        }}>
                          {badgeLabel.icon && <span>{badgeLabel.icon}</span>}
                          {badgeLabel.text}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tên */}
          <div style={{ textAlign:"center" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
              <h1 style={{ color:"white", fontSize:24, fontWeight:900, margin:0, textShadow:"0 2px 8px rgba(0,0,0,.5)" }}>{displayName}</h1>
              {["idol","ngoi_sao","minh_tinh"].includes(activeBadge)
                ? <CharmMiniBadge badgeKey={activeBadge} size="sm"/>
                : <TierBadge tierKey={activeBadge === "champion" ? tierKey : activeBadge} isChampion={activeBadge === "champion"} size="sm"/>
              }
            </div>
            {["idol","ngoi_sao","minh_tinh"].includes(activeBadge)
              ? <CharmMiniBadge badgeKey={activeBadge} size="md" showLabel={true}/>
              : <TierBadge tierKey={activeBadge === "champion" ? tierKey : activeBadge} isChampion={activeBadge === "champion"} size="md" showLabel={true}/>
            }
          </div>
        </div>
      </div>

      {/* Body — nổi lên trên header */}
      <div style={{ padding:"0 16px", marginTop:-20 }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[
            { label:"Điểm tích lũy",  value:fmt(points),              icon:"⭐", accent:"#D4531C" },
            { label:"Điểm quyến rũ",  value:fmt(member.charmPoints||0),icon:"✨", accent:"#b090ff" },
            { label:"Lần ghé thăm",   value:fmt(eatTimes),             icon:"🧋", accent:"#2196F3" },
            { label:"Chi tiêu",       value:fmt(paymentAmount)+"đ",    icon:"💰", accent:"#4CAF50" },
          ].map((s,i) => (
            <div key={i} style={{ background:theme.card, borderRadius:16, padding:"16px 8px", textAlign:"center", border:`1px solid ${theme.border}`, backdropFilter:"blur(10px)" }}>
              <p style={{ fontSize:22, margin:"0 0 6px" }}>{s.icon}</p>
              <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 3px" }}>{s.value}</p>
              <p style={{ color:theme.sub, fontSize:9, margin:0, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* DANH HIỆU CHÍNH — theme của profile */}
        <div style={{ marginBottom:14 }}>
          {["idol","ngoi_sao","minh_tinh"].includes(activeBadge)
            ? <CharmProfileCard badgeKey={activeBadge}/>
            : activeBadge === "champion"
            ? <TierCard isChampion={true} firstVisit={member.firstVisit}/>
            : activeBadge?.startsWith("hof_")
            ? <TierCard tierKey={activeBadge} firstVisit={member.firstVisit}/>
            : <TierCard tierKey={activeBadge} tierName={member.tierName} firstVisit={member.firstVisit}/>
          }
        </div>

        {/* CHỌN DANH HIỆU CHÍNH — chỉ chính chủ */}
        {isOwn && ownedBadges.length > 1 && (
          <div style={{ marginBottom:14 }}>
            <button onClick={() => setShowBadgePicker(p => !p)}
              style={{ width:"100%", padding:"10px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.7)", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <span>🎖</span> Chọn danh hiệu hiển thị chính
              <span style={{ marginLeft:"auto", opacity:.5 }}>{showBadgePicker ? "▲" : "▼"}</span>
            </button>

            {showBadgePicker && (
              <div style={{ marginTop:8, background:"rgba(0,0,0,.4)", borderRadius:14, padding:12, border:"1px solid rgba(255,255,255,.1)" }}>
                {ownedBadges.map(getBadgeOption).map(opt => (
                  <div key={opt.key} onClick={() => {
                      setPrimaryBadge(opt.key);
                      setShowBadgePicker(false);
                      if (isOwn && resolvedPhone) {
                        apiClient.patch(`/profile-update/profile/${resolvedPhone}/preferences`, {
                          selected_badge: opt.key,
                        }).catch(() => {});
                      }
                    }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, marginBottom:6, cursor:"pointer", border:activeBadge===opt.key?`1.5px solid ${opt.color}`:"1px solid rgba(255,255,255,.1)", background:activeBadge===opt.key?"rgba(255,255,255,.08)":"transparent" }}>
                    {["idol","ngoi_sao","minh_tinh"].includes(opt.key)
                      ? <CharmMiniBadge badgeKey={opt.key} size="sm"/>
                      : <TierBadge tierKey={opt.key==="champion"?tierKey:opt.key} isChampion={opt.key==="champion"} size="sm"/>
                    }
                    <div style={{ flex:1 }}>
                      <p style={{ color:"white", fontSize:13, fontWeight:800, margin:0 }}>{opt.label}</p>
                      <p style={{ color:"rgba(255,255,255,.4)", fontSize:10, margin:"2px 0 0" }}>{opt.sub}</p>
                    </div>
                    {activeBadge===opt.key && <span style={{ color:opt.color, fontSize:16 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TẤT CẢ DANH HIỆU ĐANG SỞ HỮU */}
        {ownedBadges.filter(b => b !== activeBadge).map(badgeKey => (
          <div key={badgeKey} style={{ marginBottom:14 }}>
            {renderBadgeCard(badgeKey)}
          </div>
        ))}

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

      <style>{`
        .profile-avatar-charm-badge{
          position: relative;
          z-index: 99;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(1.5);
          transform-origin: center center;
        }
        .profile-avatar-charm-badge .charm-chat-badge{
          margin: 0 !important;
          transform: none !important;
        }
        .profile-avatar-charm-badge .charm-chat-badge--compact{
          margin: 0 !important;
          transform: none !important;
        }
      `}</style>
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
