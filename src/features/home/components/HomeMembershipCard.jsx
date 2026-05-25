import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembership } from "../hooks/useMembership";
import { useEffect, useRef } from "react";
import useAuthStore from "@/stores/auth/authStore";
import useRealtimeCustomerStore from "@/stores/customer/customerRuntimeStore";

/* ── Barcode 1D dung JsBarcode (Code128 chuan ISO) ── */
function Barcode({ value, width = 120, height = 40 }) {
  const svgRef = useRef(null);
  useEffect(() => {
    if (!value || !svgRef.current) return;
    const script = document.getElementById("jsbarcode-script");
    function render() {
      if (!window.JsBarcode) return;
      try {
        window.JsBarcode(svgRef.current, String(value), {
          format: "CODE128",
          width: 2,
          height: height,
          displayValue: false,
          margin: 4,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch(e) { console.warn("Barcode error:", e); }
    }
    if (window.JsBarcode) {
      render();
    } else if (!script) {
      const s = document.createElement("script");
      s.id = "jsbarcode-script";
      s.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
      s.onload = render;
      document.head.appendChild(s);
    } else {
      script.addEventListener("load", render);
    }
  }, [value, height]);
  return (
    <svg ref={svgRef}
      style={{ display:"block", width:width, height:height+8, borderRadius:4 }}
    />
  );
}

/* ── Tier config — 5 hạng hội viên + 2 hạng đối tác ── */
const TIERS = {
  /* === HỘI VIÊN === */
  member:          {
    label:"Hội viên", group:"Hội viên",
    next:"Hội viên thân thiết", nextSpend:"1.000.000đ",
    stars:1, icon:"🌱",
    bg:["#5a7a5a","#7ab87a","#5a9a5a"],
    glow:"rgba(122,184,122,0.45)",
    desc:"Kích hoạt tài khoản thành công",
  },
  loyal:           {
    label:"Thân thiết", group:"Hội viên",
    next:"Hội viên Bạc", nextSpend:"3.000.000đ",
    stars:2, icon:"💚",
    bg:["#2d6a4f","#52b788","#40916c"],
    glow:"rgba(82,183,136,0.5)",
    desc:"Tiêu dùng 1.000.000đ – 2.999.999đ / chu kỳ",
  },
  silver:          {
    label:"Bạc", group:"Hội viên",
    next:"Hội viên Vàng", nextSpend:"5.000.000đ",
    stars:3, icon:"🥈",
    bg:["#6b7280","#9ca3af","#d1d5db"],
    glow:"rgba(156,163,175,0.5)",
    desc:"Tiêu dùng 3.000.000đ – 4.999.999đ / chu kỳ",
  },
  gold:            {
    label:"Vàng", group:"Hội viên",
    next:"Hội viên Kim Cương", nextSpend:"10.000.000đ",
    stars:4, icon:"🥇",
    bg:["#92400e","#f59e0b","#fbbf24"],
    glow:"rgba(251,191,36,0.55)",
    desc:"Tiêu dùng 5.000.000đ – 9.999.999đ / chu kỳ",
  },
  diamond:         {
    label:"Kim Cương", group:"Hội viên",
    next:null, nextSpend:null,
    stars:5, icon:"💎",
    bg:["#0a0a1a","#1a1040","#0d0d2e"],
    glow:"rgba(180,160,255,0.8)",
    supreme:true,
    desc:"Tiêu dùng từ 10.000.000đ / chu kỳ",
  },
  /* === ĐỐI TÁC === */
  partner:         {
    label:"Đối tác", group:"Đối tác",
    next:"Đối tác thân thiết", nextSpend:"2.000.000đ/tháng × 2",
    stars:1, icon:"🤝",
    bg:["#7c3aed","#a855f7","#c084fc"],
    glow:"rgba(168,85,247,0.5)",
    supreme:false,
    desc:"Được admin xét duyệt và kích hoạt",
  },
  loyal_partner:   {
    label:"Đối tác thân thiết", group:"Đối tác",
    next:null, nextSpend:null,
    stars:2, icon:"👑",
    bg:["#581c87","#7e22ce","#9333ea"],
    glow:"rgba(147,51,234,0.6)",
    supreme:true,
    desc:"Giữ hạng: tiêu ≥ 2.000.000đ mỗi tháng",
  },
};

/* Map tên hạng từ iPOS CRM → key nội bộ */
function mapTierKey(raw) {
  if (!raw) return "member";
  const r = raw.toLowerCase().trim();
  if (r === "diamond" || r.includes("diamond") || (r.includes("kim") && (r.includes("cuong") || r.includes("cương")))) return "diamond";
  if (r.includes("vang") || r.includes("gold") || r.includes("vàng")) return "gold";
  if (r.includes("bac") || r.includes("silver") || r.includes("bạc")) return "silver";
  if ((r.includes("than thiet") || r.includes("thân thiết")) && (r.includes("doi tac") || r.includes("đối tác") || r.includes("partner"))) return "loyal_partner";
  if (r.includes("doi tac") || r.includes("đối tác") || r.includes("partner")) return "partner";
  if (r.includes("than thiet") || r.includes("thân thiết") || r.includes("loyal")) return "loyal";
  return "member";
}

export default function HomeMembershipCard() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const phone = profile?.phone || profile?.phoneNumber || profile?.mobile || "";

  const realtimePoints = useRealtimeCustomerStore(s => s.profile?.points ?? null);
  const realtimeTier   = useRealtimeCustomerStore(s => s.profile?.tier?.toLowerCase?.() ?? null);
  const [inputPhone, setInputPhone] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState(
    () => sessionStorage.getItem("dev_membership_phone") || ""
  );
  const handleSubmitPhone = (p) => {
    const clean = p.replace(/\D/g,"");
    sessionStorage.setItem("dev_membership_phone", clean);
    setSubmittedPhone(clean);
  };
  const { data: membership, isLoading } = useMembership(submittedPhone || phone);
  const displayName = membership?.name || profile?.name || profile?.displayName || "Hội viên";

  const tierRaw = membership?.tierName || membership?.tierKey || realtimeTier || "member";
  // Uu tien tierKey neu da biet (chinh xac hon)
  const tierKeyDirect = membership?.tierKey?.toLowerCase?.() || "";
  const tier = tierKeyDirect && ["member","loyal","silver","gold","diamond","partner","loyal_partner"].includes(tierKeyDirect)
    ? tierKeyDirect
    : mapTierKey(membership?.tierName || tierRaw || "");
  const cfg    = TIERS[tier] || TIERS.member;
  const points = membership?.points ?? (realtimePoints || 0);
  const paymentAmount = membership?.paymentAmount ?? 0;

  const TIER_THRESHOLDS = { member:0, loyal:1000000, silver:3000000, gold:5000000, diamond:10000000 };
  const TIER_ORDER = ["member","loyal","silver","gold","diamond"];
  const currentIdx = TIER_ORDER.indexOf(tier);
  const nextTier = TIER_ORDER[currentIdx + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
  const currentThreshold = TIER_THRESHOLDS[tier] || 0;
  const progress = nextThreshold
    ? Math.min(Math.round(((paymentAmount - currentThreshold) / (nextThreshold - currentThreshold)) * 100), 99)
    : 100;
  const remaining = nextThreshold ? Math.max(nextThreshold - paymentAmount, 0) : 0;
  const activePhone = submittedPhone || phone || membership?.phone || "";
  const barcodeValue = activePhone.replace(/\D/g,"") || "000000000000";

  const isWeb = typeof window !== "undefined" && !window.__ZALO_MINI_APP__ && !navigator.userAgent.includes("ZaloApp");

  // Neu tren web va chua co phone, hien thi input
  if (!phone && isWeb && !submittedPhone) {
    return (
      <div style={{ background:"white", borderRadius:20, padding:"16px 18px",
        boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
        <p style={{ fontSize:12, color:"#888", margin:"0 0 4px", fontWeight:600 }}>
          🔍 Test card hội viên
        </p>
        <p style={{ fontSize:11, color:"#bbb", margin:"0 0 10px" }}>
          Nhập SĐT đã có trong iPOS để xem dữ liệu thật
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <input type="tel" placeholder="VD: 0984966336" autoFocus
            value={inputPhone}
            onChange={e => setInputPhone(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleSubmitPhone(inputPhone)}
            style={{ flex:1, border:"1.5px solid #e8e0d0", borderRadius:10,
              padding:"9px 12px", fontSize:13, outline:"none" }}/>
          <button onClick={() => handleSubmitPhone(inputPhone)}
            style={{ background:"#D4531C", color:"white", border:"none",
              borderRadius:10, padding:"9px 16px", fontSize:12,
              fontWeight:700, cursor:"pointer" }}>Xem</button>
        </div>
      </div>
    );
  }

  if (isLoading && !membership) {
    return <div style={{ height:220, borderRadius:24, background:"#e8e0d0", margin:"0 0 4px" }} className="animate-pulse"/>;
  }

  return (
    <button onClick={() => navigate("/account")}
      style={{ width:"100%", textAlign:"left", border:"none", background:"none", padding:0, cursor:"pointer" }}>
      <div style={{
        position:"relative", borderRadius:24, overflow:"hidden",
        boxShadow:`0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.2)`,
        background: tier === 'diamond' ? 'linear-gradient(135deg, #060614 0%, #0f0728 30%, #1a0f3d 60%, #0a0520 100%)' : `linear-gradient(135deg, ${cfg.bg[0]} 0%, ${cfg.bg[1]} 50%, ${cfg.bg[2]} 100%)`,
        border: tier === 'diamond' ? '1px solid rgba(167,139,250,0.4)' : 'none',
        minHeight:200,
      }}>

      {/* Diamond shimmer effect */}
      {tier === "diamond" && (<>
        <style>{`
          @keyframes diamondShimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(400%) rotate(45deg); }
          }
          @keyframes prismatic {
            0%   { opacity:0.6; filter: hue-rotate(0deg) brightness(1.5); }
            25%  { opacity:1;   filter: hue-rotate(60deg) brightness(2); }
            50%  { opacity:0.8; filter: hue-rotate(180deg) brightness(1.8); }
            75%  { opacity:1;   filter: hue-rotate(270deg) brightness(2); }
            100% { opacity:0.6; filter: hue-rotate(360deg) brightness(1.5); }
          }
          @keyframes facetGlow {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.4; }
          }
        `}</style>
        {/* Shimmer sweep */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", borderRadius:24, zIndex:0 }}>
          <div style={{ position:"absolute", top:"-50%", left:"-20%", width:"40%", height:"200%",
            background:"linear-gradient(to right, transparent, rgba(255,255,255,0.15), rgba(200,180,255,0.2), rgba(255,255,255,0.15), transparent)",
            animation:"diamondShimmer 3s ease-in-out infinite", transform:"rotate(45deg)" }}/>
        </div>
        {/* Prismatic facets */}
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, zIndex:0, borderRadius:24, overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"10%", right:"15%", width:80, height:80,
            background:"linear-gradient(135deg, rgba(180,160,255,0.3), rgba(100,200,255,0.2), rgba(255,180,255,0.2))",
            clipPath:"polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            animation:"facetGlow 2s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", bottom:"20%", left:"10%", width:50, height:50,
            background:"linear-gradient(45deg, rgba(100,180,255,0.25), rgba(200,150,255,0.2))",
            clipPath:"polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            animation:"facetGlow 2.5s ease-in-out infinite 0.5s" }}/>
          <div style={{ position:"absolute", top:"40%", left:"5%", width:30, height:30,
            background:"rgba(180,220,255,0.2)",
            clipPath:"polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            animation:"facetGlow 3s ease-in-out infinite 1s" }}/>
        </div>
        {/* Prismatic border glow */}
        <div style={{ position:"absolute", inset:-1, borderRadius:25, zIndex:0,
          background:"linear-gradient(135deg, #a78bfa, #60a5fa, #f0abfc, #818cf8, #a78bfa)",
          animation:"prismatic 4s linear infinite",
          WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite:"xor", maskComposite:"exclude", padding:2 }}/>
      </>)}
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160,
          borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
        <div style={{ position:"absolute", bottom:-60, left:-30, width:180, height:180,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>

        {/* Content */}
        <div style={{ position:"relative", zIndex:1, padding:"18px 18px 14px" }}>

          {/* Top row: brand + tier badge */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:9, fontWeight:800,
                letterSpacing:3, margin:"0 0 3px", textTransform:"uppercase" }}>
                Cing Hu Tang Kinh Bắc
              </p>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>{displayName}</p>
            </div>
            {/* Tier badge */}
            <div style={{
              background:"rgba(255,255,255,0.2)",
              backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.35)",
              borderRadius:20, padding:"5px 12px",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{ fontSize:15 }}>{cfg.icon}</span>
              <div>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:8, margin:0, fontWeight:700 }}>{cfg.group}</p>
                <p style={{ color:"white", fontSize:11, fontWeight:900, margin:0 }}>{cfg.label}</p>
              </div>
            </div>
          </div>

          {/* Points */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, margin:"0 0 3px" }}>
                Điểm tích lũy · 1đ = 1.000đ
              </p>
              <p style={{ color:"white", fontSize:28, fontWeight:900, margin:0, lineHeight:1 }}>
                {points.toLocaleString("vi-VN")}
                <span style={{ fontSize:13, fontWeight:600, marginLeft:4 }}>điểm</span>
              </p>
            </div>
            {/* Next tier progress */}
            {cfg.next && (
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, margin:"0 0 3px" }}>
                  {cfg.next && remaining > 0 ? `→ ${cfg.next}: còn ${remaining.toLocaleString("vi-VN")}đ` : cfg.next ? `Sắp lên ${cfg.next}!` : ""}
                </p>
                <div style={{ width:100, height:6, background:"rgba(255,255,255,0.2)", borderRadius:4 }}>
                  <div style={{ width:progress+"%", height:"100%", borderRadius:4,
                    background:"rgba(255,255,255,0.9)", transition:"width 0.8s ease" }}/>
                </div>
              </div>
            )}
            {!cfg.next && cfg.supreme && (
              <div style={{
                background:"rgba(255,255,255,0.2)", borderRadius:12,
                padding:"4px 10px",
              }}>
                <p style={{ color:"white", fontSize:10, fontWeight:800, margin:0 }}>🏆 Hạng tối thượng</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height:1, background:"rgba(255,255,255,0.15)", margin:"0 0 12px" }}/>

          {/* Bottom: card number + barcode */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:9, margin:"0 0 3px", letterSpacing:1 }}>
                HỘI VIÊN
              </p>
              <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0, lineHeight:1.3 }}>
                {displayName}
              </p>
            </div>
            {/* Barcode */}
            <div style={{
              background:"white", borderRadius:8, padding:"5px 8px 2px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.2)",
            }}>
              <Barcode value={barcodeValue} width={120} height={32} />
              <p style={{ textAlign:"center", fontSize:8, color:"#555",
                margin:"2px 0 0", letterSpacing:1.5, fontFamily:"monospace" }}>
                {barcodeValue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
