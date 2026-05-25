import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminMissions({ token }) {
  const [missions, setMissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/missions", { headers: h })
      .then(r => setMissions(r.data?.data || []));
  }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      await apiClient.put("/admin/missions", { missions }, { headers: h });
      setMsg("✅ Đã lưu và cập nhật realtime!");
    } catch(e) { setMsg("❌ " + e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  const update = (i, field, val) => {
    const m = [...missions];
    m[i] = { ...m[i], [field]: field === "plays" ? Number(val) : val };
    setMissions(m);
  };

  const add = () => setMissions([...missions, {
    type: `mission_${Date.now()}`, label: "Nhiệm vụ mới", plays: 1, enabled: true, icon: "⭐"
  }]);

  const remove = (i) => setMissions(missions.filter((_,idx) => idx !== i));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>🎯 Quản lý nhiệm vụ ngày</h2>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={add}
            style={{ background:"rgba(255,255,255,0.1)", border:"1px solid #333",
              color:"white", borderRadius:8, padding:"8px 14px", fontSize:12, cursor:"pointer" }}>
            + Thêm nhiệm vụ
          </button>
          <button onClick={save} disabled={saving}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:8, padding:"8px 20px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {saving ? "Đang lưu..." : "💾 Lưu & Realtime"}
          </button>
        </div>
      </div>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#4CAF50", fontSize:13 }}>{msg}</div>}
      
      {missions.map((m, i) => (
        <div key={i} style={{ background:"#1a1a24", borderRadius:14, padding:"16px 20px",
          marginBottom:12, border:"1px solid #2a2a38", display:"flex", alignItems:"center", gap:12 }}>
          <input value={m.icon} onChange={e=>update(i,"icon",e.target.value)}
            style={{ width:40, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"8px", color:"white", fontSize:18, textAlign:"center" }}/>
          <input value={m.label} onChange={e=>update(i,"label",e.target.value)}
            style={{ flex:1, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"8px 12px", color:"white", fontSize:13 }}/>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#666", fontSize:12 }}>🎮 Lượt:</span>
            <input type="number" value={m.plays} onChange={e=>update(i,"plays",e.target.value)}
              style={{ width:60, background:"#2a2a38", border:"1px solid #333", borderRadius:8,
                padding:"8px", color:"white", fontSize:13, textAlign:"center" }}/>
          </div>
          <button onClick={()=>update(i,"enabled",!m.enabled)}
            style={{ background: m.enabled ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
              border: `1px solid ${m.enabled ? "#4CAF50" : "#ff6b6b"}`,
              color: m.enabled ? "#4CAF50" : "#ff6b6b",
              borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            {m.enabled ? "BẬT" : "TẮT"}
          </button>
          <button onClick={()=>remove(i)}
            style={{ background:"rgba(255,80,80,0.1)", border:"1px solid rgba(255,80,80,0.3)",
              color:"#ff6b6b", borderRadius:8, padding:"6px 10px", fontSize:12, cursor:"pointer" }}>
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}
