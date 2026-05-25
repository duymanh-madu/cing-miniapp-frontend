import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminAppConfig({ token }) {
  const [config, setConfig] = useState({
    app_name: "Cing Hu Tang Kinh Bắc",
    hero_title: "Khách",
    hero_subtitle: "Thưởng thức trà sữa premium",
    promo_banner_text: "Mua 1 tặng 1",
    promo_banner_sub: "Trà sữa premium mỗi thứ 3",
    promo_banner_enabled: true,
    custom_leaderboard_name: "",
    custom_leaderboard_from: "",
    custom_leaderboard_to: "",
    maintenance_mode: false,
  });
  const [msg, setMsg] = useState("");
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/app-config/public")
      .then(r => {
        const d = r.data?.data;
        if (d) setConfig(c => ({ ...c, ...d }));
      }).catch(console.error);
  }, []);

  const save = async () => {
    try {
      await apiClient.put("/app-config/admin/update", config, { headers: h });
      setMsg("✅ Đã lưu cấu hình realtime!");
    } catch(e) { setMsg("❌ " + e.message); }
    setTimeout(()=>setMsg(""),3000);
  };

  const fields = [
    { key:"app_name", label:"Tên app", type:"text" },
    { key:"promo_banner_text", label:"Banner khuyến mại - Tiêu đề", type:"text" },
    { key:"promo_banner_sub", label:"Banner khuyến mại - Mô tả", type:"text" },
    { key:"custom_leaderboard_name", label:"Tên bảng xếp hạng tùy chỉnh", type:"text" },
    { key:"custom_leaderboard_from", label:"BXH từ ngày", type:"date" },
    { key:"custom_leaderboard_to", label:"BXH đến ngày", type:"date" },
  ];

  const toggles = [
    { key:"promo_banner_enabled", label:"Hiển thị banner khuyến mại" },
    { key:"maintenance_mode", label:"Chế độ bảo trì (tắt app)" },
  ];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>⚙️ Cấu hình App</h2>
        <button onClick={save}
          style={{ background:"#D4531C", border:"none", color:"white",
            borderRadius:8, padding:"10px 24px", fontWeight:700, cursor:"pointer" }}>
          💾 Lưu & Realtime
        </button>
      </div>
      {msg && <div style={{ color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b",
        fontSize:13, marginBottom:14 }}>{msg}</div>}

      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
        marginBottom:16, border:"1px solid #2a2a38" }}>
        <p style={{ color:"#888", fontSize:12, fontWeight:700, margin:"0 0 14px", letterSpacing:2 }}>
          CẤU HÌNH CHUNG
        </p>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom:12 }}>
            <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>{f.label}</p>
            <input type={f.type} value={config[f.key] || ""}
              onChange={e=>setConfig(c=>({...c,[f.key]:e.target.value}))}
              style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                borderRadius:8, padding:"9px 12px", color:"white",
                fontSize:13, boxSizing:"border-box" }}/>
          </div>
        ))}
      </div>

      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
        <p style={{ color:"#888", fontSize:12, fontWeight:700, margin:"0 0 14px", letterSpacing:2 }}>
          BẬT / TẮT
        </p>
        {toggles.map(t => (
          <div key={t.key} style={{ display:"flex", alignItems:"center",
            justifyContent:"space-between", padding:"10px 0",
            borderBottom:"1px solid #2a2a38" }}>
            <p style={{ color:"white", fontSize:13, margin:0 }}>{t.label}</p>
            <button onClick={()=>setConfig(c=>({...c,[t.key]:!c[t.key]}))}
              style={{ background: config[t.key] ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
                border: `1px solid ${config[t.key] ? "#4CAF50" : "#ff6b6b"}`,
                color: config[t.key] ? "#4CAF50" : "#ff6b6b",
                borderRadius:8, padding:"6px 16px", fontWeight:700, cursor:"pointer" }}>
              {config[t.key] ? "BẬT" : "TẮT"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
