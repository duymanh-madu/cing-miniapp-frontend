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

export function TierBadge({ tierKey = "member", isChampion = false, size = "sm", showLabel = false }) {
  const cfg = isChampion ? CHAMPION_CONFIG : (TIER_CONFIG[tierKey] || TIER_CONFIG.member);
  const isRoyal = cfg.royal || isChampion;

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
        animation:      isRoyal ? (isChampion ? "ktGlowSm 2s ease-in-out infinite" : tierKey === "diamond" ? "dGlowSm 2s ease-in-out infinite" : "pGlowSm 2s ease-in-out infinite") : "none",
      }}>
        {cfg.icon}
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
          animation:    isChampion ? "ktGlow 2.2s ease-in-out infinite" : tierKey === "diamond" ? "diamondGlowBadge 2s ease-in-out infinite" : "partnerGlowBadge 2s ease-in-out infinite",
          position:     "relative",
        }}>
          {cfg.icon}
        </div>
      </div>
      {showLabel && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <p style={{ color: cfg.color, fontSize: pillFontSize + 3, fontWeight:900, margin:0 }}>{cfg.label}</p>
            {isChampion && (
              <span style={{ background:"rgba(255,0,0,.85)", borderRadius:4, padding:"1px 5px", fontSize:8, fontWeight:900, color:"#fff", animation:"liveFlash 1.2s ease-in-out infinite" }}>
                LIVE
              </span>
            )}
          </div>
          {size !== "sm" && (
            <StarRating
              stars={isChampion ? 4 : TIER_CONFIG[tierKey]?.stars || 5}
              size={size}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TierBadge;
