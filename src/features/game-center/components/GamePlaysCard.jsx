import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { useNavigate } from "react-router-dom";
import { useMembership } from "@/features/home/hooks/useMembership";
import queryRealtimeSync from "@/services/query/queryRealtimeSync";

function getPhone() {
  const sources = [
    useRuntimeCustomerIdentityStore.getState().identity?.phone,
    useAuthStore.getState().profile?.phone,
  ];
  for (const src of sources) {
    if (!src || src === "pending") continue;
    const n = src.replace(/\D/g, "").replace(/^84/, "0");
    if (n.length >= 9) return n;
  }
  return "";
}

export default function GamePlaysCard({
  onPlaysUpdate,
  refreshKey = 0,
  economyPolicy = null,
}) {
  const navigate = useNavigate();
  const [plays,   setPlays]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying,  setBuying]  = useState(false);
  const [buyMsg,  setBuyMsg]  = useState("");
  const [pressing, setPressing] = useState(null);

  const profileId =
    useAuthStore(
      s => s.profile?.id
    );

  const profilePhone =
    useAuthStore(
      s => s.profile?.phone
    );

  const runtimePhone =
    useRuntimeCustomerIdentityStore(
      s => s.identity?.phone
    );

  const memberPhone = (() => {
    for (
      const source of [
        runtimePhone,
        profilePhone,
      ]
    ) {
      if (
        !source ||
        source === "pending"
      ) {
        continue;
      }

      const normalized =
        String(source)
          .replace(/\D/g, "")
          .replace(/^84/, "0");

      if (
        normalized.length >= 9
      ) {
        return normalized;
      }
    }

    return "";
  })();

  const {
    data: membership,
  } = useMembership(
    memberPhone
  );

  const points =
    Number(
      membership?.points ||
      0
    );

  const [spendPerPlay, setSpendPerPlay] = useState(20000);

  useEffect(() => {
    apiClient.get("/app-config/public")
      .then(r => {
        const val = r.data?.data?.spend_per_play;
        if (val) setSpendPerPlay(val);
      }).catch(() => {});
  }, []);

  const fetchPlays = async () => {
    const phone = getPhone();
    if (!phone) { setLoading(false); return; }
    try {
      // game_plays is a separate game-economy domain.
      // Loyalty points come exclusively from useMembership().
      const playsRes =
        await apiClient.get(
          `/game/plays/${phone}`
        );

      const gamePlays =
        playsRes.data?.data
          ?.game_plays ??
        0;

      setPlays(
        gamePlays
      );

      onPlaysUpdate?.(
        gamePlays
      );
    } catch(e) {
      setPlays(0);
      onPlaysUpdate?.(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlays(); }, [profileId, runtimePhone, refreshKey]);

  const buyPlay = async (qty) => {
    const phone = getPhone();
    if (!phone) return;
    // Hiệu ứng nhấp ngay lập tức
    setPressing(qty);
    setTimeout(() => setPressing(null), 200);
    setBuying(true); setBuyMsg("⏳ Đang xử lý...");
    try {
      const res = await apiClient.post("/points/buy-plays", { user_id: phone, quantity: qty });
      if (res.data?.success) {
        setPlays(
          res.data.data.new_plays
        );

        queryRealtimeSync
          .applyMembershipPoints({
            user_id:
              phone,

            phone,

            points:
              res.data.data
                .remaining_points,
          });

        onPlaysUpdate?.(
          res.data.data.new_plays
        );
        setBuyMsg("✅ +" + qty + " lượt thành công!");
      } else {
        setBuyMsg("❌ " + res.data.message);
      }
    } catch(e) {
      setBuyMsg("❌ " + (e.response?.data?.message || "Lỗi mua lượt chơi"));
    }
    setBuying(false);
    setTimeout(() => setBuyMsg(""), 3000);
  };

  const bars = [1,2,3,4,5];

  const economyGames =
    economyPolicy?.games &&
    typeof economyPolicy.games === "object"
      ? Object.values(economyPolicy.games)
      : [];

  const paidOfflineCount =
    economyGames.filter(
      game =>
        game?.economy_type === "paid_offline" &&
        Number(game?.play_cost || 0) > 0
    ).length;

  const freeMultiplayerCount =
    economyGames.filter(
      game =>
        game?.economy_type === "free_multiplayer" &&
        Number(game?.play_cost || 0) === 0
    ).length;

  return (
    <div style={{ margin:"0 16px 16px", background:"linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.05))", border:"1px solid rgba(255,215,0,0.2)", borderRadius:18, overflow:"hidden" }}>
      <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🎮</span>
          <span style={{ color:"white", fontSize:14, fontWeight:800 }}>Lượt chơi</span>
        </div>
        <div style={{ background: plays > 0 ? "rgba(0,255,100,0.15)" : "rgba(255,80,80,0.15)", border:`1px solid ${plays > 0 ? "rgba(0,255,100,0.3)" : "rgba(255,80,80,0.3)"}`, borderRadius:20, padding:"3px 12px", color: plays > 0 ? "#00ff64" : "#ff6464", fontSize:12, fontWeight:800 }}>
          {loading ? "..." : plays > 0 ? `${plays} lượt còn lại` : "Hết lượt"}
        </div>
      </div>

      <div style={{ padding:"12px 16px 8px" }}>
        <div style={{ display:"flex", gap:5, marginBottom:12 }}>
          {bars.map(i => (
            <div key={i} style={{ flex:1, height:8, borderRadius:4, background: i <= (plays||0) ? "linear-gradient(90deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.1)", transition:"background 0.3s" }}/>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span>🎟</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>
              Game offline có thưởng BXH sử dụng <b style={{color:"#FFD700"}}>1 lượt / ván</b>
              {paidOfflineCount > 0 ? ` · hiện có ${paidOfflineCount} game` : ""}
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span>♾</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>
              Game multiplayer realtime <b style={{color:"#00e99a"}}>không trừ lượt chơi</b>
              {freeMultiplayerCount > 0 ? ` · hiện có ${freeMultiplayerCount} game` : ""}
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span>🧋</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>
              Mỗi <b style={{color:"#FFD700"}}>{(spendPerPlay||20000).toLocaleString("vi-VN")}đ</b> chi tiêu → nhận thêm <b style={{color:"#FFD700"}}>1 lượt chơi</b>
            </span>
          </div>
        </div>
      </div>

      {plays === 0 && !loading && (
        <div style={{ margin:"0 12px 12px", background:"rgba(212,83,28,0.15)", border:"1px solid rgba(212,83,28,0.3)", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>Đặt hàng để nhận thêm lượt chơi</span>
          <button onClick={() => navigate("/menu")} style={{ background:"#D4531C", color:"white", border:"none", borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Đặt ngay</button>
        </div>
      )}

      <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,215,0,0.1)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, margin:0 }}>💎 Điểm tích lũy: <strong style={{ color:"#FFD700" }}>{points}</strong> điểm</p>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, margin:0 }}>5 điểm = 1 lượt</p>
        </div>
        {buyMsg && <p style={{ color: buyMsg.includes("✅") ? "#4CAF50" : "#ff6b6b", fontSize:11, margin:"0 0 8px" }}>{buyMsg}</p>}
        <div style={{ display:"flex", gap:6 }}>
          {[1,3,5].map(qty => (
            <button key={qty} onClick={() => buyPlay(qty)} disabled={buying || points < qty * 5}
              style={{ flex:1, padding:"7px 0", borderRadius:10, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
                background: pressing === qty ? "rgba(255,215,0,0.4)" : points >= qty * 5 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                color: points >= qty * 5 ? "#FFD700" : "rgba(255,255,255,0.2)",
                transform: pressing === qty ? "scale(0.95)" : "scale(1)",
                transition:"all 0.15s ease",
                boxShadow: pressing === qty ? "0 0 12px rgba(255,215,0,0.4)" : "none" }}>
              {buying && pressing === qty ? "⏳" : `+${qty} lượt`}<br/>
              <span style={{ fontSize:9, fontWeight:400 }}>({qty*5} điểm)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
