import { useState, useEffect, useRef } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

const TICKER_DURATION = 30000;

export default function GlobalTicker() {
  const [queue, setQueue]     = useState([]);
  const [current, setCurrent] = useState(null);
  const timerRef = useRef(null);

  const addMessage = (msg) => {
    setQueue(q => {
      // Dedup — không thêm nếu message giống hệt đã có trong queue
      if (q.some(m => m.msg === msg)) return q;
      // Giới hạn queue 3 messages
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

  useEffect(() => {
    let interval = setInterval(() => {
      const socket = getRuntimeSocket();
      if (!socket) return;
      clearInterval(interval);
      socket.on("notification.broadcast", (data) => {
        const msg = data?.notification?.message || data?.message || "";
        if (msg) addMessage(msg);
      });
      socket.on("leaderboard.weekly_reset",  (d) => addMessage("🔄 Reset BXH tuần! " + (d?.message || "Top 3 vui lòng vào nhận thưởng 🎁")));
      socket.on("leaderboard.monthly_reset", (d) => addMessage("🔄 Reset BXH tháng! " + (d?.message || "Top 3 vui lòng vào nhận thưởng 🎁")));
      socket.on("leaderboard.yearly_reset",  (d) => addMessage("🔄 Reset BXH năm! " + (d?.message || "Top 3 vui lòng vào nhận thưởng 🎁")));
      // Challenge won — lắng nghe cả socket và window event
      socket.on("challenge.won", (d) => {
        const payload = d?.payload || d;
        const name = payload?.winner_name || "Một thành viên";
        const pts  = payload?.reward_points || 0;
        addMessage("🏆 Chúc mừng " + name + " đã xuất sắc hoàn thành thách thức ngày! +" + pts + " điểm 🎉");
      });

    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!current) return null;

  return (
    <div style={{
      position:"fixed", top:"env(safe-area-inset-top, 0px)", left:0, right:0, zIndex:99999,
      background:"linear-gradient(90deg,#1a0a00,#2a1400,#1a0a00)",
      borderBottom:"1px solid rgba(255,180,0,0.3)",
      overflow:"hidden", height:32,
      display:"flex", alignItems:"center",
    }}>
      <style>{`@keyframes tickerScroll{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}`}</style>
      <div
        onAnimationEnd={() => setCurrent(null)}
        style={{
          whiteSpace:"nowrap",
          animation:"tickerScroll " + TICKER_DURATION + "ms linear forwards",
          color:"#FFD700", fontSize:12, fontWeight:700, paddingLeft:16,
        }}>
        {current.msg}
      </div>
    </div>
  );
}
