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
            {b.category === "Danh hiệu quyến rũ" ? (() => {
              const cfg = {
                minh_tinh: { border:"linear-gradient(90deg,#6a0020,#cc0055,#ff60a0,#ffe0f0,#ff60a0,#cc0055,#6a0020)", inner:"linear-gradient(155deg,#0a0005,#180008,#0a0005)", iconBg:"radial-gradient(circle at 35% 35%,#ffb0d0 0%,#ee0055 35%,#880028 65%,#3a0010 100%)", color:"#ff80b0", glow:"hofGlow1 1.8s ease-in-out infinite", icon:"🌟", sub:"20.000 điểm quyến rũ", rank:"Đỉnh cao quyến rũ" },
                ngoi_sao:  { border:"linear-gradient(90deg,#6a4a00,#c09000,#ffd700,#fffacc,#ffd700,#c09000,#6a4a00)", inner:"linear-gradient(155deg,#090700,#160e00,#090700)", iconBg:"radial-gradient(circle at 35% 35%,#ffe880 0%,#d4a000 35%,#7a5000 65%,#2a1800 100%)", color:"#ffd700", glow:"ktGlowCard 2s ease-in-out infinite", icon:"⭐", sub:"10.000 điểm quyến rũ", rank:"Ngôi sao tỏa sáng" },
                idol:      { border:"linear-gradient(90deg,#2a1060,#6040c0,#a080ff,#e0d0ff,#a080ff,#6040c0,#2a1060)", inner:"linear-gradient(155deg,#060318,#0e0628,#060318)", iconBg:"radial-gradient(circle at 35% 35%,#d0c0ff 0%,#8060e0 35%,#3a2080 65%,#100840 100%)", color:"#b090ff", glow:"partnerGlowCard 2s ease-in-out infinite", icon:"✨", sub:"5.000 điểm quyến rũ", rank:"Idol của cộng đồng" },
              }[b.key] || {};
              return (
                <div style={{ borderRadius:20, padding:"2.5px", background:cfg.border, backgroundSize:"400% 100%", animation:"royalBorder 1.8s linear infinite" }}>
                  <div style={{ borderRadius:18, padding:"20px 18px", background:cfg.inner, position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:0, bottom:0, left:"-60%", width:"50%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.1),rgba(255,255,255,.2),rgba(255,255,255,.1),transparent)", animation:"tcScan 2.5s ease-in-out infinite", pointerEvents:"none" }}/>
                    <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 30% 50%,${cfg.color}15 0%,transparent 60%)`, pointerEvents:"none", borderRadius:18 }}/>
                    <div style={{ display:"flex", alignItems:"center", gap:16, position:"relative", zIndex:1 }}>
                      <div style={{ width:72, height:72, borderRadius:"50%", background:cfg.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, flexShrink:0, animation:cfg.glow }}>
                        {cfg.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"inline-block", background:`${cfg.color}22`, borderRadius:20, padding:"2px 10px", marginBottom:6, border:`1px solid ${cfg.color}44` }}>
                          <span style={{ fontSize:9, fontWeight:800, color:cfg.color, letterSpacing:1.5 }}>{cfg.rank}</span>
                        </div>
                        <p style={{ fontSize:19, fontWeight:900, color:cfg.color, margin:"0 0 5px", textShadow:`0 0 16px ${cfg.color}, 0 0 32px ${cfg.color}88` }}>{b.label}</p>
                        <div style={{ display:"flex", gap:3 }}>
                          {[1,2,3,4,5].map(i => (
                            <svg key={i} width="14" height="14" viewBox="0 0 12 12">
                              <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill={cfg.color} stroke={cfg.color} strokeWidth=".5"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,.3)", margin:"0 0 4px" }}>YÊU CẦU</p>
                        <p style={{ fontSize:13, fontWeight:900, color:cfg.color, margin:0 }}>{cfg.sub}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
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
