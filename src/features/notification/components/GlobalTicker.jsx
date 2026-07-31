import { useState, useEffect, useRef } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

const TICKER_DURATION = 30000;

export default function GlobalTicker() {
  const [queue, setQueue]     = useState([]);
  const [current, setCurrent] = useState(null);
  const timerRef = useRef(null);
  const resetBufferRef = useRef([]);
  const resetFlushRef = useRef(null);

  const addMessage = (msg) => {
    setQueue(q => {
      const next = [...q, { id: Date.now() + Math.random(), msg }];
      return next.slice(-3);
    });
  };

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    timerRef.current = setTimeout(() => setCurrent(null), TICKER_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [queue, current]);

  const addLeaderboardResetMessage = (type, msg) => {
    const priority = { weekly: 1, monthly: 2, yearly: 3 };
    resetBufferRef.current.push({ type, msg, priority: priority[type] || 99 });

    if (resetFlushRef.current) clearTimeout(resetFlushRef.current);

    resetFlushRef.current = setTimeout(() => {
      const items = [...resetBufferRef.current].sort((a,b) => a.priority - b.priority);
      resetBufferRef.current = [];

      const body = items.map(i => i.msg).filter(Boolean).join("\n");
      if (body) addMessage("🔄 Tổng kết reset BXH:\n" + body);
    }, 1800);
  };

  useEffect(() => {
    let socket = null;
    let interval = null;

    const handleNotificationTicker = (data) => {
      const payload = data?.payload || data || {};
      const msg =
        payload?.ticker?.message ||
        payload?.notification?.message ||
        data?.notification?.message ||
        data?.message ||
        "";

      if (msg) addMessage(msg);
    };

    const handleWeeklyReset = (data) => {
      addLeaderboardResetMessage(
        "weekly",
        data?.message || "BXH tuần đã reset. Top 3 vui lòng vào nhận thưởng 🎁"
      );
    };

    const handleMonthlyReset = (data) => {
      addLeaderboardResetMessage(
        "monthly",
        data?.message || "BXH tháng đã reset. Top 3 vui lòng vào nhận thưởng 🎁"
      );
    };

    const handleYearlyReset = (data) => {
      addLeaderboardResetMessage(
        "yearly",
        data?.message || "BXH năm đã reset. Top 3 vui lòng vào nhận thưởng 🎁"
      );
    };

    const handleChallengeWon = (data) => {
      const payload = data?.payload || data;
      const name = payload?.winner_name || "Một thành viên";
      const pts = payload?.reward_points || 0;
      addMessage(
        "🏆 Chúc mừng " + name +
        " đã xuất sắc hoàn thành thách thức ngày! +" +
        pts + " điểm 🎉"
      );
    };

    const detachListeners = () => {
      if (!socket) return;

      socket.off("notification.broadcast", handleNotificationTicker);
      socket.off("notification.new", handleNotificationTicker);
      socket.off("leaderboard.weekly_reset", handleWeeklyReset);
      socket.off("leaderboard.monthly_reset", handleMonthlyReset);
      socket.off("leaderboard.yearly_reset", handleYearlyReset);
      socket.off("challenge.won", handleChallengeWon);
      socket.off("connect", attachListeners);
    };

    function attachListeners() {
      if (!socket) return;

      // Bảo đảm mỗi event chỉ tồn tại đúng một listener của component này.
      detachListeners();

      socket.on("notification.broadcast", handleNotificationTicker);
      socket.on("notification.new", handleNotificationTicker);
      socket.on("leaderboard.weekly_reset", handleWeeklyReset);
      socket.on("leaderboard.monthly_reset", handleMonthlyReset);
      socket.on("leaderboard.yearly_reset", handleYearlyReset);
      socket.on("challenge.won", handleChallengeWon);
      socket.on("connect", attachListeners);
    }

    let attempts = 0;

    interval = setInterval(() => {
      socket = getRuntimeSocket();

      if (!socket) {
        if (attempts++ > 40) clearInterval(interval);
        return;
      }

      clearInterval(interval);
      interval = null;
      attachListeners();
    }, 500);

    return () => {
      if (interval) clearInterval(interval);
      detachListeners();

      if (resetFlushRef.current) {
        clearTimeout(resetFlushRef.current);
        resetFlushRef.current = null;
      }
    };
  }, []);

  if (!current) return null;

  return (
    <div key={current.id} style={{
      position:"fixed", top:"calc(env(safe-area-inset-top, 0px) + 56px)", left:0, right:0, zIndex:99999,
      background:"linear-gradient(90deg,#1a0a00,#2a1400,#1a0a00)",
      borderBottom:"1px solid rgba(255,180,0,0.3)",
      overflow:"hidden", height:32,
      display:"flex", alignItems:"center",
    }}>
      <style>{`@keyframes tickerScroll${current.id.toString().replace('.','')}{0%{transform:translateX(100vw)}100%{transform:translateX(-200%)}}`}</style>
      <div
        onAnimationEnd={() => setCurrent(null)}
        style={{
          whiteSpace:"nowrap",
          animation:("tickerScroll" + current.id.toString().replace('.','') + " " + TICKER_DURATION + "ms linear 1"),
          color:"#FFD700", fontSize:12, fontWeight:700, paddingLeft:16,
        }}>
        {current.msg}
      </div>
    </div>
  );
}
