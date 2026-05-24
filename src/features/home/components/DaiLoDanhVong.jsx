import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";
const MEDAL = ["🥇","🥈","🥉"];

export default function DaiLoDanhVong() {
  const navigate = useNavigate();
  const [top3, setTop3] = useState([]);

  useEffect(() => {
    apiClient.get("/leaderboard/top-spenders?limit=3")
      .then(r => setTop3(r.data?.data?.slice(0,3) || []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ margin:"16px 16px 8px" }}>
      <div style={{
        background:"linear-gradient(135deg,#1a0a2e 0%,#2d1254 50%,#1a0828 100%)",
        borderRadius:"20px 20px 0 0",
        padding:"20px 20px 16px",
        border:"1px solid rgba(255,215,0,0.2)",
        borderBottom:"none",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", top:-40, right:-40, width:120, height:120,
          borderRadius:"50%", background:"rgba(255,215,0,0.08)", filter:"blur(30px)",
        }}/>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ fontSize:36, filter:"drop-shadow(0 0 12px rgba(255,215,0,0.6))" }}>👑</div>
          <div>
            <p style={{ color:"rgba(255,215,0,0.7)", fontSize:10, fontWeight:800,
              letterSpacing:3, margin:"0 0 3px", textTransform:"uppercase" }}>Hall of Fame</p>
            <h2 style={{ color:"white", fontSize:18, fontWeight:900, margin:0, letterSpacing:1 }}>
              Đại Lộ Danh Vọ ng
            </h2>
          </div>
        </div>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:11, margin:"0 0 14px", lineHeight:1.5 }}>
          Top 100 khách hàng tiêu dùng nhiều nhất — được vinh danh mỗi tuần, tháng, năm
        </p>
        {top3.length > 0 ? (
          <div style={{ display:"flex", gap:8 }}>
            {top3.map((entry, i) => (
              <div key={i} style={{
                flex:1, background:"rgba(255,255,255,0.05)", borderRadius:12,
                padding:"8px 10px", border:"1px solid rgba(255,215,0,0.1)",
                display:"flex", flexDirection:"column", alignItems:"center",
              }}>
                <span style={{ fontSize:16, marginBottom:3 }}>{MEDAL[i]}</span>
                <p style={{ color:"white", fontSize:10, fontWeight:700, margin:"0 0 2px",
                  maxWidth:60, textAlign:"center",
                  overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                  {entry.player_name || entry.name || "Ẩn danh"}
                </p>
                <p style={{ color:"#FFD700", fontSize:9, fontWeight:800, margin:0 }}>
                  {fmt(entry.total_spent||0)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"8px 0",
            color:"rgba(255,255,255,0.25)", fontSize:12 }}>
            Chưa có dữ liệu tuần này
          </div>
        )}
      </div>
      <button onClick={() => navigate("/leaderboard")} style={{
        width:"100%", padding:"14px",
        background:"linear-gradient(135deg,#FFD700,#FFA500)",
        border:"none", borderRadius:"0 0 20px 20px",
        color:"#1a0a2e", fontSize:14, fontWeight:900,
        cursor:"pointer", letterSpacing:0.5,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        boxShadow:"0 4px 20px rgba(255,180,0,0.3)",
      }}>
        <span>Xem bảng xếp hạng đầy đủ</span>
        <span style={{ fontSize:16 }}>›</span>
      </button>
    </div>
  );
}
