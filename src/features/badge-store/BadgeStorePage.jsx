import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BADGE_STORE = [
  {
    key:"member", label:"Hội viên", icon:"🌱", stars:0,
    color:"#7ab87a", textColor:"white",
    bg:"linear-gradient(135deg,#3d6b3d,#5a9a5a,#7ab87a)",
    border:"rgba(122,184,122,0.5)",
    innerBg:"linear-gradient(135deg,#0a150a,#0f200f)",
    tier:"Cơ bản", category:"Hạng thành viên",
    condition:"Kích hoạt tài khoản thành công",
    upgrade:"Tiêu dùng tích lũy 1.000.000đ – 2.999.999đ để lên hạng",
    maintain:"Không yêu cầu duy trì",
    benefits:["Tích 10% điểm trên mỗi hóa đơn","Tham gia Game Center nhận thưởng","Nhận thông báo ưu đãi","Ưu đãi sinh nhật đặc biệt"],
    discount:"0%", pointRate:"10%", permanent:true,
  },
  {
    key:"loyal", label:"Hội viên Thân Thiết", icon:"💚", stars:1,
    color:"#52b788", textColor:"white",
    bg:"linear-gradient(135deg,#1a4d35,#2d6a4f,#52b788)",
    border:"rgba(82,183,136,0.5)",
    innerBg:"linear-gradient(135deg,#020e08,#041408)",
    tier:"Thân thiết", category:"Hạng thành viên",
    condition:"Tiêu dùng tích lũy 1.000.000đ – 2.999.999đ",
    upgrade:"Tiêu dùng tích lũy 3.000.000đ – 4.999.999đ để lên Bạc",
    maintain:"Duy trì chi tiêu tháng ≥ 1.000.000đ",
    benefits:["Tích 10% điểm trên mỗi hóa đơn","Giảm 1% trên tổng hóa đơn","Tham gia Game Center nhận thưởng","Ưu đãi sinh nhật đặc biệt"],
    discount:"1%", pointRate:"10%", permanent:false,
  },
  {
    key:"silver", label:"Hội viên Bạc", icon:"🥈", stars:2,
    color:"#9ca3af", textColor:"white",
    bg:"linear-gradient(135deg,#4b5563,#6b7280,#9ca3af)",
    border:"rgba(156,163,175,0.5)",
    innerBg:"linear-gradient(135deg,#080a0e,#0d1018)",
    tier:"Bạc ✦", category:"Hạng thành viên",
    condition:"Tiêu dùng tích lũy 3.000.000đ – 4.999.999đ",
    upgrade:"Tiêu dùng tích lũy 5.000.000đ – 9.999.999đ để lên Vàng",
    maintain:"Duy trì chi tiêu tháng ≥ 1.500.000đ",
    benefits:["Tích 10% điểm trên mỗi hóa đơn","Giảm 2% trên tổng hóa đơn","Tham gia Game Center nhận thưởng","Ưu đãi sinh nhật đặc biệt"],
    discount:"2%", pointRate:"10%", permanent:false,
  },
  {
    key:"gold", label:"Hội viên Vàng", icon:"🥇", stars:3.5,
    color:"#f59e0b", textColor:"#412402",
    bg:"linear-gradient(135deg,#78350f,#b45309,#f59e0b)",
    border:"rgba(245,158,11,0.6)",
    innerBg:"linear-gradient(135deg,#100800,#1e1000)",
    tier:"✦ Vàng ✦", category:"Hạng thành viên",
    condition:"Tiêu dùng tích lũy 5.000.000đ – 9.999.999đ",
    upgrade:"Tiêu dùng tích lũy từ 10.000.000đ để lên Kim Cương",
    maintain:"Duy trì chi tiêu tháng ≥ 2.000.000đ",
    benefits:["Tích 10% điểm trên mỗi hóa đơn","Giảm 3% trên tổng hóa đơn","Tham gia Game Center nhận thưởng","Ưu đãi sinh nhật đặc biệt"],
    discount:"3%", pointRate:"10%", permanent:false,
  },
  {
    key:"diamond", label:"Hội viên Kim Cương", icon:"💎", stars:5,
    color:"#a78bfa", textColor:"#e0f4ff",
    bg:"linear-gradient(135deg,#0a2a5a,#1a50a0,#3a8adf,#80c0ff,#3a8adf)",
    border:"rgba(167,139,250,0.6)",
    innerBg:"linear-gradient(150deg,#04101e,#061828,#081e34)",
    tier:"Đẳng cấp tối thượng", category:"Đẳng cấp vương giả",
    condition:"Tiêu dùng tích lũy từ 10.000.000đ",
    upgrade:"Hạng cao nhất trong nhóm Hội viên",
    maintain:"Duy trì chi tiêu tháng ≥ 3.000.000đ",
    benefits:["Tích 10% điểm trên mỗi hóa đơn","Giảm 5% trên tổng hóa đơn","Hạng tối thượng — đẳng cấp riêng biệt","Quà sinh nhật + Tri ân hàng tháng","Ưu tiên tham gia sự kiện độc quyền"],
    discount:"5%", pointRate:"10%", permanent:false,
    royal:true,
    borderAnim:"linear-gradient(90deg,#0050ff,#40b0ff,#fff,#80d0ff,#0050ff)",
    glowAnim:"diamondGlowCard 2s ease-in-out infinite",
  },
  {
    key:"partner", label:"Đối Tác", icon:"🤝", stars:3.5,
    color:"#8b5cf6", textColor:"white",
    bg:"linear-gradient(135deg,#4c1d95,#6d28d9,#8b5cf6)",
    border:"rgba(139,92,246,0.6)",
    innerBg:"linear-gradient(150deg,#08041a,#0f0628,#14082e)",
    tier:"✦ Đối tác ✦", category:"Hạng đối tác",
    condition:"Được admin xét duyệt và kích hoạt",
    upgrade:"Tiêu ≥ 2.000.000đ/tháng × 2 tháng liên tiếp để lên Đối Tác Thân Thiết",
    maintain:"Duy trì chi tiêu tháng ≥ 1.000.000đ · Mất hạng nếu không đủ",
    benefits:["Tích 10% tổng tiêu dùng tháng thành điểm hoa hồng","Hoa hồng nhận ngay mỗi tháng","Giảm 3% trên tổng hóa đơn","Quà tặng sinh nhật đặc biệt","Ưu tiên thông báo chương trình mới"],
    discount:"3%", pointRate:"10%", permanent:false,
    royal:true,
    borderAnim:"linear-gradient(90deg,#4c1d95,#7c3aed,#c4b5fd,#7c3aed,#4c1d95)",
    glowAnim:"partnerGlowCard 2s ease-in-out infinite",
  },
  {
    key:"loyal_partner", label:"Đối Tác Thân Thiết", icon:"👑", stars:5,
    color:"#c084fc", textColor:"#ffe0f0",
    bg:"linear-gradient(135deg,#4a0a28,#8a1a50,#d4537e,#ff90c0,#c080ff)",
    border:"rgba(192,132,252,0.6)",
    innerBg:"linear-gradient(150deg,#120608,#1e0a14,#160820)",
    tier:"Bất khả xâm phạm", category:"Đẳng cấp vương giả",
    condition:"Tiêu ≥ 2.000.000đ/tháng × 2 tháng liên tiếp",
    upgrade:"Hạng cao nhất trong toàn bộ hệ thống",
    maintain:"Duy trì chi tiêu tháng ≥ 2.000.000đ · Mất hạng nếu không đủ",
    benefits:["Tích 15% tổng tiêu dùng tháng thành điểm hoa hồng","Hoa hồng nhận ngay mỗi tháng","Giảm 5% trên tổng hóa đơn","Hạng tối thượng — đặc quyền tuyệt đối","Quà tặng sinh nhật đặc biệt","Ưu tiên tham gia sự kiện độc quyền"],
    discount:"5%", pointRate:"15%", permanent:false,
    royal:true,
    borderAnim:"linear-gradient(90deg,#cc2266,#ff60b0,#fff,#c080ff,#cc2266)",
    glowAnim:"loyalPartnerGlowCard 2s ease-in-out infinite",
  },
  {
    key:"champion", label:"Kiện tướng", icon:"♟️", stars:4,
    color:"#ffd700", textColor:"#120c00",
    bg:"linear-gradient(135deg,#3a2200,#7a4a00,#c47a00,#ffd700,#ffb800,#c47a00)",
    border:"#ffd700",
    innerBg:"linear-gradient(150deg,#0e0900,#1a1000,#261800)",
    tier:"Vương giả cờ vua", category:"Danh hiệu đặc biệt · Live",
    condition:"Top 1 BXH Kỳ thủ cờ vua",
    upgrade:"Danh hiệu cao quý — không có cấp trên",
    maintain:"Duy trì vị trí Top 1 BXH · Mất ngay khi bị vượt qua",
    benefits:["Danh hiệu LIVE — hiển thị trực tiếp","Được công nhận là Vương giả cờ vua","Biểu tượng ♟️ độc nhất vô nhị","Xuất hiện nổi bật trong cộng đồng"],
    discount:"—", pointRate:"—", permanent:false, live:true,
    royal:true,
    borderAnim:"linear-gradient(90deg,#5a3a00,#ffd700,#fff8e0,#ffcc00,#ffd700,#5a3a00)",
    glowAnim:"ktGlowCard 2.2s ease-in-out infinite",
  },
  {
    key:"hof_1", label:"Vương Giả", icon:"♦", stars:5,
    color:"#ff80a0", textColor:"#ffe0ea",
    bg:"radial-gradient(circle at 35% 35%,#ff80a0 0%,#dd0050 30%,#880028 60%,#3a0010 100%)",
    border:"#ff2060",
    innerBg:"linear-gradient(155deg,#0a0005,#150008,#0a0005)",
    tier:"Đỉnh Phong Bất Bại", category:"Đại Sảnh Danh Vọng · Live",
    condition:"Top 1 BXH Tiêu dùng Alltime",
    upgrade:"Danh hiệu cao quý nhất — không có cấp trên",
    maintain:"Duy trì vị trí Top 1 Alltime · Mất ngay khi bị vượt qua",
    benefits:["Danh hiệu LIVE — thay đổi tức thì","Biểu tượng Ruby đỏ thẫm quyền uy","Khung viền lửa đặc trưng 5 sao","Xuất hiện nổi bật nhất trong cộng đồng","Không thể mua — chỉ do thực lực tiêu dùng"],
    discount:"—", pointRate:"—", permanent:false, live:true,
    royal:true,
    borderAnim:"linear-gradient(90deg,#3a0010,#aa0030,#ff2060,#ff80a0,#fff0f3,#ff2060,#aa0030,#3a0010)",
    glowAnim:"hofGlow1 2s ease-in-out infinite",
  },
  {
    key:"hof_2", label:"Phú Hào", icon:"♦", stars:4,
    color:"#80a0ff", textColor:"#c0d8ff",
    bg:"radial-gradient(circle at 35% 35%,#90b8ff 0%,#2050ee 32%,#0c1880 62%,#040830 100%)",
    border:"#2050ee",
    innerBg:"linear-gradient(155deg,#010208,#02040e,#010208)",
    tier:"Tinh Hoa Đệ Nhị", category:"Đại Sảnh Danh Vọng · Live",
    condition:"Top 2 BXH Tiêu dùng Alltime",
    upgrade:"Vươn lên Top 1 để đạt Vương Giả",
    maintain:"Duy trì vị trí Top 2 Alltime · Thay đổi tức thì khi BXH thay đổi",
    benefits:["Danh hiệu LIVE — thay đổi tức thì","Biểu tượng Sapphire xanh dương huyền bí","Khung viền xanh đặc trưng 4 sao","Xuất hiện nổi bật trong cộng đồng","Không thể mua — chỉ do thực lực tiêu dùng"],
    discount:"—", pointRate:"—", permanent:false, live:true,
    royal:true,
    borderAnim:"linear-gradient(90deg,#080030,#1840cc,#5080ff,#b0c8ff,#5080ff,#1840cc,#080030)",
    glowAnim:"hofGlow2 2s ease-in-out infinite",
  },
  {
    key:"hof_3", label:"Địa Chủ", icon:"♦", stars:4,
    color:"#40ee80", textColor:"#a0ffcc",
    bg:"radial-gradient(circle at 35% 35%,#80ffb8 0%,#18cc66 30%,#066838 60%,#001c0a 100%)",
    border:"#0caa55",
    innerBg:"linear-gradient(155deg,#010802,#020e04,#010802)",
    tier:"Tinh Hoa Đệ Tam", category:"Đại Sảnh Danh Vọng · Live",
    condition:"Top 3 BXH Tiêu dùng Alltime",
    upgrade:"Vươn lên Top 2 để đạt Phú Hào",
    maintain:"Duy trì vị trí Top 3 Alltime · Thay đổi tức thì khi BXH thay đổi",
    benefits:["Danh hiệu LIVE — thay đổi tức thì","Biểu tượng Emerald xanh lá quý phái","Khung viền xanh đặc trưng 4 sao","Xuất hiện nổi bật trong cộng đồng","Không thể mua — chỉ do thực lực tiêu dùng"],
    discount:"—", pointRate:"—", permanent:false, live:true,
    royal:true,
    borderAnim:"linear-gradient(90deg,#001c0a,#0caa55,#40ee88,#a0ffcc,#40ee88,#0caa55,#001c0a)",
    glowAnim:"hofGlow3 2s ease-in-out infinite",
  },
];

const CATEGORIES = ["Tất cả","Hạng thành viên","Hạng đối tác","Đẳng cấp vương giả","Danh hiệu đặc biệt · Live","Đại Sảnh Danh Vọng · Live"];

function Stars({ count, color }) {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div style={{ display:"flex", gap:3 }}>
      {Array(full).fill(0).map((_,i) => (
        <svg key={`f${i}`} width="13" height="13" viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={color} stroke={color} strokeWidth=".5"/>
        </svg>
      ))}
      {half && (
        <svg width="13" height="13" viewBox="0 0 12 12">
          <defs><linearGradient id="hg" x1="0" x2="1" y1="0" y2="0"><stop offset="50%" stopColor={color}/><stop offset="50%" stopColor="transparent" stopOpacity="0"/></linearGradient></defs>
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="url(#hg)" stroke={color} strokeWidth="1"/>
        </svg>
      )}
      {Array(empty).fill(0).map((_,i) => (
        <svg key={`e${i}`} width="13" height="13" viewBox="0 0 12 12">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="none" stroke={color} strokeWidth="1" opacity=".3"/>
        </svg>
      ))}
    </div>
  );
}

function BadgeCard({ b }) {
  const isRoyal = b.royal;
  return (
    <div style={{ borderRadius:20, padding:isRoyal?"2.5px":"0", background:isRoyal?b.borderAnim:"transparent", backgroundSize:"400% 100%", animation:isRoyal?"royalBorder 1.8s linear infinite":"none" }}>
      <div style={{ borderRadius:isRoyal?18:20, padding:"20px 16px", background:isRoyal?b.innerBg:"#1a1a24", border:isRoyal?"none":`1px solid ${b.border}`, position:"relative", overflow:"hidden", boxSizing:"border-box" }}>
        {isRoyal && <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.07),rgba(255,255,255,.14),rgba(255,255,255,.07),transparent)", animation:"tcScan 3s ease-in-out infinite", pointerEvents:"none" }}/>}
        {b.live && <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,0,0,.85)", borderRadius:4, padding:"2px 7px", fontSize:9, fontWeight:900, color:"#fff", animation:"liveFlash 1.2s ease-in-out infinite", zIndex:2 }}>LIVE</div>}

        {/* Icon */}
        <div style={{ width:64, height:64, borderRadius:"50%", background:b.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:14, animation:b.glowAnim||"none", position:"relative", zIndex:1 }}>
          {b.icon}
        </div>

        {/* Tier pill */}
        <div style={{ display:"inline-block", background:isRoyal?`${b.border}22`:"rgba(255,255,255,.06)", borderRadius:20, padding:"3px 12px", marginBottom:8, border:`1px solid ${isRoyal?b.border+"66":"rgba(255,255,255,.1)"}` }}>
          <span style={{ fontSize:10, fontWeight:800, color:b.color, letterSpacing:1 }}>{b.tier}</span>
        </div>

        <p style={{ fontSize:17, fontWeight:900, color:isRoyal?b.color:"white", margin:"0 0 5px", textShadow:isRoyal?`0 0 12px ${b.border}`:"none", position:"relative", zIndex:1 }}>{b.label}</p>
        <Stars count={b.stars} color={b.color}/>

        {/* Stats row */}
        {(b.discount !== "—" || b.pointRate !== "—") && (
          <div style={{ display:"flex", gap:8, margin:"12px 0 0", flexWrap:"wrap" }}>
            {b.discount !== "—" && <div style={{ background:"rgba(255,255,255,.06)", borderRadius:8, padding:"5px 10px", border:"1px solid rgba(255,255,255,.08)" }}>
              <p style={{ fontSize:9, color:"#888", margin:"0 0 2px" }}>GIẢM GIÁ</p>
              <p style={{ fontSize:14, fontWeight:900, color:b.color, margin:0 }}>{b.discount}</p>
            </div>}
            {b.pointRate !== "—" && <div style={{ background:"rgba(255,255,255,.06)", borderRadius:8, padding:"5px 10px", border:"1px solid rgba(255,255,255,.08)" }}>
              <p style={{ fontSize:9, color:"#888", margin:"0 0 2px" }}>TÍCH ĐIỂM</p>
              <p style={{ fontSize:14, fontWeight:900, color:b.color, margin:0 }}>{b.pointRate}</p>
            </div>}
          </div>
        )}

        {/* Conditions */}
        <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:10, color:"#555", margin:"0 0 4px", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>✦ Điều kiện đạt hạng</p>
            <p style={{ fontSize:12, color:isRoyal?b.color:"#ccc", margin:0, fontWeight:600 }}>{b.condition}</p>
          </div>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:10, color:"#555", margin:"0 0 4px", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>⬆ Điều kiện lên hạng tiếp</p>
            <p style={{ fontSize:11, color:"#888", margin:0 }}>{b.upgrade}</p>
          </div>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:10, color:"#555", margin:"0 0 4px", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>◎ Điều kiện duy trì</p>
            <p style={{ fontSize:11, color:"#888", margin:0 }}>{b.maintain}</p>
          </div>
          <div>
            <p style={{ fontSize:10, color:"#555", margin:"0 0 6px", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>★ Quyền lợi</p>
            {b.benefits.map((d,i) => (
              <p key={i} style={{ fontSize:11, color:"#777", margin:"0 0 3px", paddingLeft:8, borderLeft:`2px solid ${b.color}44` }}>• {d}</p>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          {b.permanent ? (
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(76,175,80,.15)", color:"#4CAF50", border:"1px solid rgba(76,175,80,.3)" }}>✓ Vĩnh viễn</span>
          ) : b.live ? (
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(255,0,0,.12)", color:"#f44336", border:"1px solid rgba(255,0,0,.25)" }}>⚡ Live · Tạm thời</span>
          ) : (
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(255,150,0,.1)", color:"#ff9800", border:"1px solid rgba(255,150,0,.2)" }}>◎ Có điều kiện</span>
          )}
          <span style={{ fontSize:10, padding:"3px 8px", borderRadius:10, background:"rgba(255,255,255,.04)", color:"#666", border:"1px solid rgba(255,255,255,.08)" }}>{b.category}</span>
        </div>
      </div>
    </div>
  );
}

export default function BadgeStorePage() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("Tất cả");
  const filtered = cat === "Tất cả" ? BADGE_STORE : BADGE_STORE.filter(b => b.category === cat);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", paddingBottom:80 }}>
      <div style={{ background:"#0a0a0f", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,.08)", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"white" }}>←</button>
        <div>
          <h1 style={{ fontSize:18, fontWeight:900, margin:0, color:"white" }}>💎 Store Danh Hiệu</h1>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", margin:0 }}>11 danh hiệu · Điều kiện chi tiết</p>
        </div>
      </div>

      <div style={{ padding:"12px 16px 0" }}>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:12 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding:"7px 14px", borderRadius:20, border:`1.5px solid ${cat===c?"#D4531C":"rgba(255,255,255,.12)"}`, background:cat===c?"rgba(212,83,28,.2)":"transparent", color:cat===c?"#D4531C":"rgba(255,255,255,.45)", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 16px 16px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {filtered.map(b => <BadgeCard key={b.key} b={b}/>)}
      </div>

      <style>{`
        @keyframes royalBorder{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes tcScan{0%{left:-60%}100%{left:120%}}
        @keyframes liveFlash{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes diamondGlowCard{0%,100%{box-shadow:0 0 22px 7px rgba(50,140,255,.55),inset 0 0 20px rgba(80,160,255,.15)}50%{box-shadow:0 0 50px 18px rgba(50,140,255,.9),inset 0 0 35px rgba(80,160,255,.28)}}
        @keyframes partnerGlowCard{0%,100%{box-shadow:0 0 18px 6px rgba(127,119,221,.5),inset 0 0 16px rgba(140,100,255,.12)}50%{box-shadow:0 0 40px 14px rgba(127,119,221,.88),inset 0 0 28px rgba(140,100,255,.24)}}
        @keyframes loyalPartnerGlowCard{0%,100%{box-shadow:0 0 22px 7px rgba(212,83,126,.55),inset 0 0 20px rgba(220,80,150,.15)}50%{box-shadow:0 0 50px 18px rgba(212,83,126,.92),inset 0 0 35px rgba(220,80,150,.28)}}
        @keyframes ktGlowCard{0%,100%{box-shadow:0 0 22px 7px rgba(186,117,23,.55),inset 0 0 18px rgba(255,200,0,.14)}50%{box-shadow:0 0 50px 18px rgba(186,117,23,.9),inset 0 0 32px rgba(255,200,0,.28)}}
        @keyframes hofGlow1{0%,100%{box-shadow:0 0 20px 6px rgba(255,0,80,.65),inset 0 0 18px rgba(255,60,100,.18)}50%{box-shadow:0 0 45px 15px rgba(255,20,90,.95),inset 0 0 32px rgba(255,80,120,.32)}}
        @keyframes hofGlow2{0%,100%{box-shadow:0 0 16px 5px rgba(40,80,255,.55),inset 0 0 14px rgba(80,130,255,.15)}50%{box-shadow:0 0 32px 11px rgba(80,130,255,.8),inset 0 0 26px rgba(80,130,255,.28)}}
        @keyframes hofGlow3{0%,100%{box-shadow:0 0 15px 5px rgba(20,180,80,.55),inset 0 0 14px rgba(50,220,120,.14)}50%{box-shadow:0 0 30px 10px rgba(50,220,120,.8),inset 0 0 26px rgba(50,220,120,.26)}}
      `}</style>
    </div>
  );
}
