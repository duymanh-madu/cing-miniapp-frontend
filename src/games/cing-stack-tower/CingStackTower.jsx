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
    // Keep gameplay below header/HUD. The crane starts under the controls.
    const SAFE_TOP = Math.max(286, Math.floor(H * 0.255));
    const GROUND_Y = H - 74;
    const BLOCK = Math.max(62, Math.min(74, Math.floor(W * 0.168)));
    const FACE = BLOCK;
    const DEPTH = Math.round(BLOCK * 0.26);
    const PIVOT_Y = SAFE_TOP - 46;
    const ROPE_LENGTH = Math.max(292, Math.min(408, Math.floor(H * 0.405)));
    const HANGING_CENTER_LOW = PIVOT_Y + ROPE_LENGTH;
    const LANDING_SCREEN_Y = Math.min(
      GROUND_Y - BLOCK,
      Math.max(
        Math.floor(H * 0.72),
        HANGING_CENTER_LOW + BLOCK * 0.75
      )
    );
    const DROP_GRAVITY = 0.58;
    const AIR_DRAG_X = 0.996;
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
    const starbursts = [];
    const MAX_PARTICLES = 110;

    const SHAKE_TABLE = new Float32Array(64);
    for (let i = 0; i < 64; i++) SHAKE_TABLE[i] = (Math.random() - 0.5) * 2;
    let shakeIndex = 0;

    let audioCtx = null;
    const audioBuffers = {};
    let audioUnlocked = false;
    let audioLoading = false;

    function unlockAudio() {
      if (audioUnlocked || audioLoading) {
        if (audioCtx?.state === "suspended") audioCtx.resume().catch(() => {});
        return;
      }

      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        audioLoading = true;
        audioCtx = new AudioContextClass();
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

        const files = {
          combo: "/sounds/combo-sound.mp3",
          perfect: "/sounds/perfect-sound.mp3",
          fall: "/sounds/fall-sound.mp3",
        };

        Promise.all(Object.entries(files).map(async ([key, url]) => {
          const res = await fetch(url, { cache: "force-cache" });
          const arr = await res.arrayBuffer();
          audioBuffers[key] = await audioCtx.decodeAudioData(arr);
        }))
          .then(() => {
            audioUnlocked = true;
            audioLoading = false;
          })
          .catch(() => {
            audioLoading = false;
          });
      } catch {
        audioLoading = false;
      }
    }

    function playSound(name, volume = 0.82) {
      if (!audioUnlocked || !audioCtx || !audioBuffers[name]) return;

      try {
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

        const source = audioCtx.createBufferSource();
        const gain = audioCtx.createGain();

        source.buffer = audioBuffers[name];
        gain.gain.value = volume;

        source.connect(gain);
        gain.connect(audioCtx.destination);
        source.start(0);
      } catch {}
    }

    function emitPerfectStarburst(x, y) {
      const colors = ["#fff7b0", "#ffd24a", "#ff9f1c", "#ffffff"];
      for (let i = 0; i < 22; i++) {
        starbursts.push({
          x,
          y,
          angle: (Math.PI * 2 * i) / 22 + Math.random() * 0.16,
          speed: 52 + Math.random() * 48,
          size: 5 + Math.random() * 7,
          spin: (Math.random() - 0.5) * 1.8,
          color: colors[i % colors.length],
          born: performance.now(),
          life: 680 + Math.random() * 180,
        });
      }
    }

    function drawStar(x, y, outer, inner, rotation) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = rotation + i * Math.PI / 5 - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    function drawPerfectStarbursts(now) {
      for (let i = starbursts.length - 1; i >= 0; i--) {
        const star = starbursts[i];
        const progress = (now - star.born) / star.life;
        if (progress >= 1) {
          starbursts.splice(i, 1);
          continue;
        }

        const easeOut = 1 - Math.pow(1 - progress, 2);
        const radius = star.speed * easeOut;
        const x = star.x + Math.cos(star.angle) * radius;
        const y = star.y + Math.sin(star.angle) * radius - progress * 20;
        const alpha = Math.pow(1 - progress, 1.35);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = "#ffd24a";
        ctx.shadowBlur = 16;
        ctx.fillStyle = star.color;
        drawStar(x, y, star.size, star.size * 0.45, progress * 5 + star.spin);
        ctx.restore();
      }
    }

    function drawHeightReferences() {
      const camY = cameraY();
      const markerLimit = Math.max(35, game.floor + 20);
      const rulerX = W - 24;

      ctx.save();

      const cityOffset = (camY * 0.18) % 180;

      // Background city blocks.
      for (let i = 0; i < 8; i++) {
        if (i === 3) continue;

        const buildingX = -18 + i * Math.max(44, W / 6.3);
        const buildingW = 28 + (i % 4) * 8;
        const baseTop = H - 150 - (i % 4) * 22 + cityOffset;
        const top = Math.max(SAFE_TOP + 150, baseTop);

        ctx.fillStyle = "rgba(72, 43, 28, 0.14)";
        ctx.fillRect(buildingX, top, buildingW, H - top);

        ctx.fillStyle = "rgba(255, 211, 130, 0.24)";
        for (let wy = top + 18; wy < H - 18; wy += 26) {
          ctx.fillRect(buildingX + 7, wy, 5, 7);
          ctx.fillRect(buildingX + buildingW - 12, wy, 5, 7);
        }
      }

      // Cing Hu Tang Kinh Bac landmark: tallest building, inspired by the real storefront.
      const cingW = Math.min(138, Math.max(112, W * 0.18));
      const cingX = Math.max(28, Math.min(W - cingW - 28, W * 0.43 - cingW / 2));
      const cingTop = Math.max(SAFE_TOP + 94, H - 340 + cityOffset * 0.42);
      const cingH = H - cingTop;

      ctx.save();
      ctx.globalAlpha = 0.34;

      // Main cream facade.
      const facadeGrad = ctx.createLinearGradient(cingX, cingTop, cingX + cingW, H);
      facadeGrad.addColorStop(0, "rgba(232, 205, 162, 0.72)");
      facadeGrad.addColorStop(0.48, "rgba(178, 132, 88, 0.52)");
      facadeGrad.addColorStop(1, "rgba(83, 49, 30, 0.2)");
      ctx.fillStyle = facadeGrad;
      ctx.fillRect(cingX, cingTop, cingW, cingH);

      // Side columns.
      ctx.fillStyle = "rgba(72, 43, 28, 0.18)";
      ctx.fillRect(cingX, cingTop, 10, cingH);
      ctx.fillRect(cingX + cingW - 10, cingTop, 10, cingH);
      ctx.fillRect(cingX + cingW * 0.49, cingTop + 18, 8, cingH - 18);

      // Floor separators, like stone facade bands.
      ctx.strokeStyle = "rgba(255, 229, 176, 0.22)";
      ctx.lineWidth = 1;
      for (let y = cingTop + 34; y < H - 40; y += 32) {
        ctx.beginPath();
        ctx.moveTo(cingX + 6, y);
        ctx.lineTo(cingX + cingW - 6, y);
        ctx.stroke();
      }

      // Upper balconies.
      for (let b = 0; b < 3; b++) {
        const bx = cingX + 16 + b * ((cingW - 38) / 3);
        const by = cingTop + 18;
        const bw = Math.max(24, cingW * 0.22);

        ctx.fillStyle = "rgba(255, 230, 184, 0.28)";
        ctx.fillRect(bx, by, bw, 11);

        ctx.strokeStyle = "rgba(43, 22, 11, 0.36)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - 2, by + 11);
        ctx.lineTo(bx + bw + 2, by + 11);
        for (let r = 0; r < 5; r++) {
          const rx = bx + 2 + r * (bw - 4) / 4;
          ctx.moveTo(rx, by + 2);
          ctx.lineTo(rx, by + 12);
        }
        ctx.stroke();
      }

      // Large arches copied from the real facade feel.
      const archY = cingTop + Math.max(72, cingH * 0.34);
      const archW = cingW * 0.43;
      const archH = Math.min(92, cingH * 0.28);
      for (let a = 0; a < 2; a++) {
        const ax = cingX + 11 + a * (cingW * 0.5);
        ctx.fillStyle = "rgba(44, 29, 24, 0.22)";
        ctx.beginPath();
        ctx.moveTo(ax, archY + archH);
        ctx.lineTo(ax, archY + archW * 0.5);
        ctx.quadraticCurveTo(ax + archW / 2, archY - 8, ax + archW, archY + archW * 0.5);
        ctx.lineTo(ax + archW, archY + archH);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 225, 178, 0.2)";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Real-storefront style black signboard.
      const signW = cingW * 0.74;
      const signH = 25;
      const signX = cingX + (cingW - signW) / 2;
      const signY = archY + 18;

      ctx.globalAlpha = 0.52;
      ctx.fillStyle = "rgba(9, 16, 18, 0.9)";
      ctx.beginPath();
      ctx.roundRect(signX, signY, signW, signH, 3);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textAlign = "center";
      ctx.font = "900 10px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText("Cing Hu Tang", signX + signW / 2, signY + 11);
      ctx.font = "800 7px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText("Kinh Bac", signX + signW / 2, signY + 20);

      // Lower entrance sign.
      const doorW = cingW * 0.46;
      const doorX = cingX + (cingW - doorW) / 2;
      const doorY = signY + signH + 8;
      ctx.fillStyle = "rgba(12, 18, 20, 0.68)";
      ctx.fillRect(doorX, doorY, doorW, 42);
      ctx.strokeStyle = "rgba(255, 230, 184, 0.3)";
      ctx.strokeRect(doorX, doorY, doorW, 42);

      ctx.restore();

      const cloudBase = SAFE_TOP + 46 + ((camY * 0.11) % 130);
      ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
      for (let i = 0; i < 4; i++) {
        const x = 30 + i * Math.max(82, W / 3.4);
        const y = cloudBase + (i % 2) * 42;
        if (y < SAFE_TOP - 40 || y > H + 50) continue;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.arc(x + 18, y - 6, 19, 0, Math.PI * 2);
        ctx.arc(x + 40, y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = "rgba(92, 50, 26, 0.34)";
      ctx.fillStyle = "rgba(92, 50, 26, 0.66)";
      ctx.lineWidth = 1;

      for (let floor = 5; floor <= markerLimit; floor += 5) {
        const y = GROUND_Y - BLOCK * (floor + 1) + camY;
        if (y < SAFE_TOP - 82 || y > H + 82) continue;

        ctx.beginPath();
        ctx.moveTo(18, y);
        ctx.lineTo(W - 18, y);
        ctx.stroke();

        ctx.font = "800 11px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.textAlign = "right";
        const label = floor >= 30 ? `May tang ${floor}` : `Tang ${floor}`;
        ctx.fillText(label, rulerX, y - 6);
      }

      if (isFeverActive()) {
        const now = performance.now();
        const progress = Math.max(0, Math.min(1, (game.feverUntil - now) / 3000));
        const barW = Math.min(286, W - 56);
        const barH = 14;
        const barX = (W - barW) / 2;
        const barY = SAFE_TOP + 25;
        const fillW = Math.max(barH, barW * progress);

        ctx.save();
        ctx.globalAlpha = game.feverFlashUntil > now ? 0.98 : 0.86;

        const glow = ctx.createLinearGradient(0, SAFE_TOP - 12, 0, SAFE_TOP + 62);
        glow.addColorStop(0, "rgba(255, 210, 78, 0.25)");
        glow.addColorStop(0.62, "rgba(255, 176, 0, 0.16)");
        glow.addColorStop(1, "rgba(255, 176, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, SAFE_TOP - 12, W, 76);

        ctx.fillStyle = "#7a3c00";
        ctx.shadowColor = "rgba(255, 176, 0, 0.55)";
        ctx.shadowBlur = 10;
        ctx.font = "950 15px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PERFECT FEVER x1.55", W / 2, SAFE_TOP + 14);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(73, 38, 17, 0.22)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 999);
        ctx.fill();

        const barGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        barGrad.addColorStop(0, "#ffb000");
        barGrad.addColorStop(0.52, "#ffe16a");
        barGrad.addColorStop(1, "#ff8a00");
        ctx.fillStyle = barGrad;
        ctx.shadowColor = "rgba(255, 196, 0, 0.72)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(barX, barY, fillW, barH, 999);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 238, 176, 0.82)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 999);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

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
        feverUntil: 0,
        feverFlashUntil: 0,
        floor: 0,
        stability: 100,
        shake: 0,
        message: "",
        messageUntil: 0,
        tower: [base],
        falling: null,
        cranePhase: 0,
        // Production gameplay tuning:
        // slow start, then ramps continuously with tower height.
        craneSpeed: 0.00134,
        dropCount: 0,
      };
    }

    const game = makeGame();
    gameRef.current = game;

    function topBlock() {
      return game.tower[game.tower.length - 1];
    }

    function isFeverActive(now = performance.now()) {
      return game.feverUntil > now;
    }

    function targetY() {
      return GROUND_Y - BLOCK * (game.tower.length + 1);
    }

    function cameraY() {
      const visibleTop = targetY();
      return Math.max(0, LANDING_SCREEN_Y - visibleTop);
    }

    function activeRopeLengthForFloor(floor) {
      const targetLength = ROPE_LENGTH - Math.max(0, floor) * BLOCK * 0.08;
      const minLength = Math.max(246, Math.min(318, ROPE_LENGTH * 0.82));
      return Math.max(minLength, targetLength);
    }

    function pendulumState(now) {
      const floor = Math.max(0, game.floor);
      const activeRopeLength = activeRopeLengthForFloor(floor);

      const speedLevel = Math.min(10, Math.floor(floor / 5));
      const baseSpeed = game.craneSpeed + floor * 0.00002 + speedLevel * 0.00009;
      const t = now * baseSpeed + game.cranePhase;

      // Smooth continuous swing. Difficulty comes from rhythm variation,
      // while the vertical loop keeps the hook moving at the side turns.
      const rhythmPhase =
        Math.sin(t * 0.36 + floor * 0.29) * 0.16 +
        Math.sin(t * 0.71 + game.cranePhase) * 0.055;

      const maxAngle = Math.max(0.25, 0.43 - Math.min(0.12, floor * 0.0032));
      const swingWave =
        Math.sin(t + rhythmPhase) * 0.92 +
        Math.sin(t * 2.08 + 0.7) * 0.08;
      const angle = swingWave * maxAngle;

      const rhythmVelocity =
        1 +
        Math.cos(t * 0.36 + floor * 0.29) * 0.16 * 0.36 +
        Math.cos(t * 0.71 + game.cranePhase) * 0.055 * 0.71;
      const angularVelocity =
        (Math.cos(t + rhythmPhase) * 0.92 +
          Math.cos(t * 2.08 + 0.7) * 0.08 * 2.08) *
        maxAngle *
        baseSpeed *
        rhythmVelocity;

      const verticalAmp = Math.min(BLOCK * 0.34, 12 + floor * 0.55);
      const verticalSway =
        Math.sin(t * 1.42 + floor * 0.33) * verticalAmp +
        Math.sin(t * 0.62 + 1.2) * verticalAmp * 0.22;

      const pivotX = W / 2;
      const pivotY = PIVOT_Y;
      const cx = pivotX + Math.sin(angle) * activeRopeLength;
      const cy = pivotY + Math.cos(angle) * activeRopeLength + verticalSway;

      return {
        pivotX,
        pivotY,
        cx,
        cy,
        angle,
        angularVelocity,
        ropeLength: activeRopeLength,
        x: cx - BLOCK / 2,
        y: cy - BLOCK / 2 - cameraY(),
        vx: angularVelocity * activeRopeLength * Math.cos(angle) * 10.8,
        vy: Math.max(0, -angularVelocity * activeRopeLength * Math.sin(angle) * 1.55),
      };
    }

    function spawnFalling(now) {
      if (game.falling || game.ended) return;
      const swing = pendulumState(now);
      game.falling = cloneBlock(swing.x, swing.y, {
        dropping: false,
        vx: 0,
        vy: 0,
        swingAt: now,
        swingAngle: swing.angle,
      });
    }

    function resetRoundOnly() {
      const next = makeGame();
      Object.keys(game).forEach(k => delete game[k]);
      Object.assign(game, next);
      particles.length = 0;
      starbursts.length = 0;
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
      playSound("fall", 0.9);
      const penalty = Math.min(game.score, 36 + game.floor * 5 + game.combo * 4);
      game.score = Math.max(0, game.score - penalty);
      game.combo = 0;
      game.feverUntil = 0;
      game.feverFlashUntil = 0;
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
        playSound("perfect", 0.88);

        const now = performance.now();
        game.feverUntil = now + 3000;
        game.feverFlashUntil = now + 650;
        showMessage(`FEVER PERFECT x${game.combo} +${gained}`, 1050);
        emitParticles(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY(), 38, "#ffd700");
        emitPerfectStarburst(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY());
      } else if (excellent) {
        game.combo = 0;
        gained = 52 + game.floor * 6;
        playSound("combo", 0.78);
        showMessage(`CHUẨN +${gained}`, 850);
        emitParticles(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY(), 16, "#ffb000");
      } else if (good) {
        game.combo = 0;
        gained = 28 + game.floor * 4;
        playSound("combo", 0.72);
        showMessage(`ỔN +${gained}`, 750);
        emitParticles(block.x + BLOCK / 2, block.y + BLOCK / 2 + cameraY(), 8, "#ff8a00");
      } else {
        game.combo = 0;
        gained = 12 + game.floor * 2;
        playSound("combo", 0.64);
        game.stability -= Math.round((absOffset / BLOCK) * 30);
        game.shake = Math.max(game.shake, 12);
        showMessage(`LỆCH +${gained}`, 850);
      }

      if (isFeverActive()) {
        gained = Math.round(gained * 1.55);
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
      unlockAudio();
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
        const swing = pendulumState(now);
        game.falling.x = swing.x;
        game.falling.y = swing.y;
        game.falling.vx = swing.vx;
        game.falling.vy = swing.vy;
        game.falling.dropping = true;
        game.falling.rot = swing.angle * 0.18;
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
          const swing = pendulumState(now);
          game.falling.x = swing.x;
          game.falling.y = swing.y;
          game.falling.rot = swing.angle * 0.18;
          game.falling.swingAngle = swing.angle;
        } else {
          game.falling.vy += DROP_GRAVITY;
          game.falling.x += game.falling.vx;
          game.falling.y += game.falling.vy;
          game.falling.vx *= AIR_DRAG_X;
          game.falling.rot += game.falling.vx * 0.0009;

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
      const size = block.size || BLOCK;
      const d = DEPTH;

      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);
      ctx.rotate(block.rot || 0);
      ctx.translate(-size / 2, -size / 2);

      ctx.shadowColor = "rgba(43,22,11,.34)";
      ctx.shadowBlur = active ? 18 : 10;
      ctx.shadowOffsetY = active ? 10 : 6;

      const frontGrad = ctx.createLinearGradient(0, 0, size, size);
      frontGrad.addColorStop(0, active ? "#ff9c1a" : "#ff8810");
      frontGrad.addColorStop(0.55, "#ff7400");
      frontGrad.addColorStop(1, "#e95700");

      const topGrad = ctx.createLinearGradient(0, -d, size + d, 0);
      topGrad.addColorStop(0, "#ffc05a");
      topGrad.addColorStop(0.55, "#ff9d18");
      topGrad.addColorStop(1, "#e96600");

      const sideGrad = ctx.createLinearGradient(size, 0, size + d, size);
      sideGrad.addColorStop(0, "#c84405");
      sideGrad.addColorStop(1, "#7c2506");

      // Top face.
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(d, -d);
      ctx.lineTo(size + d, -d);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Right face.
      ctx.fillStyle = sideGrad;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(size + d, -d);
      ctx.lineTo(size + d, size - d);
      ctx.lineTo(size, size);
      ctx.closePath();
      ctx.fill();

      // Front face.
      ctx.fillStyle = frontGrad;
      roundRect(0, 0, size, size, 12);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Strong cartoon/Tower-Bloxx style outline.
      ctx.strokeStyle = "rgba(43,22,11,.96)";
      ctx.lineWidth = 3;
      roundRect(0, 0, size, size, 12);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(43,22,11,.82)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(d, -d);
      ctx.moveTo(size, 0);
      ctx.lineTo(size + d, -d);
      ctx.moveTo(size, size);
      ctx.lineTo(size + d, size - d);
      ctx.stroke();

      // Subtle bevels/highlights.
      ctx.strokeStyle = "rgba(255,255,255,.32)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(9, 8);
      ctx.lineTo(size - 12, 8);
      ctx.moveTo(8, 11);
      ctx.lineTo(8, size - 16);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,.08)";
      roundRect(7, 7, size - 14, Math.max(18, size * 0.24), 8);
      ctx.fill();

      // Logo panel: orange base, bigger logo, no fake white square.
      const panelPad = Math.round(size * 0.115);
      const panelSize = size - panelPad * 2;
      const panelX = panelPad;
      const panelY = panelPad;

      ctx.save();
      roundRect(panelX, panelY, panelSize, panelSize, 11);
      ctx.clip();

      const panelGrad = ctx.createLinearGradient(panelX, panelY, panelX + panelSize, panelY + panelSize);
      panelGrad.addColorStop(0, "#ff9a13");
      panelGrad.addColorStop(1, "#ff6f00");
      ctx.fillStyle = panelGrad;
      ctx.fillRect(panelX, panelY, panelSize, panelSize);

      if (logoReady && logoImg.width && logoImg.height) {
        const logoScale = Math.min(
          (panelSize * 1.22) / logoImg.width,
          (panelSize * 1.22) / logoImg.height
        );
        const iw = logoImg.width * logoScale;
        const ih = logoImg.height * logoScale;
        const ix = panelX + (panelSize - iw) / 2;
        const iy = panelY + (panelSize - ih) / 2;

        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(logoImg, ix, iy, iw, ih);
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.fillStyle = "#111";
        ctx.font = `900 ${Math.floor(size * 0.24)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Cing", size / 2, size / 2);
      }
      ctx.restore();

      ctx.strokeStyle = "rgba(43,22,11,.86)";
      ctx.lineWidth = 2;
      roundRect(panelX, panelY, panelSize, panelSize, 11);
      ctx.stroke();

      if (block.perfect) {
        ctx.strokeStyle = "rgba(255,235,120,.95)";
        ctx.lineWidth = 4;
        roundRect(5, 5, size - 10, size - 10, 10);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawCrane(now, camY) {
      if (!game.started || game.ended || !game.falling || game.falling.dropping) return;

      const swing = pendulumState(now);
      const hookX = swing.cx;
      const hookY = swing.cy - BLOCK / 2 - DEPTH - 8;

      ctx.save();

      // Crane rail.
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(43,22,11,.68)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 94, PIVOT_Y);
      ctx.lineTo(W / 2 + 94, PIVOT_Y);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 86, PIVOT_Y - 2);
      ctx.lineTo(W / 2 + 86, PIVOT_Y - 2);
      ctx.stroke();

      // Pivot wheel.
      ctx.fillStyle = "#3a2417";
      ctx.beginPath();
      ctx.arc(swing.pivotX, swing.pivotY, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#6b4229";
      ctx.beginPath();
      ctx.arc(swing.pivotX, swing.pivotY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rope.
      ctx.strokeStyle = "rgba(43,22,11,.78)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(swing.pivotX, swing.pivotY);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();

      // Hook.
      ctx.strokeStyle = "rgba(43,22,11,.9)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hookX, hookY);
      ctx.quadraticCurveTo(hookX + 10, hookY + 12, hookX + 2, hookY + 23);
      ctx.stroke();

      ctx.fillStyle = "#2b160b";
      ctx.beginPath();
      ctx.arc(hookX, hookY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function draw(now) {
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
      drawHeightReferences();

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

      const firstVisibleTowerIndex = Math.max(0, game.tower.length - 4);
      for (let i = firstVisibleTowerIndex; i < game.tower.length; i++) {
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
      drawPerfectStarbursts(now);
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
      if (audioCtx) audioCtx.close().catch(() => {});
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
        top:"max(env(safe-area-inset-top,0px) + 12px, 44px)",
        left:14,
        right:14,
        zIndex:40,
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        gap:9,
        pointerEvents:"none",
      }}
    >
      <div
        style={{
          height:62,
          width:"min(360px, calc(100vw - 36px))",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          gap:12,
          background:"rgba(255,246,231,.94)",
          border:"1px solid rgba(43,22,11,.16)",
          borderRadius:31,
          padding:"8px 16px",
          boxShadow:"0 8px 28px rgba(43,22,11,.18)",
          pointerEvents:"auto",
        }}
      >
        <img
          src="/logo-cing.png"
          alt="logo"
          style={{ width:44, height:44, borderRadius:10, objectFit:"contain", flexShrink:0 }}
        />
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:3, color:"#c15a13", marginBottom:2 }}>
            MINI GAME
          </div>
          <div style={{ fontSize:20, lineHeight:"22px", fontWeight:950, color:"#2b160b", whiteSpace:"nowrap" }}>
            Xếp Tháp Cing
          </div>
        </div>
      </div>

      <div
        style={{
          width:"min(360px, calc(100vw - 36px))",
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:9,
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
        top:"max(env(safe-area-inset-top,0px) + 172px, 214px)",
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
