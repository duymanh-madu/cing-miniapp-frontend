import { useNavigate } from "react-router-dom";

const TIERS = [
  {
    key: "member",
    label: "Hội viên",
    icon: "🌱",
    group: "Hội viên",
    bg: "linear-gradient(135deg,#3d6b3d,#5a9a5a,#7ab87a)",
    border: "rgba(122,184,122,0.4)",
    glow: "rgba(122,184,122,0.3)",
    condition: "Kích hoạt tài khoản thành công",
    spend: "Dưới 1.000.000đ / chu kỳ",
    benefits: [
      { icon:"⭐", text:"Tích 10% điểm trên mỗi hóa đơn" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"🔔", text:"Nhận thông báo ưu đãi sớm nhất" },
      { icon:"🎁", text:"Ưu đãi sinh nhật đặc biệt" },
    ],
    discount: "0%",
    pointRate: "10%",
  },
  {
    key: "loyal",
    label: "Hội viên Thân Thiết",
    icon: "💚",
    group: "Hội viên",
    bg: "linear-gradient(135deg,#1a4d35,#2d6a4f,#52b788)",
    border: "rgba(82,183,136,0.4)",
    glow: "rgba(82,183,136,0.3)",
    condition: "Tiêu dùng 1.000.000đ – 2.999.999đ",
    spend: "1.000.000đ – 2.999.999đ / chu kỳ",
    benefits: [
      { icon:"⭐", text:"Tích 10% điểm trên mỗi hóa đơn" },
      { icon:"💰", text:"Giảm 1% trên tổng hóa đơn" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"🔔", text:"Nhận thông báo ưu đãi sớm nhất" },
      { icon:"🎁", text:"Ưu đãi sinh nhật đặc biệt" },
    ],
    discount: "1%",
    pointRate: "10%",
  },
  {
    key: "silver",
    label: "Hội viên Bạc",
    icon: "🥈",
    group: "Hội viên",
    bg: "linear-gradient(135deg,#4b5563,#6b7280,#9ca3af)",
    border: "rgba(156,163,175,0.4)",
    glow: "rgba(156,163,175,0.3)",
    condition: "Tiêu dùng 3.000.000đ – 4.999.999đ",
    spend: "3.000.000đ – 4.999.999đ / chu kỳ",
    benefits: [
      { icon:"⭐", text:"Tích 10% điểm trên mỗi hóa đơn" },
      { icon:"💰", text:"Giảm 2% trên tổng hóa đơn" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"🔔", text:"Nhận thông báo ưu đãi sớm nhất" },
      { icon:"🎁", text:"Ưu đãi sinh nhật đặc biệt" },
    ],
    discount: "2%",
    pointRate: "10%",
  },
  {
    key: "gold",
    label: "Hội viên Vàng",
    icon: "🥇",
    group: "Hội viên",
    bg: "linear-gradient(135deg,#78350f,#b45309,#f59e0b)",
    border: "rgba(245,158,11,0.5)",
    glow: "rgba(245,158,11,0.35)",
    condition: "Tiêu dùng 5.000.000đ – 9.999.999đ",
    spend: "5.000.000đ – 9.999.999đ / chu kỳ",
    benefits: [
      { icon:"⭐", text:"Tích 10% điểm trên mỗi hóa đơn" },
      { icon:"💰", text:"Giảm 3% trên tổng hóa đơn" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"🔔", text:"Nhận thông báo ưu đãi sớm nhất" },
      { icon:"🎁", text:"Ưu đãi sinh nhật đặc biệt" },
    ],
    discount: "3%",
    pointRate: "10%",
  },
  {
    key: "diamond",
    label: "Hội viên Kim Cương",
    icon: "💎",
    group: "Hội viên",
    bg: "linear-gradient(135deg,#060614,#0f0728,#1a0f3d)",
    border: "rgba(167,139,250,0.5)",
    glow: "rgba(180,160,255,0.4)",
    condition: "Tiêu dùng từ 10.000.000đ",
    spend: "Từ 10.000.000đ / chu kỳ",
    supreme: true,
    shimmer: true,
    benefits: [
      { icon:"⭐", text:"Tích 10% điểm trên mỗi hóa đơn" },
      { icon:"💰", text:"Giảm 5% trên tổng hóa đơn" },
      { icon:"👑", text:"Hạng tối thượng — đẳng cấp riêng biệt" },
      { icon:"🎁", text:"Quà sinh nhật đặc biệt + Tri ân hàng tháng" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"🏆", text:"Ưu tiên tham gia sự kiện độc quyền" },
    ],
    discount: "5%",
    pointRate: "10%",
  },
  {
    key: "partner",
    label: "Đối Tác",
    icon: "🤝",
    group: "Đối tác",
    bg: "linear-gradient(135deg,#4c1d95,#6d28d9,#8b5cf6)",
    border: "rgba(139,92,246,0.5)",
    glow: "rgba(139,92,246,0.35)",
    condition: "Được admin xét duyệt và kích hoạt",
    spend: "Là Hội viên và đăng kí trực tiếp với admin",
    benefits: [
      { icon:"⭐", text:"Tích 10% tổng tiêu dùng tháng thành điểm hoa hồng" },
      { icon:"💰", text:"Hoa hồng nhận ngay mỗi tháng - tiêu dùng càng nhiều, hoa hồng càng cao" },
      { icon:"💰", text:"Giảm 3% trên tổng hóa đơn" },
      { icon:"🎁", text:"Quà tặng sinh nhật đặc biệt" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"📢", text:"Ưu tiên thông báo chương trình mới" },
    ],
    discount: "3%",
    pointRate: "10%",
  },
  {
    key: "loyal_partner",
    label: "Đối Tác Thân Thiết",
    icon: "👑",
    group: "Đối tác",
    bg: "linear-gradient(135deg,#2d0a4e,#4a1082,#6b21a8)",
    border: "rgba(192,132,252,0.5)",
    glow: "rgba(192,132,252,0.4)",
    condition: "Tiêu ≥ 2.000.000đ/tháng × 2 tháng liên tiếp",
    spend: "Duy trì ≥ 2.000.000đ mỗi tháng",
    supreme: true,
    royalShimmer: true,
    benefits: [
      { icon:"⭐", text:"Tích 15% tổng tiêu dùng tháng thành điểm hoa hồng" },
      { icon:"💰", text:"Hoa hồng nhận ngay mỗi tháng - tiêu dùng càng nhiều, hoa hồng càng cao" },
      { icon:"💰", text:"Giảm 5% trên tổng hóa đơn" },
      { icon:"👑", text:"Hạng tối thượng — đặc quyền tuyệt đối" },
      { icon:"🎮", text:"Tham gia Game Center nhận thưởng" },
      { icon:"🎁", text:"Quà tặng sinh nhật đặc biệt" },
      { icon:"🏆", text:"Ưu tiên tham gia sự kiện độc quyền" },
    ],
    discount: "5%",
    pointRate: "15%",
  },
];

export default function MembershipBenefitsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0a0514 0%,#12071a 50%,#0a0514 100%)",
      paddingBottom:100 }}>
      <style>{`
        @keyframes shimmerSweep {
          0% { transform:translateX(-100%) rotate(45deg); }
          100% { transform:translateX(400%) rotate(45deg); }
        }
        @keyframes royalSweep {
          0% { transform:translateX(-100%) rotate(45deg); }
          100% { transform:translateX(400%) rotate(45deg); }
        }
        @keyframes prismaticBorder {
          0%   { filter:hue-rotate(0deg) brightness(1.5); }
          50%  { filter:hue-rotate(180deg) brightness(2); }
          100% { filter:hue-rotate(360deg) brightness(1.5); }
        }
        @keyframes facetPulse {
          0%,100% { opacity:0.15; }
          50% { opacity:0.4; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding:"20px 16px 16px", background:"linear-gradient(180deg,rgba(255,215,0,0.08),transparent)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <button onClick={()=>navigate(-1)} style={{ background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.1)", color:"white", borderRadius:12,
            width:38, height:38, cursor:"pointer", fontSize:18,
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1, textAlign:"center" }}>
            <p style={{ color:"rgba(255,215,0,0.6)", fontSize:10, fontWeight:800,
              letterSpacing:4, margin:"0 0 3px", textTransform:"uppercase" }}>Cing Hu Tang</p>
            <h1 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>Quyền Lợi Thành Viên</h1>
          </div>
          <div style={{ width:38 }}/>
        </div>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12, textAlign:"center", margin:0 }}>
          7 hạng thành viên · Đặc quyền riêng cho từng hạng
        </p>
      </div>

      {/* Group divider: Hội viên */}
      <div style={{ margin:"8px 16px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.3))" }}/>
        <span style={{ color:"rgba(255,215,0,0.7)", fontSize:11, fontWeight:800, letterSpacing:2 }}>HỘI VIÊN</span>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }}/>
      </div>

      {/* Cards */}
      <div style={{ padding:"0 16px" }}>
        {TIERS.map((tier, idx) => {
          const isGroupDivider = tier.key === "partner";
          return (
            <div key={tier.key}>
              {isGroupDivider && (
                <div style={{ margin:"20px 0 12px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.4))" }}/>
                  <span style={{ color:"rgba(139,92,246,0.8)", fontSize:11, fontWeight:800, letterSpacing:2 }}>ĐỐI TÁC</span>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(139,92,246,0.4),transparent)" }}/>
                </div>
              )}

              <div style={{ position:"relative", borderRadius:20, overflow:"hidden", marginBottom:14,
                boxShadow:`0 8px 30px ${tier.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
                background: tier.bg,
                border: `1px solid ${tier.border}` }}>

                {/* Diamond shimmer */}
                {tier.shimmer && (
                  <div style={{ position:"absolute", inset:0, overflow:"hidden", borderRadius:20, zIndex:0 }}>
                    <div style={{ position:"absolute", top:"-50%", left:"-20%", width:"35%", height:"200%",
                      background:"linear-gradient(to right,transparent,rgba(255,255,255,0.12),rgba(200,180,255,0.18),rgba(255,255,255,0.12),transparent)",
                      animation:"shimmerSweep 3s ease-in-out infinite", transform:"rotate(45deg)" }}/>
                    <div style={{ position:"absolute", inset:-1, borderRadius:21,
                      background:"linear-gradient(135deg,#a78bfa,#60a5fa,#f0abfc,#818cf8,#a78bfa)",
                      animation:"prismaticBorder 4s linear infinite",
                      WebkitMask:"linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
                      WebkitMaskComposite:"xor", maskComposite:"exclude", padding:2 }}/>
                  </div>
                )}

                {/* Royal partner shimmer */}
                {tier.royalShimmer && (
                  <div style={{ position:"absolute", inset:0, overflow:"hidden", borderRadius:20, zIndex:0 }}>
                    <div style={{ position:"absolute", top:"-50%", left:"-20%", width:"35%", height:"200%",
                      background:"linear-gradient(to right,transparent,rgba(220,160,255,0.18),rgba(255,200,255,0.22),rgba(220,160,255,0.18),transparent)",
                      animation:"royalSweep 2.5s ease-in-out infinite", transform:"rotate(45deg)" }}/>
                    <div style={{ position:"absolute", inset:-1, borderRadius:21,
                      background:"linear-gradient(135deg,#c084fc,#e879f9,#a855f7,#7e22ce,#c084fc)",
                      animation:"prismaticBorder 3.5s linear infinite",
                      WebkitMask:"linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
                      WebkitMaskComposite:"xor", maskComposite:"exclude", padding:2 }}/>
                  </div>
                )}

                {/* Decor circles */}
                <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120,
                  borderRadius:"50%", background:"rgba(255,255,255,0.05)", zIndex:0 }}/>
                <div style={{ position:"absolute", bottom:-40, left:-20, width:140, height:140,
                  borderRadius:"50%", background:"rgba(255,255,255,0.03)", zIndex:0 }}/>

                {/* Content */}
                <div style={{ position:"relative", zIndex:1, padding:"18px 18px 16px" }}>
                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:48, height:48, borderRadius:14,
                        background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                        border:"1px solid rgba(255,255,255,0.25)",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                        {tier.icon}
                      </div>
                      <div>
                        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:9, fontWeight:700,
                          letterSpacing:2, margin:"0 0 2px", textTransform:"uppercase" }}>
                          {tier.group}
                        </p>
                        <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>{tier.label}</p>
                      </div>
                    </div>
                    {tier.supreme && (
                      <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                        border:"1px solid rgba(255,255,255,0.25)", borderRadius:10,
                        padding:"4px 10px" }}>
                        <p style={{ color:"white", fontSize:9, fontWeight:800, margin:0 }}>👑 Tối thượng</p>
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                    <div style={{ flex:1, background:"rgba(0,0,0,0.2)", borderRadius:10,
                      padding:"8px 10px", border:"1px solid rgba(255,255,255,0.1)" }}>
                      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:9, margin:"0 0 2px" }}>Giảm giá</p>
                      <p style={{ color:"white", fontSize:18, fontWeight:900, margin:0 }}>{tier.discount}</p>
                    </div>
                    <div style={{ flex:1, background:"rgba(0,0,0,0.2)", borderRadius:10,
                      padding:"8px 10px", border:"1px solid rgba(255,255,255,0.1)" }}>
                      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:9, margin:"0 0 2px" }}>Tích điểm</p>
                      <p style={{ color:"white", fontSize:18, fontWeight:900, margin:0 }}>{tier.pointRate}</p>
                    </div>
                    <div style={{ flex:2, background:"rgba(0,0,0,0.2)", borderRadius:10,
                      padding:"8px 10px", border:"1px solid rgba(255,255,255,0.1)" }}>
                      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:9, margin:"0 0 2px" }}>Điều kiện</p>
                      <p style={{ color:"rgba(255,255,255,0.85)", fontSize:10, fontWeight:600, margin:0, lineHeight:1.3 }}>
                        {tier.spend}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height:1, background:"rgba(255,255,255,0.12)", margin:"0 0 12px" }}/>

                  {/* Benefits list */}
                  <p style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:800,
                    letterSpacing:2, margin:"0 0 8px", textTransform:"uppercase" }}>
                    Quyền lợi
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 8px" }}>
                    {tier.benefits.map((b, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:14, flexShrink:0 }}>{b.icon}</span>
                        <span style={{ color:"rgba(255,255,255,0.8)", fontSize:11, lineHeight:1.3 }}>{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ margin:"8px 16px 20px", padding:"14px 16px",
        background:"rgba(255,255,255,0.04)", borderRadius:14,
        border:"1px solid rgba(255,255,255,0.08)" }}>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, margin:0, lineHeight:1.7, textAlign:"center" }}>
          💡 Hạng thành viên được xét duyệt theo chu kỳ tháng dựa trên tổng chi tiêu tích lũy.<br/>
          Điểm tích lũy có thể dùng để đổi ưu đãi hoặc thay đổi thông tin hồ sơ.
        </p>
      </div>
    </div>
  );
}
