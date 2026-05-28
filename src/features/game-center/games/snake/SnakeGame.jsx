import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND     = import.meta.env.VITE_API_BASE_URL?.replace("/api","") || "https://cing-backend-production.up.railway.app";
const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || BACKEND;
const MAP_SIZE=4000,MAP_R=1800,MAP_CX=2000,MAP_CY=2000,CLI_SPD=4;
const QUALITY={
  high:  {glowEffect:true, pearlShine:true,  gridDots:true,  nameTag:true},
  medium:{glowEffect:true, pearlShine:false, gridDots:true,  nameTag:true},
  low:   {glowEffect:false,pearlShine:false, gridDots:false, nameTag:true},
};
const detectQ=()=>{ try{ const m=navigator?.deviceMemory||4,c=navigator?.hardwareConcurrency||4; return(m>=4||c>=6)?"high":(m>=2||c>=4)?"medium":"low"; }catch{return"medium";} };
const lerpA=(a,b,t)=>{ let d=b-a; while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2; return a+d*t; };

export default function SnakeGame({profile,onExit}){
  const cvRef=useRef(null),sockRef=useRef(null),stRef=useRef({self:null,players:[],food:[],special:[]});
  const animRef=useRef(null),deadRef=useRef(false),glowRef=useRef(0);
  const loc=useRef({angle:0,target:0,boosting:false}),joyRef=useRef({active:false,ox:0,oy:0,dx:0,dy:0});
  const qRef=useRef(QUALITY.medium),smoothA=useRef({}),audioRef=useRef(null);
  const [phase,setPhase]=useState("lobby"),[rooms,setRooms]=useState([]),[lb,setLb]=useState([]);
  const [death,setDeath]=useState(null),[kills,setKills]=useState(0),[len,setLen]=useState(20);
  const [efx,setEfx]=useState([]),[err,setErr]=useState(""),[music,setMusic]=useState(true);
  const [quality,setQuality]=useState(()=>{ try{return localStorage.getItem("snake_q")||detectQ();}catch{return"medium";} });

  useEffect(()=>{ qRef.current=QUALITY[quality]||QUALITY.medium; try{localStorage.setItem("snake_q",quality);}catch{} },[quality]);

  useEffect(()=>{
    if(phase==="playing"&&music){
      try{
        if(!audioRef.current){
          // Nhạc lofi upbeat cho game
          audioRef.current=new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
          audioRef.current.loop=true; audioRef.current.volume=0.2;
        }
        audioRef.current.play().catch(()=>{});
      }catch{}
    } else { try{audioRef.current?.pause();}catch{} }
    return()=>{ try{audioRef.current?.pause();}catch{} };
  },[phase,music]);

  useEffect(()=>{
    if(sockRef.current) return;
    const s=io(`${GAME_SERVER}/snake`,{transports:["websocket"],reconnection:true,reconnectionDelay:1500,reconnectionAttempts:10});
    sockRef.current=s;
    s.on("connect",()=>s.emit("game:rooms"));
    s.on("game:rooms",d=>setRooms(d));
    s.on("game:joined",()=>{setPhase("playing");deadRef.current=false;});
    s.on("game:state",d=>{
      stRef.current=d;
      if(d.self){ setKills(d.self.kills);setLen(d.self.length);setEfx(Object.keys(d.self.effects||{}));
        let da=d.self.angle-loc.current.angle; while(da>Math.PI)da-=Math.PI*2; while(da<-Math.PI)da+=Math.PI*2;
        if(Math.abs(da)>0.8) loc.current.angle=d.self.angle; }
    });
    s.on("game:ate",({multiplier})=>{glowRef.current=multiplier>=5?1:0.65;});
    s.on("item:pickup",()=>{glowRef.current=1;});
    s.on("game:leaderboard",d=>setLb(d));
    s.on("game:over",d=>{deadRef.current=true;setDeath(d);setPhase("dead");});
    s.on("game:border_death",d=>{deadRef.current=true;setDeath({...d,killerName:"Đường viền"});setPhase("dead");});
    s.on("game:error",({message})=>setErr(message));
    return()=>{s.disconnect();sockRef.current=null;};
  },[]);

  const join=useCallback(()=>{
    if(!sockRef.current||!profile) return;
    setErr("");
    sockRef.current.emit("game:join",{userId:profile.id||profile.phone,name:profile.name||profile.zalo_name||"Cing iu",avatar:profile.avatar||""});
  },[profile]);

  useEffect(()=>{
    if(phase!=="playing") return;
    let cleanup=null;
    const init=()=>{
      const cv=cvRef.current; if(!cv){setTimeout(init,50);return;}
      const dpr=window.devicePixelRatio||1,W=window.innerWidth,H=window.innerHeight;
      cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";
      const ctx=cv.getContext("2d");ctx.scale(dpr,dpr);
      const joy=joyRef.current;let joyFid=-1;
      const onTS=e=>{e.preventDefault();for(const t of e.changedTouches){if(joyFid===-1){joyFid=t.identifier;joy.active=true;joy.ox=t.clientX;joy.oy=t.clientY;joy.dx=0;joy.dy=0;}else{loc.current.boosting=true;sockRef.current?.emit("game:boost",{active:true});}}};
      const onTM=e=>{e.preventDefault();for(const t of e.changedTouches){if(t.identifier===joyFid&&joy.active){const dx=t.clientX-joy.ox,dy=t.clientY-joy.oy;joy.dx=dx;joy.dy=dy;if(Math.sqrt(dx*dx+dy*dy)>6){const a=Math.atan2(dy,dx);loc.current.target=a;sockRef.current?.emit("game:direction",{angle:a});}}}};
      const onTE=e=>{e.preventDefault();for(const t of e.changedTouches){if(t.identifier===joyFid){joyFid=-1;joy.active=false;joy.dx=0;joy.dy=0;}else{loc.current.boosting=false;sockRef.current?.emit("game:boost",{active:false});}}};
      let md=false;
      const onMD=e=>{md=true;joy.active=true;joy.ox=e.clientX;joy.oy=e.clientY;};
      const onMM=e=>{if(!md||!joy.active)return;const dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;if(Math.sqrt(dx*dx+dy*dy)>8){joy.dx=dx;joy.dy=dy;const a=Math.atan2(dy,dx);loc.current.target=a;sockRef.current?.emit("game:direction",{angle:a});}};
      const onMU=()=>{md=false;joy.active=false;joy.dx=0;joy.dy=0;};
      cv.addEventListener("touchstart",onTS,{passive:false});cv.addEventListener("touchmove",onTM,{passive:false});cv.addEventListener("touchend",onTE);
      cv.addEventListener("mousedown",onMD);cv.addEventListener("mousemove",onMM);cv.addEventListener("mouseup",onMU);

      const drawPearl=(cx,cy,r,glow)=>{
        if(r<0.8)return;
        if(glow>0.05&&qRef.current.glowEffect){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r*3);g.addColorStop(0,`rgba(255,120,20,${glow*.6})`);g.addColorStop(1,"rgba(0,0,0,0)");ctx.beginPath();ctx.arc(cx,cy,r*3,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();}
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle="#3A1202";ctx.fill();
        ctx.beginPath();ctx.arc(cx,cy,r*.82,0,Math.PI*2);ctx.fillStyle="#7A3008";ctx.fill();
        ctx.beginPath();ctx.arc(cx,cy,r*.62,0,Math.PI*2);ctx.fillStyle="#B04810";ctx.fill();
        const g2=ctx.createRadialGradient(cx-r*.12,cy-r*.12,0,cx,cy,r*.44);g2.addColorStop(0,"#E86820");g2.addColorStop(1,"#C05010");
        ctx.beginPath();ctx.arc(cx,cy,r*.44,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();
        if(qRef.current.pearlShine){ctx.beginPath();ctx.ellipse(cx-r*.12,cy-r*.15,r*.18,r*.12,-0.3,0,Math.PI*2);ctx.fillStyle=`rgba(255,180,100,${.6+glow*.4})`;ctx.fill();}
      };

      const drawHead=(x,y,r,ang,isSelf,glow)=>{
        ctx.save();ctx.translate(x,y);ctx.rotate(ang);
        if(glow>0.05&&qRef.current.glowEffect){const g=ctx.createRadialGradient(0,0,0,0,0,r*2.8);g.addColorStop(0,`rgba(255,110,20,${glow*.8})`);g.addColorStop(1,"rgba(0,0,0,0)");ctx.beginPath();ctx.arc(0,0,r*2.8,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();}
        const hg=ctx.createRadialGradient(-r*.28,-r*.28,0,0,0,r);hg.addColorStop(0,"#FAA840");hg.addColorStop(.45,"#E07018");hg.addColorStop(1,"#903010");
        ctx.beginPath();ctx.ellipse(0,0,r,r*.88,0,0,Math.PI*2);ctx.fillStyle=hg;ctx.fill();
        [[-r*.27,-r*.24],[r*.27,-r*.24]].forEach(([ex,ey],i)=>{
          const er=r*(i===0?.35:.29);
          ctx.beginPath();ctx.arc(ex,ey,er,0,Math.PI*2);ctx.fillStyle="white";ctx.fill();
          ctx.beginPath();ctx.arc(ex,ey,er*.75,0,Math.PI*2);ctx.fillStyle="#160800";ctx.fill();
          const ig=ctx.createRadialGradient(ex,ey,0,ex,ey,er*.42);ig.addColorStop(0,"#E85010");ig.addColorStop(1,"#600800");
          ctx.beginPath();ctx.arc(ex,ey,er*.42,0,Math.PI*2);ctx.fillStyle=ig;ctx.fill();
          ctx.beginPath();ctx.arc(ex,ey,er*.24,0,Math.PI*2);ctx.fillStyle="#050100";ctx.fill();
          ctx.beginPath();ctx.ellipse(ex+er*.18,ey-er*.24,er*.17,er*.12,-0.3,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.9)";ctx.fill();
        });
        ctx.strokeStyle="#EE0808";ctx.lineWidth=2;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(0,r*.5);ctx.lineTo(0,r*.73);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,r*.73);ctx.lineTo(-r*.15,r*.92);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,r*.73);ctx.lineTo(r*.15,r*.92);ctx.stroke();
        ctx.restore();
      };

      const drawSnake=(player,isSelf,camX,camY,glow)=>{
        const segs=player.segments;if(!segs?.length)return;
        const maxR=Math.min(6+player.length*.15,18),minR=maxR*.28;
        for(let i=segs.length-1;i>=0;i--){
          const frac=1-i/segs.length,r=minR+(maxR-minR)*frac;
          const sx=segs[i].x-camX+W/2,sy=segs[i].y-camY+H/2;
          if(sx<-r*4||sx>W+r*4||sy<-r*4||sy>H+r*4)continue;
          drawPearl(sx,sy,r,isSelf?glow:0);
        }
        const hx=segs[0].x-camX+W/2,hy=segs[0].y-camY+H/2;
        let headAng;
        if(isSelf){
          // Self: dùng direction từ seg[0]→seg[1] để khớp với thân
          headAng = segs.length>1
            ? Math.atan2(segs[0].y-segs[1].y, segs[0].x-segs[1].x) - Math.PI/2
            : loc.current.angle - Math.PI/2;
        } else {
          // Others: tính từ segment direction + smooth
          const pid=player.id;
          const rawAng=segs.length>1?Math.atan2(segs[0].y-segs[1].y,segs[0].x-segs[1].x):0;
          if(smoothA.current[pid]===undefined)smoothA.current[pid]=rawAng;
          else smoothA.current[pid]=lerpA(smoothA.current[pid],rawAng,0.25);
          headAng=smoothA.current[pid]-Math.PI/2;
        }
        drawHead(hx,hy,maxR*1.55,headAng,isSelf,glow);
        if(qRef.current.nameTag){
          const nm=(player.name||"").slice(0,14);
          if(nm){
            ctx.save();
            const fs=Math.max(Math.min(maxR*.6,13),9);
            ctx.font=`bold ${fs}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="bottom";
            ctx.shadowColor="rgba(0,0,0,1)";ctx.shadowBlur=8;
            ctx.fillStyle=isSelf?"#FF8C4B":"white";
            ctx.fillText(nm,hx,hy-maxR*2.2);
            ctx.shadowBlur=0;ctx.restore();
          }
        }
      };

      const SCOL={x2:"#4080FF",x5:"#C040FF",x10:"#FFD700",magnet:"#40FFB0",shield:"#FFB830"};
      const SICO={x2:"✖2",x5:"✖5",x10:"✖10",magnet:"🧲",shield:"🛡"};
      const drawSpecial=(items,camX,camY,t)=>{
        items.forEach(s=>{
          const sx=s.x-camX+W/2,sy=s.y-camY+H/2;
          if(sx<-60||sx>W+60||sy<-60||sy>H+60)return;
          ctx.save();
          const r=20+Math.sin(t*3)*2,col=SCOL[s.type]||"#fff";
          const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.8);
          g.addColorStop(0,col+"55");g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.beginPath();ctx.arc(sx,sy,r*2.8,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
          ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fillStyle="#1a0d05";ctx.fill();
          ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
          ctx.font=`bold ${Math.round(r*.85)}px sans-serif`;
          ctx.textAlign="center";ctx.textBaseline="middle";
          ctx.fillStyle=col;
          ctx.fillText(SICO[s.type]||"?",sx,sy);
          ctx.restore();
        });
      };

      const drawMinimap=(self,players)=>{
        const ms=66,mx=12,my=H-ms-88,cx2=mx+ms/2,cy2=my+ms/2,mr=ms/2-2,sc=mr/MAP_R;
        ctx.save();
        ctx.shadowColor="rgba(0,0,0,.6)";ctx.shadowBlur=10;
        ctx.beginPath();ctx.arc(cx2,cy2,mr+2,0,Math.PI*2);ctx.fillStyle="rgba(0,0,0,.8)";ctx.fill();ctx.shadowBlur=0;
        ctx.beginPath();ctx.arc(cx2,cy2,mr,0,Math.PI*2);ctx.clip();
        ctx.fillStyle="#0a0604";ctx.fillRect(mx,my,ms,ms);
        ctx.fillStyle="rgba(200,80,16,.55)";
        stRef.current.food?.forEach(f=>{ctx.beginPath();ctx.arc(cx2+(f.x-MAP_CX)*sc,cy2+(f.y-MAP_CY)*sc,.7,0,Math.PI*2);ctx.fill();});
        stRef.current.special?.forEach(s=>{ctx.beginPath();ctx.arc(cx2+(s.x-MAP_CX)*sc,cy2+(s.y-MAP_CY)*sc,2,0,Math.PI*2);ctx.fillStyle="#FFD700";ctx.fill();});
        players.forEach(p=>{if(!p.segments?.[0])return;ctx.beginPath();ctx.arc(cx2+(p.segments[0].x-MAP_CX)*sc,cy2+(p.segments[0].y-MAP_CY)*sc,2.5,0,Math.PI*2);ctx.fillStyle="#8040FF";ctx.fill();});
        const sx3=cx2+(self.segments[0].x-MAP_CX)*sc,sy3=cy2+(self.segments[0].y-MAP_CY)*sc;
        ctx.save();ctx.translate(sx3,sy3);ctx.rotate(loc.current.angle);
        ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(-3,-3);ctx.lineTo(-3,3);ctx.closePath();ctx.fillStyle="#D4531C";ctx.fill();ctx.restore();
        ctx.restore();
        ctx.beginPath();ctx.arc(cx2,cy2,mr,0,Math.PI*2);ctx.strokeStyle="rgba(212,83,28,.45)";ctx.lineWidth=1.5;ctx.stroke();
      };

      // predict: đầu smooth, thân fixed length
      const predict=(segs)=>{
        if(!segs?.length)return segs;
        // Smooth turn
        loc.current.angle=lerpA(loc.current.angle,loc.current.target,0.18);
        const nx=segs[0].x+Math.cos(loc.current.angle)*CLI_SPD;
        const ny=segs[0].y+Math.sin(loc.current.angle)*CLI_SPD;
        // QUAN TRỌNG: slice(0,-1) bỏ đuôi → độ dài KHÔNG ĐỔI dù boost hay không
        return [{x:nx,y:ny},...segs.slice(0,segs.length-1)];
      };

      let t=0;
      const frame=()=>{
        if(deadRef.current)return;
        t+=0.016;
        const st=stRef.current,self=st.self;
        ctx.fillStyle="#080504";ctx.fillRect(0,0,W,H);
        let camX=self?.segments?.[0]?.x??MAP_CX,camY=self?.segments?.[0]?.y??MAP_CY;
        const bx=W/2-camX+MAP_CX,by=H/2-camY+MAP_CY;
        ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(bx,by,MAP_R,0,Math.PI*2,true);ctx.fillStyle="rgba(0,0,0,.55)";ctx.fill();ctx.restore();
        if(qRef.current.gridDots){
          ctx.fillStyle="rgba(255,100,20,.07)";
          const gs=80,ox=((-camX%gs+W/2+MAP_CX)%gs+gs)%gs,oy=((-camY%gs+H/2+MAP_CY)%gs+gs)%gs;
          for(let gx=ox-gs;gx<W+gs;gx+=gs)for(let gy=oy-gs;gy<H+gs;gy+=gs){const dx=gx-bx,dy=gy-by;if(dx*dx+dy*dy<MAP_R*MAP_R){ctx.beginPath();ctx.arc(gx,gy,1.2,0,Math.PI*2);ctx.fill();}}
        }
        const pulse=0.5+Math.sin(t*2)*.15;
        ctx.beginPath();ctx.arc(bx,by,MAP_R,0,Math.PI*2);ctx.strokeStyle=`rgba(255,80,20,${pulse*.22})`;ctx.lineWidth=28;ctx.stroke();
        ctx.beginPath();ctx.arc(bx,by,MAP_R,0,Math.PI*2);ctx.strokeStyle="rgba(212,83,28,.85)";ctx.lineWidth=3;ctx.stroke();
        if(self?.segments?.[0]){const dx=self.segments[0].x-MAP_CX,dy=self.segments[0].y-MAP_CY,dist=MAP_R-Math.sqrt(dx*dx+dy*dy);if(dist<260){ctx.fillStyle=`rgba(255,0,0,${(1-dist/260)*.22})`;ctx.fillRect(0,0,W,H);}}
        st.food?.forEach(f=>{const fx=f.x-camX+W/2,fy=f.y-camY+H/2;if(fx<-20||fx>W+20||fy<-20||fy>H+20)return;const r=f.size||5;ctx.beginPath();ctx.arc(fx,fy,r,0,Math.PI*2);ctx.fillStyle="#3A1202";ctx.fill();ctx.beginPath();ctx.arc(fx,fy,r*.64,0,Math.PI*2);ctx.fillStyle=f.color||"#C85010";ctx.fill();ctx.beginPath();ctx.ellipse(fx-r*.14,fy-r*.14,r*.19,r*.13,-0.3,0,Math.PI*2);ctx.fillStyle="rgba(255,180,100,.6)";ctx.fill();});
        drawSpecial(st.special||[],camX,camY,t);
        if(glowRef.current>0)glowRef.current=Math.max(0,glowRef.current-.01);
        st.players?.forEach(p=>{if(p.id!==self?.id)drawSnake(p,false,camX,camY,0);});
        if(self){const pred=predict(self.segments);if(pred?.length){camX=pred[0].x;camY=pred[0].y;}drawSnake({...self,segments:pred},true,camX,camY,glowRef.current);}
        const joy2=joyRef.current;
        if(joy2.active){const jx=joy2.ox,jy=joy2.oy,mR=52,djx=Math.max(-mR,Math.min(mR,joy2.dx)),djy=Math.max(-mR,Math.min(mR,joy2.dy));ctx.beginPath();ctx.arc(jx,jy,mR,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.06)";ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(jx+djx,jy+djy,22,0,Math.PI*2);ctx.fillStyle="rgba(212,83,28,0.75)";ctx.fill();ctx.strokeStyle="rgba(255,120,50,0.9)";ctx.lineWidth=2;ctx.stroke();}
        if(self)drawMinimap(self,st.players||[]);
        animRef.current=requestAnimationFrame(frame);
      };
      animRef.current=requestAnimationFrame(frame);
      cleanup=()=>{cancelAnimationFrame(animRef.current);cv.removeEventListener("touchstart",onTS);cv.removeEventListener("touchmove",onTM);cv.removeEventListener("touchend",onTE);cv.removeEventListener("mousedown",onMD);cv.removeEventListener("mousemove",onMM);cv.removeEventListener("mouseup",onMU);};
    };
    init();
    return()=>cleanup?.();
  },[phase]);

  const EC={x2:"#4080FF",x5:"#C040FF",x10:"#FFD700",magnet:"#40FFB0",shield:"#FFB830"};
  const EI={x2:"✖2",x5:"✖5",x10:"✖10",magnet:"🧲",shield:"🛡"};

  if(phase==="lobby")return(
    <div style={{background:"#080504",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <img src="/logo-cing.png" alt="logo" style={{width:52,height:52,objectFit:"contain",marginBottom:6,filter:"drop-shadow(0 0 8px rgba(255,215,0,0.7))"}}/>
      <p style={{color:"#FFD700",fontSize:11,fontWeight:800,letterSpacing:2,margin:"0 0 2px",textShadow:"0 0 8px rgba(255,215,0,0.6)"}}>CING HU TANG KINH BẮC</p>
      <h1 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 2px"}}>TRÂN CHÂU ĐẠI CHIẾN</h1>
      <p style={{color:"#888",fontSize:12,margin:"0 0 16px"}}>PvP realtime · Tiêu diệt · Leo rank</p>
      <div style={{display:"flex",gap:6,marginBottom:16,width:"100%",maxWidth:320}}>
        {[{k:"high",label:"🔥 Cao",desc:"Máy mạnh"},{k:"medium",label:"⚡ Cân bằng",desc:"Khuyên dùng"},{k:"low",label:"🔋 Mượt",desc:"Máy yếu"}].map(q=>(
          <button key={q.k} onClick={()=>setQuality(q.k)} style={{flex:1,padding:"8px 4px",background:quality===q.k?"rgba(212,83,28,0.25)":"rgba(255,255,255,0.04)",border:`1px solid ${quality===q.k?"#D4531C":"rgba(255,255,255,0.1)"}`,color:quality===q.k?"#D4531C":"#666",borderRadius:10,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:15}}>{q.label.split(" ")[0]}</div>
            <div style={{fontSize:10,fontWeight:700,color:quality===q.k?"white":"#555",marginTop:1}}>{q.label.split(" ").slice(1).join(" ")}</div>
            <div style={{fontSize:9,color:"#444",marginTop:2}}>{q.desc}</div>
          </button>
        ))}
      </div>
      {err&&<div style={{background:"rgba(244,67,54,.15)",border:"1px solid #f44336",borderRadius:10,padding:"10px 14px",marginBottom:12,color:"#f44336",fontSize:13,textAlign:"center",maxWidth:320,width:"100%"}}>{err}</div>}
      <div style={{width:"100%",maxWidth:320,marginBottom:12}}>
        {rooms.map(r=>(
          <div key={r.id} style={{background:"#1a0d05",borderRadius:12,padding:"11px 16px",marginBottom:7,border:`1px solid ${r.full?"#333":"#D4531C44"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{color:"white",fontWeight:800,margin:"0 0 1px",fontSize:14}}>Phòng {r.id}</p><p style={{color:"#888",fontSize:11,margin:0}}>{r.players}/{r.max} người</p></div>
            <span style={{color:r.full?"#666":"#4CAF50",fontSize:11,fontWeight:700}}>{r.full?"ĐẦY":"TRỐNG"}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#1a0d05",borderRadius:12,padding:"12px 16px",marginBottom:16,width:"100%",maxWidth:320,border:"1px solid #2a2a38"}}>
        <p style={{color:"#888",fontSize:11,fontWeight:700,margin:"0 0 7px"}}>LUẬT CHƠI</p>
        {["🫧 Ăn trân châu → to hơn, tầm nhìn rộng hơn","⚔️ Tạt đầu đối thủ → +100 điểm rank tuần","✖ x2/x5/x10 nhân điểm thức ăn 15 giây","🧲 Nam châm hút thức ăn tự động","🛡 Giáp miễn nhiễm tạt đầu 15 giây","👆 2 ngón tay = tăng tốc boost"].map((rule,i)=>(<p key={i} style={{color:"#aaa",fontSize:11,margin:"0 0 4px"}}>{rule}</p>))}
      </div>
      <button onClick={join} style={{background:"#D4531C",border:"none",color:"white",borderRadius:14,padding:"15px",fontSize:16,fontWeight:900,cursor:"pointer",width:"100%",maxWidth:320}}>🎮 Vào chiến ngay!</button>
      <button onClick={onExit} style={{background:"none",border:"none",color:"#666",marginTop:12,fontSize:13,cursor:"pointer"}}>← Quay lại</button>
    </div>
  );

  if(phase==="dead")return(
    <div style={{background:"#080504",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <p style={{fontSize:48,margin:"0 0 10px"}}>💥</p>
      <h2 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 5px"}}>Bị tiêu diệt!</h2>
      {death?.killerName&&<p style={{color:"#D4531C",fontSize:13,margin:"0 0 16px"}}>Bởi <strong>{death.killerName}</strong></p>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20,width:"100%",maxWidth:280}}>
        {[{l:"Kill",v:death?.kills||0,i:"⚔️",c:"#D4531C"},{l:"Điểm",v:(death?.kills||0)*100,i:"⭐",c:"#FFD700"},{l:"Dài",v:death?.length||0,i:"📏",c:"#4CAF50"},{l:"Hạng",v:`#${death?.rank||"?"}`,i:"🏆",c:"#9C27B0"}].map((s,i)=>(
          <div key={i} style={{background:"#1a0d05",borderRadius:12,padding:"13px",border:`1px solid ${s.c}33`,textAlign:"center"}}>
            <p style={{fontSize:18,margin:"0 0 3px"}}>{s.i}</p>
            <p style={{color:s.c,fontSize:20,fontWeight:900,margin:"0 0 2px"}}>{s.v}</p>
            <p style={{color:"#666",fontSize:11,margin:0}}>{s.l}</p>
          </div>
        ))}
      </div>
      <button onClick={()=>{setPhase("lobby");setDeath(null);setKills(0);setLen(20);}} style={{background:"#D4531C",border:"none",color:"white",borderRadius:14,padding:"14px",fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10,width:"100%",maxWidth:280}}>🔄 Chơi lại</button>
      <button onClick={onExit} style={{background:"none",border:"1px solid #333",color:"#888",borderRadius:14,padding:"12px",fontSize:14,cursor:"pointer",width:"100%",maxWidth:280}}>← Thoát</button>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"#080504",overflow:"hidden"}}>
      <canvas ref={cvRef} style={{display:"block",touchAction:"none"}}/>
      {/* Logo text only */}
      <div style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",pointerEvents:"none",zIndex:10}}>
        <span style={{color:"#FFD700",fontSize:12,fontWeight:900,letterSpacing:2,
          textShadow:"0 0 12px rgba(255,215,0,0.9), 0 1px 3px rgba(0,0,0,0.8)",
          whiteSpace:"nowrap"}}>CING HU TANG KINH BẮC</span>
      </div>
      {/* HUD */}
      <div style={{position:"absolute",top:32,left:10,right:10,display:"flex",justifyContent:"space-between",pointerEvents:"none"}}>
        <div style={{background:"rgba(0,0,0,.65)",borderRadius:10,padding:"8px 13px"}}>
          <p style={{color:"#F0A030",fontSize:11,fontWeight:700,margin:"0 0 1px"}}>⚔️ Kill: {kills}</p>
          <p style={{color:"#FFD700",fontSize:12,fontWeight:900,margin:0}}>⭐ {kills*100} điểm</p>
        </div>
        <div style={{background:"rgba(0,0,0,.65)",borderRadius:10,padding:"8px 13px",textAlign:"right"}}>
          <p style={{color:"#4CAF50",fontSize:11,fontWeight:700,margin:"0 0 1px"}}>📏 Dài: {len}</p>
          <div style={{display:"flex",gap:3,justifyContent:"flex-end",flexWrap:"wrap"}}>
            {efx.map(e=><span key={e} style={{background:(EC[e]||"#fff")+"33",color:EC[e]||"#fff",borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:800}}>{EI[e]||e}</span>)}
          </div>
        </div>
      </div>
      {/* Leaderboard */}
      <div style={{position:"absolute",top:90,right:10,background:"rgba(0,0,0,.65)",borderRadius:10,padding:"7px 11px",minWidth:118,pointerEvents:"none"}}>
        <p style={{color:"#D4531C",fontSize:10,fontWeight:800,margin:"0 0 4px"}}>TOP KILLS</p>
        {lb.slice(0,5).map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:2}}>
            <span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#888",fontSize:10,fontWeight:700}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`} {p.name?.slice(0,8)}</span>
            <span style={{color:"white",fontSize:10,fontWeight:800}}>{p.kills}</span>
          </div>
        ))}
      </div>
      {/* Nút nhạc + thoát */}
      <div style={{position:"absolute",bottom:20,right:14,display:"flex",gap:8}}>
        <button onClick={()=>setMusic(m=>!m)} style={{background:"rgba(0,0,0,.6)",border:`1px solid ${music?"#D4531C":"#333"}`,color:music?"#D4531C":"#555",borderRadius:8,padding:"7px 11px",fontSize:16,cursor:"pointer"}}>{music?"🔊":"🔇"}</button>
        <button onClick={()=>{sockRef.current?.disconnect();sockRef.current=null;onExit();}} style={{background:"rgba(0,0,0,.6)",border:"1px solid #333",color:"#888",borderRadius:8,padding:"7px 13px",fontSize:12,cursor:"pointer"}}>✕ Thoát</button>
      </div>
    </div>
  );
}
