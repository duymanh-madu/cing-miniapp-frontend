import { useEffect, useState } from "react";

/**
 * TierBadge — hiển thị huy hiệu hạng thành viên
 * Props:
 *   tierKey: string — "member" | "loyal" | "silver" | "gold" | "diamond" | "partner" | "loyal_partner"
 *   isChampion: bool — đang top 1 BXH cờ vua
 *   size: "sm" | "md" | "lg" — sm=chat, md=profile card, lg=profile page
 *   showLabel: bool — hiển thị tên hạng
 */

const TIER_CONFIG = {
  member: {
    label:   "Hội viên",
    icon:    "🌱",
    bg:      "#e4e2d8",
    color:   "#5f5e5a",
    border:  "#c8c6bc",
    stars:   0,
    glow:    null,
  },
  loyal: {
    label:   "Hội viên thân thiết",
    icon:    "💚",
    bg:      "#9fe1cb",
    color:   "#085041",
    border:  "#5dcaa5",
    stars:   1,
    glow:    null,
  },
  silver: {
    label:   "Hội viên bạc",
    icon:    "🥈",
    bg:      "linear-gradient(135deg,#c0d4e8,#ddeaf8,#c0d4e8)",
    color:   "#185fa5",
    border:  "#85b7eb",
    stars:   2,
    glow:    "0 2px 10px rgba(120,160,200,.35)",
  },
  gold: {
    label:   "Hội viên vàng",
    icon:    "🥇",
    bg:      "linear-gradient(135deg,#fac775,#ef9f27,#fac775)",
    color:   "#412402",
    border:  "#ef9f27",
    stars:   3.5,
    glow:    "0 0 14px rgba(186,117,23,.5)",
  },
  partner: {
    label:   "Đối tác",
    icon:    "🤝",
    bg:      "linear-gradient(135deg,#afa9ec,#7f77dd,#afa9ec)",
    color:   "#fff",
    border:  "#7f77dd",
    stars:   3.5,
    glow:    "0 0 14px rgba(127,119,221,.5)",
  },
  diamond: {
    label:   "Hội viên kim cương",
    icon:    "💎",
    bg:      "linear-gradient(135deg,#0a2a5a,#1a50a0,#3a8adf,#80c0ff,#3a8adf)",
    color:   "#e0f4ff",
    border:  "#3a8adf",
    stars:   5,
    glow:    "0 0 22px rgba(50,140,255,.7), 0 0 55px rgba(50,140,255,.35)",
    royal:   true,
    borderAnim: "linear-gradient(90deg,#0050ff,#40b0ff,#fff,#80d0ff,#0050ff)",
    innerBg: "linear-gradient(150deg,#04101e,#061828,#081e34)",
  },
  loyal_partner: {
    label:   "Đối tác thân thiết",
    icon:    "👑",
    bg:      "linear-gradient(135deg,#4a0a28,#8a1a50,#d4537e,#ff90c0,#c080ff)",
    color:   "#ffe0f0",
    border:  "#d4537e",
    stars:   5,
    glow:    "0 0 22px rgba(212,83,126,.7), 0 0 55px rgba(180,80,255,.35)",
    royal:   true,
    borderAnim: "linear-gradient(90deg,#cc2266,#ff60b0,#fff,#c080ff,#cc2266)",
    innerBg: "linear-gradient(150deg,#120608,#1e0a14,#160820)",
  },
  idol: {
    label:   "Idol",
    icon:    "✨",
    bg:      "linear-gradient(135deg,#5030ff,#8a70ff,#c0b0ff)",
    color:   "#fff",
    border:  "#a080ff",
    stars:   5,
    glow:    "0 0 22px rgba(160,128,255,.7), 0 0 55px rgba(160,128,255,.35)",
    royal:   true,
    borderAnim: "linear-gradient(90deg,#5030ff,#b090ff,#fff,#b090ff,#5030ff)",
    innerBg: "linear-gradient(150deg,#080418,#120828,#1a0a30)",
  },
  ngoi_sao: {
    label:   "Ngôi Sao",
    icon:    "⭐",
    bg:      "linear-gradient(135deg,#ffd700,#ffe766,#fff3a0)",
    color:   "#7a5000",
    border:  "#ffd700",
    stars:   5,
    glow:    "0 0 22px rgba(255,215,0,.7), 0 0 55px rgba(255,215,0,.35)",
    royal:   true,
    borderAnim: "linear-gradient(90deg,#c08000,#ffd700,#fff,#ffd700,#c08000)",
    innerBg: "linear-gradient(150deg,#120b00,#221500,#2c1b00)",
  },
  minh_tinh: {
    label:   "Minh Tinh",
    icon:    "🌟",
    bg:      "linear-gradient(135deg,#ff2060,#ff80b0,#ffd0e0)",
    color:   "#fff",
    border:  "#ff80b0",
    stars:   5,
    glow:    "0 0 22px rgba(255,80,160,.7), 0 0 55px rgba(255,80,160,.35)",
    royal:   true,
    borderAnim: "linear-gradient(90deg,#ff2060,#ff80b0,#fff,#ff80b0,#ff2060)",
    innerBg: "linear-gradient(150deg,#180008,#280010,#320018)",
  },
};

// === HALL OF FAME — Top 3 BXH Alltime (dynamic, không vĩnh viễn) ===
const HOF_CONFIG = {
  hof_1: {
    label:      "Vương Giả",
    icon:       "💎",
    bg:         "linear-gradient(135deg,#3a0010,#aa0030,#ff2060,#ff80a0,#aa0030)",
    color:      "#ff80a0",
    border:     "#ff2060",
    stars:      5,
    glow:       "0 0 30px rgba(255,0,80,.75), 0 0 70px rgba(200,0,60,.4)",
    royal:      true,
    borderAnim: "linear-gradient(90deg,#3a0010,#aa0030,#ff2060,#ff80a0,#fff0f3,#ff2060,#aa0030,#3a0010)",
    innerBg:    "linear-gradient(155deg,#0a0005,#150008,#0a0005)",
    rank:       1,
    subtitle:   "Đỉnh Phong Bất Bại · Truyền Thuyết",
  },
  hof_2: {
    label:      "Phú Hào",
    icon:       "💎",
    bg:         "linear-gradient(135deg,#080030,#1840cc,#5080ff,#90b8ff,#1840cc)",
    color:      "#80a0ff",
    border:     "#2050ee",
    stars:      4,
    glow:       "0 0 22px rgba(40,80,255,.65), 0 0 55px rgba(40,80,220,.35)",
    royal:      true,
    borderAnim: "linear-gradient(90deg,#080030,#1840cc,#5080ff,#b0c8ff,#fff4,#5080ff,#1840cc,#080030)",
    innerBg:    "linear-gradient(155deg,#010208,#02040e,#010208)",
    rank:       2,
    subtitle:   "Tinh Hoa Đệ Nhị",
  },
  hof_3: {
    label:      "Địa Chủ",
    icon:       "💎",
    bg:         "linear-gradient(135deg,#001c0a,#0caa55,#40ee88,#80ffb8,#0caa55)",
    color:      "#40ee80",
    border:     "#0caa55",
    stars:      4,
    glow:       "0 0 20px rgba(20,180,80,.6), 0 0 50px rgba(20,180,80,.3)",
    royal:      true,
    borderAnim: "linear-gradient(90deg,#001c0a,#0caa55,#40ee88,#a0ffcc,#fff4,#40ee88,#0caa55,#001c0a)",
    innerBg:    "linear-gradient(155deg,#010802,#020e04,#010802)",
    rank:       3,
    subtitle:   "Tinh Hoa Đệ Tam",
  },
};

const CHAMPION_CONFIG = {
  label:  "Kiện tướng",
  icon:   "♟️",
  bg:     "linear-gradient(135deg,#3a2200,#7a4a00,#c47a00,#ffd700,#ffb800,#c47a00)",
  color:  "#ffd700",
  border: "#ffd700",
  borderAnim: "linear-gradient(90deg,#8a6000,#ffd700,#fff8dc,#ffb800,#ffd700,#8a6000)",
  innerBg:"linear-gradient(150deg,#120c00,#1e1400,#2a1c04)",
  glow:   "0 0 22px rgba(186,117,23,.7), 0 0 55px rgba(255,180,0,.35)",
};

function StarRating({ stars, size = "sm" }) {
  const starSize = size === "lg" ? 14 : size === "md" ? 12 : 10;
  const full  = Math.floor(stars);
  const half  = stars % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const color = stars >= 5 ? "#ffd700" : stars >= 3.5 ? "#ef9f27" : stars >= 2 ? "#378add" : stars >= 1 ? "#1d9e75" : "#c8c6bc";

  return (
    <div style={{ display:"flex", gap:2, alignItems:"center" }}>
      {Array(full).fill(0).map((_,i) => (
        <svg key={`f${i}`} width={starSize} height={starSize} viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={color} stroke={color} strokeWidth=".5"/>
        </svg>
      ))}
      {half && (
        <svg width={starSize} height={starSize} viewBox="0 0 12 12">
          <defs>
            <linearGradient id={`hg_${stars}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="50%" stopColor={color}/>
              <stop offset="50%" stopColor="transparent" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={`url(#hg_${stars})`} stroke={color} strokeWidth="1"/>
        </svg>
      )}
      {Array(empty).fill(0).map((_,i) => (
        <svg key={`e${i}`} width={starSize} height={starSize} viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="none" stroke={color} strokeWidth="1" opacity=".4"/>
        </svg>
      ))}
    </div>
  );
}


function GemIconSm({ tierKey, size = 20 }) {
  const s = size * 0.85;
  if (tierKey === "hof_1") return (
    <svg width={s} height={s} viewBox="0 0 48 52" style={{ overflow:"visible", filter:"drop-shadow(0 0 4px rgba(255,40,100,.9))" }}>
      <defs>
        <linearGradient id="gs1t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff0f3"/><stop offset="50%" stopColor="#ff80a0"/><stop offset="100%" stopColor="#880030"/></linearGradient>
        <linearGradient id="gs1l" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff4080"/><stop offset="100%" stopColor="#3a0018"/></linearGradient>
        <linearGradient id="gs1r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff90b0"/><stop offset="100%" stopColor="#550020"/></linearGradient>
      </defs>
      <polygon points="10,20 38,20 44,28 38,36 10,36 4,28" fill="#cc0044" opacity=".5"/>
      <polygon points="24,4 36,12 36,20 24,24 12,20 12,12" fill="url(#gs1t)" opacity=".98"/>
      <polygon points="4,28 10,20 12,20 12,36 10,36" fill="url(#gs1l)" opacity=".88"/>
      <polygon points="44,28 38,20 36,20 36,36 38,36" fill="url(#gs1r)" opacity=".85"/>
      <polygon points="12,36 36,36 28,48 20,48" fill="#440018" opacity=".88"/>
      <polygon points="20,48 24,52 28,48" fill="#220010" opacity=".9"/>
      <ellipse cx="22" cy="13" rx="7" ry="4" fill="white" opacity=".3"/>
    </svg>
  );
  if (tierKey === "hof_2") return (
    <svg width={s} height={s} viewBox="0 0 48 52" style={{ overflow:"visible", filter:"drop-shadow(0 0 4px rgba(60,120,255,.9))" }}>
      <defs>
        <linearGradient id="gs2t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e8f0ff"/><stop offset="50%" stopColor="#90b8ff"/><stop offset="100%" stopColor="#0c1880"/></linearGradient>
        <linearGradient id="gs2l" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3060ee"/><stop offset="100%" stopColor="#040830"/></linearGradient>
        <linearGradient id="gs2r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#70a0ff"/><stop offset="100%" stopColor="#080840"/></linearGradient>
      </defs>
      <polygon points="10,20 38,20 44,28 38,36 10,36 4,28" fill="#1840cc" opacity=".5"/>
      <polygon points="24,4 36,12 36,20 24,24 12,20 12,12" fill="url(#gs2t)" opacity=".97"/>
      <polygon points="4,28 10,20 12,20 12,36 10,36" fill="url(#gs2l)" opacity=".85"/>
      <polygon points="44,28 38,20 36,20 36,36 38,36" fill="url(#gs2r)" opacity=".82"/>
      <polygon points="12,36 36,36 28,48 20,48" fill="#0c1870" opacity=".88"/>
      <polygon points="20,48 24,52 28,48" fill="#060c38" opacity=".9"/>
      <ellipse cx="22" cy="13" rx="7" ry="4" fill="white" opacity=".28"/>
    </svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 48 52" style={{ overflow:"visible", filter:"drop-shadow(0 0 4px rgba(30,200,100,.9))" }}>
      <defs>
        <linearGradient id="gs3t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d0ffe8"/><stop offset="50%" stopColor="#70ee99"/><stop offset="100%" stopColor="#043820"/></linearGradient>
        <linearGradient id="gs3l" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18cc66"/><stop offset="100%" stopColor="#011a08"/></linearGradient>
        <linearGradient id="gs3r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60ee88"/><stop offset="100%" stopColor="#022810"/></linearGradient>
      </defs>
      <polygon points="10,20 38,20 44,28 38,36 10,36 4,28" fill="#0c8840" opacity=".5"/>
      <polygon points="24,4 36,12 36,20 24,24 12,20 12,12" fill="url(#gs3t)" opacity=".97"/>
      <polygon points="4,28 10,20 12,20 12,36 10,36" fill="url(#gs3l)" opacity=".85"/>
      <polygon points="44,28 38,20 36,20 36,36 38,36" fill="url(#gs3r)" opacity=".82"/>
      <polygon points="12,36 36,36 28,48 20,48" fill="#043820" opacity=".88"/>
      <polygon points="20,48 24,52 28,48" fill="#021408" opacity=".9"/>
      <ellipse cx="22" cy="13" rx="7" ry="4" fill="white" opacity=".25"/>
    </svg>
  );
}

export function TierBadge({ tierKey = "member", isChampion = false, size = "sm", showLabel = false }) {
  const isHOF = tierKey?.startsWith("hof_");
  const cfg = isHOF ? HOF_CONFIG[tierKey] : (isChampion ? CHAMPION_CONFIG : (TIER_CONFIG[tierKey] || TIER_CONFIG.member));
  const isRoyal = cfg.royal || isChampion || isHOF;

  const iconSize = size === "lg" ? 44 : size === "md" ? 32 : 20;
  const fontSize = size === "lg" ? 22 : size === "md" ? 16 : 11;
  const pillFontSize = size === "lg" ? 11 : size === "md" ? 10 : 9;

  if (size === "sm" && !showLabel) {
    return (
      <span style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        width:          22,
        height:         22,
        borderRadius:   "50%",
        background:     cfg.bg,
        boxShadow:      cfg.glow || "none",
        fontSize:       12,
        flexShrink:     0,
        border:         isRoyal ? "1.5px solid rgba(255,255,255,.3)" : `1px solid ${cfg.border}`,
        animation:      isRoyal ? (isChampion ? "ktGlowSm 2s ease-in-out infinite" : tierKey === "diamond" ? "dGlowSm 2s ease-in-out infinite" : isHOF ? "hofGlowSm 2s ease-in-out infinite" : "pGlowSm 2s ease-in-out infinite") : "none",
        overflow:       "visible",
      }}>
        {isHOF ? <GemIconSm tierKey={tierKey} size={22}/> : cfg.icon}
      </span>
    );
  }

  if (!isRoyal) {
    return (
      <div style={{ display:"inline-flex", alignItems:"center", gap: showLabel ? 6 : 0 }}>
        <div style={{
          width:        iconSize,
          height:       iconSize,
          borderRadius: "50%",
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}`,
          boxShadow:    cfg.glow || "none",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          fontSize:     fontSize,
          flexShrink:   0,
        }}>
          {cfg.icon}
        </div>
        {showLabel && (
          <div>
            <p style={{ color: cfg.color === "#fff" ? "#26215c" : cfg.color, fontSize: pillFontSize + 2, fontWeight:800, margin:0 }}>{cfg.label}</p>
            {size !== "sm" && <StarRating stars={TIER_CONFIG[tierKey]?.stars || 0} size={size}/>}
          </div>
        )}
      </div>
    );
  }

  // Royal / Champion
  return (
    <div style={{
      display:  "inline-flex",
      alignItems: showLabel ? "center" : "flex-start",
      gap:      showLabel ? 8 : 0,
    }}>
      <div style={{
        padding:      "2px",
        borderRadius: "50%",
        background:   cfg.borderAnim,
        backgroundSize: "400% 100%",
        animation:    "royalBorder 1.8s linear infinite",
        flexShrink:   0,
      }}>
        <div style={{
          width:        iconSize,
          height:       iconSize,
          borderRadius: "50%",
          background:   cfg.bg,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          fontSize:     fontSize,
          boxShadow:    cfg.glow,
          animation:    isChampion ? "ktGlow 2.2s ease-in-out infinite" : isHOF && tierKey === "hof_1" ? "hofGlow1 2s ease-in-out infinite" : isHOF && tierKey === "hof_2" ? "hofGlow2 2s ease-in-out infinite" : isHOF ? "hofGlow3 2s ease-in-out infinite" : tierKey === "diamond" ? "diamondGlowBadge 2s ease-in-out infinite" : "partnerGlowBadge 2s ease-in-out infinite",
          position:     "relative",
          overflow:     "visible",
        }}>
          {isHOF ? <GemIconSm tierKey={tierKey} size={iconSize}/> : cfg.icon}
        </div>
      </div>
      {showLabel && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <p style={{ color: cfg.color, fontSize: pillFontSize + 3, fontWeight:900, margin:0 }}>{cfg.label}</p>
            {(isChampion || isHOF) && (
              <span style={{ background: isHOF ? "rgba(255,255,255,.15)" : "rgba(255,0,0,.85)", borderRadius:4, padding:"1px 5px", fontSize:8, fontWeight:900, color: isHOF ? cfg.color : "#fff", animation:"liveFlash 1.2s ease-in-out infinite", border: isHOF ? `1px solid ${cfg.border}` : "none" }}>
                {isHOF ? `Top ${cfg.rank} Alltime` : "LIVE"}
              </span>
            )}
          </div>
          {size !== "sm" && (
            <StarRating
              stars={isHOF ? cfg.stars : isChampion ? 4 : TIER_CONFIG[tierKey]?.stars || 5}
              size={size}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TierBadge;
