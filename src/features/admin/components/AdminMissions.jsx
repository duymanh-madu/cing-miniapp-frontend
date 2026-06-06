import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const CONDITION_TYPES = [
  { value:"manual",       label:"Thủ công (không tự complete)" },
  { value:"checkin",      label:"Điểm danh (tự complete khi bấm)" },
  { value:"order_amount", label:"Đặt hàng đạt số tiền" },
  { value:"game_score",   label:"Đạt điểm game" },
];

const DEFAULT_MISSION = {
  type:"", label:"", description:"", icon:"🎯",
  plays:1, points:0, enabled:true,
  condition_type:"checkin", condition_value:0
};

export default function AdminMissions({ token }) {
  const [missions, setMissions] = useState([]);
  const [editing, setEditing]   = useState(null); // null | "new" | {mission}
  const [form, setForm]         = useState(DEFAULT_MISSION);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const h = { Authorization: `Bearer ${token}` };

  const load = () => {
    apiClient.get("/admin/missions", { headers:h })
      .then(r => setMissions(r.data?.data || []));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(DEFAULT_MISSION); setEditing("new"); };
  const openEdit = (m) => { setForm({...m}); setEditing(m); };
  const close = () => { setEditing(null); setMsg(""); };

  const upd = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const save = async () => {
    if (!form.type || !form.label) { setMsg("❌ Thiếu type và label"); return; }
    setSaving(true); setMsg("");
    try {
      if (editing === "new") {
        await apiClient.post("/admin/missions", form, { headers:h });
      } else {
        await apiClient.put(`/admin/missions/${editing.id}`, form, { headers:h });
      }
      setMsg("✅ Đã lưu!");
      load(); close();
    } catch(e) { setMsg("❌ " + (e.response?.data?.error || e.message)); }
    finally { setSaving(false); }
  };

  const toggle = async (m) => {
    await apiClient.put(`/admin/missions/${m.id}`, { ...m, enabled: !m.enabled }, { headers:h });
    load();
  };

  const del = async (m) => {
    if (!window.confirm(`Xóa nhiệm vụ "${m.label}"?`)) return;
    await apiClient.delete(`/admin/missions/${m.id}`, { headers:h });
    load();
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:18, fontWeight:900, margin:0 }}>🎯 Nhiệm vụ ngày</h2>
        <button onClick={openNew}
          style={{ background:"#D4531C", border:"none", color:"white",
            borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          + Thêm nhiệm vụ
        </button>
      </div>

      {/* List */}
      {missions.map(m => (
        <div key={m.id} style={{ background:"#1a1a24", borderRadius:14, padding:"14px 18px",
          marginBottom:10, border:`1px solid ${m.enabled?"#2a3a2a":"#2a2a38"}`,
          display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>{m.icon}</span>
          <div style={{ flex:1 }}>
            <p style={{ color:"white", fontSize:13, fontWeight:700, margin:"0 0 2px" }}>{m.label}</p>
            <p style={{ color:"Top 555", fontSize:11, margin:0 }}>
              +{m.plays} lượt · {CONDITION_TYPES.find(c=>c.value===m.condition_type)?.label}
              {m.condition_value > 0 ? ` ≥ ${new Intl.NumberFormat("vi-VN").format(m.condition_value)}` : ""}
            </p>
          </div>
          <button onClick={() => toggle(m)}
            style={{ background: m.enabled?"rgba(76,175,80,0.2)":"rgba(255,80,80,0.2)",
              border:`1px solid ${m.enabled?"#4CAF50":"#ff6b6b"}`,
              color: m.enabled?"#4CAF50":"#ff6b6b",
              borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            {m.enabled ? "BẬT" : "TẮT"}
          </button>
          <button onClick={() => openEdit(m)}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid #333",
              color:"#aaa", borderRadius:8, padding:"5px 10px", fontSize:12, cursor:"pointer" }}>
            ✏️
          </button>
          <button onClick={() => del(m)}
            style={{ background:"rgba(255,80,80,0.1)", border:"1px solid rgba(255,80,80,0.3)",
              color:"#ff6b6b", borderRadius:8, padding:"5px 10px", fontSize:12, cursor:"pointer" }}>
            🗑
          </button>
        </div>
      ))}

      {/* Form modal */}
      {editing !== null && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={close}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#1a1a24", borderRadius:20, padding:24, width:"100%", maxWidth:480,
              border:"1px solid #2a2a38" }}>
            <h3 style={{ color:"white", fontSize:16, fontWeight:900, margin:"0 0 20px" }}>
              {editing==="new" ? "➕ Thêm nhiệm vụ mới" : "✏️ Sửa nhiệm vụ"}
            </h3>
            {msg && <p style={{ color: msg.includes("✅")?"#4CAF50":"#ff6b6b", fontSize:12, margin:"0 0 12px" }}>{msg}</p>}

            {[
              { label:"Icon", field:"icon", type:"text", placeholder:"🎯" },
              { label:"Type (key duy nhất)", field:"type", type:"text", placeholder:"checkin" },
              { label:"Tên nhiệm vụ", field:"label", type:"text", placeholder:"Điểm danh hàng ngày" },
              { label:"Mô tả", field:"description", type:"text", placeholder:"Mô tả ngắn..." },
              { label:"Số lượt chơi thưởng", field:"plays", type:"number" },
              { label:"Số điểm thưởng (tùy chọn)", field:"points", type:"number" },
            ].map(f => (
              <div key={f.field} style={{ marginBottom:12 }}>
                <p style={{ color:"Top 888", fontSize:11, margin:"0 0 4px" }}>{f.label}</p>
                <input type={f.type} value={form[f.field]} onChange={e=>upd(f.field, f.type==="number"?Number(e.target.value):e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38",
                    borderRadius:8, padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
              </div>
            ))}

            <div style={{ marginBottom:12 }}>
              <p style={{ color:"Top 888", fontSize:11, margin:"0 0 4px" }}>Điều kiện hoàn thành</p>
              <select value={form.condition_type} onChange={e=>upd("condition_type",e.target.value)}
                style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38",
                  borderRadius:8, padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}>
                {CONDITION_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {(form.condition_type==="order_amount"||form.condition_type==="game_score") && (
              <div style={{ marginBottom:12 }}>
                <p style={{ color:"Top 888", fontSize:11, margin:"0 0 4px" }}>Giá trị điều kiện</p>
                <input type="number" value={form.condition_value} onChange={e=>upd("condition_value",Number(e.target.value))}
                  style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38",
                    borderRadius:8, padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
              </div>
            )}

            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button onClick={close}
                style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid #333",
                  color:"#aaa", borderRadius:10, padding:"10px", fontSize:13, cursor:"pointer" }}>
                Huỷ
              </button>
              <button onClick={save} disabled={saving}
                style={{ flex:2, background:"#D4531C", border:"none", color:"white",
                  borderRadius:10, padding:"10px", fontSize:13, fontWeight:800, cursor:"pointer" }}>
                {saving ? "Đang lưu..." : "💾 Lưu nhiệm vụ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
