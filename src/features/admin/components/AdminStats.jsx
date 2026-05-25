import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminStats({ token }) {
  const [stats, setStats] = useState(null);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/stats", { headers: h })
      .then(r => setStats(r.data?.data)).catch(console.error);
  }, []);

  const cards = [
    { label:"Tổng người chơi", value: stats?.total_players || 0, icon:"👥", color:"#4CAF50" },
    { label:"Đơn hàng hôm nay", value: stats?.orders_today || 0, icon:"🛍", color:"#2196F3" },
    { label:"Điểm danh hôm nay", value: stats?.checkins_today || 0, icon:"📅", color:"#FF9800" },
  ];

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>
        📊 Tổng quan hệ thống
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {cards.map((c,i) => (
          <div key={i} style={{ background:"#1a1a24", borderRadius:16, padding:"20px",
            border:`1px solid ${c.color}30` }}>
            <p style={{ color:"#666", fontSize:12, margin:"0 0 8px" }}>{c.icon} {c.label}</p>
            <p style={{ color:"white", fontSize:32, fontWeight:900, margin:0 }}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
