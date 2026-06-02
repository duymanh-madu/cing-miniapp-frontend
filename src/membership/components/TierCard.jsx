/**
 * TierCard — card hạng thành viên full hiệu ứng cho ProfilePage
 * Thiết kế theo đúng mockup đã chốt
 */

function StarRow({ tierKey }) {
  const stars  = { member:0, loyal:1, silver:2, gold:3.5, partner:3.5, diamond:5, loyal_partner:5 };
  const colors = { member:"#b4b2a9", loyal:"#1d9e75", silver:"#378add", gold:"#ef9f27", partner:"#7f77dd", diamond:"#3a8adf", loyal_partner:"#d4537e" };
  const s = stars[tierKey] || 0;
  const c = colors[tierKey] || "#888";
  const full = Math.floor(s);
  const half = s % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div style={{ display:"flex", gap:3, alignItems:"center" }}>
      {Array(full).fill(0).map((_,i) => (
        <svg key={"f"+i} width="15" height="15" viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={c} stroke={c} strokeWidth=".5"/>
        </svg>
      ))}
      {half && (
        <svg width="15" height="15" viewBox="0 0 12 12">
          <defs><linearGradient id="hpf2" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={c}/>
            <stop offset="50%" stopColor="transparent" stopOpacity="0"/>
          </linearGradient></defs>
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="url(#hpf2)" stroke={c} strokeWidth="1"/>
        </svg>
      )}
      {Array(empty).fill(0).map((_,i) => (
        <svg key={"e"+i} width="15" height="15" viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="none" stroke={c} strokeWidth="1" opacity=".4"/>
        </svg>
      ))}
    </div>
  );
}

const TIER_CARD_CONFIG = {
  member: {
    outerBg:   "#2c2c2a",
    innerBg:   "#1e1e1c",
    border:    "#444441",
    badgeBg:   "#e4e2d8",
    icon:      "🌱",
    nameColor: "#f1efe8",
    subColor:  "#888780",
    label:     "Hội viên",
    royal:     false,
  },
  loyal: {
    outerBg:   "#0a2a20",
    innerBg:   "#061a14",
    border:    "#5dcaa5",
    badgeBg:   "#9fe1cb",
    icon:      "💚",
    nameColor: "#e1f5ee",
    subColor:  "#5dcaa5",
    label:     "Hội viên thân thiết",
    royal:     false,
  },
  silver: {
    outerBg:   "#0a1828",
    innerBg:   "#061020",
    border:    "#85b7eb",
    badgeBg:   "linear-gradient(135deg,#c0d4e8,#ddeaf8,#c0d4e8)",
    icon:      "🥈",
    nameColor: "#e6f1fb",
    subColor:  "#85b7eb",
    label:     "Hội viên bạc",
    royal:     false,
    shimmer:   true,
  },
  gold: {
    outerBg:   "#1e1000",
    innerBg:   "#140a00",
    border:    "#ef9f27",
    badgeBg:   "linear-gradient(135deg,#fac775,#ef9f27,#fac775)",
    icon:      "🥇",
    nameColor: "#faeeda",
    subColor:  "#fac775",
    label:     "Hội viên vàng",
    royal:     false,
    pulse:     true,
    pulseColor:"rgba(186,117,23,.5)",
  },
  partner: {
    outerBg:   "#100a2a",
    innerBg:   "#0a0620",
    border:    "#7f77dd",
    badgeBg:   "linear-gradient(135deg,#afa9ec,#7f77dd,#afa9ec)",
    icon:      "🤝",
    nameColor: "#eeedfe",
    subColor:  "#afa9ec",
    label:     "Đối tác",
    royal:     false,
    pulse:     true,
    pulseColor:"rgba(127,119,221,.5)",
  },
  diamond: {
    borderAnim: "linear-gradient(90deg,#0050ff,#40b0ff,#fff,#80d0ff,#0050ff)",
    innerBg:    "linear-gradient(150deg,#04101e,#061828,#0d2244)",
    badgeBg:    "linear-gradient(135deg,#0a2a5a,#1a50a0,#3a8adf,#80c0ff,#3a8adf)",
    icon:       "💎",
    nameColor:  "#e0f4ff",
    subColor:   "#64b4ff",
    label:      "Hội viên kim cương",
    royal:      true,
    glowColor:  "rgba(50,140,255,.7)",
    glowColor2: "rgba(50,140,255,.35)",
    scanColor:  "rgba(100,180,255,.2)",
  },
  loyal_partner: {
    borderAnim: "linear-gradient(90deg,#cc2266,#ff60b0,#fff,#c080ff,#cc2266)",
    innerBg:    "linear-gradient(150deg,#120608,#1e0a14,#160820)",
    badgeBg:    "linear-gradient(135deg,#4a0a28,#8a1a50,#d4537e,#ff90c0,#c080ff)",
    icon:       "👑",
    nameColor:  "#ffe0f0",
    subColor:   "#ff90c0",
    label:      "Đối tác thân thiết",
    royal:      true,
    glowColor:  "rgba(212,83,126,.7)",
    glowColor2: "rgba(180,80,255,.35)",
    scanColor:  "rgba(255,120,180,.2)",
  },
};

export function TierCard({ tierKey = "member", tierName, firstVisit }) {
  const cfg = TIER_CARD_CONFIG[tierKey] || TIER_CARD_CONFIG.member;

  if (cfg.royal) {
    return (
      <div style={{ borderRadius:20, padding:"2.5px", background:cfg.borderAnim, backgroundSize:"400% 100%", animation:"royalBorder 1.8s linear infinite" }}>
        <div style={{ borderRadius:18, padding:"20px 18px", background:cfg.innerBg, position:"relative", overflow:"hidden" }}>
          {/* Scanline */}
          <div style={{ position:"absolute", top:0, bottom:0, width:"50%", background:`linear-gradient(90deg,transparent,${cfg.scanColor},transparent)`, animation:"tcScan 3.5s ease-in-out infinite", pointerEvents:"none" }}/>
          {/* Texture */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 7px)", pointerEvents:"none" }}/>
          {/* Radial glow center */}
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 50%,${cfg.glowColor2.replace(".35",",.08")} 0%,transparent 65%)`, pointerEvents:"none" }}/>

          <p style={{ color:cfg.subColor, fontSize:10, fontWeight:700, letterSpacing:1.5, margin:"0 0 16px", textTransform:"uppercase" }}>Hạng thành viên</p>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {/* Badge với glow */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:68, height:68, borderRadius:"50%", background:cfg.badgeBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, animation:`tcGlow_${tierKey} 2s ease-in-out infinite, tcFloat 3s ease-in-out infinite`, flexShrink:0 }}>
                {cfg.icon}
                {/* Sparkles */}
                <div style={{ position:"absolute", top:3, right:5, width:7, height:7, borderRadius:"50%", background:"#fff", animation:"tcSp1 2.4s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", bottom:5, left:4, width:5, height:5, borderRadius:"50%", background:tierKey==="diamond"?"#a0d8ff":"#ffb0d8", animation:"tcSp2 2.4s ease-in-out .5s infinite" }}/>
                <div style={{ position:"absolute", top:9, left:7, width:4, height:4, borderRadius:"50%", background:"#fff", animation:"tcSp3 2.4s ease-in-out 1s infinite" }}/>
              </div>
              {/* Gold dot for diamond */}
              {tierKey === "diamond" && (
                <div style={{ position:"absolute", top:-2, right:-2, width:18, height:18, background:"linear-gradient(135deg,#fac775,#ef9f27)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, border:"2px solid #04101e", boxShadow:"0 0 6px rgba(250,199,117,.8)" }}>✦</div>
              )}
              {/* Crown for loyal_partner */}
              {tierKey === "loyal_partner" && (
                <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", filter:"drop-shadow(0 0 5px rgba(250,199,117,.9))" }}>
                  <svg width="24" height="14" viewBox="0 0 24 14"><polygon points="12,0 24,14 0,14" fill="#ffd700"/><polygon points="4,4 0,14 8,14" fill="#c47a00"/><polygon points="20,4 24,14 16,14" fill="#c47a00"/></svg>
                </div>
              )}
            </div>

            <div>
              <p style={{ color:cfg.nameColor, fontSize:18, fontWeight:900, margin:"0 0 6px" }}>{tierName || cfg.label}</p>
              <StarRow tierKey={tierKey}/>
              {firstVisit && (
                <p style={{ color:cfg.subColor, fontSize:10, margin:"8px 0 0", opacity:.7 }}>
                  Thành viên từ {new Date(firstVisit).toLocaleDateString("vi-VN", { month:"long", year:"numeric" })}
                </p>
              )}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes royalBorder { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
          @keyframes tcFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes tcScan  { 0%{left:-60%} 100%{left:120%} }
          @keyframes tcSp1 { 0%,100%{opacity:0;transform:scale(0)} 42%,55%{opacity:1;transform:scale(1)} }
          @keyframes tcSp2 { 0%,18%,100%{opacity:0;transform:scale(0)} 55%,65%{opacity:1;transform:scale(1)} }
          @keyframes tcSp3 { 0%,58%,100%{opacity:0;transform:scale(0)} 78%,85%{opacity:1;transform:scale(1)} }
          @keyframes tcGlow_diamond {
            0%,100%{box-shadow:0 0 22px 7px rgba(50,140,255,.55),0 0 55px 18px rgba(50,140,255,.28),0 0 100px 35px rgba(50,140,255,.12),inset 0 0 18px rgba(255,255,255,.22)}
            50%{box-shadow:0 0 40px 14px rgba(50,140,255,.85),0 0 100px 35px rgba(50,140,255,.5),0 0 180px 65px rgba(50,140,255,.28),inset 0 0 32px rgba(255,255,255,.45)}
          }
          @keyframes tcGlow_loyal_partner {
            0%,100%{box-shadow:0 0 22px 7px rgba(212,83,126,.55),0 0 55px 18px rgba(180,80,255,.28),0 0 100px 35px rgba(212,83,126,.12),inset 0 0 18px rgba(255,255,255,.2)}
            50%{box-shadow:0 0 40px 14px rgba(212,83,126,.85),0 0 100px 35px rgba(180,80,255,.5),0 0 180px 65px rgba(212,83,126,.28),inset 0 0 32px rgba(255,255,255,.45)}
          }
        `}</style>
      </div>
    );
  }

  // Non-royal tiers
  const hasPulse = cfg.pulse;
  return (
    <div style={{ borderRadius:16, padding:"20px 18px", background:cfg.innerBg, border:`1px solid ${cfg.border}`, position:"relative", overflow:"hidden", boxShadow: hasPulse ? `0 0 16px 4px ${cfg.pulseColor}` : cfg.shimmer ? "0 2px 12px rgba(120,160,200,.2)" : "none", animation: hasPulse ? "tcPulse 2.8s ease-in-out infinite" : "none" }}>
      {cfg.shimmer && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(110deg,transparent 35%,rgba(255,255,255,.06) 50%,transparent 65%)", animation:"tcShimmer 2.8s ease-in-out infinite", pointerEvents:"none" }}/>
      )}
      <p style={{ color:cfg.subColor, fontSize:10, fontWeight:700, letterSpacing:1.5, margin:"0 0 16px", textTransform:"uppercase", opacity:.8 }}>Hạng thành viên</p>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:cfg.badgeBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, border:`1px solid ${cfg.border}`, flexShrink:0, boxShadow: hasPulse ? `0 3px 14px ${cfg.pulseColor}` : "none" }}>
          {cfg.icon}
        </div>
        <div>
          <p style={{ color:cfg.nameColor, fontSize:17, fontWeight:900, margin:"0 0 6px" }}>{tierName || cfg.label}</p>
          <StarRow tierKey={tierKey}/>
          {firstVisit && (
            <p style={{ color:cfg.subColor, fontSize:10, margin:"8px 0 0", opacity:.7 }}>
              Thành viên từ {new Date(firstVisit).toLocaleDateString("vi-VN", { month:"long", year:"numeric" })}
            </p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes tcPulse   { 0%,100%{box-shadow:0 0 10px 3px ${cfg.pulseColor||"transparent"}} 50%{box-shadow:0 0 22px 8px ${cfg.pulseColor||"transparent"}} }
        @keyframes tcShimmer { 0%{transform:translateX(-150%)} 100%{transform:translateX(150%)} }
      `}</style>
    </div>
  );
}

export default TierCard;
