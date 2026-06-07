import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const GAME_OPTIONS = [
  { key:"black-pearl-rush", name:"Bay cùng trân châu 🫧" },
  { key:"chess",            name:"Kỳ thủ cờ vua ♟️" },
];

export default function AdminDailyChallenge({ token }) {
  const [challenges, setChallenges] = useState([]);
  const [msg, setMsg]   = useState("");
  const [saving, setSaving] = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/app-config/public")
      .then(r => {
        const cfg = r.data?.data?.daily_challenge_config;
        setChallenges(cfg?.challenges || [
          { game_key:"black-pearl-rush", challenge_type:"combo", target_value:100, reward_points:50, label:"Đạt combo 100 liên tiếp trong game Bay cùng trân châu", enabled:true }
        ]);
      })
      .catch(console.error);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/app-config/1", {
        daily_challenge_config: { challenges }
      }, { headers: h });
      setMsg("✅ Đã lưu!"); setTimeout(() => setMsg(""), 3000);
    } catch(e) { setMsg("❌ " + e.message); }
    setSaving(false);
  };

  const update = (i, field, val) => setChallenges(prev => {
    const next = [...prev];
    next[i] = { ...next[i], [field]: field === "target_value" || field === "reward_points" ? Number(val) : val };
    return next;
  });

  const addChallenge = () => setChallenges(prev => [...prev, {
    game_key: "black-pearl-rush", challenge_type:"combo",
    target_value: 100, reward_points: 50,
    label: "Thách thức mới", enabled: true,
  }]);

  const removeChallenge = (i) => setChallenges(prev => prev.filter((_, idx) => idx !== i));

  const inputStyle = {
    background:"#1a1a2e", border:"1px solid #333", color:"white",
    borderRadius:8, padding:"8px 10px", fontSize:13, width:"100%", boxSizing:"border-box",
  };

  return (
    <div style={{ padding:"0 0 40px" }}>
      {msg && (
        <div style={{ background: msg.startsWith("✅") ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)",
          border: `1px solid ${msg.startsWith("✅") ? "#4CAF50" : "#f44336"}`,
          borderRadius:10, padding:"10px 14px", marginBottom:12,
          color: msg.startsWith("✅") ? "#4CAF50" : "#f44336", fontSize:13 }}>
          {msg}
        </div>
      )}

      <div style={{ background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.15)",
        borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
        <p style={{ color:"#FFD700", fontSize:12, fontWeight:800, margin:"0 0 4px" }}>⚠️ Lưu ý quan trọng</p>
        <p style={{ color:"#aaa", fontSize:11, margin:0, lineHeight:1.6 }}>
          Thách thức ngày chỉ <strong style={{color:"white"}}>1 người đầu tiên</strong> nhận được thưởng.
          Mỗi ngày hệ thống tự tạo challenge mới từ config này.
          Thay đổi config sẽ áp dụng từ <strong style={{color:"white"}}>ngày hôm sau</strong>.
        </p>
      </div>

      {challenges.map((c, i) => (
        <div key={i} style={{ background:"#1a0d05", border:`1px solid ${c.enabled ? "#D4531C44" : "#333"}`,
          borderRadius:12, padding:"16px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ color:"white", fontWeight:800, margin:0, fontSize:14 }}>
              Thách thức #{i+1}
            </p>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => update(i, "enabled", !c.enabled)}
                style={{ background: c.enabled ? "#D4531C" : "#333", border:"none", color:"white",
                  borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                {c.enabled ? "🟢 Bật" : "⚫ Tắt"}
              </button>
              <button onClick={() => removeChallenge(i)}
                style={{ background:"rgba(244,67,54,0.15)", border:"1px solid #f44336",
                  color:"#f44336", borderRadius:8, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>
                Xóa
              </button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Game</p>
              <select value={c.game_key} onChange={e => update(i, "game_key", e.target.value)}
                style={{ ...inputStyle }}>
                {GAME_OPTIONS.map(g => <option key={g.key} value={g.key}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Loại thách thức</p>
              <select value={c.challenge_type} onChange={e => update(i, "challenge_type", e.target.value)}
                style={{ ...inputStyle }}>
                <option value="combo">Combo liên tiếp</option>
                <option value="score">Điểm số</option>
                <option value="wins">Số trận thắng</option>
              </select>
            </div>
            <div>
              <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Mục tiêu</p>
              <input type="number" value={c.target_value}
                onChange={e => update(i, "target_value", e.target.value)}
                style={{ ...inputStyle }} />
            </div>
            <div>
              <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Thưởng (điểm)</p>
              <input type="number" value={c.reward_points}
                onChange={e => update(i, "reward_points", e.target.value)}
                style={{ ...inputStyle }} />
            </div>
          </div>

          <div>
            <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Mô tả hiển thị cho user</p>
            <input type="text" value={c.label}
              onChange={e => update(i, "label", e.target.value)}
              style={{ ...inputStyle }} />
          </div>
        </div>
      ))}

      <button onClick={addChallenge}
        style={{ width:"100%", background:"rgba(212,83,28,0.1)", border:"1px dashed #D4531C",
          color:"#D4531C", borderRadius:12, padding:"12px", fontSize:13,
          fontWeight:700, cursor:"pointer", marginBottom:16 }}>
        + Thêm thách thức
      </button>

      <button onClick={save} disabled={saving}
        style={{ width:"100%", background: saving ? "#333" : "linear-gradient(135deg,#D4531C,#FF6B35)",
          border:"none", color:"white", borderRadius:12, padding:"14px",
          fontSize:14, fontWeight:900, cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "Đang lưu..." : "💾 Lưu cấu hình"}
      </button>
    </div>
  );
}
