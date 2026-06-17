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
    let attached = false;

    const attachListeners = (socket) => {
      if (attached) return;
      attached = true;
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

      socket.on("notification.broadcast", handleNotificationTicker);
      socket.on("notification.new", handleNotificationTicker);
      socket.on("leaderboard.weekly_reset",  (d) => addLeaderboardResetMessage("weekly",  d?.message || "BXH tuần đã reset. Top 3 vui lòng vào nhận thưởng 🎁"));
      socket.on("leaderboard.monthly_reset", (d) => addLeaderboardResetMessage("monthly", d?.message || "BXH tháng đã reset. Top 3 vui lòng vào nhận thưởng 🎁"));
      socket.on("leaderboard.yearly_reset",  (d) => addLeaderboardResetMessage("yearly",  d?.message || "BXH năm đã reset. Top 3 vui lòng vào nhận thưởng 🎁"));
      socket.on("challenge.won", (d) => {
        const payload = d?.payload || d;
        const name = payload?.winner_name || "Một thành viên";
        const pts  = payload?.reward_points || 0;
        addMessage("🏆 Chúc mừng " + name + " đã xuất sắc hoàn thành thách thức ngày! +" + pts + " điểm 🎉");
      });
      // Re-attach khi reconnect
      socket.on("connect", () => { attached = false; attachListeners(socket); });
    };

    let attempts = 0;
    let interval = setInterval(() => {
      const socket = getRuntimeSocket();
      if (!socket) { if (attempts++ > 40) clearInterval(interval); return; }
      clearInterval(interval);
      // Attach ngay — socket.on hoạt động dù chưa connected
      attachListeners(socket);
    }, 500);
    return () => clearInterval(interval);
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
