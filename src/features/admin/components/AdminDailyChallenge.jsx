import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const GAME_OPTIONS = [
  { key:"black-pearl-rush", name:"Bay cùng trân châu 🫧" },
  { key:"cing-stack-tower", name:"Xếp Tháp Cing 🧱" },
  { key:"chess",            name:"Kỳ thủ cờ vua ♟️" },
];

export default function AdminDailyChallenge({ token }) {
  const [challenges, setChallenges] = useState([]);
  const [msg, setMsg]   = useState("");
  const [saving, setSaving] = useState(false);

  // Stable request identity across ambiguous retries.
  const pendingApplyRef = useRef(null);
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


  const reset = async () => {
    if (
      !confirm(
        "Chỉ reset thách thức hôm nay của các game ngoài Revival. Black Pearl Rush và Cing Stack Tower không bị reset. Tiếp tục?"
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(
        "/game/daily-challenge/reset",
        { headers: h }
      );

      setMsg(
        "✅ Đã reset thách thức của các game ngoài Revival."
      );
    } catch (error) {
      setMsg(
        "❌ " +
        (
          error?.response?.data?.message ||
          error?.message ||
          "Không thể reset"
        )
      );
    }
  };

  const save = async () => {
    if (saving) return;

    setSaving(true);

    try {
      /*
       * Same content + ambiguous failure:
       * reuse the same request UUID.
       *
       * Edited content:
       * create a different Admin action.
       */
      const signature =
        JSON.stringify(challenges);

      if (
        !pendingApplyRef.current ||
        pendingApplyRef.current.signature !==
          signature
      ) {
        const requestId =
          globalThis.crypto?.randomUUID?.();

        if (!requestId) {
          throw new Error(
            "Thiết bị không hỗ trợ tạo mã yêu cầu an toàn."
          );
        }

        pendingApplyRef.current = {
          signature,
          requestId,
        };
      }

      const pending =
        pendingApplyRef.current;

      const response =
        await apiClient.post(
          "/app-config/revival-challenges/apply",
          {
            apply_request_id:
              pending.requestId,
            challenges:
              JSON.parse(pending.signature),
          },
          { headers: h }
        );

      if (
        response.data?.success !== true
      ) {
        throw new Error(
          "Chưa xác nhận được kết quả lưu cấu hình."
        );
      }

      /*
       * The backend has confirmed the
       * committed Admin Apply result.
       * A later Save is a new action.
       */
      pendingApplyRef.current =
        null;

      setMsg(
        response.data?.data?.replayed
          ? "✅ Cấu hình đã được áp dụng trước đó. Không tạo bản ghi trùng."
          : "✅ Đã lưu và áp dụng cấu hình thách thức!"
      );
    } catch (error) {
      const code =
        error?.response?.data?.code;

      /*
       * The next attempt with unchanged
       * content keeps its request UUID.
       */
      setMsg(
        "❌ " +
        (
          code ||
          error?.message ||
          "Không thể xác nhận kết quả lưu"
        )
      );
    } finally {
      setSaving(false);
    }
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
          Thay đổi config sẽ được <strong style={{color:"white"}}>áp dụng ngay cho hôm nay</strong> khi bấm lưu.
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

      <button onClick={reset}
        style={{ width:"100%", background:"rgba(244,67,54,0.1)", border:"1px solid rgba(244,67,54,0.3)",
          color:"#f44336", borderRadius:12, padding:"12px",
          fontSize:13, fontWeight:700, cursor:"pointer", marginTop:8 }}>
        🔄 Reset thách thức game ngoài Revival
      </button>
    </div>
  );
}
