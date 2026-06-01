import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import apiClient from "@/infra/api/apiClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";

export function ChallengeWonPopup() {
  const [data, setData] = useState(null);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  useEffect(() => {
    const handler = (e) => {
      setData(e.detail);
      setTimeout(() => setData(null), 6000);
    };
    window.addEventListener("challenge_won", handler);
    return () => window.removeEventListener("challenge_won", handler);
  }, []);

  if (!data) return null;

  const myPhone = (() => {
    const src = runtimePhone || useAuthStore.getState().profile?.phone;
    if (!src || src === "pending") return "";
    const n = src.replace(/\D/g,"").replace(/^84/,"0");
    return n.length >= 9 ? n : "";
  })();

  const isWinner = myPhone && data?.winner_user_id === myPhone;

  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9500, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(0,0,0,0.8)", padding:24 }}
      onClick={() => setData(null)}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:"linear-gradient(135deg,#0d0a08,#1a1208)", borderRadius:20,
          border:`2px solid ${isWinner?"rgba(255,215,0,0.6)":"rgba(212,83,28,0.4)"}`,
          padding:24, maxWidth:320, width:"100%", textAlign:"center",
          boxShadow:`0 0 60px ${isWinner?"rgba(255,215,0,0.3)":"rgba(212,83,28,0.2)"}` }}>
        <div style={{ fontSize:56, marginBottom:12 }}>{isWinner ? "🏆" : "🎯"}</div>
        {isWinner ? (
          <>
            <h2 style={{ color:"#FFD700", fontSize:20, fontWeight:900, margin:"0 0 8px" }}>
              Bạn đã chinh phục thách thức!
            </h2>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:"0 0 16px" }}>
              +{data?.reward_points} điểm tích lũy đã được cộng vào tài khoản
            </p>
          </>
        ) : (
          <>
            <h2 style={{ color:"#FF6B35", fontSize:18, fontWeight:900, margin:"0 0 8px" }}>
              Thách thức ngày đã có người nhận!
            </h2>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:"0 0 4px" }}>
              🥇 <strong style={{color:"#FFD700"}}>{data?.winner_name}</strong>
            </p>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12, margin:"0 0 16px" }}>
              vừa nhận +{data?.reward_points} điểm tích lũy
            </p>
          </>
        )}
        <button onClick={() => setData(null)}
          style={{ background: isWinner?"linear-gradient(135deg,#FFD700,#FF6B35)":"linear-gradient(135deg,#D4531C,#FF6B35)",
            border:"none", borderRadius:12, padding:"11px 32px",
            color: isWinner?"#1a0800":"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
          {isWinner ? "Tuyệt vời! 🎉" : "Cố lên lần sau! 💪"}
        </button>
      </div>
    </div>,
    document.body
  );
}

export function LeaderboardResetPopup() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const handler = (e) => setMsg(e.detail?.message || "BXH đã được reset!");
    window.addEventListener("leaderboard_reset", handler);
    return () => window.removeEventListener("leaderboard_reset", handler);
  }, []);
  if (!msg) return null;
  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(0,0,0,0.75)", padding:24 }}
      onClick={() => setMsg(null)}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:"linear-gradient(135deg,#0d0a08,#1a1208)", borderRadius:20,
          border:"2px solid rgba(255,215,0,0.4)", padding:24, maxWidth:320, width:"100%",
          boxShadow:"0 0 60px rgba(255,215,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🏆</div>
          <h2 style={{ color:"#FFD700", fontSize:18, fontWeight:900, margin:"0 0 4px" }}>Bảng xếp hạng đã reset!</h2>
        </div>
        <div style={{ background:"rgba(255,215,0,0.08)", borderRadius:12, padding:"12px 14px",
          marginBottom:16, border:"1px solid rgba(255,215,0,0.15)" }}>
          <p style={{ color:"rgba(255,255,255,0.8)", fontSize:12, margin:0, lineHeight:1.7, whiteSpace:"pre-line" }}>{msg}</p>
        </div>
        <button onClick={() => setMsg(null)}
          style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#D4531C,#FF6B35)",
            border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
          Đã hiểu 🎁
        </button>
      </div>
    </div>,
    document.body
  );
}

export function PendingRewardsBadge() {
  const [rewards, setRewards] = useState([]);
  const [show, setShow] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  const phone = (() => {
    const src = runtimePhone || useAuthStore.getState().profile?.phone;
    if (!src || src === "pending") return "";
    const n = src.replace(/\D/g,"").replace(/^84/,"0");
    return n.length >= 9 ? n : "";
  })();

  const loadRewards = () => {
    if (!phone) return;
    apiClient.get(`/game/rewards/pending/${phone}`)
      .then(r => setRewards(r.data?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadRewards();
    const handler = () => setTimeout(loadRewards, 2000);
    window.addEventListener("leaderboard_reset", handler);
    window.addEventListener("challenge_won", handler);
    // Refresh khi user.updated (nhận điểm)
    const socketHandler = () => setTimeout(loadRewards, 1000);
    const s = window.__runtimeSocket;
    s?.on?.("user.updated", socketHandler);
    return () => {
      window.removeEventListener("leaderboard_reset", handler);
      window.removeEventListener("challenge_won", handler);
      s?.off?.("user.updated", socketHandler);
    };
  }, [phone]);

  const claim = async (reward) => {
    setClaiming(reward.id);
    try {
      const res = await apiClient.post(`/game/rewards/claim/${reward.id}`, { userId: phone });
      if (res.data?.success) {
        setRewards(prev => prev.filter(r => r.id !== reward.id));
        alert(`🎉 Nhận thưởng thành công! +${reward.points} điểm`);
      }
    } catch(e) {}
    setClaiming(null);
  };

  if (rewards.length === 0) return null;

  return (
    <>
      <button onClick={() => setShow(true)}
        style={{ position:"fixed", bottom:90, left:16, zIndex:500,
          background:"linear-gradient(135deg,#FFD700,#FF6B35)", border:"none", borderRadius:50,
          padding:"10px 16px", display:"flex", alignItems:"center", gap:8, cursor:"pointer",
          boxShadow:"0 4px 20px rgba(255,215,0,0.5)", animation:"pulseGlow 2s ease-in-out infinite" }}>
        <span style={{ fontSize:20 }}>🎁</span>
        <span style={{ color:"#1a0800", fontSize:13, fontWeight:900 }}>{rewards.length} phần thưởng</span>
        <div style={{ background:"#e74c3c", color:"white", borderRadius:10, width:20, height:20,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900 }}>
          {rewards.length}
        </div>
      </button>

      {show && createPortal(
        <div style={{ position:"fixed", inset:0, zIndex:9001, background:"rgba(0,0,0,0.8)",
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={() => setShow(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"linear-gradient(160deg,#0d0a08,#1a1208)", borderRadius:"24px 24px 0 0",
              border:"1px solid rgba(255,215,0,0.25)", padding:"20px 20px 40px", width:"100%", maxWidth:480 }}>
            <div style={{ width:40, height:4, background:"rgba(255,255,255,0.15)", borderRadius:2, margin:"0 auto 16px" }}/>
            <h2 style={{ color:"#FFD700", fontSize:18, fontWeight:900, margin:"0 0 16px", textAlign:"center" }}>
              🏆 Phần thưởng của bạn
            </h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {rewards.map(r => (
                <div key={r.id} style={{ background:"rgba(255,215,0,0.08)", borderRadius:14,
                  border:"1px solid rgba(255,215,0,0.2)", padding:"14px 16px",
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:"0 0 3px" }}>
                      {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"} {r.board}
                    </p>
                    <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, margin:0 }}>{r.reason}</p>
                  </div>
                  <button onClick={() => claim(r)} disabled={claiming === r.id}
                    style={{ background: claiming === r.id ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#D4531C,#FF6B35)",
                      border:"none", borderRadius:10, padding:"8px 14px", color:"white",
                      fontSize:13, fontWeight:800, cursor:"pointer", flexShrink:0, marginLeft:10 }}>
                    {claiming === r.id ? "..." : `+${r.points} 💎`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
      <style>{`@keyframes pulseGlow{0%,100%{box-shadow:0 4px 20px rgba(255,215,0,0.5)}50%{box-shadow:0 4px 30px rgba(255,215,0,0.9)}}`}</style>
    </>
  );
}
