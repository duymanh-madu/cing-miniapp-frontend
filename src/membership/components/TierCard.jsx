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
    borderAnim: "linear-gradient(90deg,#0030cc,#60d0ff,#ffffff,#ffffff,#60d0ff,#0030cc)",
    innerBg:    "linear-gradient(150deg,#000508,#010c18,#020e20)",
    badgeBg:    "linear-gradient(135deg,#0a2a5a,#1a50a0,#3a8adf,#80c0ff,#3a8adf)",
    icon:       "💎",
    nameColor:  "#e0f4ff",
    subColor:   "#64b4ff",
    label:      "Hội viên kim cương",
    royal:      true,
    glowColor:  "rgba(0,150,255,1)",
    glowColor2: "rgba(0,150,255,.65)",
    scanColor:  "rgba(150,230,255,.45)",
  },
  loyal_partner: {
    borderAnim: "linear-gradient(90deg,#990044,#ff50a0,#ffffff,#ffffff,#dd88ff,#990044)",
    innerBg:    "linear-gradient(150deg,#060004,#0e0410,#100618)",
    badgeBg:    "linear-gradient(135deg,#4a0a28,#8a1a50,#d4537e,#ff90c0,#c080ff)",
    icon:       "👑",
    nameColor:  "#ffe0f0",
    subColor:   "#ff90c0",
    label:      "Đối tác thân thiết",
    royal:      true,
    glowColor:  "rgba(220,60,120,1)",
    glowColor2: "rgba(180,60,255,.65)",
    scanColor:  "rgba(255,160,220,.45)",
  },
};

function GemIcon({ tierKey }) {
  if (tierKey === "hof_1") return (
    <svg width="44" height="46" viewBox="0 0 48 52" style={{ filter:"drop-shadow(0 0 10px rgba(255,40,100,1)) drop-shadow(0 0 20px rgba(255,0,80,.8))", overflow:"visible" }}>
      <defs>
        <linearGradient id="hc1t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff0f3"/><stop offset="20%" stopColor="#ff80a0"/><stop offset="60%" stopColor="#ee0055"/><stop offset="100%" stopColor="#880030"/></linearGradient>
        <linearGradient id="hc1l" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff4080"/><stop offset="100%" stopColor="#3a0018"/></linearGradient>
        <linearGradient id="hc1r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff90b0"/><stop offset="100%" stopColor="#550020"/></linearGradient>
        <radialGradient id="hc1g" cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#ff90b0" stopOpacity=".9"/><stop offset="100%" stopColor="transparent"/></radialGradient>
      </defs>
      <polygon points="10,20 38,20 44,28 38,36 10,36 4,28" fill="#3060cc" opacity=".5"/>
      <polygon points="24,4 36,12 36,20 24,24 12,20 12,12" fill="url(#hc1t)" opacity=".98"/>
      <polygon points="4,28 10,20 12,20 12,36 10,36" fill="url(#hc1l)" opacity=".88"/>
      <polygon points="44,28 38,20 36,20 36,36 38,36" fill="url(#hc1r)" opacity=".85"/>
      <polygon points="12,36 36,36 28,48 20,48" fill="#440018" opacity=".88"/>
      <polygon points="20,48 24,52 28,48" fill="#220010" opacity=".9"/>
      <ellipse cx="22" cy="14" rx="8" ry="5" fill="url(#hc1g)" opacity=".85"/>
      <line x1="16" y1="8" x2="22" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </svg>
  );
  if (tierKey === "hof_2") return (
    <svg width="44" height="46" viewBox="0 0 48 52" style={{ filter:"drop-shadow(0 0 8px rgba(60,120,255,1)) drop-shadow(0 0 16px rgba(40,80,255,.8))", overflow:"visible" }}>
      <defs>
        <linearGradient id="hc2t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e8f0ff"/><stop offset="25%" stopColor="#90b8ff"/><stop offset="65%" stopColor="#2050ee"/><stop offset="100%" stopColor="#0c1880"/></linearGradient>
        <linearGradient id="hc2l" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3060ee"/><stop offset="100%" stopColor="#040830"/></linearGradient>
        <linearGradient id="hc2r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#70a0ff"/><stop offset="100%" stopColor="#080840"/></linearGradient>
        <radialGradient id="hc2g" cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#c0d8ff" stopOpacity=".85"/><stop offset="100%" stopColor="transparent"/></radialGradient>
      </defs>
      <polygon points="10,20 38,20 44,28 38,36 10,36 4,28" fill="#1840cc" opacity=".5"/>
      <polygon points="24,4 36,12 36,20 24,24 12,20 12,12" fill="url(#hc2t)" opacity=".97"/>
      <polygon points="4,28 10,20 12,20 12,36 10,36" fill="url(#hc2l)" opacity=".85"/>
      <polygon points="44,28 38,20 36,20 36,36 38,36" fill="url(#hc2r)" opacity=".82"/>
      <polygon points="12,36 36,36 28,48 20,48" fill="#0c1870" opacity=".88"/>
      <polygon points="20,48 24,52 28,48" fill="#060c38" opacity=".9"/>
      <ellipse cx="22" cy="14" rx="7" ry="4" fill="url(#hc2g)" opacity=".82"/>
      <line x1="15" y1="8" x2="21" y2="15" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity=".48"/>
    </svg>
  );
  return (
    <svg width="44" height="46" viewBox="0 0 48 52" style={{ filter:"drop-shadow(0 0 8px rgba(30,200,100,1)) drop-shadow(0 0 16px rgba(20,180,80,.8))", overflow:"visible" }}>
      <defs>
        <linearGradient id="hc3t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d0ffe8"/><stop offset="25%" stopColor="#70ee99"/><stop offset="65%" stopColor="#0caa55"/><stop offset="100%" stopColor="#043820"/></linearGradient>
        <linearGradient id="hc3l" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18cc66"/><stop offset="100%" stopColor="#011a08"/></linearGradient>
        <linearGradient id="hc3r" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60ee88"/><stop offset="100%" stopColor="#022810"/></linearGradient>
        <radialGradient id="hc3g" cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#b0ffda" stopOpacity=".85"/><stop offset="100%" stopColor="transparent"/></radialGradient>
      </defs>
      <polygon points="10,20 38,20 44,28 38,36 10,36 4,28" fill="#0c8840" opacity=".5"/>
      <polygon points="24,4 36,12 36,20 24,24 12,20 12,12" fill="url(#hc3t)" opacity=".97"/>
      <polygon points="4,28 10,20 12,20 12,36 10,36" fill="url(#hc3l)" opacity=".85"/>
      <polygon points="44,28 38,20 36,20 36,36 38,36" fill="url(#hc3r)" opacity=".82"/>
      <polygon points="12,36 36,36 28,48 20,48" fill="#043820" opacity=".88"/>
      <polygon points="20,48 24,52 28,48" fill="#021408" opacity=".9"/>
      <ellipse cx="22" cy="14" rx="7" ry="4" fill="url(#hc3g)" opacity=".82"/>
      <line x1="15" y1="8" x2="21" y2="15" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity=".48"/>
    </svg>
  );
}

// HOF Card configs
const HOF_CARD_CONFIG = {
  hof_1: {
    borderAnim: "linear-gradient(90deg,#3a0010,#aa0030,#ff2060,#ff80a0,#fff0f3,#ff2060,#aa0030,#3a0010)",
    innerBg: "linear-gradient(155deg,#0a0005,#150008,#0a0005)",
    scanColor: "rgba(255,60,100,.22),rgba(255,200,210,.38)",
    glowAnim: "hofCard1Glow",
    gemColors: { top:"#fff0f3,#ff80a0,#ee0055,#880030", left:"#ff4080,#cc0045,#3a0018", right:"#ff90b0,#dd0055,#550020", btm:"#cc0048,#1a0008" },
    nameColor: "#ff80a0", subColor: "#cc3060", borderColor: "rgba(255,80,120,.45)",
    rankLabel: "#1 ALLTIME", rankBg: "linear-gradient(135deg,#880028,#dd0055,#ff2060)",
    label: "Vương Giả", subtitle: "Đỉnh Phong Bất Bại · Truyền Thuyết",
    stars: 5, starColor: "#ff2060", starStroke: "#ff80a0",
    pillBg: "linear-gradient(135deg,#3a0010,#aa0035,#ff2060)", pillColor: "#ffe0ea",
    pillBorder: "rgba(255,80,120,.45)", pillLabel: "♦ RUBY ♦",
  },
  hof_2: {
    borderAnim: "linear-gradient(90deg,#080030,#1840cc,#5080ff,#b0c8ff,#fff4,#5080ff,#1840cc,#080030)",
    innerBg: "linear-gradient(155deg,#010208,#02040e,#010208)",
    scanColor: "rgba(50,100,255,.18),rgba(180,210,255,.3)",
    glowAnim: "hofCard2Glow",
    nameColor: "#6090ff", subColor: "#2848cc", borderColor: "rgba(80,140,255,.4)",
    rankLabel: "#2 ALLTIME", rankBg: "linear-gradient(90deg,#0a1888,#1840cc)",
    label: "Phú Hào", subtitle: "Tinh Hoa Đệ Nhị",
    stars: 4, starColor: "#2050ee", starStroke: "#70a0ff",
    pillBg: "linear-gradient(90deg,#040828,#0a1888)", pillColor: "#6090ff",
    pillBorder: "rgba(80,140,255,.4)", pillLabel: "♦ SAPPHIRE ♦",
  },
  hof_3: {
    borderAnim: "linear-gradient(90deg,#001c0a,#0caa55,#40ee88,#a0ffcc,#fff4,#40ee88,#0caa55,#001c0a)",
    innerBg: "linear-gradient(155deg,#010802,#020e04,#010802)",
    scanColor: "rgba(20,180,80,.16),rgba(160,255,200,.28)",
    glowAnim: "hofCard3Glow",
    nameColor: "#40ee80", subColor: "#0c8840", borderColor: "rgba(50,200,110,.35)",
    rankLabel: "#3 ALLTIME", rankBg: "linear-gradient(90deg,#065530,#0caa55)",
    label: "Địa Chủ", subtitle: "Tinh Hoa Đệ Tam",
    stars: 4, starColor: "#0caa55", starStroke: "#40ee80",
    pillBg: "linear-gradient(90deg,#001808,#065530)", pillColor: "#40ee80",
    pillBorder: "rgba(50,200,110,.3)", pillLabel: "♦ EMERALD ♦",
  },
};

export function TierCard({ tierKey = "member", tierName, firstVisit, isChampion = false }) {
  const cfg = TIER_CARD_CONFIG[tierKey] || TIER_CARD_CONFIG.member;

  // Champion card — Kiện tướng
  if (isChampion) {
    return (
      <div style={{ borderRadius:20, padding:"3px", background:"linear-gradient(90deg,#5a3a00,#ffd700,#fff8e0,#ffcc00,#ffd700,#5a3a00)", backgroundSize:"400% 100%", animation:"ktBorderSpin 1.4s linear infinite" }}>
        <div style={{ borderRadius:18, padding:"20px 18px", background:"linear-gradient(150deg,#0e0900,#1a1000,#261800)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:"linear-gradient(90deg,transparent,rgba(255,210,0,.18),rgba(255,240,150,.35),rgba(255,210,0,.18),transparent)", animation:"tcScan 2.2s ease-in-out infinite", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,210,0,.018) 0,rgba(255,210,0,.018) 1px,transparent 1px,transparent 8px)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 50%,rgba(186,117,23,.08) 0%,transparent 65%)", pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <p style={{ color:"#c47a00", fontSize:10, fontWeight:700, letterSpacing:1.5, margin:0, textTransform:"uppercase" }}>Danh hiệu đặc biệt</p>
            <span style={{ background:"rgba(255,0,0,.85)", borderRadius:4, padding:"1px 6px", fontSize:8, fontWeight:900, color:"#fff", animation:"liveFlash 1.2s ease-in-out infinite" }}>LIVE</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              {/* Crown */}
              <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", filter:"drop-shadow(0 0 6px rgba(255,210,0,.9))", zIndex:1 }}>
                <svg width="32" height="18" viewBox="0 0 32 18">
                  <polygon points="16,0 32,18 0,18" fill="#ffd700"/>
                  <polygon points="4,5 0,18 9,18" fill="#c47a00"/>
                  <polygon points="28,5 32,18 23,18" fill="#c47a00"/>
                  <polygon points="16,2 19,10 16,8 13,10" fill="#fff8dc" opacity=".7"/>
                </svg>
              </div>
              {/* Badge */}
              <div style={{ width:68, height:68, borderRadius:"50%", background:"linear-gradient(135deg,#3a2200,#7a4a00,#c47a00,#ffd700,#ffb800,#c47a00)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, animation:"tcGlow_champion 2.2s ease-in-out infinite, tcFloat 3.2s ease-in-out infinite", position:"relative" }}>
                ♟️
                <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle at 35% 30%,rgba(255,240,150,.35),transparent 60%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", top:3, right:5, width:8, height:8, borderRadius:"50%", background:"#fff", animation:"tcSp1 2.6s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", bottom:5, left:4, width:6, height:6, borderRadius:"50%", background:"#ffd700", animation:"tcSp2 2.6s ease-in-out .55s infinite" }}/>
                <div style={{ position:"absolute", top:10, left:7, width:4, height:4, borderRadius:"50%", background:"#fff", animation:"tcSp3 2.6s ease-in-out 1.1s infinite" }}/>
              </div>
              {/* TOP 1 badge */}
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#c47a00,#ffd700,#c47a00)", borderRadius:10, padding:"2px 8px", border:"1px solid #ffd700", boxShadow:"0 0 8px rgba(255,210,0,.6)", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:9, fontWeight:900, color:"#120c00" }}>TOP 1</span>
              </div>
            </div>

            <div>
              <p style={{ color:"#ffd700", fontSize:18, fontWeight:900, margin:"0 0 6px", textShadow:"0 0 12px rgba(255,210,0,.6)" }}>Kiện tướng</p>
              <div style={{ display:"flex", gap:3, marginBottom:6 }}>
                {[1,2,3,4].map(i => (
                  <svg key={i} width="15" height="15" viewBox="0 0 12 12">
                    <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="#ffd700" stroke="#ffc000" strokeWidth=".5"/>
                  </svg>
                ))}
                <svg width="15" height="15" viewBox="0 0 12 12">
                  <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="none" stroke="#7a5800" strokeWidth="1"/>
                </svg>
              </div>
              <p style={{ color:"#c47a00", fontSize:10, margin:0 }}>Vương giả cờ vua · Độc chiếm Top 1</p>
              {firstVisit && (
                <p style={{ color:"#7a5800", fontSize:10, margin:"6px 0 0" }}>
                  Thành viên từ {new Date(firstVisit).toLocaleDateString("vi-VN", { month:"long", year:"numeric" })}
                </p>
              )}
            </div>
          </div>
          <style>{`
            @keyframes ktBorderSpin { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
            @keyframes tcScan { 0%{left:-60%} 100%{left:120%} }
            @keyframes tcFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            @keyframes tcSp1 { 0%,100%{opacity:0;transform:scale(0)} 42%,55%{opacity:1;transform:scale(1)} }
            @keyframes tcSp2 { 0%,20%,100%{opacity:0;transform:scale(0)} 55%,65%{opacity:1;transform:scale(1)} }
            @keyframes tcSp3 { 0%,58%,100%{opacity:0;transform:scale(0)} 76%,87%{opacity:1;transform:scale(1)} }
            @keyframes tcGlow_champion {
              0%,100%{box-shadow:0 0 22px 7px rgba(186,117,23,.55),0 0 55px 18px rgba(255,180,0,.28),0 0 100px 35px rgba(186,117,23,.12),inset 0 0 18px rgba(255,220,100,.22)}
              50%{box-shadow:0 0 40px 14px rgba(186,117,23,.85),0 0 100px 35px rgba(255,180,0,.5),0 0 180px 65px rgba(186,117,23,.28),inset 0 0 32px rgba(255,220,100,.45)}
            }
            @keyframes liveFlash { 0%,100%{opacity:1} 50%{opacity:.35} }
          `}</style>
        </div>
      </div>
    );
  }

  // HOF cards — Top 3 Alltime
  if (tierKey?.startsWith("hof_")) {
    const hof = HOF_CARD_CONFIG[tierKey];
    // gemSvg removed — using GemIcon JSX

    return (
      <div style={{ borderRadius:20, padding:"2.5px", background:hof.borderAnim, backgroundSize:"400% 100%", animation:"hofBorder 2s linear infinite" }}>
        <div style={{ borderRadius:18, padding:"20px 18px", background:hof.innerBg, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:`linear-gradient(90deg,transparent,${hof.scanColor},transparent)`, animation:"hofScan 2.5s ease-in-out infinite", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:0, borderRadius:18, background:"radial-gradient(ellipse at 30% 50%,rgba(255,255,255,.06) 0%,transparent 60%)", pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <p style={{ color:hof.subColor, fontSize:10, fontWeight:700, letterSpacing:1.5, margin:0, textTransform:"uppercase" }}>Đại Sảnh Danh Vọng</p>
            <span style={{ background:"rgba(255,255,255,.12)", borderRadius:4, padding:"1px 6px", fontSize:8, fontWeight:900, color:hof.nameColor, border:`1px solid ${hof.borderColor}`, animation:"liveFlash 1.2s ease-in-out infinite" }}>{hof.rankLabel}</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background: tierKey==="hof_1" ? "radial-gradient(circle at 35% 35%,#ff80a0 0%,#dd0050 30%,#880028 60%,#3a0010 100%)" : tierKey==="hof_2" ? "radial-gradient(circle at 35% 35%,#90b8ff 0%,#2050ee 32%,#0c1880 62%,#040830 100%)" : "radial-gradient(circle at 35% 35%,#80ffb8 0%,#18cc66 30%,#066838 60%,#001c0a 100%)", display:"flex", alignItems:"center", justifyContent:"center", animation:`${hof.glowAnim} 2s ease-in-out infinite, tcFloat 3s ease-in-out infinite`, position:"relative", overflow:"visible" }}>
                <GemIcon tierKey={tierKey}/>
              </div>
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", background:hof.rankBg, borderRadius:10, padding:"2px 8px", border:`1px solid ${hof.borderColor}`, boxShadow:`0 0 8px ${hof.borderColor}`, whiteSpace:"nowrap" }}>
                <span style={{ fontSize:9, fontWeight:900, color:hof.rankLabel.includes("1") ? "#ffe0ea" : hof.rankLabel.includes("2") ? "#c0d8ff" : "#a0ffcc" }}>{hof.rankLabel}</span>
              </div>
            </div>

            <div style={{ flex:1 }}>
              <p style={{ color:hof.nameColor, fontSize:18, fontWeight:900, margin:"0 0 6px", textShadow:`0 0 12px ${hof.borderColor}` }}>{hof.label}</p>
              <div style={{ display:"flex", gap:3, marginBottom:6 }}>
                {Array(hof.stars).fill(0).map((_,i) => (
                  <svg key={i} width="15" height="15" viewBox="0 0 12 12">
                    <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={hof.starColor} stroke={hof.starStroke} strokeWidth=".5"/>
                  </svg>
                ))}
                {hof.stars < 5 && <svg width="15" height="15" viewBox="0 0 12 12"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="none" stroke={hof.starColor} strokeWidth="1" opacity=".4"/></svg>}
              </div>
              <p style={{ color:hof.subColor, fontSize:10, margin:0 }}>{hof.subtitle}</p>
              {firstVisit && <p style={{ color:hof.subColor, fontSize:10, margin:"6px 0 0", opacity:.7 }}>Thành viên từ {new Date(firstVisit).toLocaleDateString("vi-VN", { month:"long", year:"numeric" })}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOF cards — Top 3 Alltime
  if (tierKey?.startsWith("hof_")) {
    const hof = HOF_CARD_CONFIG[tierKey];
    // gemSvg removed — using GemIcon JSX

    return (
      <div style={{ borderRadius:20, padding:"2.5px", background:hof.borderAnim, backgroundSize:"400% 100%", animation:"hofBorder 2s linear infinite" }}>
        <div style={{ borderRadius:18, padding:"20px 18px", background:hof.innerBg, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:`linear-gradient(90deg,transparent,${hof.scanColor},transparent)`, animation:"hofScan 2.5s ease-in-out infinite", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:0, borderRadius:18, background:"radial-gradient(ellipse at 30% 50%,rgba(255,255,255,.06) 0%,transparent 60%)", pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <p style={{ color:hof.subColor, fontSize:10, fontWeight:700, letterSpacing:1.5, margin:0, textTransform:"uppercase" }}>Đại Sảnh Danh Vọng</p>
            <span style={{ background:"rgba(255,255,255,.12)", borderRadius:4, padding:"1px 6px", fontSize:8, fontWeight:900, color:hof.nameColor, border:`1px solid ${hof.borderColor}`, animation:"liveFlash 1.2s ease-in-out infinite" }}>{hof.rankLabel}</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background: tierKey==="hof_1" ? "radial-gradient(circle at 35% 35%,#ff80a0 0%,#dd0050 30%,#880028 60%,#3a0010 100%)" : tierKey==="hof_2" ? "radial-gradient(circle at 35% 35%,#90b8ff 0%,#2050ee 32%,#0c1880 62%,#040830 100%)" : "radial-gradient(circle at 35% 35%,#80ffb8 0%,#18cc66 30%,#066838 60%,#001c0a 100%)", display:"flex", alignItems:"center", justifyContent:"center", animation:`${hof.glowAnim} 2s ease-in-out infinite, tcFloat 3s ease-in-out infinite`, position:"relative", overflow:"visible" }}>
                <GemIcon tierKey={tierKey}/>
              </div>
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", background:hof.rankBg, borderRadius:10, padding:"2px 8px", border:`1px solid ${hof.borderColor}`, boxShadow:`0 0 8px ${hof.borderColor}`, whiteSpace:"nowrap" }}>
                <span style={{ fontSize:9, fontWeight:900, color:hof.rankLabel.includes("1") ? "#ffe0ea" : hof.rankLabel.includes("2") ? "#c0d8ff" : "#a0ffcc" }}>{hof.rankLabel}</span>
              </div>
            </div>

            <div style={{ flex:1 }}>
              <p style={{ color:hof.nameColor, fontSize:18, fontWeight:900, margin:"0 0 6px", textShadow:`0 0 12px ${hof.borderColor}` }}>{hof.label}</p>
              <div style={{ display:"flex", gap:3, marginBottom:6 }}>
                {Array(hof.stars).fill(0).map((_,i) => (
                  <svg key={i} width="15" height="15" viewBox="0 0 12 12">
                    <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={hof.starColor} stroke={hof.starStroke} strokeWidth=".5"/>
                  </svg>
                ))}
                {hof.stars < 5 && <svg width="15" height="15" viewBox="0 0 12 12"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="none" stroke={hof.starColor} strokeWidth="1" opacity=".4"/></svg>}
              </div>
              <p style={{ color:hof.subColor, fontSize:10, margin:0 }}>{hof.subtitle}</p>
              {firstVisit && <p style={{ color:hof.subColor, fontSize:10, margin:"6px 0 0", opacity:.7 }}>Thành viên từ {new Date(firstVisit).toLocaleDateString("vi-VN", { month:"long", year:"numeric" })}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cfg.royal) {
    return (
      <div style={{ borderRadius:20, padding:"2.5px", background:cfg.borderAnim, backgroundSize:"400% 100%", animation:"royalBorder 1.2s linear infinite" }}>
        <div style={{ borderRadius:18, padding:"20px 18px", background:cfg.innerBg, position:"relative", overflow:"hidden" }}>
          {/* Scanline */}
          <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:`linear-gradient(90deg,transparent,${cfg.scanColor},transparent)`, animation:"tcScan 3.5s ease-in-out infinite", pointerEvents:"none" }}/>
          {/* Radial glow center */}
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 50%,${cfg.glowColor}22 0%,transparent 65%)`, pointerEvents:"none" }}/>

          <p style={{ color:cfg.subColor, fontSize:10, fontWeight:700, letterSpacing:1.5, margin:"0 0 16px", textTransform:"uppercase" }}>Hạng thành viên</p>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {/* Badge với vòng nhẫn xoay */}
            <div style={{ position:"relative", flexShrink:0 }}>
              {/* Crown for loyal_partner */}
              {tierKey === "loyal_partner" && (
                <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", zIndex:2, filter:"drop-shadow(0 0 5px rgba(250,199,117,.9))" }}>
                  <svg width="24" height="14" viewBox="0 0 24 14"><polygon points="12,0 24,14 0,14" fill="#ffd700"/><polygon points="4,4 0,14 8,14" fill="#c47a00"/><polygon points="20,4 24,14 16,14" fill="#c47a00"/></svg>
                </div>
              )}
              {/* Vòng nhẫn xoay */}
              <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:`2px solid ${tierKey==="diamond"?"rgba(0,200,255,.6)":"rgba(255,80,160,.6)"}`, borderTopColor:"transparent", borderBottomColor:"transparent", animation:"ringRotate 2.5s linear infinite", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", inset:-18, borderRadius:"50%", border:`1.5px dashed ${tierKey==="diamond"?"rgba(0,150,255,.35)":"rgba(180,60,255,.35)"}`, animation:"ringRotateRev 4s linear infinite", pointerEvents:"none" }}/>
              {/* Badge */}
              <div style={{ width:64, height:64, borderRadius:"50%", background:cfg.badgeBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, animation:`tcGlow_${tierKey} 1.8s ease-in-out infinite, tcFloat 3s ease-in-out infinite`, position:"relative" }}>
                {cfg.icon}
                <div style={{ position:"absolute", top:3, right:5, width:7, height:7, borderRadius:"50%", background:"#fff", animation:"tcSp1 2.4s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", bottom:5, left:4, width:5, height:5, borderRadius:"50%", background:tierKey==="diamond"?"#80e0ff":"#ffb0d8", animation:"tcSp2 2.4s ease-in-out .5s infinite" }}/>
                <div style={{ position:"absolute", top:9, left:7, width:4, height:4, borderRadius:"50%", background:"#fff", animation:"tcSp3 2.4s ease-in-out 1s infinite" }}/>
                <div style={{ position:"absolute", bottom:10, right:6, width:6, height:6, borderRadius:"50%", background:tierKey==="diamond"?"#40c0ff":"#ff90c0", animation:"tcSp4 2.4s ease-in-out .3s infinite" }}/>
                <div style={{ position:"absolute", top:6, right:10, width:4, height:4, borderRadius:"50%", background:"#fff", animation:"tcSp5 2.4s ease-in-out .8s infinite" }}/>
                <div style={{ position:"absolute", bottom:6, left:10, width:3, height:3, borderRadius:"50%", background:tierKey==="diamond"?"#a0e0ff":"#ffaada", animation:"tcSp6 2.4s ease-in-out 1.4s infinite" }}/>
              </div>
              {/* Gold dot for diamond */}
              {tierKey === "diamond" && (
                <div style={{ position:"absolute", top:-2, right:-2, width:18, height:18, background:"linear-gradient(135deg,#fac775,#ef9f27)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, border:"2px solid #010c18", boxShadow:"0 0 8px rgba(250,199,117,.9)" }}>✦</div>
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
          @keyframes ktBorderSpin  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
          @keyframes tcFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes tcScan  { 0%{left:-60%} 100%{left:120%} }
          @keyframes ringRotate { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
          @keyframes ringRotateRev { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
          @keyframes outerPulseD { 0%,100%{box-shadow:0 0 0 3px rgba(30,120,255,.4),0 0 0 7px rgba(30,120,255,.15),0 0 0 14px rgba(30,120,255,.06)} 50%{box-shadow:0 0 0 5px rgba(80,180,255,.7),0 0 0 12px rgba(30,120,255,.3),0 0 0 22px rgba(30,120,255,.12)} }
          @keyframes outerPulseP { 0%,100%{box-shadow:0 0 0 3px rgba(212,83,126,.4),0 0 0 7px rgba(180,80,255,.15),0 0 0 14px rgba(212,83,126,.06)} 50%{box-shadow:0 0 0 5px rgba(255,100,180,.7),0 0 0 12px rgba(200,80,255,.3),0 0 0 22px rgba(212,83,126,.12)} }
          @keyframes tcSp4 { 0%,35%,100%{opacity:0;transform:scale(0)} 60%,72%{opacity:1;transform:scale(1)} }
          @keyframes tcSp5 { 0%,70%,100%{opacity:0;transform:scale(0)} 85%,92%{opacity:1;transform:scale(1)} }
          @keyframes tcSp6 { 0%,50%,100%{opacity:0;transform:scale(0)} 68%,78%{opacity:1;transform:scale(1)} }
          @keyframes tcSp1 { 0%,100%{opacity:0;transform:scale(0)} 42%,55%{opacity:1;transform:scale(1)} }
          @keyframes tcSp2 { 0%,18%,100%{opacity:0;transform:scale(0)} 55%,65%{opacity:1;transform:scale(1)} }
          @keyframes tcSp3 { 0%,58%,100%{opacity:0;transform:scale(0)} 78%,85%{opacity:1;transform:scale(1)} }
          @keyframes tcGlow_diamond {
            0%,100%{box-shadow:0 0 35px 12px rgba(0,150,255,.7),0 0 80px 30px rgba(0,150,255,.4),0 0 150px 60px rgba(0,150,255,.2),inset 0 0 30px rgba(255,255,255,.35)}
            50%{box-shadow:0 0 60px 22px rgba(0,200,255,1),0 0 130px 55px rgba(0,150,255,.65),0 0 250px 100px rgba(0,150,255,.35),inset 0 0 55px rgba(255,255,255,.65)}
          }
          @keyframes tcGlow_loyal_partner {
            0%,100%{box-shadow:0 0 35px 12px rgba(220,60,120,.7),0 0 80px 30px rgba(180,60,255,.4),0 0 150px 60px rgba(220,60,120,.2),inset 0 0 30px rgba(255,255,255,.3)}
            50%{box-shadow:0 0 60px 22px rgba(255,80,160,1),0 0 130px 55px rgba(200,60,255,.65),0 0 250px 100px rgba(220,60,120,.35),inset 0 0 55px rgba(255,255,255,.6)}
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
