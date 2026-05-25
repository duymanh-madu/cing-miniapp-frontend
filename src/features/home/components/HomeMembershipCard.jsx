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
    bg:["#1e1b4b","#4338ca","#818cf8"],
    glow:"rgba(129,140,248,0.6)",
    desc:"Tiêu dùng từ 10.000.000đ / chu kỳ",
  },
  /* === ĐỐI TÁC === */
  partner:         {
    label:"Đối tác", group:"Đối tác",
    next:"Đối tác thân thiết", nextSpend:"2.000.000đ/tháng × 2",
    stars:1, icon:"🤝",
    bg:["#7c3aed","#a855f7","#c084fc"],
    glow:"rgba(168,85,247,0.5)",
    desc:"Được admin xét duyệt và kích hoạt",
  },
  loyal_partner:   {
    label:"Đối tác thân thiết", group:"Đối tác",
    next:null, nextSpend:null,
    stars:2, icon:"👑",
    bg:["#581c87","#7e22ce","#9333ea"],
    glow:"rgba(147,51,234,0.6)",
    desc:"Giữ hạng: tiêu ≥ 2.000.000đ mỗi tháng",
  },
};

/* Map tên hạng từ iPOS CRM → key nội bộ */
function mapTierKey(raw) {
  if (!raw) return "member";
  const r = raw.toLowerCase().trim();
  if (r.includes("kim") && r.includes("cuong") || r.includes("diamond")) return "diamond";
  if (r.includes("vang") || r.includes("gold") || r.includes("vàng")) return "gold";
  if (r.includes("bac") || r.includes("silver") || r.includes("bạc")) return "silver";
  if (r.includes("than thiet") || r.includes("thân thiết") && r.includes("doi tac") || r.includes("đối tác")) return "loyal_partner";
  if (r.includes("doi tac") || r.includes("đối tác") || r.includes("partner")) return "partner";
  if (r.includes("than thiet") || r.includes("thân thiết") || r.includes("loyal")) return "loyal";
  return "member";
}

export default function HomeMembershipCard() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const phone = profile?.phone || profile?.phoneNumber || profile?.mobile || "";
  const displayName = profile?.name || profile?.displayName || "Hội viên";

  const realtimePoints = useRealtimeCustomerStore(s => s.profile?.points ?? null);
  const realtimeTier   = useRealtimeCustomerStore(s => s.profile?.tier?.toLowerCase?.() ?? null);
  const [inputPhone, setInputPhone] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const { data: membership, isLoading } = useMembership(submittedPhone || phone);

  const tierRaw     = realtimeTier || membership?.level || "member";
  const tier   = mapTierKey(membership?.tierName || tierRaw || "");
  const cfg    = TIERS[tier] || TIERS.member;
  const points = realtimePoints ?? membership?.points ?? 0;
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
  const barcodeValue = phone || "000000000000";

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
            onKeyDown={e => e.key==="Enter" && setSubmittedPhone(inputPhone.replace(/\D/g,""))}
            style={{ flex:1, border:"1.5px solid #e8e0d0", borderRadius:10,
              padding:"9px 12px", fontSize:13, outline:"none" }}/>
          <button onClick={() => setSubmittedPhone(inputPhone.replace(/\D/g,""))}
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
        background:`linear-gradient(135deg, ${cfg.bg[0]} 0%, ${cfg.bg[1]} 50%, ${cfg.bg[2]} 100%)`,
        minHeight:200,
      }}>
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
            {!cfg.next && (
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
