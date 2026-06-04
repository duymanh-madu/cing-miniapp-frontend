import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";

const fmt = (d) => new Date(d).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });

export default function GamePlaysHistoryPage() {
  const navigate = useNavigate();
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const profilePhone = useAuthStore(s => s.profile?.phone);
  const phone = (() => {
    const src = runtimePhone || profilePhone || "";
    if (!src || src === "pending") return "";
    return src.replace(/\D/g,"").replace(/^84/,"0");
  })();

  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gamePlays, setGamePlays] = useState(null);

  useEffect(() => {
    if (!phone) return;
    // Fetch lịch sử lượt chơi
    apiClient.get(`/profile-update/plays-history/${phone}`)
      .then(r => setLog(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Fetch số lượt hiện tại
    apiClient.get(`/game/plays/${phone}`)
      .then(r => setGamePlays(r.data?.data?.game_plays ?? r.data?.game_plays ?? null))
      .catch(() => {});
  }, [phone]);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", paddingBottom:80 }}>
      {/* Header */}
      <div style={{ background:"#0a0a0f", padding:"14px 16px", display:"flex",
        alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,0.08)",
        position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)}
          style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"white" }}>←</button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0, color:"white" }}>🎮 Lượt chơi game</h1>
      </div>

      <div style={{ padding:16 }}>
        {/* Số lượt hiện tại */}
        <div style={{ background:"linear-gradient(135deg,#1a1208,#2d1f0a)", borderRadius:20,
          padding:"24px", marginBottom:16, textAlign:"center",
          border:"1px solid rgba(255,215,0,0.2)", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"0 0 8px",
            letterSpacing:2, textTransform:"uppercase" }}>Lượt chơi hiện có</p>
          <p style={{ fontSize:64, fontWeight:900, color:"#FFD700", margin:"0 0 4px", lineHeight:1 }}>
            {gamePlays ?? "—"}
          </p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:0 }}>lượt</p>
        </div>

        {/* Lịch sử */}
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:20, padding:20,
          border:"1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize:15, fontWeight:800, color:"white", margin:"0 0 16px" }}>
            📋 Lịch sử lượt chơi
          </p>
          {loading ? (
            <p style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"20px 0" }}>Đang tải...</p>
          ) : log.length === 0 ? (
            <p style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", fontSize:13, padding:"20px 0" }}>
              Chưa có lịch sử lượt chơi
            </p>
          ) : log.map((item, i) => {
            const isAdd = item.event_name === "plays_added";
            const amt = Math.abs(item.event_data?.amount || 0);
            const reason = item.event_data?.reason || (isAdd ? "Nhận lượt chơi" : "Chơi game");
            const newTotal = item.event_data?.new_total;
            // Icon theo loại
            const icon = (() => {
              if (!isAdd) return "🕹️";
              if (reason.includes("chi tiêu") || reason.includes("tiêu dùng")) return "🧋";
              if (reason.includes("nhiệm vụ") || reason.includes("Nhiệm vụ") || reason.includes("Điểm danh")) return "✅";
              if (reason.includes("kích hoạt") || reason.includes("Bonus")) return "🎉";
              if (reason.includes("cờ vua") || reason.includes("chess")) return "♟️";
              if (reason.includes("điểm") || reason.includes("Đổi")) return "⭐";
              return "🎁";
            })();
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"14px 0", borderBottom: i < log.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ width:42, height:42, borderRadius:12, flexShrink:0,
                  background: isAdd ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  {icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"white", margin:"0 0 4px",
                    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{reason}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>{fmt(item.created_at)}</p>
                    {newTotal !== undefined && (
                      <p style={{ fontSize:11, color:"rgba(255,215,0,0.5)", margin:0 }}>
                        · Còn lại: <strong style={{ color:"#FFD700" }}>{Math.round(newTotal)} lượt</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:18, fontWeight:900, margin:0,
                    color: isAdd ? "#4CAF50" : "#f44336" }}>
                    {isAdd ? "+" : "-"}{amt}
                  </p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>lượt</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
