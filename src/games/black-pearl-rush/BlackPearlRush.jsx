import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BlackPearlRush() {
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    /* ── DPR cap tại 2 để tránh render 3x trên mobile ── */
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const WIDTH = 390;
    const HEIGHT = 780;

    canvas.width  = WIDTH  * DPR;
    canvas.height = HEIGHT * DPR;
    canvas.style.width  = WIDTH  + "px";
    canvas.style.height = HEIGHT + "px";
    ctx.scale(DPR, DPR);

    /* ── Cache gradients 1 lần ── */
    const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bgGrad.addColorStop(0, "#f7f0e4");
    bgGrad.addColorStop(1, "#eadcc7");

    const obsGrad = ctx.createLinearGradient(0, 0, 74, 0);
    obsGrad.addColorStop(0, "#ff9d00");
    obsGrad.addColorStop(1, "#ff6200");

    const pearlGrad = ctx.createRadialGradient(-10, -14, 4, 0, 0, 36);
    pearlGrad.addColorStop(0,   "#4b2a19");
    pearlGrad.addColorStop(0.4, "#1a0f09");
    pearlGrad.addColorStop(1,   "#050505");

    /* ── Pre-cache font strings ── */
    const FONT_SCORE = "900 54px Arial";
    const FONT_COMBO = "900 24px Arial";
    const FONT_START = "900 34px Arial";
    const FONT_OVER1 = "900 56px Arial";
    const FONT_OVER2 = "900 26px Arial";
    const FONT_OVER3 = "700 20px Arial";

    /* ── Audio ── */
    const soundCache = {};
    ["jump","score","die"].forEach(key => {
      const a = new Audio("/sounds/" + key + ".mp3");
      a.preload = "auto";
      a.volume = key === "die" ? 0.72 : 0.42;
      soundCache[key] = a;
    });
    let audioUnlocked = false;
    let lastJump = 0, lastScore = 0;

    function unlockAudio() {
      if (audioUnlocked) return;
      Object.values(soundCache).forEach(a => {
        a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
      });
      audioUnlocked = true;
    }

    function playSound(name) {
      const now = performance.now();
      if (name === "jump")  { if (now - lastJump  < 60) return; lastJump  = now; }
      if (name === "score") { if (now - lastScore < 45) return; lastScore = now; }
      const b = soundCache[name];
      if (!b) return;
      const c = b.cloneNode();
      c.volume = b.volume;
      c.play().catch(() => {});
    }

    /* ── Game state ── */
    const game = {
      started: false, dead: false,
      score: 0, combo: 0, bestCombo: 0,
      shake: 0, flash: 0, obstacleTimer: 0,
      frameTime: 0,
      particles: [], obstacles: [],
      leaderboard: [{ id: 1, name: "Player", score: 0, isPlayer: true }],
      pearl: { x: 110, y: HEIGHT / 2, radius: 26, velocity: 0, rotation: 0, squash: 1 },
    };
    setLeaderboardData([...game.leaderboard]);

    /* ── Particle pool (tránh GC) ── */
    const POOL_SIZE = 120;
    const pool = Array.from({ length: POOL_SIZE }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, size: 0, alpha: 0, active: false
    }));

    function burst(x, y, count) {
      let spawned = 0;
      for (let i = 0; i < POOL_SIZE && spawned < count; i++) {
        if (!pool[i].active) {
          pool[i].x = x; pool[i].y = y;
          pool[i].vx = (Math.random() - 0.5) * 8;
          pool[i].vy = (Math.random() - 0.5) * 8;
          pool[i].size = Math.random() * 5 + 2;
          pool[i].alpha = 1;
          pool[i].active = true;
          spawned++;
        }
      }
    }

    function resetGame() {
      game.started = false; game.dead = false;
      game.score = 0; game.combo = 0;
      game.flash = 0; game.shake = 0; game.obstacleTimer = 0;
      game.obstacles = [];
      pool.forEach(p => { p.active = false; });
      game.pearl.y = HEIGHT / 2; game.pearl.velocity = 0;
      game.pearl.rotation = 0; game.pearl.squash = 1;
    }

    function jump() {
      if (game.dead) { resetGame(); return; }
      game.started = true;
      game.pearl.velocity = -8.2;
      game.pearl.squash = 1.22;
      playSound("jump");
      burst(game.pearl.x, game.pearl.y, 10);
    }

    function createObstacle() {
      const gap = game.combo < 10 ? 250 : game.combo < 20 ? 220 : game.combo < 35 ? 190 : 165;
      const center = 180 + Math.random() * 300;
      game.obstacles.push({
        x: WIDTH + 100, width: 74,
        gapTop: center - gap / 2,
        gapBottom: center + gap / 2,
        passed: false,
      });
    }

    function collide(pearl, obs) {
      if (pearl.x + pearl.radius <= obs.x || pearl.x - pearl.radius >= obs.x + obs.width) return false;
      return pearl.y - pearl.radius < obs.gapTop || pearl.y + pearl.radius > obs.gapBottom;
    }

    function die() {
      if (game.dead) return;
      game.dead = true; game.started = false; game.shake = 14;
      playSound("die");
      burst(game.pearl.x, game.pearl.y, 30);
      game.leaderboard[0].score = game.bestCombo;
      setLeaderboardData([...game.leaderboard]);
    }

    /* ── Update ── */
    function update() {
      if (!game.started || game.dead) return;
      const p = game.pearl;

      p.velocity += 0.42;
      p.y += p.velocity;
      p.rotation = p.velocity * 0.05;
      p.squash += (1 - p.squash) * 0.12;

      game.obstacleTimer++;
      const spawnDelay = game.combo < 10 ? 95 : game.combo < 20 ? 82 : 74;
      if (game.obstacleTimer > spawnDelay) { createObstacle(); game.obstacleTimer = 0; }

      const speed = game.combo < 10 ? 3.5 : game.combo < 20 ? 4.3 : game.combo < 35 ? 5.2 : 6;

      for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const obs = game.obstacles[i];
        obs.x -= speed;
        if (!obs.passed && obs.x + obs.width < p.x) {
          obs.passed = true;
          game.score++; game.combo++;
          game.bestCombo = Math.max(game.bestCombo, game.combo);
          game.flash = 1;
          playSound("score");
          burst(p.x, p.y, 8);
        }
        if (collide(p, obs)) die();
        if (obs.x < -140) { game.obstacles.splice(i, 1); }
      }

      if (p.y < 0 || p.y > HEIGHT) die();

      /* particle pool update */
      for (let i = 0; i < POOL_SIZE; i++) {
        const pt = pool[i];
        if (!pt.active) continue;
        pt.x += pt.vx; pt.y += pt.vy; pt.alpha -= 0.03;
        if (pt.alpha <= 0) pt.active = false;
      }

      game.shake *= 0.85;
      game.flash *= 0.92;
    }

    /* ── Draw ── */
    function draw() {
      /* BG — solid gradient cached */
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      /* Shake transform */
      ctx.save();
      if (game.shake > 0.5) {
        const s = game.shake | 0;
        ctx.translate(
          ((Math.random() * s) | 0) - (s >> 1),
          ((Math.random() * s) | 0) - (s >> 1)
        );
      }

      /* Obstacles — batch fillStyle set once */
      ctx.fillStyle = obsGrad;
      for (let i = 0; i < game.obstacles.length; i++) {
        const obs = game.obstacles[i];
        ctx.beginPath();
        ctx.roundRect(obs.x, 0, obs.width, obs.gapTop, 22);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.gapBottom, obs.width, HEIGHT, 22);
        ctx.fill();
      }

      /* Particles — batch single beginPath */
      ctx.fillStyle = "#ffd166";
      for (let i = 0; i < POOL_SIZE; i++) {
        const pt = pool[i];
        if (!pt.active) continue;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* Pearl */
      const p = game.pearl;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.squash, 1 / p.squash);

      const wingFlap = Math.sin(game.frameTime * 0.02) * 0.12;

      function wing(offset, flip) {
        ctx.save();
        ctx.translate(offset, -2);
        ctx.scale(flip, 1);
        ctx.rotate(wingFlap * flip);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-30, -20, -10, -58);
        ctx.quadraticCurveTo(18, -32, 12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      wing(-28, 1);
      wing(28, -1);

      ctx.fillStyle = pearlGrad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, 6.2832);
      ctx.fill();

      if (game.dead) {
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.fillText("\xD7", -18, 4);
        ctx.fillText("\xD7", 8, 4);
        ctx.fillStyle = "#8ed8ff";
        ctx.fillRect(-16, 10, 4, 18);
        ctx.fillRect(14, 10, 4, 18);
      } else {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(-10, -2, 9, 0, 6.2832);
        ctx.arc(10, -2, 9, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(-8, 0, 3, 0, 6.2832);
        ctx.arc(12, 0, 3, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();

      /* HUD — set font once per style */
      ctx.textAlign = "center";
      ctx.font = FONT_COMBO;
      ctx.fillStyle = "#dca63a";
      ctx.fillText("COMBO x" + game.combo, WIDTH / 2, 145);

      ctx.font = FONT_SCORE;
      ctx.fillStyle = "#2b160b";
      ctx.fillText(game.score, WIDTH / 2, 190);

      if (!game.started && !game.dead) {
        ctx.font = FONT_START;
        ctx.fillStyle = "#2b160b";
        ctx.fillText("TAP TO START", WIDTH / 2, HEIGHT / 2 - 80);
      }

      if (game.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.font = FONT_OVER1;
        ctx.fillStyle = "white";
        ctx.fillText("THANH TICH", WIDTH / 2, HEIGHT / 2 - 40);
        ctx.font = FONT_OVER2;
        ctx.fillStyle = "#ffd166";
        ctx.fillText("BEST COMBO x" + game.bestCombo, WIDTH / 2, HEIGHT / 2 + 10);
        ctx.font = FONT_OVER3;
        ctx.fillStyle = "white";
        ctx.fillText("TAP DE CHOI LAI", WIDTH / 2, HEIGHT / 2 + 70);
      }
    }

    /* ── Loop ── */
    function loop(timestamp) {
      game.frameTime = timestamp;
      update();
      draw();
      animationRef.current = requestAnimationFrame(loop);
    }
    animationRef.current = requestAnimationFrame(loop);

    /* ── Events ── */
    function handleTap(e) {
      unlockAudio();
      jump();
    }
    canvas.addEventListener("pointerdown", handleTap, { passive: true });

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("pointerdown", handleTap);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#efe7dc] flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-[390px]">

        {/* Header — xóa backdrop-blur để tránh composite lag */}
        <div className="absolute top-3 left-3 right-3 z-40 flex items-start justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-[#efe7dc] border border-[#d8c8ae] rounded-2xl px-3 py-2 shadow-lg max-w-[220px]">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#efe7dc] flex items-center justify-center shrink-0">
              <img src="/logo-cing.png" alt="logo" className="w-full h-full object-contain" />
            </div>
            <div className="leading-none overflow-hidden">
              <div className="text-[10px] font-black tracking-[2px] text-[#c19b61] mb-1">MINI GAME</div>
              <div className="text-[15px] font-black text-[#2b160b] whitespace-nowrap">Bay cung tran chau</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button onClick={() => setShowLeaderboard(true)}
              className="bg-[rgba(0,0,0,0.55)] text-white font-black text-sm rounded-2xl px-4 h-[42px] shadow-lg">
              🏆 BXH
            </button>
            <button onClick={() => navigate("/game-center")}
              className="bg-[#2b160b] text-white font-black text-[12px] rounded-2xl px-4 h-[42px] shadow-lg">
              🎮 Game Center
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="w-full rounded-[32px] shadow-2xl touch-none select-none" />

        {showLeaderboard && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-[32px] p-4">
            <div className="w-full bg-[#f6efe4] rounded-[28px] p-5 shadow-2xl border border-[#dccfb7]">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[#2b160b] font-black text-2xl">🏆 TOP 100</div>
                <button onClick={() => setShowLeaderboard(false)}
                  className="w-10 h-10 rounded-full bg-[#2b160b] text-white font-black">✕</button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {leaderboardData?.slice(0, 20)?.map((player, index) => (
                  <div key={player.id || index}
                    className={"flex items-center justify-between rounded-2xl px-4 py-3 " +
                      (player.isPlayer ? "bg-[#2b160b] text-white" : "bg-white/70")}>
                    <div className="flex items-center gap-3">
                      <div className="font-black w-[42px] text-[#c19b61]">#{index + 1}</div>
                      <div className="font-bold">{player.name}</div>
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
