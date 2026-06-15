import { useState, useEffect, useRef } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { createPortal } from "react-dom";
import apiClient from "@/infra/api/apiClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";
import { isGamePlaying, subscribeGamePlaying } from "@/runtime/game/gamePlayState";

export function ChallengeWonPopup() {
  const [data, setData] = useState(null);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const timerRef = useRef(null);
  const shownRef = useRef(false);
  const pendingRef = useRef([]);

  const closeChallengePopup = () => {
    setData(null);
    shownRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const show = (detail) => {
      if (shownRef.current || isGamePlaying()) {
        pendingRef.current.push(detail);
        return;
      }
      shownRef.current = true;
      setData(detail);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setData(null);
        shownRef.current = false;
        timerRef.current = null;
      }, 30000);
    };

    // Lắng nghe window event (từ GameCenterPage)
    const windowHandler = (e) => show(e.detail);
    window.addEventListener("challenge_won", windowHandler);

    // Lắng nghe socket trực tiếp
    let socketRef = null;
    const attachSocket = (attempts = 0) => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socketRef = socket;
        socket.on("challenge.won", (d) => {
          const payload = d?.payload || d;
          show(payload);
        });
      } else if (attempts < 20) {
        setTimeout(() => attachSocket(attempts + 1), 1000);
      }
    };
    attachSocket();

    const unsubscribeGame = subscribeGamePlaying((playing) => {
      if (!playing && !shownRef.current && pendingRef.current.length > 0) {
        const next = pendingRef.current.shift();
        show(next);
      }
    });

    return () => {
      unsubscribeGame?.();
      window.removeEventListener("challenge_won", windowHandler);
      socketRef?.off?.("challenge.won");
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!data) return null;

  const myPhone = (() => {
    const src = runtimePhone || useAuthStore.getState().profile?.phone;
    if (!src || src === "pending") return "";
    const n = src.replace(/\D/g,"").replace(/^84/,"0");
    return n.length >= 9 ? n : "";
  })();

  const winnerId = data?.winner_user_id || "";
  const isWinner = myPhone && (
    winnerId === myPhone ||
    winnerId === "84" + myPhone.slice(1) ||
    winnerId.replace(/^84/,"0") === myPhone
  );

  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9500, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(0,0,0,0.8)", padding:24 }}
      onClick={closeChallengePopup}>
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
        <button onClick={closeChallengePopup}
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
  const STORAGE_KEY = "cing_leaderboard_reset_popup";
  const [msg, setMsg] = useState(null);
  const resetBufferRef = useRef([]);
  const resetFlushRef = useRef(null);

  const persistResetPopup = (message) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        message,
        createdAt: Date.now()
      }));
    } catch(e) {}
  };

  const clearPersistedResetPopup = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch(e) {}
  };

  const closeLeaderboardResetPopup = () => {
    clearPersistedResetPopup();
    resetBufferRef.current = [];
    if (resetFlushRef.current) {
      clearTimeout(resetFlushRef.current);
      resetFlushRef.current = null;
    }
    setMsg(null);
  };

  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      const type = detail.type || detail.period || "weekly";
      const priority = { weekly: 1, monthly: 2, yearly: 3 }[type] || 99;

      resetBufferRef.current.push({
        priority,
        message: detail.message || "BXH đã được reset!"
      });

      if (resetFlushRef.current) clearTimeout(resetFlushRef.current);

      resetFlushRef.current = setTimeout(() => {
        const items = [...resetBufferRef.current].sort((a,b) => a.priority - b.priority);
        resetBufferRef.current = [];

        const body = items.map(i => i.message).filter(Boolean).join("\n\n");
        if (!body) return;
        persistResetPopup(body);
        if (isGamePlaying()) {
          resetBufferRef.current.push({ priority: 99, message: body });
          return;
        }
        setMsg(body);
      }, 1800);
    };

    window.addEventListener("leaderboard_reset", handler);

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const fresh = Date.now() - Number(saved?.createdAt || 0) < 10 * 60 * 1000;
        if (fresh && saved?.message) {
          if (isGamePlaying()) {
            resetBufferRef.current.push({ priority: 99, message: saved.message });
          } else {
            setMsg(saved.message);
          }
        } else {
          clearPersistedResetPopup();
        }
      }
    } catch(e) {}

    const unsubscribeGame = subscribeGamePlaying((playing) => {
      if (!playing && !msg && resetBufferRef.current.length > 0) {
        const items = [...resetBufferRef.current].sort((a,b) => a.priority - b.priority);
        resetBufferRef.current = [];
        const body = items.map(i => i.message).filter(Boolean).join("\n\n");
        if (body) {
          persistResetPopup(body);
          setMsg(body);
        }
      }
    });

    return () => {
      window.removeEventListener("leaderboard_reset", handler);
      unsubscribeGame?.();
      if (resetFlushRef.current) clearTimeout(resetFlushRef.current);
    };
  }, []);

  if (!msg) return null;
  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(0,0,0,0.75)", padding:24 }}
      onClick={closeLeaderboardResetPopup}>
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
        <button onClick={closeLeaderboardResetPopup}
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
  useEffect(() => {
    if (rewards.length === 0) {
      setShow(false);
    }
  }, [rewards]);
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
    const s = getRuntimeSocket();
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
        setRewards(prev => {
  const next = prev.filter(r => r.id !== reward.id);

  if (next.length === 0) {
    setShow(false);
  }

  return next;
});

        setShow(false);

        window.dispatchEvent(new CustomEvent("reward_claimed", {
          detail: { phone, pointsAdded: reward.points }
        }));

        window.dispatchEvent(new CustomEvent("membership_points_updated", {
          detail: { phone, pointsAdded: reward.points }
        }));

        setShow(false);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("cing_toast", {
            detail: { message: `🎉 Nhận thưởng thành công! +${reward.points} điểm` }
          }));
        }, 50);
      }
    } catch(e) {}
    setClaiming(null);
  };

  if (rewards.length === 0) return null;
  if (isGamePlaying()) return null;

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
