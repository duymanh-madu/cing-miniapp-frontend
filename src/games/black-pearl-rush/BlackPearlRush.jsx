import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function BlackPearlRush({ onExit, onGameOver, onRestart, onGameStart }) {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [uiScore, setUiScore] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const scoreThrottleRef = useRef(0);
  const gameStartedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Canvas context với alpha:false = faster composite ── */
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

    /* ── DPR cap 2 — iPhone 14 Pro = DPR3, cap tại 2 giảm 44% pixels ── */
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(DPR, DPR);

    /* ── Cached gradients — tạo 1 lần, không bao giờ tạo lại ── */
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#f7f0e4");
    bgGrad.addColorStop(1, "#eadcc7");

    const obsGrad = ctx.createLinearGradient(0, 0, 74, 0);
    obsGrad.addColorStop(0, "#ff9d00");
    obsGrad.addColorStop(1, "#ff6200");

    const pearlGrad = ctx.createRadialGradient(-10, -14, 4, 0, 0, 36);
    pearlGrad.addColorStop(0,   "#4b2a19");
    pearlGrad.addColorStop(0.4, "#1a0f09");
    pearlGrad.addColorStop(1,   "#050505");

    /* ── ImageBitmap cache cho pearl body (pre-rendered) ── */
    const offPearl = new OffscreenCanvas(80, 80);
    const offCtx = offPearl.getContext("2d");
    offCtx.translate(40, 40);
    const pg = offCtx.createRadialGradient(-10, -14, 4, 0, 0, 36);
    pg.addColorStop(0, "#4b2a19"); pg.addColorStop(0.4, "#1a0f09"); pg.addColorStop(1, "#050505");
    offCtx.fillStyle = pg;
    offCtx.beginPath(); offCtx.arc(0, 0, 28, 0, 6.2832); offCtx.fill();
    offCtx.fillStyle = "white";
    offCtx.beginPath(); offCtx.arc(-10, -2, 9, 0, 6.2832); offCtx.arc(10, -2, 9, 0, 6.2832); offCtx.fill();
    offCtx.fillStyle = "black";
    offCtx.beginPath(); offCtx.arc(-8, 0, 3, 0, 6.2832); offCtx.arc(12, 0, 3, 0, 6.2832); offCtx.fill();
    let pearlBitmap = null;
    let wingBitmap = null;
    const wingImg = new Image();
    wingImg.onload = () => {
      createImageBitmap(wingImg).then(bm => { wingBitmap = bm; });
    };
    wingImg.src = "/cupid-wings.svg";
    offPearl.convertToBlob().then(blob => {
      createImageBitmap(blob).then(bm => { pearlBitmap = bm; });
    });

    /* ── WebAudio thay Audio.cloneNode — zero latency ── */
    let audioCtx = null;
    const audioBuffers = {};
    let audioUnlocked = false;

    async function unlockAudio() {
      if (audioUnlocked) return;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const files = { jump: "/sounds/jump.mp3", score: "/sounds/score.mp3", die: "/sounds/die.mp3" };
        await Promise.all(Object.entries(files).map(async ([k, url]) => {
          try {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            audioBuffers[k] = await audioCtx.decodeAudioData(buf);
          } catch(e) {}
        }));
        audioUnlocked = true;
      } catch(e) {}
    }

    let lastJump = 0, lastScore = 0;
    function playSound(name) {
      if (!audioUnlocked || !audioCtx || !audioBuffers[name]) return;
      const now = performance.now();
      if (name === "jump"  && now - lastJump  < 60)  return; if (name === "jump")  lastJump  = now;
      if (name === "score" && now - lastScore < 45) return; if (name === "score") lastScore = now;
      try {
        const src = audioCtx.createBufferSource();
        src.buffer = audioBuffers[name];
        const gain = audioCtx.createGain();
        gain.gain.value = name === "die" ? 0.72 : 0.42;
        src.connect(gain); gain.connect(audioCtx.destination);
        src.start(0);
      } catch(e) {}
    }

    /* ── Game state — tất cả trong 1 object, không dùng React state ── */
    const game = {
      started: false, dead: false,
      score: 0, combo: 0, bestCombo: 0,
      shake: 0, frameTime: 0,
      obstacles: [],
      obstacleTimer: 0,
      pearl: { x: 110, y: H/2, radius: 26, vy: 0, rot: 0, squash: 1 },
    };

    /* ── Pre-computed shake table 64 entries ── */
    const SHAKE_TABLE = new Float32Array(64);
    for (let i = 0; i < 64; i++) SHAKE_TABLE[i] = (Math.random() - 0.5) * 2;
    let shakeIdx = 0;

    /* ── Particle pool — fixed size array, zero allocation ── */
    const PMAX = 80;
    const px = new Float32Array(PMAX), py = new Float32Array(PMAX);
    const pvx = new Float32Array(PMAX), pvy = new Float32Array(PMAX);
    const psize = new Float32Array(PMAX), palpha = new Float32Array(PMAX);
    let pCount = 0;

    function burst(x, y, n) {
      for (let i = 0; i < PMAX && n > 0; i++) {
        if (palpha[i] <= 0) {
          px[i] = x; py[i] = y;
          pvx[i] = (Math.random() - .5) * 8;
          pvy[i] = (Math.random() - .5) * 8;
          psize[i] = Math.random() * 4 + 2;
          palpha[i] = 1; n--;
        }
      }
    }

    function resetGame() {
      game.started = false; game.dead = false;
      game.score = 0; game.combo = 0; game._challengeClaimed = false; game._deadNotified = false;
      game.shake = 0; game.obstacleTimer = 0;
      game.obstacles = [];
      palpha.fill(0);
      game.pearl.y = H/2; game.pearl.vy = 0; game.pearl.rot = 0; game.pearl.squash = 1;
      setUiScore(0);
    }

    function jump() {
      if (game.dead && !game._deadNotified) {
        game._deadNotified = true;
        if (onGameOver) onGameOver({ bestCombo: game.bestCombo, score: game.score });
      }
      if (game.dead) {
        // Check lượt trước khi reset
        if (onRestart) {
          const allowed = onRestart();
          if (allowed === false) return; // Hết lượt — không reset
        }
        resetGame();
        return;
      }
      if (!game.started && onGameStart) onGameStart();
      game.started = true;
      game.pearl.vy = -8.2;
      game.pearl.squash = 1.22;
      playSound("jump");
      burst(game.pearl.x, game.pearl.y, 10);
    }

    function createObstacle() {
      const gap = game.combo < 10 ? 250 : game.combo < 20 ? 220 : game.combo < 35 ? 190 : 165;
      const center = 180 + Math.random() * 300;
      game.obstacles.push({ x: W + 100, w: 74, top: center - gap/2, bot: center + gap/2, passed: false });
    }

    async function refreshLeaderboard() {
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'https://cing-backend-production.up.railway.app/api') + '/leaderboard/top-games/black-pearl-rush?limit=20');
        const data = await res.json();
        const rows = Array.isArray(data?.data) ? data.data : [];
        setLeaderboardData(rows);
      } catch {}
    }

    async function die() {
      if (game.dead) return;
      game.dead = true; game.started = false; game.shake = 14;
      playSound("die");
      burst(game.pearl.x, game.pearl.y, 30);
      setLeaderboardData([]);

      if (!game._deadNotified) {
        game._deadNotified = true;
        if (onGameOver) await onGameOver({ bestCombo: game.bestCombo, score: game.score });
        await refreshLeaderboard();
      }
    }

    /* ── Fixed timestep: update logic tách hoàn toàn khỏi render ── */
    const FIXED_DT = 1000 / 60;
    let accumulator = 0;
    let lastTime = 0;

    function update() {
      if (!game.started || game.dead) return;
      const p = game.pearl;
      p.vy += 0.42; p.y += p.vy;
      p.rot = p.vy * 0.05;
      p.squash += (1 - p.squash) * 0.12;

      game.obstacleTimer++;
      const spawnDelay = game.combo < 10 ? 95 : game.combo < 20 ? 82 : 74;
      if (game.obstacleTimer > spawnDelay) { createObstacle(); game.obstacleTimer = 0; }

      const speed = game.combo < 10 ? 3.5 : game.combo < 20 ? 4.3 : game.combo < 35 ? 5.2 : 6;

      for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const o = game.obstacles[i];
        o.x -= speed;
        if (!o.passed && o.x + o.w < p.x) {
          o.passed = true;
          game.score++; game.combo++;
          game.bestCombo = Math.max(game.bestCombo, game.combo);
          // Trigger challenge claim khi dat combo 100
          if (game.combo >= 100 && !game._challengeClaimed) {
            game._challengeClaimed = true;
            if (onGameOver) onGameOver({ bestCombo: game.combo, score: game.score });
          }
          playSound("score");
          burst(p.x, p.y, 8);
          /* Throttle React setState — chỉ update DOM score mỗi 300ms */
          const now = performance.now();
          if (now - scoreThrottleRef.current > 300) {
            scoreThrottleRef.current = now;
            setUiScore(game.score);
          }
        }
        /* AABB collision — không dùng Math.sqrt */
        const hitX = p.x + p.radius > o.x && p.x - p.radius < o.x + o.w;
        if (hitX && (p.y - p.radius < o.top || p.y + p.radius > o.bot)) die();
        if (o.x < -140) { game.obstacles.splice(i, 1); }
      }

      if (p.y < 0 || p.y > H) die();

      /* Particle update — typed arrays, no object overhead */
      for (let i = 0; i < PMAX; i++) {
        if (palpha[i] <= 0) continue;
        px[i] += pvx[i]; py[i] += pvy[i]; palpha[i] -= 0.035;
      }

      game.shake *= 0.82;
    }

    /* ── Draw — không có bất kỳ object allocation nào ── */
    function draw() {
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      if (game.shake > 0.5) {
        const s = game.shake | 0;
        shakeIdx = (shakeIdx + 1) & 63;
        ctx.translate(
          (SHAKE_TABLE[shakeIdx] * s) | 0,
          (SHAKE_TABLE[(shakeIdx + 32) & 63] * s) | 0
        );
      }

      /* Obstacles — dùng fillRect thay roundRect (3-5x nhanh hơn mobile) */
      ctx.fillStyle = obsGrad;
      for (let i = 0; i < game.obstacles.length; i++) {
        const o = game.obstacles[i];
        ctx.fillRect(o.x, 0, o.w, o.top);
        ctx.fillRect(o.x, o.bot, o.w, H);
      }

      /* Particles — reuse path object */
      const particlePath = new Path2D();
      let hasParticles = false;
      for (let i = 0; i < PMAX; i++) {
        if (palpha[i] <= 0) continue;
        particlePath.moveTo(px[i] + psize[i], py[i]);
        particlePath.arc(px[i], py[i], psize[i], 0, 6.2832);
        hasParticles = true;
      }
      if (hasParticles) {
        ctx.fillStyle = "#ffd166";
        ctx.globalAlpha = 0.85;
        ctx.fill(particlePath);
        ctx.globalAlpha = 1;
      }

      /* Pearl */
      const p = game.pearl;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.squash, 1/p.squash);

      const wf = Math.sin(game.frameTime * 0.02) * 0.12;
      /* Canh goc - quadratic curve huong len */
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.save(); ctx.translate(-28,-2); ctx.rotate(wf);
      ctx.beginPath(); ctx.moveTo(0,0);
      ctx.quadraticCurveTo(-30,-20,-10,-58);
      ctx.quadraticCurveTo(18,-32,12,0);
      ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(28,-2); ctx.scale(-1,1); ctx.rotate(-wf);
      ctx.beginPath(); ctx.moveTo(0,0);
      ctx.quadraticCurveTo(-30,-20,-10,-58);
      ctx.quadraticCurveTo(18,-32,12,0);
      ctx.closePath(); ctx.fill(); ctx.restore();

            /* Dùng ImageBitmap nếu đã load, fallback về canvas paths */
      if (pearlBitmap && !game.dead) {
        ctx.drawImage(pearlBitmap, -40, -40, 80, 80);
      } else {
        ctx.fillStyle = pearlGrad;
        ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, 6.2832); ctx.fill();
        if (game.dead) {
          ctx.fillStyle = "white"; ctx.font = "bold 18px Arial";
          ctx.fillText("\xD7", -18, 4); ctx.fillText("\xD7", 8, 4);
          ctx.fillStyle = "#8ed8ff";
          ctx.fillRect(-16,10,4,18); ctx.fillRect(14,10,4,18);
        } else {
          ctx.fillStyle = "white"; ctx.beginPath();
          ctx.arc(-10,-2,9,0,6.2832); ctx.arc(10,-2,9,0,6.2832); ctx.fill();
          ctx.fillStyle = "black"; ctx.beginPath();
          ctx.arc(-8,0,3,0,6.2832); ctx.arc(12,0,3,0,6.2832); ctx.fill();
        }
      }
      ctx.restore();
      ctx.restore();

      /* HUD — skip text render khi không started (idle state) */
      if (game.started || game.dead) {
        ctx.textAlign = "center";
        ctx.font = "900 24px Arial"; ctx.fillStyle = "#dca63a";
        ctx.fillText("COMBO x" + game.combo, W/2, 145);
        ctx.font = "900 54px Arial"; ctx.fillStyle = "#2b160b";
        ctx.fillText(game.score, W/2, 200);
      }

      if (!game.started && !game.dead) {
        ctx.font = "900 34px Arial"; ctx.fillStyle = "#2b160b";
        ctx.textAlign = "center"; ctx.fillText("TAP TO START", W/2, H/2 - 120);
      }
      if (game.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0,0,W,H);
        ctx.font = "900 52px Arial"; ctx.fillStyle = "white";
        ctx.fillText("THÀNH TÍCH", W/2, H/2 - 40);
        ctx.font = "900 26px Arial"; ctx.fillStyle = "#ffd166";
        ctx.fillText("BEST COMBO x" + game.bestCombo, W/2, H/2 + 10);
        ctx.font = "700 20px Arial"; ctx.fillStyle = "white";
        ctx.fillText("TAP ĐỂ CHƠI LẠI", W/2, H/2 + 70);
      }
    }

    /* ── Game loop với fixed timestep ── */
    function loop(timestamp) {
      game.frameTime = timestamp;
      if (lastTime > 0) {
        accumulator += Math.min(timestamp - lastTime, 50); /* cap 50ms tránh spiral of death */
        while (accumulator >= FIXED_DT) { update(); accumulator -= FIXED_DT; }
      }
      lastTime = timestamp;
      draw();
      animationRef.current = requestAnimationFrame(loop);
    }
    animationRef.current = requestAnimationFrame(loop);

    /* ── Page Visibility API — pause khi Zalo chuyển tab ── */
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      } else if (!animationRef.current) {
        lastTime = 0; accumulator = 0;
        animationRef.current = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    /* ── Touch event ── */
    function handleTap() { unlockAudio(); jump(); }
    canvas.addEventListener("pointerdown", handleTap, { passive: true });

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("pointerdown", handleTap);
      document.removeEventListener("visibilitychange", onVisibility);
      if (audioCtx) audioCtx.close();
    };
  }, []);

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"#efe7dc", overflow:"hidden", zIndex:200 }}>
      <div style={{ position:"relative", width:"100%", height:"100%", contain:"layout style paint" }}>
        <div style={{ position:"absolute", top:"var(--app-safe-top, 0px)", left:12, right:12, display:"flex", alignItems:"flex-start", justifyContent:"space-between", pointerEvents:"none", zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#efe7dc", border:"1px solid #d8c8ae", borderRadius:18, padding:"8px 12px", boxShadow:"0 2px 8px rgba(0,0,0,0.1)", maxWidth:220 }}>
            <img src="/logo-cing.png" alt="logo" style={{ width:36, height:36, borderRadius:10, objectFit:"contain", flexShrink:0 }} />
            <div>
              <div style={{ fontSize:9, fontWeight:900, letterSpacing:2, color:"#c19b61", marginBottom:2 }}>MINI GAME</div>
              <div style={{ fontSize:14, fontWeight:900, color:"#2b160b", whiteSpace:"nowrap" }}>Bay cùng trân châu</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, pointerEvents:"auto" }}>
            <button onClick={() => setShowLeaderboard(true)} style={{ background:"rgba(0,0,0,0.55)", color:"white", fontWeight:900, fontSize:13, borderRadius:18, padding:"0 16px", height:42, border:"none", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>🏆 BXH</button>
            <button onClick={() => { if(onExit) onExit(); else navigate("/game-center"); }} style={{ background:"#2b160b", color:"white", fontWeight:900, fontSize:11, borderRadius:18, padding:"0 16px", height:42, border:"none", cursor:"pointer" }}>🎮 Game Center</button>
          </div>
        </div>

        {/* CSS will-change tạo GPU layer riêng cho canvas */}
        <canvas
          ref={canvasRef}
          className="touch-none select-none"
          style={{ willChange:"transform", position:"absolute", top:0, left:0, width:"100%", height:"100%", zIndex:1 }}
        />

        {showLeaderboard && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-[32px] p-4">
            <div className="w-full bg-[#f6efe4] rounded-[28px] p-5 shadow-2xl border border-[#dccfb7]">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[#2b160b] font-black text-2xl">🏆 TOP 100</div>
                <button onClick={() => setShowLeaderboard(false)}
                  className="w-10 h-10 rounded-full bg-[#2b160b] text-white font-black">✕</button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {leaderboardData?.slice(0,20)?.map((player, index) => (
                  <div key={player.id || index}
                    className={"flex items-center justify-between rounded-2xl px-4 py-3 " +
                      (player.isPlayer ? "bg-[#2b160b] text-white" : "bg-white/70")}>
                    <div className="flex items-center gap-3">
                      <div className="font-black w-[42px] text-[#c19b61]">#{index+1}</div>
                      <div className="font-bold">{player.player_name || player.name || "Ẩn danh"}</div>
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
