import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api","") || "https://cing-backend-production.up.railway.app";
const CLIENT_SPEED = 4;
const CLIENT_BOOST = 8;
const MAP_SIZE = 4000;

export default function SnakeGame({ profile, onExit }) {
  const canvasRef   = useRef(null);
  const socketRef   = useRef(null);
  const stateRef    = useRef({ self:null, players:[], food:[], special:[], mapSize:MAP_SIZE });
  const animRef     = useRef(null);
  const deadRef     = useRef(false);
  const glowRef     = useRef(0);
  const localRef    = useRef({ angle:0, targetAngle:0, boosting:false });

  const [phase, setPhase]       = useState("lobby");
  const [rooms, setRooms]       = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [deathInfo, setDeathInfo] = useState(null);
  const [kills, setKills]       = useState(0);
  const [myLength, setMyLength] = useState(12);
  const [effects, setEffects]   = useState([]);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (socketRef.current) return;
    const sock = io(`${BACKEND_URL}/snake`, {
      transports:["websocket"],
      reconnection:true, reconnectionDelay:1500, reconnectionAttempts:10,
    });
    socketRef.current = sock;

    sock.on("connect",        ()   => sock.emit("game:rooms"));
    sock.on("game:rooms",     (d)  => setRooms(d));
    sock.on("game:joined",    ({roomId}) => { setPhase("playing"); deadRef.current=false; });
    sock.on("game:state",     (s)  => {
      stateRef.current = s;
      if (s.self) {
        setKills(s.self.kills);
        setMyLength(s.self.length);
        setEffects(Object.keys(s.self.effects||{}));
        // Sync server angle về local (chỉ khi lệch nhiều)
        const serverAngle = s.self.angle;
        let da = serverAngle - localRef.current.angle;
        while (da>Math.PI) da-=Math.PI*2;
        while (da<-Math.PI) da+=Math.PI*2;
        if (Math.abs(da) > 0.5) localRef.current.angle = serverAngle;
      }
    });
    sock.on("game:ate",       ({multiplier}) => { glowRef.current = multiplier >= 5 ? 1 : 0.6; });
    sock.on("game:leaderboard", (d) => setLeaderboard(d));
    sock.on("game:over",      (d)  => { deadRef.current=true; setDeathInfo(d); setPhase("dead"); });
    sock.on("game:error",     ({message}) => setError(message));
    sock.on("item:pickup",    ({itemType}) => { glowRef.current = 1; });

    return () => { sock.disconnect(); socketRef.current=null; };
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

  useEffect(() => {
    if (phase !== "playing") return;
    let cleanup;

    const init = () => {
      const canvas = canvasRef.current;
      if (!canvas) { setTimeout(init, 50); return; }

      const dpr = window.devicePixelRatio || 1;
      let W = window.innerWidth, H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      // Input handlers
      const getAngle = (cx, cy) => {
        const rect = canvas.getBoundingClientRect();
        return Math.atan2(cy - rect.top - H/2, cx - rect.left - W/2);
      };
      const onMove = (cx, cy) => {
        const a = getAngle(cx, cy);
        localRef.current.targetAngle = a;
        socketRef.current?.emit("game:direction", { angle:a });
      };
      const onTouch     = (e) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); };
      const onTouchStart= (e) => {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
        if (e.touches.length >= 2) { localRef.current.boosting=true; socketRef.current?.emit("game:boost",{active:true}); }
      };
      const onTouchEnd  = () => { localRef.current.boosting=false; socketRef.current?.emit("game:boost",{active:false}); };
      const onMouse     = (e) => onMove(e.clientX, e.clientY);
      canvas.addEventListener("touchmove",  onTouch,      {passive:false});
      canvas.addEventListener("touchstart", onTouchStart, {passive:false});
      canvas.addEventListener("touchend",   onTouchEnd);
      canvas.addEventListener("mousemove",  onMouse);

      // ── DRAW HELPERS ──────────────────────────────
      const drawPearl = (cx, cy, r, glow) => {
        if (r < 1) return;
        if (glow > 0.05) {
          const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r*2.8);
          g.addColorStop(0,`rgba(255,120,20,${glow*0.7})`);
          g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(cx,cy,r*2.8,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle="#3A1202"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r*.82,0,Math.PI*2); ctx.fillStyle="#7A3008"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r*.62,0,Math.PI*2); ctx.fillStyle="#B04810"; ctx.fill();
        const g2=ctx.createRadialGradient(cx-r*.15,cy-r*.15,0,cx,cy,r*.44);
        g2.addColorStop(0,"#E86820"); g2.addColorStop(1,"#C05010");
        ctx.beginPath(); ctx.arc(cx,cy,r*.44,0,Math.PI*2); ctx.fillStyle=g2; ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx-r*.14,cy-r*.17,r*.2,r*.14,-0.3,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,180,100,${0.7+glow*.3})`; ctx.fill();
      };

      const drawHead = (x, y, r, ang, isSelf, glow) => {
        ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
        if (glow>0.05) {
          const g=ctx.createRadialGradient(0,0,0,0,0,r*2.2);
          g.addColorStop(0,`rgba(255,100,20,${glow*.8})`); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(0,0,r*2.2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
        const hg=ctx.createRadialGradient(-r*.3,-r*.3,0,0,0,r);
        hg.addColorStop(0,"#FAA840"); hg.addColorStop(.45,"#E07018"); hg.addColorStop(1,"#903010");
        ctx.beginPath(); ctx.ellipse(0,0,r,r*.88,0,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
        [[-r*.28,-r*.26],[r*.28,-r*.26]].forEach(([ex,ey],i)=>{
          const er=r*(i===0?.36:.3);
          ctx.beginPath(); ctx.arc(ex,ey,er,0,Math.PI*2); ctx.fillStyle="white"; ctx.fill();
          ctx.beginPath(); ctx.arc(ex,ey,er*.75,0,Math.PI*2); ctx.fillStyle="#160800"; ctx.fill();
          const ig=ctx.createRadialGradient(ex,ey,0,ex,ey,er*.44);
          ig.addColorStop(0,"#E85010"); ig.addColorStop(1,"#600800");
          ctx.beginPath(); ctx.arc(ex,ey,er*.42,0,Math.PI*2); ctx.fillStyle=ig; ctx.fill();
          ctx.beginPath(); ctx.arc(ex,ey,er*.25,0,Math.PI*2); ctx.fillStyle="#050100"; ctx.fill();
          ctx.beginPath(); ctx.ellipse(ex+er*.2,ey-er*.26,er*.18,er*.13,-0.3,0,Math.PI*2);
          ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.fill();
        });
        ctx.strokeStyle="#EE0808"; ctx.lineWidth=2; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(0,r*.52); ctx.lineTo(0,r*.74); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,r*.74); ctx.lineTo(-r*.16,r*.92); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,r*.74); ctx.lineTo(r*.16,r*.92); ctx.stroke();
        ctx.restore();
      };

      const drawSnake = (player, isSelf, camX, camY, glow) => {
        const segs = player.segments;
        if (!segs?.length) return;
        const maxR = Math.min(6 + player.length*.15, 18);
        const minR = maxR*.28;
        for (let i=segs.length-1; i>=0; i--) {
          const frac = 1 - i/segs.length;
          const r = minR+(maxR-minR)*frac;
          const sx = segs[i].x-camX+W/2;
          const sy = segs[i].y-camY+H/2;
          if (sx<-r*4||sx>W+r*4||sy<-r*4||sy>H+r*4) continue;
          drawPearl(sx,sy,r, isSelf?glow:0);
        }
        const hx=segs[0].x-camX+W/2, hy=segs[0].y-camY+H/2;
        const ang = isSelf
          ? localRef.current.angle - Math.PI/2
          : (segs.length>1 ? Math.atan2(segs[0].y-segs[1].y,segs[0].x-segs[1].x)-Math.PI/2 : 0);
        drawHead(hx,hy,maxR*1.55,ang,isSelf,glow);
        // Name tag cho người khác
        if (!isSelf) {
          ctx.save();
          ctx.fillStyle="rgba(0,0,0,0.65)";
          const tw = Math.min(player.name.length*7+16, 100);
          if(ctx.roundRect){ctx.beginPath();ctx.roundRect(hx-tw/2,hy-maxR*2.2-16,tw,16,4);ctx.fill();}
          ctx.fillStyle="white"; ctx.font=`bold ${Math.max(maxR*.55,10)}px sans-serif`;
          ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillText(player.name.slice(0,12), hx, hy-maxR*2.2-8);
          ctx.restore();
        }
      };

      const SCOL = {x2:"#4080FF",x5:"#C040FF",x10:"#FFD700",magnet:"#40FFB0",shield:"#FFB830"};
      const SICO = {x2:"x2",x5:"x5",x10:"x10",magnet:"🧲",shield:"🛡"};
      const drawSpecial = (items, camX, camY) => {
        items.forEach(s => {
          const sx=s.x-camX+W/2, sy=s.y-camY+H/2;
          if (sx<-40||sx>W+40||sy<-40||sy>H+40) return;
          const r=20, col=SCOL[s.type]||"#fff";
          // Glow
          const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.2);
          g.addColorStop(0,col+"77"); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(sx,sy,r*2.2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
          // Circle
          ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fillStyle="#1a0d05"; ctx.fill();
          ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke();
          ctx.font=`bold ${r*.8}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillStyle=col; ctx.fillText(SICO[s.type]||"?",sx,sy);
        });
      };

      // ── CLIENT PREDICTION ─────────────────────────
      // Dự đoán vị trí head dựa trên input local, không chờ server
      const predictedSegments = { current: null };

      const updatePrediction = (serverSegs) => {
        if (!serverSegs?.length) return serverSegs;
        // Lerp targetAngle → angle
        let da = localRef.current.targetAngle - localRef.current.angle;
        while (da>Math.PI) da-=Math.PI*2;
        while (da<-Math.PI) da+=Math.PI*2;
        localRef.current.angle += Math.max(-0.15, Math.min(0.15, da));

        const spd = localRef.current.boosting ? CLIENT_BOOST : CLIENT_SPEED;
        const MAP = stateRef.current.mapSize || MAP_SIZE;
        const nx = ((serverSegs[0].x + Math.cos(localRef.current.angle)*spd) % MAP + MAP) % MAP;
        const ny = ((serverSegs[0].y + Math.sin(localRef.current.angle)*spd) % MAP + MAP) % MAP;
        return [{ x:nx, y:ny }, ...serverSegs.slice(0, 120)];
      };

      // ── MINI MAP ──────────────────────────────────
      const drawMinimap = (self, players, MAP) => {
        const mx=W-70, my=H-70, ms=60;
        ctx.save();
        ctx.fillStyle="rgba(0,0,0,0.5)";
        ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.rect(mx,my,ms,ms); ctx.fill(); ctx.stroke();
        const scale = ms/MAP;
        // Self
        ctx.fillStyle="#D4531C";
        ctx.beginPath(); ctx.arc(mx+self.segments[0].x*scale, my+self.segments[0].y*scale, 3, 0, Math.PI*2); ctx.fill();
        // Others
        players.forEach(p => {
          ctx.fillStyle="#8040FF";
          ctx.beginPath(); ctx.arc(mx+p.segments[0].x*scale, my+p.segments[0].y*scale, 2, 0, Math.PI*2); ctx.fill();
        });
        // Food dots
        ctx.fillStyle="rgba(200,80,16,0.5)";
        stateRef.current.food?.slice(0,50).forEach(f => {
          ctx.beginPath(); ctx.arc(mx+f.x*scale, my+f.y*scale, 1, 0, Math.PI*2); ctx.fill();
        });
        ctx.restore();
      };

      // ── GAME LOOP ─────────────────────────────────
      const frame = () => {
        if (deadRef.current) return;
        const state = stateRef.current;
        const self  = state.self;

        ctx.fillStyle="#080504"; ctx.fillRect(0,0,W,H);

        const MAP = state.mapSize || MAP_SIZE;
        let camX = self?.segments?.[0]?.x ?? W/2;
        let camY = self?.segments?.[0]?.y ?? H/2;

        // Grid — infinite tiling
        ctx.strokeStyle="rgba(255,100,20,0.05)"; ctx.lineWidth=0.5;
        const gs=80;
        const ox=((-camX%gs+W/2)%gs+gs)%gs;
        const oy=((-camY%gs+H/2)%gs+gs)%gs;
        for(let x=ox-gs;x<W+gs;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
        for(let y=oy-gs;y<H+gs;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

        // Map border
        const bx1=W/2-camX, by1=H/2-camY;
        const bx2=bx1+MAP, by2=by1+MAP;
        ctx.strokeStyle="rgba(212,83,28,0.4)"; ctx.lineWidth=3;
        ctx.strokeRect(bx1,by1,MAP,MAP);
        // Danger zone nếu gần border
        if (self) {
          const distToEdge = Math.min(self.segments[0].x, MAP-self.segments[0].x,
                                       self.segments[0].y, MAP-self.segments[0].y);
          if (distToEdge < 200) {
            ctx.fillStyle=`rgba(255,0,0,${0.15*(1-distToEdge/200)})`;
            ctx.fillRect(0,0,W,H);
          }
        }

        // Draw food
        state.food?.forEach(f => {
          const fx=f.x-camX+W/2, fy=f.y-camY+H/2;
          if (fx<-20||fx>W+20||fy<-20||fy>H+20) return;
          const r=f.size||5;
          ctx.beginPath(); ctx.arc(fx,fy,r,0,Math.PI*2); ctx.fillStyle="#3A1202"; ctx.fill();
          ctx.beginPath(); ctx.arc(fx,fy,r*.65,0,Math.PI*2); ctx.fillStyle=f.color||"#C85010"; ctx.fill();
          ctx.beginPath(); ctx.ellipse(fx-r*.18,fy-r*.18,r*.22,r*.16,-0.3,0,Math.PI*2);
          ctx.fillStyle="rgba(255,180,100,0.65)"; ctx.fill();
        });

        // Draw special items
        drawSpecial(state.special||[], camX, camY);

        // Glow decay
        if (glowRef.current>0) glowRef.current=Math.max(0,glowRef.current-0.015);

        // Draw other players
        state.players?.forEach(p => {
          if (p.id!==self?.id) drawSnake(p,false,camX,camY,0);
        });

        // Draw self với predicted position
        if (self) {
          const predicted = updatePrediction(self.segments);
          const displaySelf = { ...self, segments:predicted };
          // Update camX/camY theo predicted head
          if (predicted?.length) {
            camX = predicted[0].x;
            camY = predicted[0].y;
          }
          drawSnake(displaySelf,true,camX,camY,glowRef.current);
        }

        // Minimap
        if (self) drawMinimap(self, state.players||[], MAP);

        animRef.current = requestAnimationFrame(frame);
      };

      animRef.current = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(animRef.current);
        canvas.removeEventListener("touchmove",  onTouch);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchend",   onTouchEnd);
        canvas.removeEventListener("mousemove",  onMouse);
      };
    };

    init();
    return () => cleanup?.();
  }, [phase]);

  const EC={x2:"#4080FF",x5:"#C040FF",x10:"#FFD700",magnet:"#40FFB0",shield:"#FFB830"};
  const EI={x2:"✖2",x5:"✖5",x10:"✖10",magnet:"🧲",shield:"🛡"};

  if (phase==="lobby") return (
    <div style={{background:"#080504",minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <p style={{fontSize:44,margin:"0 0 8px"}}>🧋</p>
      <h1 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 4px"}}>TRÂN CHÂU ĐẠI CHIẾN</h1>
      <p style={{color:"#888",fontSize:12,margin:"0 0 24px"}}>PvP realtime · Tiêu diệt · Leo rank</p>
      {error&&<div style={{background:"rgba(244,67,54,.15)",border:"1px solid #f44336",borderRadius:10,
        padding:"12px 16px",marginBottom:14,color:"#f44336",fontSize:13,textAlign:"center",maxWidth:300}}>{error}</div>}
      <div style={{width:"100%",maxWidth:320,marginBottom:14}}>
        {rooms.map(r=>(
          <div key={r.id} style={{background:"#1a0d05",borderRadius:12,padding:"12px 16px",marginBottom:8,
            border:`1px solid ${r.full?"#333":"#D4531C44"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{color:"white",fontWeight:800,margin:"0 0 2px",fontSize:14}}>Phòng {r.id}</p>
              <p style={{color:"#888",fontSize:11,margin:0}}>{r.players}/{r.max} người</p>
            </div>
            <span style={{color:r.full?"#666":"#4CAF50",fontSize:11,fontWeight:700}}>{r.full?"ĐẦY":"TRỐNG"}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#1a0d05",borderRadius:12,padding:"12px 16px",marginBottom:18,
        width:"100%",maxWidth:320,border:"1px solid #2a2a38"}}>
        <p style={{color:"#888",fontSize:11,fontWeight:700,margin:"0 0 8px"}}>LUẬT CHƠI</p>
        {["🫧 Ăn trân châu để to ra, tầm nhìn rộng hơn",
          "⚡ Tạt đầu đối thủ → +100 điểm leaderboard",
          "✖ Ăn x2/x5/x10 để nhân điểm thức ăn",
          "🧲 Nam châm tự hút thức ăn xung quanh",
          "🛡 Giáp bảo vệ khỏi bị tạt đầu",
          "👆 Chạm 2 ngón tay để tăng tốc"].map((t,i)=>(
          <p key={i} style={{color:"#aaa",fontSize:11,margin:"0 0 4px"}}>{t}</p>
        ))}
      </div>
      <button onClick={joinRoom} style={{background:"#D4531C",border:"none",color:"white",
        borderRadius:14,padding:"16px",fontSize:16,fontWeight:900,cursor:"pointer",
        width:"100%",maxWidth:320}}>🎮 Vào chiến ngay!</button>
      <button onClick={onExit} style={{background:"none",border:"none",color:"#666",
        marginTop:12,fontSize:13,cursor:"pointer"}}>← Quay lại</button>
    </div>
  );

  if (phase==="dead") return (
    <div style={{background:"#080504",minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <p style={{fontSize:48,margin:"0 0 12px"}}>💥</p>
      <h2 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 6px"}}>Bị tiêu diệt!</h2>
      {deathInfo?.killerName&&<p style={{color:"#D4531C",fontSize:13,margin:"0 0 18px"}}>
        Bởi <strong>{deathInfo.killerName}</strong></p>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22,width:"100%",maxWidth:280}}>
        {[{label:"Kill",value:deathInfo?.kills||0,icon:"⚔️",color:"#D4531C"},
          {label:"Điểm",value:(deathInfo?.kills||0)*100,icon:"⭐",color:"#FFD700"},
          {label:"Dài",value:deathInfo?.length||0,icon:"📏",color:"#4CAF50"},
          {label:"Hạng",value:`#${deathInfo?.rank||"?"}`,icon:"🏆",color:"#9C27B0"}].map((s,i)=>(
          <div key={i} style={{background:"#1a0d05",borderRadius:12,padding:"14px",
            border:`1px solid ${s.color}33`,textAlign:"center"}}>
            <p style={{fontSize:18,margin:"0 0 3px"}}>{s.icon}</p>
            <p style={{color:s.color,fontSize:20,fontWeight:900,margin:"0 0 2px"}}>{s.value}</p>
            <p style={{color:"#666",fontSize:11,margin:0}}>{s.label}</p>
          </div>
        ))}
      </div>
      <button onClick={()=>{setPhase("lobby");setDeathInfo(null);setKills(0);setMyLength(12);}}
        style={{background:"#D4531C",border:"none",color:"white",borderRadius:14,padding:"14px",
          fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10,width:"100%",maxWidth:280}}>
        🔄 Chơi lại</button>
      <button onClick={onExit} style={{background:"none",border:"1px solid #333",color:"#888",
        borderRadius:14,padding:"12px",fontSize:14,cursor:"pointer",width:"100%",maxWidth:280}}>
        ← Thoát</button>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"#080504",overflow:"hidden"}}>
      <canvas ref={canvasRef} style={{display:"block",touchAction:"none"}}/>
      {/* HUD */}
      <div style={{position:"absolute",top:10,left:10,right:10,display:"flex",
        justifyContent:"space-between",pointerEvents:"none"}}>
        <div style={{background:"rgba(0,0,0,0.65)",borderRadius:10,padding:"8px 14px"}}>
          <p style={{color:"#F0A030",fontSize:11,fontWeight:700,margin:"0 0 2px"}}>⚔️ Kill: {kills}</p>
          <p style={{color:"#FFD700",fontSize:12,fontWeight:900,margin:0}}>⭐ {kills*100}đ</p>
        </div>
        <div style={{background:"rgba(0,0,0,0.65)",borderRadius:10,padding:"8px 14px",textAlign:"right"}}>
          <p style={{color:"#4CAF50",fontSize:11,fontWeight:700,margin:"0 0 2px"}}>📏 {myLength}</p>
          <div style={{display:"flex",gap:3,justifyContent:"flex-end",flexWrap:"wrap"}}>
            {effects.map(e=>(
              <span key={e} style={{background:(EC[e]||"#fff")+"33",color:EC[e]||"#fff",
                borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:800}}>{EI[e]||e}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Leaderboard */}
      <div style={{position:"absolute",top:60,right:10,background:"rgba(0,0,0,0.65)",
        borderRadius:10,padding:"8px 12px",minWidth:120,pointerEvents:"none"}}>
        <p style={{color:"#D4531C",fontSize:10,fontWeight:800,margin:"0 0 5px"}}>TOP KILLS</p>
        {leaderboard.slice(0,5).map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:2}}>
            <span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#888",
              fontSize:10,fontWeight:700}}>
              {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`} {p.name?.slice(0,8)}
            </span>
            <span style={{color:"white",fontSize:10,fontWeight:800}}>{p.kills}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>{socketRef.current?.disconnect();socketRef.current=null;onExit();}}
        style={{position:"absolute",bottom:20,right:16,background:"rgba(0,0,0,0.6)",
          border:"1px solid #333",color:"#888",borderRadius:8,padding:"8px 14px",
          fontSize:12,cursor:"pointer"}}>✕ Thoát</button>
    </div>
  );
}
