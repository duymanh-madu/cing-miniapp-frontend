import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TierCard } from "@/membership/components/TierCard";

const BADGES = [
  { key:"member",        label:"Hội viên",            condition:"Kích hoạt tài khoản thành công", category:"Hạng thành viên", live:false },
  { key:"loyal",         label:"Hội viên Thân Thiết", condition:"Chi tiêu tích lũy đạt 1.000.000đ – 2.999.999đ trong chu kỳ xét hạng", category:"Hạng thành viên", live:false },
  { key:"silver",        label:"Hội viên Bạc",        condition:"Chi tiêu tích lũy đạt 3.000.000đ – 4.999.999đ trong chu kỳ xét hạng", category:"Hạng thành viên", live:false },
  { key:"gold",          label:"Hội viên Vàng",       condition:"Chi tiêu tích lũy đạt 5.000.000đ – 9.999.999đ trong chu kỳ xét hạng", category:"Hạng thành viên", live:false },
  { key:"diamond",       label:"Hội viên Kim Cương",  condition:"Chi tiêu tích lũy từ 10.000.000đ trong chu kỳ xét hạng", category:"Hạng thành viên", live:false },
  { key:"partner",       label:"Đối Tác",             condition:"Được admin xét duyệt · Duy trì chi tiêu ≥ 1.000.000đ/tháng", category:"Hạng đối tác", live:false },
  { key:"loyal_partner", label:"Đối Tác Thân Thiết",  condition:"Chi tiêu ≥ 2.000.000đ/tháng liên tục 2 tháng · Duy trì ≥ 2.000.000đ/tháng", category:"Hạng đối tác", live:false },
  { key:"champion",      label:"Kiện tướng",          condition:"Đứng Top 1 BXH Kỳ thủ cờ vua · Danh hiệu thay đổi tức thì khi BXH thay đổi", category:"Danh hiệu Live", live:true, isChampion:true },
  { key:"hof_1",         label:"Vương Giả",           condition:"Đứng Top 1 BXH Tiêu dùng Alltime · Danh hiệu thay đổi tức thì khi BXH thay đổi", category:"Đại Sảnh Danh Vọng", live:true },
  { key:"hof_2",         label:"Phú Hào",             condition:"Đứng Top 2 BXH Tiêu dùng Alltime · Danh hiệu thay đổi tức thì khi BXH thay đổi", category:"Đại Sảnh Danh Vọng", live:true },
  { key:"hof_3",         label:"Địa Chủ",             condition:"Đứng Top 3 BXH Tiêu dùng Alltime · Danh hiệu thay đổi tức thì khi BXH thay đổi", category:"Đại Sảnh Danh Vọng", live:true },
  { key:"idol",          label:"Idol",                condition:"Tích lũy 5.000 điểm quyến rũ từ vật phẩm được tặng", category:"Danh hiệu quyến rũ", live:false },
  { key:"ngoi_sao",      label:"Ngôi sao",            condition:"Tích lũy 10.000 điểm quyến rũ từ vật phẩm được tặng", category:"Danh hiệu quyến rũ", live:false },
  { key:"minh_tinh",     label:"Minh tinh",           condition:"Tích lũy 20.000 điểm quyến rũ từ vật phẩm được tặng", category:"Danh hiệu quyến rũ", live:false },
];

const CATEGORIES = ["Tất cả", "Hạng thành viên", "Hạng đối tác", "Danh hiệu Live", "Đại Sảnh Danh Vọng", "Danh hiệu quyến rũ"];

export default function BadgeStorePage() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("Tất cả");
  const filtered = cat === "Tất cả" ? BADGES : BADGES.filter(b => b.category === cat);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", paddingBottom:80 }}>
      {/* Header */}
      <div style={{ background:"#0a0a0f", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,.08)", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"white" }}>←</button>
        <div>
          <h1 style={{ fontSize:18, fontWeight:900, margin:0, color:"white" }}>💎 Store Danh Hiệu</h1>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", margin:0 }}>11 danh hiệu · Cách thức đạt được</p>
        </div>
      </div>

      {/* Filter */}
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

      {/* Cards */}
      <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map(b => (
          <div key={b.key}>
            {b.category === "Danh hiệu quyến rũ" ? (
              <div style={{ borderRadius:20, padding:"2.5px", background: b.key==="minh_tinh" ? "linear-gradient(90deg,#ff6090,#ffb0d0,#fff,#ffb0d0,#ff6090)" : b.key==="ngoi_sao" ? "linear-gradient(90deg,#c0a000,#ffd700,#fff,#ffd700,#c0a000)" : "linear-gradient(90deg,#6040c0,#a080ff,#fff,#a080ff,#6040c0)", backgroundSize:"400% 100%", animation:"royalBorder 2s linear infinite" }}>
                <div style={{ borderRadius:18, padding:"20px 18px", background: b.key==="minh_tinh" ? "linear-gradient(150deg,#12010a,#1e0210,#12010a)" : b.key==="ngoi_sao" ? "linear-gradient(150deg,#100e00,#1e1a00,#100e00)" : "linear-gradient(150deg,#080420,#0e0830,#080420)", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)", animation:"tcScan 3s ease-in-out infinite", pointerEvents:"none" }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ width:68, height:68, borderRadius:"50%", background: b.key==="minh_tinh" ? "linear-gradient(135deg,#8a0030,#cc0055,#ff60a0,#ffb0d0)" : b.key==="ngoi_sao" ? "linear-gradient(135deg,#7a5000,#c09000,#ffd700,#ffe880)" : "linear-gradient(135deg,#3a2080,#6040c0,#a080ff,#d0c0ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0, animation: b.key==="minh_tinh" ? "hofGlow1 2s ease-in-out infinite" : b.key==="ngoi_sao" ? "ktGlowCard 2s ease-in-out infinite" : "partnerGlowCard 2s ease-in-out infinite" }}>
                      {b.key==="minh_tinh" ? "🌟" : b.key==="ngoi_sao" ? "⭐" : "✨"}
                    </div>
                    <div>
                      <p style={{ fontSize:18, fontWeight:900, color: b.key==="minh_tinh" ? "#ff80b0" : b.key==="ngoi_sao" ? "#ffd700" : "#b090ff", margin:"0 0 4px", textShadow:`0 0 12px currentColor` }}>{b.label}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", margin:"0 0 6px", letterSpacing:1 }}>DANH HIỆU QUYẾN RŨ</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <TierCard
              tierKey={b.isChampion ? "member" : b.key}
              isChampion={b.isChampion || false}
              tierName={b.label}
            />
            )}
            {/* Điều kiện đạt được */}
            <div style={{ margin:"8px 4px 0", padding:"10px 14px", background:"rgba(255,255,255,.04)", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"flex-start", gap:10 }}>
              {b.live && <span style={{ background:"rgba(255,0,0,.85)", borderRadius:4, padding:"2px 6px", fontSize:9, fontWeight:900, color:"#fff", flexShrink:0, marginTop:1 }}>LIVE</span>}
              <p style={{ fontSize:12, color:"rgba(255,255,255,.6)", margin:0, lineHeight:1.5 }}>
                <span style={{ color:"rgba(255,255,255,.35)", fontWeight:700, marginRight:6 }}>Điều kiện:</span>
                {b.condition}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
