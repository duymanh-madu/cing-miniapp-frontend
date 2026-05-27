import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api","") || "https://cing-backend-production.up.railway.app";

export default function SnakeGame({ profile, onExit }) {
  const canvasRef  = useRef(null);
  const socketRef  = useRef(null);
  const stateRef   = useRef({ self:null, players:[], food:[], special:[] });
  const animRef    = useRef(null);
  const deadRef    = useRef(false);

  const [phase, setPhase]     = useState("lobby");
  const [rooms, setRooms]     = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [deathInfo, setDeathInfo] = useState(null);
  const [effects, setEffects] = useState([]);
  const [kills, setKills]     = useState(0);
  const [myLength, setMyLength] = useState(0);
  const [error, setError]     = useState("");

  // Socket
  useEffect(() => {
    // Tránh double connect trong React StrictMode
    if (socketRef.current?.connected) return;
    const sock = io(`${BACKEND_URL}/snake`, { transports:["websocket"], forceNew:true });
    socketRef.current = sock;
    sock.on("connect", () => sock.emit("game:rooms"));
    sock.on("game:rooms",    (data) => setRooms(data));
    sock.on("game:joined",   ({ rooms: r }) => { setRooms(r||[]); setPhase("playing"); deadRef.current=false; });
    sock.on("game:state",    (state) => {
      stateRef.current = state;
      if (state.self) {
        setKills(state.self.kills);
        setMyLength(state.self.length);
        setEffects(Object.keys(state.self.effects||{}));
      }
    });
    sock.on("game:leaderboard", (top) => setLeaderboard(top));
    sock.on("game:over",     (info) => { deadRef.current=true; setDeathInfo(info); setPhase("dead"); });
    sock.on("game:error",    ({ message }) => setError(message));
    return () => sock.disconnect();
  }, []);

  const joinRoom = useCallback(() => {
    if (!socketRef.current || !profile) return;
    setError("");
    socketRef.current.emit("game:join", {
      userId: profile.id || profile.phone,
      name:   profile.name || profile.zalo_name || "Cing iu",
      avatar: profile.avatar || "",
    });
  }, [profile]);

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return;

    // Đợi canvas mount
    let started = false;
    const startLoop = () => {
      if (started) return;
      const canvas = canvasRef.current;
      if (!canvas) { setTimeout(startLoop, 50); return; }
      started = true;

      // Set canvas size = actual pixel size
      const dpr = window.devicePixelRatio || 1;
      const W   = window.innerWidth;
      const H   = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      // Controls
      const handleMove = (cx, cy) => {
        const rect = canvas.getBoundingClientRect();
        const angle = Math.atan2(cy - rect.top - H/2, cx - rect.left - W/2);
        localAngle = angle;
        socketRef.current?.emit("game:direction", { angle });
      };
      const onTouch = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); };
      const onMouse = (e) => handleMove(e.clientX, e.clientY);
      const onTouchStart = (e) => {
        e.preventDefault();
        if (e.touches.length >= 2) socketRef.current?.emit("game:boost", { active:true });
        else handleMove(e.touches[0].clientX, e.touches[0].clientY);
      };
      const onTouchEnd = () => socketRef.current?.emit("game:boost", { active:false });
      canvas.addEventListener("touchmove",  onTouch,      { passive:false });
      canvas.addEventListener("touchstart", onTouchStart, { passive:false });
      canvas.addEventListener("touchend",   onTouchEnd);
      canvas.addEventListener("mousemove",  onMouse);

      // Draw functions
      const drawPearl = (cx, cy, r, glow) => {
        if (glow > 0.05) {
          const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r*2.5);
          g.addColorStop(0, `rgba(255,96,16,${glow*0.6})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(cx,cy,r*2.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle="#3A1202"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r*0.82,0,Math.PI*2); ctx.fillStyle="#7A3008"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r*0.62,0,Math.PI*2); ctx.fillStyle="#B04810"; ctx.fill();
        const g2 = ctx.createRadialGradient(cx-r*0.15,cy-r*0.15,0,cx,cy,r*0.44);
        g2.addColorStop(0,"#E86820"); g2.addColorStop(1,"#C05010");
        ctx.beginPath(); ctx.arc(cx,cy,r*0.44,0,Math.PI*2); ctx.fillStyle=g2; ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx-r*0.15,cy-r*0.18,r*0.2,r*0.14,-0.3,0,Math.PI*2);
        ctx.fillStyle="rgba(255,180,100,0.75)"; ctx.fill();
      };

      const drawHead = (x, y, r, angle, isSelf, glow, player) => {
        ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
        if (glow>0.05) {
          const g=ctx.createRadialGradient(0,0,0,0,0,r*2.2);
          g.addColorStop(0,`rgba(255,96,16,${glow*0.7})`); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(0,0,r*2.2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
        const hg=ctx.createRadialGradient(-r*0.3,-r*0.3,0,0,0,r);
        hg.addColorStop(0,"#FAA840"); hg.addColorStop(0.45,"#E07018"); hg.addColorStop(1,"#903010");
        ctx.beginPath(); ctx.ellipse(0,0,r,r*0.88,0,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
        [[-r*0.28,-r*0.26],[r*0.28,-r*0.26]].forEach(([ex,ey],idx)=>{
          const er=r*(idx===0?0.36:0.3);
          ctx.beginPath(); ctx.arc(ex,ey,er,0,Math.PI*2); ctx.fillStyle="white"; ctx.fill();
          ctx.beginPath(); ctx.arc(ex,ey,er*0.75,0,Math.PI*2); ctx.fillStyle="#160800"; ctx.fill();
          const ig=ctx.createRadialGradient(ex,ey,0,ex,ey,er*0.45);
          ig.addColorStop(0,"#E85010"); ig.addColorStop(1,"#600800");
          ctx.beginPath(); ctx.arc(ex,ey,er*0.42,0,Math.PI*2); ctx.fillStyle=ig; ctx.fill();
          ctx.beginPath(); ctx.arc(ex,ey,er*0.24,0,Math.PI*2); ctx.fillStyle="#050100"; ctx.fill();
          ctx.beginPath(); ctx.ellipse(ex+er*0.2,ey-er*0.25,er*0.18,er*0.13,-0.3,0,Math.PI*2);
          ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.fill();
        });
        ctx.strokeStyle="#EE0808"; ctx.lineWidth=2; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(0,r*0.5); ctx.lineTo(0,r*0.72); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,r*0.72); ctx.lineTo(-r*0.15,r*0.9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,r*0.72); ctx.lineTo(r*0.15,r*0.9); ctx.stroke();
        if (!isSelf && player?.name) {
          ctx.fillStyle="rgba(0,0,0,0.65)";
          if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-r*1.1,-r*1.9,r*2.2,r*0.7,4); ctx.fill(); }
          ctx.fillStyle="white"; ctx.font=`bold ${Math.max(r*0.38,10)}px sans-serif`;
          ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(player.name.slice(0,10),0,-r*1.55);
        }
        ctx.restore();
      };

      const drawSnake = (player, isSelf, camX, camY, glow) => {
        const segs = player.segments;
        if (!segs || segs.length===0) return;
        const maxR = Math.min(7 + player.length*0.18, 20);
        const minR = maxR*0.3;
        for (let i=segs.length-1; i>=0; i--) {
          const frac = 1 - i/segs.length;
          const r = minR + (maxR-minR)*frac;
          const sx = segs[i].x - camX + W/2;
          const sy = segs[i].y - camY + H/2;
          if (sx<-r*4||sx>W+r*4||sy<-r*4||sy>H+r*4) continue;
          drawPearl(sx, sy, r, isSelf?glow:0);
        }
        if (segs.length>0) {
          const hx = segs[0].x-camX+W/2;
          const hy = segs[0].y-camY+H/2;
          const ang = segs.length>1 ? Math.atan2(segs[0].y-segs[1].y, segs[0].x-segs[1].x) - Math.PI/2 : -Math.PI/2;
          drawHead(hx, hy, maxR*1.6, ang, isSelf, glow, player);
        }
      };

      const drawFood = (food, camX, camY) => {
        food.forEach(f => {
          const fx=f.x-camX+W/2, fy=f.y-camY+H/2;
          if (fx<-20||fx>W+20||fy<-20||fy>H+20) return;
          const r=f.size||5;
          ctx.beginPath(); ctx.arc(fx,fy,r,0,Math.PI*2); ctx.fillStyle="#3A1202"; ctx.fill();
          ctx.beginPath(); ctx.arc(fx,fy,r*0.65,0,Math.PI*2); ctx.fillStyle=f.color||"#C85010"; ctx.fill();
          ctx.beginPath(); ctx.ellipse(fx-r*0.2,fy-r*0.2,r*0.22,r*0.16,-0.3,0,Math.PI*2);
          ctx.fillStyle="rgba(255,180,100,0.7)"; ctx.fill();
        });
      };

      const SCOLORS = { x2:"#4080FF", x5:"#C040FF", x10:"#FFD700", magnet:"#40FFB0", shield:"#FFB830" };
      const SICONS  = { x2:"x2", x5:"x5", x10:"x10", magnet:"🧲", shield:"🛡" };
      const drawSpecial = (items, camX, camY) => {
        items.forEach(s => {
          const sx=s.x-camX+W/2, sy=s.y-camY+H/2;
          if (sx<-40||sx>W+40||sy<-40||sy>H+40) return;
          const r=18, col=SCOLORS[s.type]||"#fff";
          const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2);
          g.addColorStop(0,col+"66"); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(sx,sy,r*2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
          ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fillStyle="#1a0d05"; ctx.fill();
          ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke();
          ctx.font=`bold ${r*0.75}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillStyle=col; ctx.fillText(SICONS[s.type]||"?",sx,sy);
        });
      };

      let localGlow=0, lastKills=0;
      let localAngle = 0;
      let lastFrameTime = Date.now();

      // Client-side prediction: tự di chuyển rắn locally
      const predictMove = (state) => {
        if (!state?.self?.segments) return state;
        const now = Date.now();
        const dt = Math.min(now - lastFrameTime, 100) / 50; // normalize to tick rate
        lastFrameTime = now;
        
        const segs = state.self.segments;
        if (segs.length === 0) return state;
        
        const spd = 3.5 * dt;
        const newHead = {
          x: ((segs[0].x + Math.cos(localAngle) * spd) % 8000 + 8000) % 8000,
          y: ((segs[0].y + Math.sin(localAngle) * spd) % 8000 + 8000) % 8000,
        };
        return {
          ...state,
          self: {
            ...state.self,
            segments: [newHead, ...segs.slice(0, state.self.length * 3)],
          }
        };
      };

      const frame = () => {
        if (deadRef.current) return;
        const rawState = stateRef.current;
        const state = predictMove(rawState);
        const self  = state.self;

        ctx.fillStyle="#080504"; ctx.fillRect(0,0,W,H);

        // Grid
        ctx.strokeStyle="rgba(255,100,20,0.05)"; ctx.lineWidth=0.5;
        const camX = self?.segments?.[0]?.x || 0;
        const camY = self?.segments?.[0]?.y || 0;
        const gs=80;
        const ox=((-camX%gs)+W/2+gs*10)%gs, oy=((-camY%gs)+H/2+gs*10)%gs;
        for(let x=ox-gs;x<W+gs;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
        for(let y=oy-gs;y<H+gs;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

        drawFood(state.food||[], camX, camY);
        drawSpecial(state.special||[], camX, camY);

        if (self && self.kills > lastKills) { localGlow=1; lastKills=self.kills; }
        if (localGlow>0) localGlow=Math.max(0, localGlow-0.008);

        (state.players||[]).forEach(p => {
          if (p.id !== self?.id) drawSnake(p, false, camX, camY, 0);
        });
        if (self) drawSnake(self, true, camX, camY, localGlow);

        animRef.current = requestAnimationFrame(frame);
      };

      animRef.current = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(animRef.current);
        canvas.removeEventListener("touchmove", onTouch);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchend", onTouchEnd);
        canvas.removeEventListener("mousemove", onMouse);
      };
    };

    startLoop();
  }, [phase]);

  const EC = { x2:"#4080FF", x5:"#C040FF", x10:"#FFD700", magnet:"#40FFB0", shield:"#FFB830" };
  const EI = { x2:"✖2", x5:"✖5", x10:"✖10", magnet:"🧲", shield:"🛡" };

  if (phase === "lobby") return (
    <div style={{ background:"#080504", minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <p style={{ fontSize:40, margin:"0 0 8px" }}>🧋</p>
      <h1 style={{ color:"white", fontSize:22, fontWeight:900, margin:"0 0 6px" }}>TRÂN CHÂU ĐẠI CHIẾN</h1>
      <p style={{ color:"#888", fontSize:12, margin:"0 0 24px" }}>Ăn trân châu · Tiêu diệt đối thủ · Leo rank</p>

      {error && <div style={{ background:"rgba(244,67,54,0.15)", border:"1px solid #f44336",
        borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f44336",
        fontSize:13, textAlign:"center", maxWidth:300 }}>{error}</div>}

      <div style={{ width:"100%", maxWidth:320, marginBottom:16 }}>
        {rooms.map(r => (
          <div key={r.id} style={{ background:"#1a0d05", borderRadius:12, padding:"12px 16px",
            marginBottom:8, border:`1px solid ${r.full?"#333":"#D4531C44"}`,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ color:"white", fontWeight:800, margin:"0 0 2px", fontSize:14 }}>Phòng {r.id}</p>
              <p style={{ color:"#888", fontSize:11, margin:0 }}>{r.players}/{r.max} người</p>
            </div>
            <span style={{ color:r.full?"#666":"#4CAF50", fontSize:11, fontWeight:700 }}>
              {r.full?"ĐẦY":"TRỐNG"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background:"#1a0d05", borderRadius:12, padding:"14px 18px",
        marginBottom:20, width:"100%", maxWidth:320, border:"1px solid #2a2a38" }}>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, margin:"0 0 8px" }}>LUẬT CHƠI</p>
        {["🫧 Ăn trân châu để to ra và mở rộng tầm nhìn",
          "⚡ Tạt đầu đối thủ để tiêu diệt → +100đ",
          "🗺 Rắn to = tầm nhìn rộng hơn",
          "👆 Chạm 2 ngón tay để tăng tốc"].map((t,i)=>(
          <p key={i} style={{ color:"#aaa", fontSize:12, margin:"0 0 5px" }}>{t}</p>
        ))}
      </div>

      <button onClick={joinRoom} style={{ background:"#D4531C", border:"none", color:"white",
        borderRadius:14, padding:"16px", fontSize:16, fontWeight:900, cursor:"pointer",
        width:"100%", maxWidth:320 }}>🎮 Vào chiến ngay!</button>
      <button onClick={onExit} style={{ background:"none", border:"none", color:"#666",
        marginTop:14, fontSize:13, cursor:"pointer" }}>← Quay lại</button>
    </div>
  );

  if (phase === "dead") return (
    <div style={{ background:"#080504", minHeight:"100vh", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <p style={{ fontSize:48, margin:"0 0 12px" }}>💥</p>
      <h2 style={{ color:"white", fontSize:22, fontWeight:900, margin:"0 0 6px" }}>Bị tiêu diệt!</h2>
      {deathInfo?.killerName && <p style={{ color:"#D4531C", fontSize:13, margin:"0 0 20px" }}>
        Bởi <strong>{deathInfo.killerName}</strong></p>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24, width:"100%", maxWidth:280 }}>
        {[{label:"Kill",value:deathInfo?.kills||0,icon:"⚔️",color:"#D4531C"},
          {label:"Điểm",value:(deathInfo?.kills||0)*100,icon:"⭐",color:"#FFD700"},
          {label:"Dài",value:deathInfo?.length||0,icon:"📏",color:"#4CAF50"},
          {label:"Hạng",value:`#${deathInfo?.rank||"?"}`,icon:"🏆",color:"#9C27B0"}]
          .map((s,i)=>(
          <div key={i} style={{ background:"#1a0d05", borderRadius:12, padding:"14px",
            border:`1px solid ${s.color}33`, textAlign:"center" }}>
            <p style={{ fontSize:18, margin:"0 0 3px" }}>{s.icon}</p>
            <p style={{ color:s.color, fontSize:20, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
            <p style={{ color:"#666", fontSize:11, margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <button onClick={()=>{setPhase("lobby");setDeathInfo(null);setKills(0);setMyLength(0);}}
        style={{ background:"#D4531C", border:"none", color:"white", borderRadius:14,
          padding:"14px", fontSize:15, fontWeight:900, cursor:"pointer",
          marginBottom:10, width:"100%", maxWidth:280 }}>🔄 Chơi lại</button>
      <button onClick={onExit} style={{ background:"none", border:"1px solid #333", color:"#888",
        borderRadius:14, padding:"12px", fontSize:14, cursor:"pointer",
        width:"100%", maxWidth:280 }}>← Thoát</button>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"#080504", overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ display:"block", touchAction:"none" }}/>
      <div style={{ position:"absolute", top:10, left:10, right:10, display:"flex",
        justifyContent:"space-between", pointerEvents:"none" }}>
        <div style={{ background:"rgba(0,0,0,0.6)", borderRadius:10, padding:"8px 14px" }}>
          <p style={{ color:"#F0A030", fontSize:11, fontWeight:700, margin:"0 0 2px" }}>⚔️ Kill: {kills}</p>
          <p style={{ color:"#FFD700", fontSize:12, fontWeight:900, margin:0 }}>⭐ {kills*100}đ</p>
        </div>
        <div style={{ background:"rgba(0,0,0,0.6)", borderRadius:10, padding:"8px 14px", textAlign:"right" }}>
          <p style={{ color:"#4CAF50", fontSize:11, fontWeight:700, margin:"0 0 2px" }}>📏 Dài: {myLength}</p>
          <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
            {effects.map(e=>(
              <span key={e} style={{ background:(EC[e]||"#fff")+"33", color:EC[e]||"#fff",
                borderRadius:4, padding:"1px 5px", fontSize:10, fontWeight:800 }}>{EI[e]||e}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position:"absolute", top:65, right:10, background:"rgba(0,0,0,0.65)",
        borderRadius:10, padding:"8px 12px", minWidth:120, pointerEvents:"none" }}>
        <p style={{ color:"#D4531C", fontSize:10, fontWeight:800, margin:"0 0 5px" }}>TOP KILLS</p>
        {leaderboard.slice(0,5).map((p,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:6, marginBottom:2 }}>
            <span style={{ color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#888",
              fontSize:10, fontWeight:700 }}>
              {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`} {p.name?.slice(0,8)}
            </span>
            <span style={{ color:"white", fontSize:10, fontWeight:800 }}>{p.kills}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>{socketRef.current?.disconnect();onExit();}}
        style={{ position:"absolute", bottom:20, right:16, background:"rgba(0,0,0,0.6)",
          border:"1px solid #333", color:"#888", borderRadius:8, padding:"8px 14px",
          fontSize:12, cursor:"pointer" }}>✕ Thoát</button>
    </div>
  );
}
