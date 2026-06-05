import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";
injectTierBadgeStyles();

const BADGE_STORE = [
  {
    key: "member", label: "Hội viên", icon: "🌱", stars: 0,
    color: "#888780", bg: "#e4e2d8", border: "#c8c6bc",
    tier: "Cơ bản", category: "Hạng thành viên",
    condition: "Mặc định khi đăng ký tài khoản",
    details: ["Đăng ký tài khoản qua Zalo Mini App", "Cung cấp số điện thoại hợp lệ"],
    permanent: true,
  },
  {
    key: "loyal", label: "Hội viên thân thiết", icon: "💚", stars: 1,
    color: "#085041", bg: "#9fe1cb", border: "#5dcaa5",
    tier: "Thân thiết", category: "Hạng thành viên",
    condition: "Chi tiêu tích lũy đủ điều kiện duy trì hạng",
    details: ["Duy trì chi tiêu tháng ≥ ngưỡng quy định", "Tham gia tích cực các hoạt động"],
    permanent: false,
  },
  {
    key: "silver", label: "Hội viên bạc", icon: "🥈", stars: 2,
    color: "#0c447c", bg: "linear-gradient(135deg,#c0d4e8,#ddeaf8,#c0d4e8)", border: "#85b7eb",
    tier: "Bạc ✦", category: "Hạng thành viên",
    condition: "Đạt ngưỡng chi tiêu tích lũy hạng Bạc",
    details: ["Chi tiêu tích lũy theo quy định iPOS CRM", "Được hệ thống tự động nâng hạng"],
    permanent: false,
    shimmer: true,
  },
  {
    key: "gold", label: "Hội viên vàng", icon: "🥇", stars: 3.5,
    color: "#412402", bg: "linear-gradient(135deg,#fac775,#ef9f27,#fac775)", border: "#ef9f27",
    tier: "✦ Vàng ✦", category: "Hạng ưu tú",
    condition: "Đạt ngưỡng chi tiêu tích lũy hạng Vàng",
    details: ["Chi tiêu tích lũy cao hơn hạng Bạc", "Ưu đãi đặc quyền hội viên vàng"],
    permanent: false,
    glow: "goldPulse 2.8s ease-in-out infinite",
  },
  {
    key: "partner", label: "Đối tác", icon: "🤝", stars: 3.5,
    color: "#26215c", bg: "linear-gradient(135deg,#afa9ec,#7f77dd,#afa9ec)", border: "#7f77dd",
    tier: "✦ Đối tác ✦", category: "Hạng ưu tú",
    condition: "Duy trì chi tiêu tháng ≥ 1.000.000đ",
    details: ["Chi tiêu hàng tháng ≥ 1.000.000đ", "Được duy trì khi đạt điều kiện mỗi tháng", "Mất hạng nếu tháng sau không đủ điều kiện"],
    permanent: false,
    glow: "partnerPulse 2.8s ease-in-out infinite",
  },
  {
    key: "diamond", label: "Kim cương", icon: "💎", stars: 5,
    color: "#e0f4ff", bg: "linear-gradient(135deg,#0a2a5a,#1a50a0,#3a8adf,#80c0ff,#3a8adf)", border: "#3a8adf",
    tier: "Đẳng cấp tối thượng", category: "Đẳng cấp vương giả",
    condition: "Đạt ngưỡng chi tiêu tích lũy cao nhất",
    details: ["Chi tiêu tích lũy ở mức cao nhất", "Đặc quyền kim cương độc quyền", "Ưu tiên dịch vụ cao nhất"],
    permanent: false,
    royal: true, borderAnim: "linear-gradient(90deg,#0050ff,#40b0ff,#fff,#80d0ff,#0050ff)",
    innerBg: "linear-gradient(150deg,#04101e,#061828,#081e34)",
    glow: "diamondGlow 2s ease-in-out infinite",
  },
  {
    key: "loyal_partner", label: "Đối tác thân thiết", icon: "👑", stars: 5,
    color: "#ffe0f0", bg: "linear-gradient(135deg,#4a0a28,#8a1a50,#d4537e,#ff90c0,#c080ff)", border: "#d4537e",
    tier: "Bất khả xâm phạm", category: "Đẳng cấp vương giả",
    condition: "Duy trì chi tiêu tháng ≥ 2.000.000đ",
    details: ["Chi tiêu hàng tháng ≥ 2.000.000đ", "Được duy trì khi đạt điều kiện mỗi tháng", "Đặc quyền cao nhất trong hệ thống thành viên"],
    permanent: false,
    royal: true, borderAnim: "linear-gradient(90deg,#cc2266,#ff60b0,#fff,#c080ff,#cc2266)",
    innerBg: "linear-gradient(150deg,#120608,#1e0a14,#160820)",
    glow: "partnerGlow 2s ease-in-out infinite",
  },
  {
    key: "champion", label: "Kiện tướng", icon: "♟️", stars: 4,
    color: "#ffd700", bg: "linear-gradient(135deg,#3a2200,#7a4a00,#c47a00,#ffd700,#ffb800,#c47a00)", border: "#ffd700",
    tier: "Vương giả cờ vua", category: "Danh hiệu đặc biệt · Live",
    condition: "Đứng Top 1 BXH Kỳ thủ cờ vua",
    details: ["Top 1 BXH thắng nhiều nhất trong game Kỳ thủ cờ vua", "Danh hiệu LIVE — thay đổi tức thì khi BXH thay đổi", "Không thể mua hoặc tặng — chỉ do thi đấu mà có"],
    permanent: false, live: true,
    royal: true, borderAnim: "linear-gradient(90deg,#5a3a00,#ffd700,#fff8e0,#ffcc00,#ffd700,#5a3a00)",
    innerBg: "linear-gradient(150deg,#0e0900,#1a1000,#261800)",
    glow: "ktGlow 2.2s ease-in-out infinite",
  },
  {
    key: "hof_1", label: "Vương Giả", icon: "♦", stars: 5,
    color: "#ff80a0", bg: "radial-gradient(circle at 35% 35%,#ff80a0 0%,#dd0050 30%,#880028 60%,#3a0010 100%)", border: "#ff2060",
    tier: "Đỉnh Phong Bất Bại · Truyền Thuyết", category: "Đại Sảnh Danh Vọng · Live",
    condition: "Đứng Top 1 BXH Tiêu dùng Alltime",
    details: ["Top 1 BXH chi tiêu tích lũy mọi thời đại", "Danh hiệu LIVE — thay đổi tức thì khi BXH thay đổi", "Biểu tượng viên Ruby — đỏ thẫm quyền uy", "Không thể mua hoặc tặng — chỉ do thực lực"],
    permanent: false, live: true,
    royal: true, borderAnim: "linear-gradient(90deg,#3a0010,#aa0030,#ff2060,#ff80a0,#fff0f3,#ff2060,#aa0030,#3a0010)",
    innerBg: "linear-gradient(155deg,#0a0005,#150008,#0a0005)",
    glow: "hofGlow1 2s ease-in-out infinite",
  },
  {
    key: "hof_2", label: "Phú Hào", icon: "♦", stars: 4,
    color: "#80a0ff", bg: "radial-gradient(circle at 35% 35%,#90b8ff 0%,#2050ee 32%,#0c1880 62%,#040830 100%)", border: "#2050ee",
    tier: "Tinh Hoa Đệ Nhị", category: "Đại Sảnh Danh Vọng · Live",
    condition: "Đứng Top 2 BXH Tiêu dùng Alltime",
    details: ["Top 2 BXH chi tiêu tích lũy mọi thời đại", "Danh hiệu LIVE — thay đổi tức thì khi BXH thay đổi", "Biểu tượng viên Sapphire — xanh dương huyền bí"],
    permanent: false, live: true,
    royal: true, borderAnim: "linear-gradient(90deg,#080030,#1840cc,#5080ff,#b0c8ff,#5080ff,#1840cc,#080030)",
    innerBg: "linear-gradient(155deg,#010208,#02040e,#010208)",
    glow: "hofGlow2 2s ease-in-out infinite",
  },
  {
    key: "hof_3", label: "Địa Chủ", icon: "♦", stars: 4,
    color: "#40ee80", bg: "radial-gradient(circle at 35% 35%,#80ffb8 0%,#18cc66 30%,#066838 60%,#001c0a 100%)", border: "#0caa55",
    tier: "Tinh Hoa Đệ Tam", category: "Đại Sảnh Danh Vọng · Live",
    condition: "Đứng Top 3 BXH Tiêu dùng Alltime",
    details: ["Top 3 BXH chi tiêu tích lũy mọi thời đại", "Danh hiệu LIVE — thay đổi tức thì khi BXH thay đổi", "Biểu tượng viên Emerald — xanh lá quý phái"],
    permanent: false, live: true,
    royal: true, borderAnim: "linear-gradient(90deg,#001c0a,#0caa55,#40ee88,#a0ffcc,#40ee88,#0caa55,#001c0a)",
    innerBg: "linear-gradient(155deg,#010802,#020e04,#010802)",
    glow: "hofGlow3 2s ease-in-out infinite",
  },
];

function Stars({ count, color }) {
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5"
            fill={i <= count ? color : "none"} stroke={color} strokeWidth={i <= count ? ".5" : "1"} opacity={i <= count ? 1 : .35}/>
        </svg>
      ))}
    </div>
  );
}

function BadgeCard({ b }) {
  const isRoyal = b.royal;
  return (
    <div style={{ borderRadius:20, padding: isRoyal ? "2.5px" : "0", background: isRoyal ? b.borderAnim : "transparent", backgroundSize:"400% 100%", animation: isRoyal ? "royalBorder 1.8s linear infinite" : "none" }}>
      <div style={{ borderRadius: isRoyal ? 18 : 20, padding:20, background: isRoyal ? b.innerBg : "#1a1a24", border: isRoyal ? "none" : `1px solid ${b.border}33`, position:"relative", overflow:"hidden", height:"100%", boxSizing:"border-box" }}>
        {isRoyal && <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:`linear-gradient(90deg,transparent,rgba(255,255,255,.08),rgba(255,255,255,.15),rgba(255,255,255,.08),transparent)`, animation:"tcScan 3s ease-in-out infinite", pointerEvents:"none" }}/>}

        {b.live && (
          <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,0,0,.85)", borderRadius:4, padding:"2px 7px", fontSize:9, fontWeight:900, color:"#fff", animation:"liveFlash 1.2s ease-in-out infinite" }}>LIVE</div>
        )}

        <div style={{ width:64, height:64, borderRadius:"50%", background:b.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:14, boxShadow: b.glow ? `var(--${b.key}-glow, none)` : "none", animation: b.glow || "none" }}>
          {b.icon}
        </div>

        <div style={{ display:"inline-block", background:b.bg, borderRadius:20, padding:"3px 12px", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:900, color:b.color, letterSpacing:1 }}>{b.tier}</span>
        </div>

        <p style={{ fontSize:17, fontWeight:900, color: isRoyal ? b.color : "white", margin:"0 0 4px", textShadow: isRoyal ? `0 0 12px ${b.border}` : "none" }}>{b.label}</p>
        <Stars count={b.stars} color={isRoyal ? b.color : b.border}/>

        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid rgba(255,255,255,.08)` }}>
          <p style={{ fontSize:10, color:"#666", margin:"0 0 6px", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Điều kiện</p>
          <p style={{ fontSize:12, color: isRoyal ? b.color : "#aaa", margin:"0 0 8px", fontWeight:600 }}>{b.condition}</p>
          {b.details.map((d,i) => (
            <p key={i} style={{ fontSize:11, color:"#666", margin:"0 0 3px", paddingLeft:8, borderLeft:`2px solid ${b.border}44` }}>• {d}</p>
          ))}
        </div>

        <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(255,255,255,.06)", color:"#888", border:"1px solid rgba(255,255,255,.1)" }}>
            {b.category}
          </span>
          {b.permanent ? (
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(76,175,80,.15)", color:"#4CAF50", border:"1px solid rgba(76,175,80,.3)" }}>Vĩnh viễn</span>
          ) : b.live ? (
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(255,0,0,.15)", color:"#f44336", border:"1px solid rgba(255,0,0,.3)" }}>Live · Tạm thời</span>
          ) : (
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(255,150,0,.12)", color:"#ff9800", border:"1px solid rgba(255,150,0,.25)" }}>Có điều kiện</span>
          )}
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = ["Tất cả", "Hạng thành viên", "Hạng ưu tú", "Đẳng cấp vương giả", "Danh hiệu đặc biệt · Live", "Đại Sảnh Danh Vọng · Live"];

export default function AdminBadgeStore() {
  const [cat, setCat] = useState("Tất cả");
  const filtered = cat === "Tất cả" ? BADGE_STORE : BADGE_STORE.filter(b => b.category === cat);

  return (
    <div style={{ padding:24, color:"white" }}>
      <h2 style={{ fontSize:20, fontWeight:900, margin:"0 0 6px" }}>💎 Store danh hiệu</h2>
      <p style={{ color:"#888", fontSize:13, margin:"0 0 20px" }}>Toàn bộ danh hiệu trong hệ thống và điều kiện sở hữu</p>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${cat===c ? "#D4531C" : "#333"}`, background: cat===c ? "rgba(212,83,28,.2)" : "transparent", color: cat===c ? "#D4531C" : "#888", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {filtered.map(b => <BadgeCard key={b.key} b={b}/>)}
      </div>

      <style>{`
        @keyframes royalBorder { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes tcScan { 0%{left:-60%} 100%{left:120%} }
        @keyframes liveFlash { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes goldPulse { 0%,100%{box-shadow:0 0 12px 4px rgba(186,117,23,.4)} 50%{box-shadow:0 0 24px 8px rgba(186,117,23,.65)} }
        @keyframes partnerPulse { 0%,100%{box-shadow:0 0 12px 4px rgba(127,119,221,.35)} 50%{box-shadow:0 0 24px 8px rgba(127,119,221,.6)} }
        @keyframes diamondGlow { 0%,100%{box-shadow:0 0 22px 7px rgba(50,140,255,.55)} 50%{box-shadow:0 0 50px 18px rgba(50,140,255,.9)} }
        @keyframes partnerGlow { 0%,100%{box-shadow:0 0 22px 7px rgba(212,83,126,.55)} 50%{box-shadow:0 0 50px 18px rgba(212,83,126,.92)} }
        @keyframes ktGlow { 0%,100%{box-shadow:0 0 22px 7px rgba(186,117,23,.55)} 50%{box-shadow:0 0 50px 18px rgba(186,117,23,.9)} }
        @keyframes hofGlow1 { 0%,100%{box-shadow:0 0 20px 6px rgba(255,0,80,.65)} 50%{box-shadow:0 0 45px 15px rgba(255,20,90,.95)} }
        @keyframes hofGlow2 { 0%,100%{box-shadow:0 0 16px 5px rgba(40,80,255,.55)} 50%{box-shadow:0 0 32px 11px rgba(80,130,255,.8)} }
        @keyframes hofGlow3 { 0%,100%{box-shadow:0 0 15px 5px rgba(20,180,80,.55)} 50%{box-shadow:0 0 30px 10px rgba(50,220,120,.8)} }
      `}</style>
    </div>
  );
}
