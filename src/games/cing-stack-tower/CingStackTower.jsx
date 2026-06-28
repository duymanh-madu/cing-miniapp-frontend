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
  const [ui, setUi] = useState({
    score: 0,
    combo: 0,
    timeLeft: 120,
    floor: 0,
    ended: false,
  });

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

    const ROUND_TIME = 120000;
    const SAFE_TOP = Math.max(120, Math.floor(H * 0.16));
    const GROUND_Y = H - 74;
    const BLOCK = Math.max(58, Math.min(76, Math.floor(W * 0.17)));
    const FACE = BLOCK;
    const DEPTH = Math.round(BLOCK * 0.22);
    const DROP_GRAVITY = 0.72;
    const HIT_TOLERANCE = BLOCK * 0.68;
    const COLLAPSE_TOLERANCE = BLOCK * 0.84;

    const logoImg = new Image();
    logoImg.src = "/logo-cing.png";
    let logoReady = false;
    logoImg.onload = () => { logoReady = true; };

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#fff5e4");
    bgGrad.addColorStop(0.52, "#f5dcb7");
    bgGrad.addColorStop(1, "#3a2417");

    const particles = [];
    const MAX_PARTICLES = 110;

    const SHAKE_TABLE = new Float32Array(64);
    for (let i = 0; i < 64; i++) SHAKE_TABLE[i] = (Math.random() - 0.5) * 2;
    let shakeIndex = 0;

    function cloneBlock(x, y, extra = {}) {
      return {
        x,
        y,
        size: BLOCK,
        rot: 0,
        settled: false,
        perfect: false,
        ...extra,
      };
    }

    function makeGame() {
      const baseX = Math.round(W / 2 - BLOCK / 2);
      const base = cloneBlock(baseX, GROUND_Y - BLOCK, {
        settled: true,
        base: true,
      });

      return {
        started: false,
        ended: false,
        submitted: false,
        startAt: 0,
        lastAt: 0,
        score: 0,
        combo: 0,
        bestCombo: 0,
        floor: 0,
        stability: 100,
        shake: 0,
        message: "",
        messageUntil: 0,
        tower: [base],
        falling: null,
        cranePhase: 0,
        craneSpeed: 0.018,
        dropCount: 0,
      };
    }

    const game = makeGame();
    gameRef.current = game;

    function topBlock() {
      return game.tower[game.tower.length - 1];
    }

    function targetY() {
      return GROUND_Y - BLOCK * (game.tower.length + 1);
    }

    function cameraY() {
      const visibleTop = targetY();
      return Math.max(0, SAFE_TOP - visibleTop);
    }

    function craneX(now) {
      const floor = Math.max(0, game.floor);
      const amp = Math.max(74, Math.min(W * 0.38, W * 0.31 + floor * 1.2));
      const speed = game.craneSpeed + Math.min(0.016, floor * 0.0009);
      return W / 2 + Math.sin(now * speed + game.cranePhase) * amp - BLOCK / 2;
    }

    function spawnFalling(now) {
      if (game.falling || game.ended) return;
      game.falling = cloneBlock(craneX(now), SAFE_TOP + 52 - cameraY(), {
        dropping: false,
        vy: 0,
        swingAt: now,
      });
    }

    function resetRoundOnly() {
      const next = makeGame();
      Object.keys(game).forEach(k => delete game[k]);
      Object.assign(game, next);
      particles.length = 0;
      setLeaderboardData([]);
      setUi({ score: 0, combo: 0, timeLeft: 120, floor: 0, ended: false });
    }

    function showMessage(text, ms = 900) {
      game.message = text;
      game.messageUntil = performance.now() + ms;
    }

    function emitParticles(x, y, n, color = "#ff8a00") {
      for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.85) * 7,
          life: 1,
          size: 2 + Math.random() * 4,
          color,
        });
      }
    }

    function syncUi(force = false) {
      const now = performance.now();
      if (!force && now - scoreThrottleRef.current < 160) return;
      scoreThrottleRef.current = now;

      const timeLeft = game.started
        ? Math.max(0, Math.ceil((ROUND_TIME - (now - game.startAt)) / 1000))
        : 120;

      setUi({
        score: Math.max(0, Math.floor(game.score)),
        combo: game.combo,
        timeLeft,
        floor: game.floor,
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
      showMessage(reason === "timeout" ? "HẾT GIỜ" : "KẾT THÚC", 2000);
      syncUi(true);

      if (onGameOver) {
        onGameOver({
          bestCombo: game.bestCombo,
          score: Math.max(0, Math.floor(game.score)),
          floor: game.floor,
        });
      }

      fetchLeaderboardSoon();
    }

    function collapseTower() {
      const penalty = Math.min(game.score, 36 + game.floor * 5 + game.combo * 4);
      game.score = Math.max(0, game.score - penalty);
      game.combo = 0;
      game.stability = 100;
      game.shake = 22;
      game.dropCount += 1;

      showMessage(`ĐỔ THÁP -${penalty}`, 1100);
      emitParticles(W / 2, GROUND_Y - cameraY() - 60, 42, "#2b160b");

      const baseX = Math.round(W / 2 - BLOCK / 2);
      game.tower = [
        cloneBlock(baseX, GROUND_Y - BLOCK, {
          settled: true,
          base: true,
        }),
      ];
      game.floor = 0;
      game.falling = null;
      syncUi(true);
    }

    function settleBlock(block) {
      const below = topBlock();
      const offset = block.x - below.x;
      const absOffset = Math.abs(offset);

      if (absOffset > COLLAPSE_TOLERANCE) {
        collapseTower();
        return;
      }

      block.y = targetY();
      block.settled = true;
      block.dropping = false;

      const perfect = absOffset <= 4;
      const excellent = absOffset <= BLOCK * 0.14;
      const good = absOffset <= BLOCK * 0.34;

      let gained = 0;

      if (perfect) {
        game.combo += 1;
        game.bestCombo = Math.max(game.bestCombo, game.combo);
        gained = 80 + game.floor * 8 + Math.min(360, game.combo * game.combo * 8);
        block.perfect = true;
        showMessage(`PERFECT x${game.combo} +${gained}`, 950);
        emitParticles(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY(), 24, "#ffd700");
      } else if (excellent) {
        game.combo += 1;
        game.bestCombo = Math.max(game.bestCombo, game.combo);
        gained = 52 + game.floor * 6 + Math.min(180, game.combo * 9);
        showMessage(`CHUẨN x${game.combo} +${gained}`, 850);
        emitParticles(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY(), 16, "#ffb000");
      } else if (good) {
        game.combo = 0;
        gained = 28 + game.floor * 4;
        showMessage(`ỔN +${gained}`, 750);
        emitParticles(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY(), 8, "#ff8a00");
      } else {
        game.combo = 0;
        gained = 12 + game.floor * 2;
        game.stability -= Math.round((absOffset / BLOCK) * 30);
        game.shake = Math.max(game.shake, 12);
        showMessage(`LỆCH +${gained}`, 850);
      }

      game.score += gained;
      game.floor += 1;
      game.tower.push(block);
      game.falling = null;

      if (game.stability <= 28 || absOffset > HIT_TOLERANCE) {
        collapseTower();
        return;
      }

      syncUi(true);
    }

    function tap() {
      const now = performance.now();

      if (game.ended) {
        if (onRestart) {
          const allowed = onRestart();
          if (allowed === false) return;
        }
        resetRoundOnly();
        return;
      }

      if (!game.started) {
        if (onGameStart) onGameStart();
        game.started = true;
        game.startAt = now;
        game.lastAt = now;
        game.cranePhase = Math.random() * Math.PI * 2;
        showMessage("TAP ĐỂ THẢ KHỐI", 900);
        spawnFalling(now);
        syncUi(true);
        return;
      }

      if (!game.falling) {
        spawnFalling(now);
        return;
      }

      if (!game.falling.dropping) {
        game.falling.dropping = true;
        game.falling.vy = 0;
      }
    }

    function update(now) {
      if (game.started && !game.ended && now - game.startAt >= ROUND_TIME) {
        finishRound("timeout");
        return;
      }

      if (game.started && !game.ended && !game.falling) {
        spawnFalling(now);
      }

      if (game.falling) {
        if (!game.falling.dropping) {
          game.falling.x = craneX(now);
          game.falling.y = SAFE_TOP + 52 - cameraY();
          game.falling.rot = Math.sin(now * 0.006) * 0.035;
        } else {
          game.falling.vy += DROP_GRAVITY;
          game.falling.y += game.falling.vy;

          const hitY = targetY();
          if (game.falling.y >= hitY) {
            settleBlock(game.falling);
          }
        }
      }

      game.shake *= 0.84;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.028;
        if (p.life <= 0) particles.splice(i, 1);
      }

      syncUi(false);
    }

    function roundRect(x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
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

    function drawCingCube(block, camY, active = false) {
      const x = block.x;
      const y = block.y + camY;
      const s = block.size || BLOCK;
      const d = DEPTH;

      ctx.save();
      ctx.translate(x + s / 2, y + s / 2);
      ctx.rotate(block.rot || 0);
      ctx.translate(-s / 2, -s / 2);

      ctx.fillStyle = active ? "#ff8a00" : "#ff7900";
      roundRect(0, 0, s, s, 10);
      ctx.fill();

      ctx.fillStyle = active ? "#ffb347" : "#ff9d20";
      ctx.beginPath();
      ctx.moveTo(d, -d);
      ctx.lineTo(s + d, -d);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#9f350b";
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(s + d, -d);
      ctx.lineTo(s + d, s - d);
      ctx.lineTo(s, s);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(43,22,11,.92)";
      ctx.lineWidth = 2;
      roundRect(0, 0, s, s, 10);
      ctx.stroke();

      ctx.strokeStyle = "rgba(43,22,11,.74)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(d, -d);
      ctx.moveTo(s, 0);
      ctx.lineTo(s + d, -d);
      ctx.moveTo(s, s);
      ctx.lineTo(s + d, s - d);
      ctx.stroke();

      const pad = Math.round(s * 0.16);
      const logoSize = s - pad * 2;

      if (logoReady) {
        ctx.save();
        roundRect(pad, pad, logoSize, logoSize, 8);
        ctx.clip();

        ctx.fillStyle = "rgba(255,245,228,.96)";
        ctx.fillRect(pad, pad, logoSize, logoSize);

        const ratio = Math.min(logoSize / logoImg.width, logoSize / logoImg.height);
        const iw = logoImg.width * ratio;
        const ih = logoImg.height * ratio;
        ctx.drawImage(
          logoImg,
          pad + (logoSize - iw) / 2,
          pad + (logoSize - ih) / 2,
          iw,
          ih
        );
        ctx.restore();
      } else {
        ctx.fillStyle = "#111";
        ctx.font = `900 ${Math.floor(s * 0.22)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Cing", s / 2, s / 2);
      }

      if (block.perfect) {
        ctx.strokeStyle = "rgba(255,255,255,.72)";
        ctx.lineWidth = 3;
        roundRect(5, 5, s - 10, s - 10, 8);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawCrane(now, camY) {
      if (!game.started || game.ended || !game.falling || game.falling.dropping) return;

      const block = game.falling;
      const hookX = block.x + BLOCK / 2;
      const hookY = block.y + camY - DEPTH - 14;

      ctx.save();
      ctx.strokeStyle = "rgba(43,22,11,.64)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hookX, SAFE_TOP + 22);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();

      ctx.fillStyle = "#2b160b";
      ctx.beginPath();
      ctx.arc(hookX, hookY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(43,22,11,.72)";
      roundRect(hookX - 44, SAFE_TOP + 16, 88, 10, 5);
      ctx.fill();
      ctx.restore();
    }

    function draw(now) {
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();

      if (game.shake > 0.5) {
        const s = game.shake | 0;
        shakeIndex = (shakeIndex + 1) & 63;
        ctx.translate(
          (SHAKE_TABLE[shakeIndex] * s) | 0,
          (SHAKE_TABLE[(shakeIndex + 32) & 63] * s) | 0
        );
      }

      ctx.fillStyle = "rgba(255,255,255,.22)";
      for (let i = 0; i < 10; i++) {
        const bx = (i * 104 + now * 0.012) % (W + 100) - 80;
        ctx.fillRect(bx, 170 + (i % 5) * 70, 68, 7);
      }

      const camY = cameraY();

      drawCrane(now, camY);

      ctx.fillStyle = "#2b1207";
      ctx.fillRect(0, GROUND_Y + camY, W, H);

      for (let i = 0; i < game.tower.length; i++) {
        const b = game.tower[i];
        const yy = b.y + camY;
        if (yy < -100 || yy > H + 120) continue;
        drawCingCube(b, camY, false);
      }

      if (game.falling) {
        drawCingCube(game.falling, camY, true);
      }

      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y + camY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      if (!game.started && !game.ended) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#2b160b";
        ctx.font = "900 31px Arial";
        ctx.fillText("TAP ĐỂ BẮT ĐẦU", W / 2, H / 2 - 64);
        ctx.fillStyle = "rgba(43,22,11,.68)";
        ctx.font = "800 15px Arial";
        ctx.fillText("Thả cube Cing từ cần cẩu trong 120 giây", W / 2, H / 2 - 30);
      }

      if (game.message && now <= game.messageUntil) {
        ctx.textAlign = "center";
        ctx.font = "900 18px Arial";
        ctx.fillStyle = game.message.includes("PERFECT") ? "#ffd700" : "#fff";
        ctx.strokeStyle = "rgba(0,0,0,.56)";
        ctx.lineWidth = 4;
        ctx.strokeText(game.message, W / 2, SAFE_TOP + 96);
        ctx.fillText(game.message, W / 2, SAFE_TOP + 96);
      }

      if (game.ended) {
        ctx.fillStyle = "rgba(0,0,0,.64)";
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "900 46px Arial";
        ctx.fillText("HẾT GIỜ", W / 2, H / 2 - 74);

        ctx.fillStyle = "#ffd166";
        ctx.font = "900 28px Arial";
        ctx.fillText(`${Math.floor(game.score)} điểm`, W / 2, H / 2 - 24);

        ctx.fillStyle = "white";
        ctx.font = "800 17px Arial";
        ctx.fillText(`Tầng: ${game.floor} • Best combo x${game.bestCombo}`, W / 2, H / 2 + 18);

        ctx.font = "800 15px Arial";
        ctx.fillText("Tap để chơi lại", W / 2, H / 2 + 64);
      }
    }

    function loop(now) {
      update(now);
      draw(now);
      rafRef.current = requestAnimationFrame(loop);
    }

    function onPointerDown() {
      tap();
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
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
        <TopBar
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onExit={() => { if (onExit) onExit(); else navigate("/game-center"); }}
        />

        <Hud ui={ui} />

        <canvas
          ref={canvasRef}
          className="touch-none select-none"
          style={{ willChange:"transform", position:"absolute", inset:0, width:"100%", height:"100%", zIndex:1 }}
        />

        {showLeaderboard && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full bg-[#fff3df] rounded-[28px] p-5 shadow-2xl border border-[#dccfb7]">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[#2b160b] font-black text-2xl">🏆 TOP Xếp Tháp Cing</div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="w-10 h-10 rounded-full bg-[#2b160b] text-white font-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {leaderboardData.length === 0 && (
                  <div className="rounded-2xl bg-white/70 px-4 py-5 text-center font-bold text-[#2b160b]">
                    Chưa có dữ liệu BXH. Chơi một lượt để ghi điểm nhé.
                  </div>
                )}

                {leaderboardData.slice(0, 20).map((player, index) => (
                  <div
                    key={player.id || `${player.user_id}-${index}`}
                    className={"flex items-center justify-between rounded-2xl px-4 py-3 " +
                      (player.isPlayer ? "bg-[#2b160b] text-white" : "bg-white/70")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-black w-[42px] text-[#c15a13]">#{index + 1}</div>
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

function TopBar({ onOpenLeaderboard, onExit }) {
  return (
    <div
      style={{
        position:"absolute",
        top:"max(env(safe-area-inset-top,0px) + 10px, 48px)",
        left:14,
        right:14,
        zIndex:40,
        display:"flex",
        alignItems:"flex-start",
        justifyContent:"space-between",
        gap:12,
        pointerEvents:"none",
      }}
    >
      <div
        style={{
          height:60,
          minWidth:0,
          maxWidth:238,
          display:"flex",
          alignItems:"center",
          gap:10,
          background:"rgba(255,246,231,.92)",
          border:"1px solid rgba(43,22,11,.16)",
          borderRadius:28,
          padding:"8px 13px",
          boxShadow:"0 8px 28px rgba(43,22,11,.18)",
          pointerEvents:"auto",
        }}
      >
        <img
          src="/logo-cing.png"
          alt="logo"
          style={{ width:42, height:42, borderRadius:10, objectFit:"contain", flexShrink:0 }}
        />
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:3, color:"#c15a13", marginBottom:2 }}>
            MINI GAME
          </div>
          <div style={{ fontSize:18, lineHeight:"20px", fontWeight:900, color:"#2b160b", whiteSpace:"nowrap" }}>
            Xếp Tháp Cing
          </div>
        </div>
      </div>

      <div
        style={{
          display:"flex",
          flexDirection:"column",
          gap:8,
          width:150,
          pointerEvents:"auto",
        }}
      >
        <button
          onClick={onOpenLeaderboard}
          style={topButtonStyle("#6a6257", "white")}
        >
          🏆 BXH
        </button>
        <button
          onClick={onExit}
          style={topButtonStyle("#2b1207", "white")}
        >
          🎮 Game Center
        </button>
      </div>
    </div>
  );
}

function Hud({ ui }) {
  return (
    <div
      style={{
        position:"absolute",
        top:"max(env(safe-area-inset-top,0px) + 142px, 174px)",
        left:14,
        right:14,
        zIndex:35,
        display:"grid",
        gridTemplateColumns:"repeat(3, minmax(0, 1fr))",
        gap:8,
        pointerEvents:"none",
      }}
    >
      <HudBox value={ui.score} label="Điểm" />
      <HudBox value={`${ui.timeLeft}s`} label="Thời gian" />
      <HudBox value={`x${ui.combo}`} label="Combo" />
    </div>
  );
}

function HudBox({ value, label }) {
  return (
    <div
      style={{
        height:58,
        background:"rgba(70,45,31,.92)",
        border:"1px solid rgba(255,185,60,.52)",
        borderRadius:18,
        color:"white",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        boxShadow:"0 10px 26px rgba(43,22,11,.18)",
        overflow:"hidden",
      }}
    >
      <div style={{ fontSize:22, lineHeight:"24px", fontWeight:950, letterSpacing:-0.5 }}>{value}</div>
      <div style={{ fontSize:12, lineHeight:"14px", opacity:.82, fontWeight:800 }}>{label}</div>
    </div>
  );
}

function topButtonStyle(bg, color) {
  return {
    height:48,
    width:"100%",
    border:"none",
    borderRadius:24,
    background:bg,
    color,
    fontSize:15,
    fontWeight:950,
    cursor:"pointer",
    boxShadow:"0 8px 22px rgba(43,22,11,.22)",
  };
}
