import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import useAuthStore from "@/stores/auth/authStore";
import useRealtimeCustomerStore from "@/stores/customer/customerRuntimeStore";
import { useMembershipProfile } from "@/features/loyalty/hooks/useMembershipProfile";

/* ── Barcode 1D renderer (Code 128 simplified) ── */
function Barcode({ value, width = 160, height = 36 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!value || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    /* Generate bars from character codes */
    const str = String(value).replace(/\D/g, "").slice(0, 12);
    const bits = [];
    /* Start quiet zone */
    bits.push(0,0,0,0,0,0,0,0,0,0);
    /* Start pattern */
    bits.push(1,1,0,1,0,0,1,0,1,1);
    /* Encode each digit as 4-bit pattern */
    const patterns = [
      [1,1,0,1,1,0,1,0,0],[1,0,0,1,1,0,1,1,0],[1,0,0,1,1,0,0,1,1],
      [1,0,1,1,0,0,1,1,0],[1,0,0,0,1,1,0,1,1],[1,1,0,0,1,0,0,1,1],
      [1,1,0,0,1,0,1,1,0],[1,0,1,0,0,1,1,0,1],[1,1,0,1,0,0,1,1,0],
      [1,1,0,0,0,1,0,1,1],
    ];
    for (const ch of str) {
      bits.push(...(patterns[parseInt(ch)] || patterns[0]));
    }
    /* Stop pattern */
    bits.push(1,1,0,0,0,1,0,0,1,1,1);
    bits.push(0,0,0,0,0,0,0,0,0,0);
    const barW = width / bits.length;
    bits.forEach((b, i) => {
      if (b) {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(i * barW, 2, Math.max(barW - 0.3, 0.8), height - 6);
      }
    });
  }, [value, width, height]);
  return <canvas ref={canvasRef} style={{ display:"block", borderRadius:4 }} />;
}

/* ── Tier config ── */
const TIERS = {
  bronze:   { label:"Đồng",     next:"Bạc",      stars:1, bg:["#8B4513","#CD853F","#A0522D"], glow:"rgba(205,133,63,0.5)"  },
  silver:   { label:"Bạc",      next:"Vàng",     stars:2, bg:["#708090","#C0C0C0","#A8A8B8"], glow:"rgba(192,192,192,0.5)" },
  gold:     { label:"Vàng",     next:"Bạch Kim",  stars:3, bg:["#B8860B","#FFD700","#DAA520"], glow:"rgba(255,215,0,0.6)"   },
  platinum: { label:"Bạch Kim", next:"Kim Cương", stars:4, bg:["#2F8A8A","#40E0D0","#20B2AA"], glow:"rgba(64,224,208,0.5)"  },
  diamond:  { label:"Kim Cương",next:null,        stars:5, bg:["#1a1a6e","#4169E1","#6495ED"], glow:"rgba(100,149,237,0.6)" },
};

export default function HomeMembershipCard() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const userId = profile?.id || profile?.userId;
  const phone = profile?.phone || profile?.phoneNumber || profile?.mobile || "";
  const displayName = profile?.name || profile?.displayName || "Hội viên";

  const realtimePoints = useRealtimeCustomerStore(s => s.profile?.points ?? null);
  const realtimeTier   = useRealtimeCustomerStore(s => s.profile?.tier?.toLowerCase?.() ?? null);
  const { membership, isLoading } = useMembershipProfile(userId);

  const tier        = realtimeTier || membership?.level || "bronze";
  const points      = realtimePoints ?? membership?.points ?? 0;
  const pointsToNext = membership?.pointsToNextLevel ?? 500;
  const progress    = pointsToNext > 0
    ? Math.min(Math.round((points / (points + pointsToNext)) * 100), 99)
    : 100;
  const cfg = TIERS[tier] || TIERS.bronze;
  const barcodeValue = phone.replace(/\D/g,"") || userId?.slice(0,12) || "000000000000";

  if (isLoading && realtimePoints === null) {
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
              <span style={{ fontSize:13 }}>
                {"⭐".repeat(cfg.stars)}
              </span>
              <span style={{ color:"white", fontSize:12, fontWeight:900 }}>{cfg.label}</span>
            </div>
          </div>

          {/* Points */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, margin:"0 0 3px" }}>
                Điểm tích lũy
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
                  Còn {pointsToNext.toLocaleString("vi-VN")}đ → {cfg.next}
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
                MÃ HỘI VIÊN
              </p>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:700,
                letterSpacing:2, margin:0, fontFamily:"monospace" }}>
                {barcodeValue.replace(/(\d{4})(?=\d)/g,"$1 ")}
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
