const fs = require('fs');
const file = 'src/features/game-center/games/chess/ChessGame.jsx';
let content = fs.readFileSync(file, 'utf8');

// Thay toàn bộ phần audio cũ (singleton oscillator) bằng file-based audio
const old = `// Singleton AudioContext — tránh tạo mới mỗi lần phát âm thanh,
// vì browser giới hạn số AudioContext sống đồng thời (gây mất âm thanh sau vài lần gọi)
let _sharedAudioCtx = null;
function getAudioContext() {
  if (!_sharedAudioCtx) {
    _sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _sharedAudioCtx;
}

function playSound(type) {
  const ctx = getAudioContext();
  // Nếu context bị suspend (autoplay policy), resume rồi phát lại sau khi sẵn sàng
  if (ctx.state === "suspended") {
    ctx.resume().then(() => playSound(type)).catch(()=>{});
    return;
  }
  try {`;

const newStr = `// =====================================================
// AUDIO SYSTEM — file-based, cùng pattern BlackPearlRush
// Unlock 1 lần từ user gesture, buffer tất cả files, zero-latency khi play
// =====================================================
let _audioCtx = null;
const _audioBuffers = {};
let _audioUnlocked = false;

async function unlockChessAudio() {
  if (_audioUnlocked) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const files = {
      move:         "/sounds/move-sound.mp3",
      capture:      "/sounds/An-quan-sound.mp3",
      check:        "/sounds/chess-sound.mp3",
      gift_receive: "/sounds/champ-sound.mp3",
      gift_send:    "/sounds/champ-sound.mp3",
      emoji:        "/sounds/emoji-sound.mp3",
      warning:      "/sounds/chess-sound.mp3",
    };
    await Promise.all(Object.entries(files).map(async ([k, url]) => {
      try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        _audioBuffers[k] = await _audioCtx.decodeAudioData(buf);
      } catch(e) {}
    }));
    _audioUnlocked = true;
  } catch(e) {}
}

function playSound(type) {
  if (!_audioUnlocked || !_audioCtx || !_audioBuffers[type]) return;
  try {`;

if (!content.includes(old)) { console.log('ERROR: pattern not found'); process.exit(1); }
content = content.replace(old, newStr);

// Xóa các oscillator nodes cũ (từ sau "try {" đến closing "} catch(e) {}" của playSound)
// Đổi phần thân các case thành createBufferSource
const oldBody = `    if (type === "move") {
      // Tiếng gõ quân cờ rõ ràng + vang nhẹ
      const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
      o1.connect(g1); g1.connect(ctx.destination);
      o1.type = "triangle";
      o1.frequency.setValueAtTime(900, ctx.currentTime);
      o1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
      g1.gain.setValueAtTime(0.5, ctx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o1.start(); o1.stop(ctx.currentTime + 0.12);
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.type = "sine";
      o2.frequency.setValueAtTime(350, ctx.currentTime + 0.04);
      g2.gain.setValueAtTime(0.2, ctx.currentTime + 0.04);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o2.start(ctx.currentTime + 0.04); o2.stop(ctx.currentTime + 0.35);

    } else if (type === "warning") {
      // 3 beep dồn dập to hơn
      [0, 0.22, 0.44].forEach((d, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "square";
        o.frequency.setValueAtTime(880 + i*100, ctx.currentTime + d);
        g.gain.setValueAtTime(0.35, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.16);
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.16);
      });

    } else if (type === "gift_receive") {
      // Nhạc chuông trang trọng 5 nốt
      [523, 659, 784, 1046, 784].forEach((freq, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.14);
        g.gain.setValueAtTime(0.35, ctx.currentTime + i * 0.14);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.28);
        o.start(ctx.currentTime + i * 0.14);
        o.stop(ctx.currentTime + i * 0.14 + 0.28);
      });

    } else if (type === "gift_send") {
      // 2 nốt xác nhận ngọt ngào
      [[659, 0], [784, 0.18]].forEach(([freq, d]) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, ctx.currentTime + d);
        g.gain.setValueAtTime(0.28, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.28);
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.28);
      });

    } else if (type === "emoji") {`;

const newBody = `    const src = _audioCtx.createBufferSource();
    src.buffer = _audioBuffers[type];
    const gain = _audioCtx.createGain();
    gain.gain.value = 0.6;
    src.connect(gain); gain.connect(_audioCtx.destination);
    src.start(0);
  } catch(e) {}
}

// placeholder để xóa oscillator cũ — dummy không dùng
function _unusedOscillator() {
    if (false) {`;

if (!content.includes(oldBody)) { console.log('ERROR2: oscillator body not found'); process.exit(1); }
content = content.replace(oldBody, newBody);

// Xóa phần cuối oscillator emoji + closing catch
const oldEnd = `      // 2 nốt nhảy vui
      [[880, 0], [1047, 0.12]].forEach(([freq, d]) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, ctx.currentTime + d);
        g.gain.setValueAtTime(0.22, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.2);
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.2);
      });
    }
  } catch(e) {}
}`;
const newEnd = `    }
  }
}`;
if (!content.includes(oldEnd)) { console.log('ERROR3: emoji oscillator not found'); process.exit(1); }
content = content.replace(oldEnd, newEnd);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
