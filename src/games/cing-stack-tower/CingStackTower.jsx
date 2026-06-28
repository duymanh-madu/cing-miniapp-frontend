import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const GAME_KEY = "cing-stack-tower";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api";

export default function CingStackTower({ onExit, onGameOver, onRestart, onGameStart }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const scoreThrottleRef = useRef(0);
  const gameRef = useRef(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [ui, setUi] = useState({ score: 0, combo: 0, timeLeft: 120, level: 0, ended: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(DPR, DPR);

    const BLOCK_H = Math.max(42, Math.min(56, Math.floor(H * 0.065)));
    const BASE_Y = H - 96;
    const ROUND_TIME = 120000;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#fff3df");
    bgGrad.addColorStop(0.55, "#f3d8b2");
    bgGrad.addColorStop(1, "#120a08");

    const SHAKE_TABLE = new Float32Array(64);
    for (let i = 0; i < 64; i++) SHAKE_TABLE[i] = (Math.random() - 0.5) * 2;
    let shakeIndex = 0;

    const particles = [];
    const MAX_PARTICLES = 90;

    function makeCurrent(stackLen, w) {
      const speed = 2.25 + Math.min(7.25, stackLen * 0.18);
      const fromLeft = stackLen % 2 === 0;
      return {
        x: fromLeft ? -w - 30 : W + 30,
        y: BASE_Y - (stackLen + 1) * BLOCK_H,
        w,
        h: BLOCK_H,
        vx: fromLeft ? speed : -speed,
      };
    }

    function freshGame() {
      const baseW = Math.min(188, W * 0.48);
      const baseX = W / 2 - baseW / 2;
      return {
        started: false,
        ended: false,
        submitted: false,
        startAt: 0,
        lastAt: 0,
        score: 0,
        combo: 0,
        bestCombo: 0,
        level: 0,
        shake: 0,
        message: "",
        stack: [{ x: baseX, y: BASE_Y, w: baseW, h: BLOCK_H, base: true, perfect: true }],
        current: makeCurrent(0, baseW),
      };
    }

    const game = freshGame();
    gameRef.current = game;

    function resetGame() {
      const next = freshGame();
      Object.keys(game).forEach(k => delete game[k]);
      Object.assign(game, next);
      particles.length = 0;
      setLeaderboardData([]);
      setUi({ score: 0, combo: 0, timeLeft: 120, level: 0, ended: false });
    }

    function emitParticles(x, y, n, color = "#ffb000") {
      for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.8) * 7,
          life: 1,
          size: 2 + Math.random() * 4,
          color,
        });
      }
    }

    function syncUi(force = false) {
      const now = performance.now();
      if (!force && now - scoreThrottleRef.current < 180) return;
      scoreThrottleRef.current = now;
      const timeLeft = game.started
        ? Math.max(0, Math.ceil((ROUND_TIME - (now - game.startAt)) / 1000))
        : 120;

      setUi({
        score: game.score,
        combo: game.combo,
        timeLeft,
        level: Math.max(0, game.stack.length - 1),
        ended: game.ended,
      });
    }

    function fetchLeaderboardSoon() {
      setTimeout(() => {
        fetch(`${API_BASE}/leaderboard/top-games/${GAME_KEY}?limit=20`)
          .then(r => r.json())
          .then(d => {
            const rows = Array.isArray(d?.data) ? d.data : [];
            setLeaderboardData(rows);
          })
          .catch(() => {});
      }, 650);
    }

    function finishRound(reason = "timeout") {
      if (game.submitted) return;
      game.ended = true;
      game.started = false;
      game.submitted = true;
      game.message = reason === "timeout" ? "HẾT GIỜ" : "KẾT THÚC";
      syncUi(true);

      if (onGameOver) {
        onGameOver({
          bestCombo: game.bestCombo,
          score: Math.max(0, Math.floor(game.score)),
          level: Math.max(0, game.stack.length - 1),
        });
      }

      fetchLeaderboardSoon();
    }

    function collapsePenalty() {
      const penalty = Math.min(game.score, 28 + game.level * 4 + game.combo * 3);
      game.score = Math.max(0, game.score - penalty);
      game.combo = 0;
      game.level = 0;
      game.shake = 18;
      game.message = `Đổ tháp -${penalty}`;
      emitParticles(W / 2, BASE_Y - 70, 34, "#2b160b");

      const baseW = Math.min(188, W * 0.48);
      game.stack = [{ x: W / 2 - baseW / 2, y: BASE_Y, w: baseW, h: BLOCK_H, base: true, perfect: true }];
      game.current = makeCurrent(0, baseW);
      syncUi(true);
    }

    function placeBlock() {
      if (!game.started || game.ended) return;

      const prev = game.stack[game.stack.length - 1];
      const cur = game.current;

      const left = Math.max(prev.x, cur.x);
      const right = Math.min(prev.x + prev.w, cur.x + cur.w);
      const overlap = right - left;

      if (overlap <= Math.max(10, cur.w * 0.12)) {
        collapsePenalty();
        return;
      }

      const prevCenter = prev.x + prev.w / 2;
      const curCenter = cur.x + cur.w / 2;
      const offset = Math.abs(prevCenter - curCenter);
      const perfect = offset <= 3.5;
      const accuracy = Math.max(0, Math.min(1, overlap / cur.w));

      if (perfect) {
        game.combo += 1;
        game.bestCombo = Math.max(game.bestCombo, game.combo);
      } else {
        game.combo = 0;
      }

      game.level += 1;

      const heightScore = 12 + game.level * 3;
      const accuracyScore = Math.round(accuracy * 18);
      const comboBonus = perfect ? 24 + Math.min(260, game.combo * game.combo * 2) : 0;
      const gained = heightScore + accuracyScore + comboBonus;

      game.score += gained;
      game.message = perfect ? `PERFECT COMBO x${game.combo} +${gained}` : `+${gained}`;

      const nextW = perfect ? cur.w : overlap;
      const block = {
        x: perfect ? prev.x : left,
        y: cur.y,
        w: nextW,
        h: BLOCK_H,
        perfect,
      };

      game.stack.push(block);
      emitParticles(block.x + block.w / 2, block.y + BLOCK_H / 2, perfect ? 18 : 8, perfect ? "#ffd700" : "#ff8a00");

      game.current = makeCurrent(game.stack.length - 1, Math.max(54, nextW));
      syncUi(true);
    }

    function tap() {
      if (game.ended) {
        if (onRestart) {
          const allowed = onRestart();
          if (allowed === false) return;
        }
        resetGame();
        return;
      }

      if (!game.started) {
        if (onGameStart) onGameStart();
        game.started = true;
        game.startAt = performance.now();
        game.lastAt = game.startAt;
        game.message = "Canh chuẩn 100% để giữ combo";
        syncUi(true);
        return;
      }

      placeBlock();
    }

    function drawRoundedRect(x, y, w, h, r) {
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.closePath();
    }

    function drawCingCube(block, cameraY, active = false) {
      const x = block.x;
      const y = block.y + cameraY;
      const w = block.w;
      const h = block.h;
      const d = Math.min(18, h * 0.34);

      ctx.save();

      ctx.fillStyle = active ? "#ff8a00" : "#ff7100";
      drawRoundedRect(x, y, w, h, 10);
      ctx.fill();

      ctx.fillStyle = active ? "#ffb13b" : "#ff9a1f";
      ctx.beginPath();
      ctx.moveTo(x + d, y - d);
      ctx.lineTo(x + w + d, y - d);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#9d330b";
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w + d, y - d);
      ctx.lineTo(x + w + d, y + h - d);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(43,22,11,.85)";
      ctx.lineWidth = 2;
      drawRoundedRect(x, y, w, h, 10);
      ctx.stroke();

      const cx = x + w / 2;
      const cy = y + h / 2;

      ctx.fillStyle = "#111";
      ctx.font = `900 ${Math.max(14, Math.min(22, w * 0.18))}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Cing", cx, cy - 3);

      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2;
      const cupW = Math.min(24, w * 0.18);
      const cupX = cx - cupW / 2;
      const cupY = cy + h * 0.16;
      ctx.beginPath();
      ctx.roundRect?.(cupX, cupY, cupW, 13, 3);
      if (ctx.roundRect) ctx.stroke();
      else {
        ctx.rect(cupX, cupY, cupW, 13);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cupY);
      ctx.lineTo(cx + 4, cupY - 15);
      ctx.stroke();

      if (block.perfect && !block.base) {
        ctx.fillStyle = "rgba(255,255,255,.42)";
        ctx.fillRect(x + 10, y + 8, Math.max(16, w * 0.28), 4);
      }

      ctx.restore();
    }

    function update(now) {
      if (!game.started || game.ended) return;

      if (now - game.startAt >= ROUND_TIME) {
        finishRound("timeout");
        return;
      }

      const cur = game.current;
      cur.x += cur.vx;

      const depth = Math.min(20, cur.h * 0.34);
      if (cur.vx > 0 && cur.x > W - cur.w - depth - 16) {
        cur.x = W - cur.w - depth - 16;
        cur.vx *= -1;
      } else if (cur.vx < 0 && cur.x < 16) {
        cur.x = 16;
        cur.vx *= -1;
      }

      game.shake *= 0.84;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.life -= 0.028;
        if (p.life <= 0) particles.splice(i, 1);
      }

      syncUi(false);
    }

    function draw(now) {
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();

      if (game.shake > 0.5) {
        const s = game.shake | 0;
        shakeIndex = (shakeIndex + 1) & 63;
        ctx.translate((SHAKE_TABLE[shakeIndex] * s) | 0, (SHAKE_TABLE[(shakeIndex + 32) & 63] * s) | 0);
      }

      ctx.fillStyle = "rgba(255,255,255,.18)";
      for (let i = 0; i < 9; i++) {
        const bx = (i * 73 + (now * 0.012)) % (W + 90) - 70;
        ctx.fillRect(bx, 120 + (i % 4) * 74, 44 + (i % 3) * 16, 5);
      }

      const topIndex = game.stack.length - 1;
      const cameraY = Math.max(0, (topIndex - 5) * BLOCK_H);

      ctx.fillStyle = "#2b160b";
      ctx.fillRect(0, BASE_Y + BLOCK_H + cameraY - 4, W, H);

      for (let i = 0; i < game.stack.length; i++) {
        const block = game.stack[i];
        const y = block.y + cameraY;
        if (y < -80 || y > H + 80) continue;
        drawCingCube(block, cameraY, false);
      }

      if (!game.ended) drawCingCube(game.current, cameraY, true);

      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y + cameraY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      if (!game.started && !game.ended) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#2b160b";
        ctx.font = "900 31px Arial";
        ctx.fillText("TAP ĐỂ BẮT ĐẦU", W / 2, H / 2 - 86);
        ctx.fillStyle = "rgba(43,22,11,.72)";
        ctx.font = "800 15px Arial";
        ctx.fillText("Xếp cube Cing thật chuẩn trong 120 giây", W / 2, H / 2 - 52);
      }

      if (game.message && (game.started || game.ended)) {
        ctx.textAlign = "center";
        ctx.font = "900 18px Arial";
        ctx.fillStyle = game.message.includes("PERFECT") ? "#ffd700" : "#fff";
        ctx.strokeStyle = "rgba(0,0,0,.45)";
        ctx.lineWidth = 4;
        ctx.strokeText(game.message, W / 2, 160);
        ctx.fillText(game.message, W / 2, 160);
      }

      if (game.ended) {
        ctx.fillStyle = "rgba(0,0,0,.62)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "900 48px Arial";
        ctx.fillText("HẾT GIỜ", W / 2, H / 2 - 76);
        ctx.fillStyle = "#ffd166";
        ctx.font = "900 28px Arial";
        ctx.fillText(`${game.score} điểm`, W / 2, H / 2 - 24);
        ctx.fillStyle = "white";
        ctx.font = "800 18px Arial";
        ctx.fillText(`Tầng: ${Math.max(0, game.stack.length - 1)} • Best combo x${game.bestCombo}`, W / 2, H / 2 + 16);
        ctx.font = "800 15px Arial";
        ctx.fillText("Tap để chơi lại", W / 2, H / 2 + 64);
      }
    }

    function loop(now) {
      update(now);
      draw(now);
      rafRef.current = requestAnimationFrame(loop);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    function onPointerDown() {
      tap();
    }

    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"#fff3df", overflow:"hidden", zIndex:200 }}>
      <div style={{ position:"relative", width:"100%", height:"100%", contain:"layout style paint" }}>
        <div style={{
          position:"absolute",
          top:"var(--app-safe-top, 0px)",
          left:12,
          right:12,
          display:"flex",
          alignItems:"flex-start",
          justifyContent:"space-between",
          pointerEvents:"none",
          zIndex:50,
        }}>
          <div style={{
            display:"flex",
            alignItems:"center",
            gap:8,
            background:"#fff3df",
            border:"1px solid rgba(43,22,11,.18)",
            borderRadius:18,
            padding:"8px 12px",
            boxShadow:"0 2px 12px rgba(0,0,0,.12)",
            maxWidth:235,
          }}>
            <img src="/logo-cing.png" alt="logo" style={{ width:36, height:36, borderRadius:10, objectFit:"contain", flexShrink:0 }} />
            <div>
              <div style={{ fontSize:9, fontWeight:900, letterSpacing:2, color:"#c15a13", marginBottom:2 }}>MINI GAME</div>
              <div style={{ fontSize:14, fontWeight:900, color:"#2b160b", whiteSpace:"nowrap" }}>Xếp Tháp Cing</div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, pointerEvents:"auto" }}>
            <button onClick={() => setShowLeaderboard(true)} style={{ background:"rgba(0,0,0,.58)", color:"white", fontWeight:900, fontSize:13, borderRadius:18, padding:"0 16px", height:42, border:"none", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,.2)" }}>🏆 BXH</button>
            <button onClick={() => { if (onExit) onExit(); else navigate("/game-center"); }} style={{ background:"#2b160b", color:"white", fontWeight:900, fontSize:11, borderRadius:18, padding:"0 16px", height:42, border:"none", cursor:"pointer" }}>🎮 Game Center</button>
          </div>
        </div>

        <div style={{
          position:"absolute",
          top:"max(env(safe-area-inset-top,0px) + 76px, 108px)",
          left:12,
          right:12,
          zIndex:45,
          display:"grid",
          gridTemplateColumns:"1fr 1fr 1fr",
          gap:8,
          pointerEvents:"none",
        }}>
          <div style={hudBoxStyle}><b>{ui.score}</b><span>Điểm</span></div>
          <div style={hudBoxStyle}><b>{ui.timeLeft}s</b><span>Thời gian</span></div>
          <div style={hudBoxStyle}><b>x{ui.combo}</b><span>Combo</span></div>
        </div>

        <canvas
          ref={canvasRef}
          className="touch-none select-none"
          style={{ willChange:"transform", position:"absolute", inset:0, width:"100%", height:"100%", zIndex:1 }}
        />

        {showLeaderboard && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-[32px] p-4">
            <div className="w-full bg-[#fff3df] rounded-[28px] p-5 shadow-2xl border border-[#dccfb7]">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[#2b160b] font-black text-2xl">🏆 TOP Xếp Tháp Cing</div>
                <button onClick={() => setShowLeaderboard(false)}
                  className="w-10 h-10 rounded-full bg-[#2b160b] text-white font-black">✕</button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {leaderboardData.length === 0 && (
                  <div className="rounded-2xl bg-white/70 px-4 py-5 text-center font-bold text-[#2b160b]">
                    Chưa có dữ liệu BXH. Chơi một lượt để ghi điểm nhé.
                  </div>
                )}
                {leaderboardData?.slice(0,20)?.map((player, index) => (
                  <div key={player.id || `${player.user_id}-${index}`}
                    className={"flex items-center justify-between rounded-2xl px-4 py-3 " +
                      (player.isPlayer ? "bg-[#2b160b] text-white" : "bg-white/70")}>
                    <div className="flex items-center gap-3">
                      <div className="font-black w-[42px] text-[#c15a13]">#{index+1}</div>
                      <div className="font-bold">{player.player_name || player.name || "Cing iu"}</div>
                    </div>
                    <div className="font-black">{player.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const hudBoxStyle = {
  background:"rgba(43,22,11,.82)",
  border:"1px solid rgba(255,215,0,.24)",
  borderRadius:14,
  padding:"8px 10px",
  color:"white",
  textAlign:"center",
  boxShadow:"0 4px 18px rgba(0,0,0,.18)",
};

