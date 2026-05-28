import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND     = import.meta.env.VITE_API_BASE_URL?.replace("/api","") || "https://cing-backend-production.up.railway.app";
const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || BACKEND; // Fallback về Railway nếu chưa có
// Linear interpolation helper
const lerp = (a, b, t) => a + (b - a) * t;
const lerpSeg = (s1, s2, t) => {
  if (!s1 || !s2) return s2 || s1;
  return { x: lerp(s1.x, s2.x, t), y: lerp(s1.y, s2.y, t) };
};
const lerpSnake = (prev, curr, t) => {
  if (!prev?.segments || !curr?.segments) return curr;
  const len = Math.min(prev.segments.length, curr.segments.length);
  return {
    ...curr,
    segments: curr.segments.map((s, i) =>
      i < len && prev.segments[i] ? lerpSeg(prev.segments[i], s, t) : s
    )
  };
};

const MAP_SIZE  = 4000;
const MAP_R     = 1800;
const MAP_CX    = MAP_SIZE / 2;
const MAP_CY    = MAP_SIZE / 2;
const CLI_SPD   = 4;
const CLI_BOOST = 8;


// ── ADAPTIVE QUALITY SYSTEM ──
const detectQuality = () => {
  const mem = navigator.deviceMemory || 4; // GB RAM
  const cores = navigator.hardwareConcurrency || 4;
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad/.test(ua);
  
  // High-end: RAM >= 4GB hoặc cores >= 6
  if (mem >= 4 || cores >= 6) return 'high';
  // Mid: RAM >= 2GB
  if (mem >= 2 || cores >= 4) return 'medium';
  return 'low';
};

const QUALITY_PRESETS = {
  high: {
    label: '🔥 Cao',
    targetFPS: 60,
    glowEffect: true,
    pearlShine: true,
    gridDots: true,
    shadowBlur: true,
    otherPlayersDetail: true,
    foodGlow: true,
    particleEffects: true,
    renderDistance: 1.0,
  },
  medium: {
    label: '⚡ Trung bình',
    targetFPS: 45,
    glowEffect: true,
    pearlShine: false,
    gridDots: true,
    shadowBlur: false,
    otherPlayersDetail: true,
    foodGlow: false,
    particleEffects: false,
    renderDistance: 0.85,
  },
  low: {
    label: '🔋 Tiết kiệm',
    targetFPS: 30,
    glowEffect: false,
    pearlShine: false,
    gridDots: false,
    shadowBlur: false,
    otherPlayersDetail: false,
    foodGlow: false,
    particleEffects: false,
    renderDistance: 0.7,
  },
};

export default function SnakeGame({ profile, onExit }) {
  const cvRef    = useRef(null);
  const sockRef  = useRef(null);
  const stRef    = useRef({ self:null, players:[], food:[], special:[], mapSize:MAP_SIZE });
  const prevRef  = useRef(null);  // state trước
  const lerpRef  = useRef(0);     // interpolation progress 0-1
  const lastTickRef = useRef(Date.now()); // thời điểm nhận state mới nhất
  const animRef  = useRef(null);
  const deadRef  = useRef(false);
  const glowRef  = useRef(0);
  const loc      = useRef({ angle:0, target:0, boosting:false, touching:false });
  const joyRef   = useRef({ active:false, ox:0, oy:0, dx:0, dy:0 }); // joystick

  const [phase, setPhase]     = useState("lobby");
  const [rooms, setRooms]     = useState([]);
  const [lb, setLb]           = useState([]);
  const [death, setDeath]     = useState(null);
  const [kills, setKills]     = useState(0);
  const [len, setLen]         = useState(12);
  const [efx, setEfx]         = useState([]);
  const [err, setErr]         = useState("");

  // ── SOCKET ──────────────────────────────────────
  useEffect(() => {
    if (sockRef.current) return;
    const s = io(`${GAME_SERVER}/snake`, { transports:["websocket"],
      reconnection:true, reconnectionDelay:1500, reconnectionAttempts:10 });
    sockRef.current = s;
    s.on("connect",           ()  => s.emit("game:rooms"));
    s.on("game:rooms",        (d) => setRooms(d));
    s.on("game:joined",       ()  => { setPhase("playing"); deadRef.current=false; });
    s.on("game:state",        (d) => {
      stRef.current = d;
      if (d.self) {
        setKills(d.self.kills);
        setLen(d.self.length);
        setEfx(Object.keys(d.self.effects||{}));
        // Sync angle nếu lệch nhiều
        let da = d.self.angle - loc.current.angle;
        while(da>Math.PI) da-=Math.PI*2;
        while(da<-Math.PI) da+=Math.PI*2;
        if (Math.abs(da) > 0.6) loc.current.angle = d.self.angle;
      }
    });
    s.on("game:ate",          ({multiplier}) => { glowRef.current = multiplier>=5?1:0.65; });
    s.on("item:pickup",       () => { glowRef.current = 1; });
    s.on("game:leaderboard",  (d) => setLb(d));
    s.on("game:over",         (d) => { deadRef.current=true; setDeath(d); setPhase("dead"); });
    s.on("game:border_death", (d) => { deadRef.current=true; setDeath({...d,killerName:"Đường viền"}); setPhase("dead"); });
    s.on("game:error",        ({message}) => setErr(message));
    return () => { s.disconnect(); sockRef.current=null; };
  }, []);

  const join = useCallback(() => {
    if (!sockRef.current||!profile) return;
    setErr("");
    sockRef.current.emit("game:join", {
      userId: profile.id||profile.phone,
      name:   profile.name||profile.zalo_name||"Cing iu",
      avatar: profile.avatar||"",
    });
  }, [profile]);

  // ── GAME LOOP ────────────────────────────────────
  useEffect(() => {
    if (phase!=="playing") return;
    let cleanup = null;

    const init = () => {
      const cv = cvRef.current;
      if (!cv) { setTimeout(init,50); return; }

      const dpr = window.devicePixelRatio||1;
      const W = window.innerWidth, H = window.innerHeight;
      cv.width  = W*dpr; cv.height = H*dpr;
      cv.style.width=W+"px"; cv.style.height=H+"px";
      const ctx = cv.getContext("2d");
      ctx.scale(dpr,dpr);

      // ── JOYSTICK INPUT ──
      const joy = joyRef.current;
      // Joystick - track finger index riêng cho steer và boost
      let joyFingerId = -1;

      const onTS = (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          if (joyFingerId === -1) {
            // Ngón đầu tiên = joystick
            joyFingerId = t.identifier;
            joy.active = true;
            joy.ox = t.clientX; joy.oy = t.clientY;
            joy.dx = 0; joy.dy = 0;
          } else {
            // Ngón thứ 2 = boost
            loc.current.boosting = true;
            sockRef.current?.emit("game:boost",{active:true});
          }
        }
      };
      const onTM = (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          if (t.identifier === joyFingerId && joy.active) {
            const dx = t.clientX - joy.ox;
            const dy = t.clientY - joy.oy;
            joy.dx = dx; joy.dy = dy;
            const dist = Math.sqrt(dx*dx+dy*dy);
            if (dist > 6) {
              const a = Math.atan2(dy, dx);
              loc.current.target = a;
              sockRef.current?.emit("game:direction",{angle:a});
            }
          }
        }
      };
      const onTE = (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          if (t.identifier === joyFingerId) {
            joyFingerId = -1;
            joy.active = false; joy.dx=0; joy.dy=0;
          } else {
            loc.current.boosting = false;
            sockRef.current?.emit("game:boost",{active:false});
          }
        }
      };
      // Desktop mouse joystick
      let md = false;
      const onMD = (e) => { md=true; joy.active=true; joy.ox=e.clientX; joy.oy=e.clientY; };
      const onMM = (e) => {
        if (!md || !joy.active) return;
        const dx=e.clientX-joy.ox, dy=e.clientY-joy.oy;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist>8){ joy.dx=dx; joy.dy=dy; const a=Math.atan2(dy,dx); loc.current.target=a; sockRef.current?.emit("game:direction",{angle:a}); }
      };
      const onMU = () => { md=false; joy.active=false; joy.dx=0; joy.dy=0; };
      cv.addEventListener("touchmove",  onTM, {passive:false});
      cv.addEventListener("touchstart", onTS, {passive:false});
      cv.addEventListener("touchend",   onTE);
      cv.addEventListener("mousedown",  onMD);
      cv.addEventListener("mousemove",  onMM);
      cv.addEventListener("mouseup",    onMU);

      // ── DRAW HELPERS ──
      const drawPearl = (cx,cy,r,glow) => {
        if(r<1) return;
        if(glow>0.05){
          const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r*3);
          g.addColorStop(0,`rgba(255,120,20,${glow*.65})`);
          g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(cx,cy,r*3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle="#3A1202"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r*.83,0,Math.PI*2); ctx.fillStyle="#7A3008"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r*.63,0,Math.PI*2); ctx.fillStyle="#B04810"; ctx.fill();
        const g2=ctx.createRadialGradient(cx-r*.14,cy-r*.14,0,cx,cy,r*.45);
        g2.addColorStop(0,"#E86820"); g2.addColorStop(1,"#C05010");
        ctx.beginPath(); ctx.arc(cx,cy,r*.45,0,Math.PI*2); ctx.fillStyle=g2; ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx-r*.13,cy-r*.16,r*.19,r*.13,-0.3,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,180,100,${.65+glow*.35})`; ctx.fill();
      };

      const drawHead = (x,y,r,ang,isSelf,glow) => {
        ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
        if(glow>0.05 && qualityRef.current.glowEffect){
          const g=ctx.createRadialGradient(0,0,0,0,0,r*2.5);
          g.addColorStop(0,`rgba(255,110,20,${glow*.85})`); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(0,0,r*2.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
        const hg=ctx.createRadialGradient(-r*.3,-r*.3,0,0,0,r);
        hg.addColorStop(0,"#FAA840"); hg.addColorStop(.45,"#E07018"); hg.addColorStop(1,"#903010");
        ctx.beginPath(); ctx.ellipse(0,0,r,r*.88,0,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
        [[-r*.28,-r*.26],[r*.28,-r*.26]].forEach(([ex,ey],i)=>{
          const er=r*(i===0?.36:.3);
          ctx.beginPath(); ctx.arc(ex,ey,er,0,Math.PI*2); ctx.fillStyle="white"; ctx.fill();
          ctx.beginPath(); ctx.arc(ex,ey,er*.76,0,Math.PI*2); ctx.fillStyle="#160800"; ctx.fill();
          const ig=ctx.createRadialGradient(ex,ey,0,ex,ey,er*.44);
          ig.addColorStop(0,"#E85010"); ig.addColorStop(1,"#600800");
          ctx.beginPath(); ctx.arc(ex,ey,er*.43,0,Math.PI*2); ctx.fillStyle=ig; ctx.fill();
          ctx.beginPath(); ctx.arc(ex,ey,er*.25,0,Math.PI*2); ctx.fillStyle="#050100"; ctx.fill();
          ctx.beginPath(); ctx.ellipse(ex+er*.2,ey-er*.26,er*.18,er*.13,-0.3,0,Math.PI*2);
          ctx.fillStyle="rgba(255,255,255,.95)"; ctx.fill();
        });
        ctx.strokeStyle="#EE0808"; ctx.lineWidth=2; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(0,r*.52); ctx.lineTo(0,r*.75); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,r*.75); ctx.lineTo(-r*.16,r*.93); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,r*.75); ctx.lineTo( r*.16,r*.93); ctx.stroke();
        ctx.restore();
      };

      const drawSnake = (player,isSelf,camX,camY,glow) => {
        const segs=player.segments;
        if(!segs?.length) return;
        const maxR=Math.min(6+player.length*.15,18), minR=maxR*.28;
        for(let i=segs.length-1;i>=0;i--){
          const frac=1-i/segs.length;
          const r=minR+(maxR-minR)*frac;
          const sx=segs[i].x-camX+W/2, sy=segs[i].y-camY+H/2;
          if(sx<-r*4||sx>W+r*4||sy<-r*4||sy>H+r*4) continue;
          drawPearl(sx,sy,r,isSelf?glow:0);
        }
        const hx=segs[0].x-camX+W/2, hy=segs[0].y-camY+H/2;
        // Dùng segment direction cho cả self để đầu đồng bộ với thân
        const ang = segs.length>1
          ? Math.atan2(segs[0].y-segs[1].y, segs[0].x-segs[1].x) - Math.PI/2
          : loc.current.angle - Math.PI/2;
        drawHead(hx,hy,maxR*1.55,ang,isSelf,glow);
        // Hiển thị tên cho tất cả (self và others)
        ctx.save();
        const nm = player.name?.slice(0,12) || "";
        if (nm) {
          const fontSize = Math.max(maxR*.55, 9);
          ctx.font = `bold ${fontSize}px sans-serif`;
          const tw = ctx.measureText(nm).width + 12;
          // Background
          ctx.fillStyle = isSelf ? "rgba(212,83,28,0.75)" : "rgba(0,0,0,0.65)";
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(hx-tw/2, hy-maxR*2.5-fontSize-2, tw, fontSize+6, 3);
            ctx.fill();
          }
          // Text
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(nm, hx, hy-maxR*2.5-fontSize/2+1);
        }
        ctx.restore();
      };

      const SCOL={x2:"#4080FF",x5:"#C040FF",x10:"#FFD700",magnet:"#40FFB0",shield:"#FFB830"};
      const SICO={x2:"x2",x5:"x5",x10:"x10",magnet:"🧲",shield:"🛡"};
      const drawSpecial=(items,camX,camY,t)=>{
        items.forEach(s=>{
          const sx=s.x-camX+W/2, sy=s.y-camY+H/2;
          if(sx<-50||sx>W+50||sy<-50||sy>H+50) return;
          const r=20+Math.sin(t*3)*2, col=SCOL[s.type]||"#fff";
          const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.5);
          g.addColorStop(0,col+"88"); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(sx,sy,r*2.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
          ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fillStyle="#1a0d05"; ctx.fill();
          ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke();
          ctx.font=`bold ${r*.8}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillStyle=col; ctx.fillText(SICO[s.type]||"?",sx,sy);
        });
      };

      const drawMinimap=(self,players)=>{
        const ms=64, mx=12, my=H-ms-90; // góc dưới trái, tránh navbar
        const cx2=mx+ms/2, cy2=my+ms/2, mr=ms/2-2;
        const sc=mr/MAP_R;
        ctx.save();
        // Shadow
        ctx.shadowColor="rgba(0,0,0,0.5)"; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(cx2,cy2,mr+2,0,Math.PI*2);
        ctx.fillStyle="rgba(0,0,0,0.75)"; ctx.fill();
        ctx.shadowBlur=0;
        // Clip tròn
        ctx.beginPath(); ctx.arc(cx2,cy2,mr,0,Math.PI*2); ctx.clip();
        // Background
        ctx.fillStyle="#0a0604"; ctx.fillRect(mx,my,ms,ms);
        // Map border trong minimap
        ctx.beginPath(); ctx.arc(cx2,cy2,mr,0,Math.PI*2);
        ctx.strokeStyle="rgba(212,83,28,0.5)"; ctx.lineWidth=1; ctx.stroke();
        // Food dots
        ctx.fillStyle="rgba(200,80,16,0.6)";
        stRef.current.food?.forEach(f=>{
          const fx2=cx2+(f.x-MAP_CX)*sc, fy2=cy2+(f.y-MAP_CY)*sc;
          ctx.beginPath(); ctx.arc(fx2,fy2,0.7,0,Math.PI*2); ctx.fill();
        });
        // Special items
        stRef.current.special?.forEach(s=>{
          const sx2=cx2+(s.x-MAP_CX)*sc, sy2=cy2+(s.y-MAP_CY)*sc;
          ctx.beginPath(); ctx.arc(sx2,sy2,2,0,Math.PI*2);
          ctx.fillStyle="#FFD700"; ctx.fill();
        });
        // Other players
        players.forEach(p=>{
          if(!p.segments?.[0]) return;
          ctx.beginPath();
          ctx.arc(cx2+(p.segments[0].x-MAP_CX)*sc, cy2+(p.segments[0].y-MAP_CY)*sc, 2.5,0,Math.PI*2);
          ctx.fillStyle="#8040FF"; ctx.fill();
        });
        // Self - tam giác chỉ hướng
        const sx3=cx2+(self.segments[0].x-MAP_CX)*sc;
        const sy3=cy2+(self.segments[0].y-MAP_CY)*sc;
        const sa3=loc.current.angle;
        ctx.save(); ctx.translate(sx3,sy3); ctx.rotate(sa3);
        ctx.beginPath(); ctx.moveTo(5,0); ctx.lineTo(-3,-3); ctx.lineTo(-3,3); ctx.closePath();
        ctx.fillStyle="#D4531C"; ctx.fill();
        ctx.restore();
        ctx.restore();
        // Viền ngoài minimap
        ctx.beginPath(); ctx.arc(cx2,cy2,mr+2,0,Math.PI*2);
        ctx.strokeStyle="rgba(212,83,28,0.4)"; ctx.lineWidth=1.5; ctx.stroke();
      };

      // ── CLIENT PREDICTION ──
      const predict = (segs) => {
        if(!segs?.length) return segs;
        let da=loc.current.target-loc.current.angle;
        while(da>Math.PI) da-=Math.PI*2;
        while(da<-Math.PI) da+=Math.PI*2;
        // Smooth turn với exponential - không giật
        let da2 = loc.current.target - loc.current.angle;
        while(da2>Math.PI) da2-=Math.PI*2;
        while(da2<-Math.PI) da2+=Math.PI*2;
        loc.current.angle += da2 * 0.18; // exponential smooth, không hard limit
        const spd=loc.current.boosting?CLI_BOOST:CLI_SPD;
        const nx=segs[0].x+Math.cos(loc.current.angle)*spd;
        const ny=segs[0].y+Math.sin(loc.current.angle)*spd;
        return [{x:nx,y:ny},...segs.slice(0,130)];
      };

      let t=0;
      const frame=()=>{
        if(deadRef.current) return;
        t+=0.016;
        const st=stRef.current;
        const self=st.self;

        ctx.fillStyle="#080504"; ctx.fillRect(0,0,W,H);

        let camX=self?.segments?.[0]?.x??MAP_CX;
        let camY=self?.segments?.[0]?.y??MAP_CY;

        // ── MAP TRÒN ──
        const bx=W/2-camX+MAP_CX, by=H/2-camY+MAP_CY;

        // Vùng ngoài tối
        ctx.save();
        ctx.beginPath(); ctx.rect(0,0,W,H);
        ctx.arc(bx,by,MAP_R,0,Math.PI*2,true);
        ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fill();
        ctx.restore();

        // Grid dots - chỉ render khi quality cho phép
        if (qualityRef.current.gridDots) ctx.fillStyle="rgba(255,100,20,.07)";
        if (!qualityRef.current.gridDots) { /* skip grid */ } else
        ctx.fillStyle="rgba(255,100,20,.07)";
        const gs=80;
        const ox2=((-camX%gs+W/2+MAP_CX)%gs+gs)%gs;
        const oy2=((-camY%gs+H/2+MAP_CY)%gs+gs)%gs;
        for(let x=ox2-gs;x<W+gs;x+=gs)
          for(let y=oy2-gs;y<H+gs;y+=gs){
            // Chỉ vẽ trong circle
            const dx=x-bx, dy=y-by;
            if(dx*dx+dy*dy<MAP_R*MAP_R){
              ctx.beginPath(); ctx.arc(x,y,1.2,0,Math.PI*2); ctx.fill();
            }
          }

        // Viền tròn glow
        const glowPulse=0.5+Math.sin(t*2)*.15;
        ctx.beginPath(); ctx.arc(bx,by,MAP_R,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,80,20,${glowPulse*.25})`; ctx.lineWidth=25; ctx.stroke();
        ctx.beginPath(); ctx.arc(bx,by,MAP_R,0,Math.PI*2);
        ctx.strokeStyle=`rgba(212,83,28,.8)`; ctx.lineWidth=3.5; ctx.stroke();

        // Danger zone
        if(self?.segments?.[0]){
          const dx2=self.segments[0].x-MAP_CX, dy2=self.segments[0].y-MAP_CY;
          const distToEdge=MAP_R-Math.sqrt(dx2*dx2+dy2*dy2);
          if(distToEdge<250){
            ctx.fillStyle=`rgba(255,0,0,${.18*(1-distToEdge/250)})`;
            ctx.fillRect(0,0,W,H);
          }
        }

        // Food
        st.food?.forEach(f=>{
          const fx=f.x-camX+W/2, fy=f.y-camY+H/2;
          if(fx<-20||fx>W+20||fy<-20||fy>H+20) return;
          const r=f.size||5;
          ctx.beginPath(); ctx.arc(fx,fy,r,0,Math.PI*2); ctx.fillStyle="#3A1202"; ctx.fill();
          ctx.beginPath(); ctx.arc(fx,fy,r*.65,0,Math.PI*2); ctx.fillStyle=f.color||"#C85010"; ctx.fill();
          ctx.beginPath(); ctx.ellipse(fx-r*.16,fy-r*.16,r*.2,r*.14,-0.3,0,Math.PI*2);
          ctx.fillStyle="rgba(255,180,100,.65)"; ctx.fill();
        });

        drawSpecial(st.special||[],camX,camY,t);

        if(glowRef.current>0) glowRef.current=Math.max(0,glowRef.current-.012);

        // Other players
        st.players?.forEach(p=>{ if(p.id!==self?.id) drawSnake(p,false,camX,camY,0); });

        // Self với prediction
        if(self){
          const pred=predict(self.segments);
          if(pred?.length){ camX=pred[0].x; camY=pred[0].y; }
          drawSnake({...self,segments:pred},true,camX,camY,glowRef.current);
        }

        // Vẽ joystick
        const joy2 = joyRef.current;
        if (joy2.active) {
          const jx=joy2.ox, jy=joy2.oy;
          const maxR2=50;
          const dx2=Math.max(-maxR2,Math.min(maxR2,joy2.dx));
          const dy2=Math.max(-maxR2,Math.min(maxR2,joy2.dy));
          // Base
          ctx.beginPath(); ctx.arc(jx,jy,maxR2,0,Math.PI*2);
          ctx.fillStyle="rgba(255,255,255,0.08)"; ctx.fill();
          ctx.strokeStyle="rgba(255,255,255,0.25)"; ctx.lineWidth=2; ctx.stroke();
          // Knob
          ctx.beginPath(); ctx.arc(jx+dx2,jy+dy2,20,0,Math.PI*2);
          ctx.fillStyle="rgba(212,83,28,0.7)"; ctx.fill();
          ctx.strokeStyle="rgba(255,120,50,0.9)"; ctx.lineWidth=2.5; ctx.stroke();
        }

        if(self) drawMinimap(self,st.players||[]);

        animRef.current=requestAnimationFrame(frame);
      };
      animRef.current=requestAnimationFrame(frame);

      cleanup=()=>{
        cancelAnimationFrame(animRef.current);
        cv.removeEventListener("touchmove",  onTM);
        cv.removeEventListener("touchstart", onTS);
        cv.removeEventListener("touchend",   onTE);
        cv.removeEventListener("mousedown",  onMD);
        cv.removeEventListener("mousemove",  onMM);
        cv.removeEventListener("mouseup",    onMU);
      };
    };
    init();
    return ()=>cleanup?.();
  },[phase]);

  const EC={x2:"#4080FF",x5:"#C040FF",x10:"#FFD700",magnet:"#40FFB0",shield:"#FFB830"};
  const EI={x2:"✖2",x5:"✖5",x10:"✖10",magnet:"🧲",shield:"🛡"};

  if(phase==="lobby") return(
    <div style={{background:"#080504",minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <p style={{fontSize:44,margin:"0 0 6px"}}>🧋</p>
      <h1 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 4px"}}>TRÂN CHÂU ĐẠI CHIẾN</h1>
      <p style={{color:"#888",fontSize:12,margin:"0 0 22px"}}>PvP realtime · Tiêu diệt · Leo rank</p>
      {err&&<div style={{background:"rgba(244,67,54,.15)",border:"1px solid #f44336",borderRadius:10,
        padding:"10px 14px",marginBottom:12,color:"#f44336",fontSize:13,textAlign:"center",maxWidth:300}}>{err}</div>}
      <div style={{width:"100%",maxWidth:320,marginBottom:12}}>
        {rooms.map(r=>(
          <div key={r.id} style={{background:"#1a0d05",borderRadius:12,padding:"11px 16px",marginBottom:7,
            border:`1px solid ${r.full?"#333":"#D4531C44"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{color:"white",fontWeight:800,margin:"0 0 1px",fontSize:14}}>Phòng {r.id}</p>
              <p style={{color:"#888",fontSize:11,margin:0}}>{r.players}/{r.max} người</p>
            </div>
            <span style={{color:r.full?"#666":"#4CAF50",fontSize:11,fontWeight:700}}>{r.full?"ĐẦY":"TRỐNG"}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#1a0d05",borderRadius:12,padding:"12px 16px",marginBottom:16,
        width:"100%",maxWidth:320,border:"1px solid #2a2a38"}}>
        <p style={{color:"#888",fontSize:11,fontWeight:700,margin:"0 0 7px"}}>LUẬT CHƠI</p>
        {["🫧 Ăn trân châu → to hơn, tầm nhìn rộng hơn",
          "⚡ Tạt đầu đối thủ → +100 điểm rank tuần",
          "✖ x2/x5/x10 nhân điểm thức ăn 15 giây",
          "🧲 Nam châm hút thức ăn tự động",
          "🛡 Giáp miễn nhiễm tạt đầu 15 giây",
          "👆 2 ngón tay = tăng tốc"].map((t,i)=>(
          <p key={i} style={{color:"#aaa",fontSize:11,margin:"0 0 4px"}}>{t}</p>
        ))}
      </div>
      <button onClick={join} style={{background:"#D4531C",border:"none",color:"white",
        borderRadius:14,padding:"15px",fontSize:16,fontWeight:900,cursor:"pointer",
        width:"100%",maxWidth:320}}>🎮 Vào chiến ngay!</button>
      <button onClick={onExit} style={{background:"none",border:"none",color:"#666",
        marginTop:12,fontSize:13,cursor:"pointer"}}>← Quay lại</button>
    </div>
  );

  if(phase==="dead") return(
    <div style={{background:"#080504",minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <p style={{fontSize:48,margin:"0 0 10px"}}>💥</p>
      <h2 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 5px"}}>Bị tiêu diệt!</h2>
      {death?.killerName&&<p style={{color:"#D4531C",fontSize:13,margin:"0 0 16px"}}>
        Bởi <strong>{death.killerName}</strong></p>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20,width:"100%",maxWidth:280}}>
        {[{l:"Kill",v:death?.kills||0,i:"⚔️",c:"#D4531C"},
          {l:"Điểm",v:(death?.kills||0)*100,i:"⭐",c:"#FFD700"},
          {l:"Dài",v:death?.length||0,i:"📏",c:"#4CAF50"},
          {l:"Hạng",v:`#${death?.rank||"?"}`,i:"🏆",c:"#9C27B0"}].map((s,i)=>(
          <div key={i} style={{background:"#1a0d05",borderRadius:12,padding:"13px",
            border:`1px solid ${s.c}33`,textAlign:"center"}}>
            <p style={{fontSize:18,margin:"0 0 3px"}}>{s.i}</p>
            <p style={{color:s.c,fontSize:20,fontWeight:900,margin:"0 0 2px"}}>{s.v}</p>
            <p style={{color:"#666",fontSize:11,margin:0}}>{s.l}</p>
          </div>
        ))}
      </div>
      <button onClick={()=>{setPhase("lobby");setDeath(null);setKills(0);setLen(12);}}
        style={{background:"#D4531C",border:"none",color:"white",borderRadius:14,padding:"14px",
          fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10,width:"100%",maxWidth:280}}>
        🔄 Chơi lại</button>
      <button onClick={onExit} style={{background:"none",border:"1px solid #333",color:"#888",
        borderRadius:14,padding:"12px",fontSize:14,cursor:"pointer",width:"100%",maxWidth:280}}>
        ← Thoát</button>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"#080504",overflow:"hidden"}}>
      <canvas ref={cvRef} style={{display:"block",touchAction:"none"}}/>
      <div style={{position:"absolute",top:10,left:10,right:10,display:"flex",
        justifyContent:"space-between",pointerEvents:"none"}}>
        <div style={{background:"rgba(0,0,0,.65)",borderRadius:10,padding:"8px 13px"}}>
          <p style={{color:"#F0A030",fontSize:11,fontWeight:700,margin:"0 0 1px"}}>⚔️ Kill: {kills}</p>
          <p style={{color:"#FFD700",fontSize:12,fontWeight:900,margin:0}}>⭐ {kills*100}đ</p>
        </div>
        <div style={{background:"rgba(0,0,0,.65)",borderRadius:10,padding:"8px 13px",textAlign:"right"}}>
          <p style={{color:"#4CAF50",fontSize:11,fontWeight:700,margin:"0 0 1px"}}>📏 {len}</p>
          <div style={{display:"flex",gap:3,justifyContent:"flex-end",flexWrap:"wrap"}}>
            {efx.map(e=><span key={e} style={{background:(EC[e]||"#fff")+"33",color:EC[e]||"#fff",
              borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:800}}>{EI[e]||e}</span>)}
          </div>
        </div>
      </div>
      <div style={{position:"absolute",top:58,right:10,background:"rgba(0,0,0,.65)",
        borderRadius:10,padding:"7px 11px",minWidth:115,pointerEvents:"none"}}>
        <p style={{color:"#D4531C",fontSize:10,fontWeight:800,margin:"0 0 4px"}}>TOP KILLS</p>
        {lb.slice(0,5).map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:2}}>
            <span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#888",
              fontSize:10,fontWeight:700}}>
              {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`} {p.name?.slice(0,8)}
            </span>
            <span style={{color:"white",fontSize:10,fontWeight:800}}>{p.kills}</span>
          </div>
        ))}
      </div>
      <button onClick={()=>{sockRef.current?.disconnect();sockRef.current=null;onExit();}}
        style={{position:"absolute",bottom:20,right:14,background:"rgba(0,0,0,.6)",
          border:"1px solid #333",color:"#888",borderRadius:8,padding:"7px 13px",
          fontSize:12,cursor:"pointer"}}>✕ Thoát</button>
    </div>
  );
}
