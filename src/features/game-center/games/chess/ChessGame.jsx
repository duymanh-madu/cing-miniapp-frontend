import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import ChessLeaderboard from "./ChessLeaderboard";

const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || "https://cing-backend-production.up.railway.app";
const LIGHT_SQ = "#F0D9B5";
const DARK_SQ  = "#B58863";
const LIGHT_HL = "#F6F669";
const DARK_HL  = "#BACA2B";
const LIGHT_MV = "#CDD16E";
const DARK_MV  = "#AABA4B";

const UNICODE = {
  wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙",
  bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟",
};

function Modal({ onClose, children }) {
  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex",
      alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.75)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
}

function ChatPortal({ messages, chatInput, setChatInput, sendChat, onClose, userIdRef }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9000, display:"flex",
      flexDirection:"column", justifyContent:"flex-end", pointerEvents:"none" }}>
      <div style={{ flex:1, pointerEvents:"all" }} onClick={onClose}/>
      <div style={{ background:"#0d0a08", borderRadius:"20px 20px 0 0",
        border:"1px solid rgba(255,215,0,0.2)", maxHeight:"50vh",
        display:"flex", flexDirection:"column", pointerEvents:"all" }}>
        <div style={{ padding:"12px 16px 8px", display:"flex", alignItems:"center",
          justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }}>
          <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:0 }}>💬 Chat trong ván</p>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#666", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
          {messages.length === 0 && (
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textAlign:"center", padding:"20px 0" }}>Chưa có tin nhắn</p>
          )}
          {messages.map((m, i) => {
            const isMe = m.userId === userIdRef.current;
            return (
              <div key={i} style={{ marginBottom:8, display:"flex", flexDirection:"column",
                alignItems: isMe?"flex-end":"flex-start" }}>
                {!isMe && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, margin:"0 0 2px 4px" }}>{m.name}</p>}
                <div style={{ background: isMe?"#D4531C":"rgba(255,255,255,0.1)",
                  borderRadius: isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",
                  padding:"7px 12px", maxWidth:"78%" }}>
                  <p style={{ color:"white", fontSize:13, margin:0, lineHeight:1.4 }}>{m.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef}/>
        </div>
        <div style={{ padding:"8px 12px 28px", display:"flex", gap:8,
          borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && sendChat()}
            placeholder="Nhập tin nhắn..." maxLength={100} autoFocus
            style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:20, padding:"9px 14px", color:"white", fontSize:13, outline:"none" }}/>
          <button onClick={sendChat} disabled={!chatInput.trim()}
            style={{ width:40, height:40, borderRadius:20, border:"none", cursor:"pointer", flexShrink:0,
              background: chatInput.trim()?"#D4531C":"rgba(255,255,255,0.08)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>➤</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ChessGame({ onExit }) {
  const profile         = useAuthStore(s => s.profile);
  const runtimeIdentity = useRuntimeCustomerIdentityStore(s => s.identity);

  const userId = (() => {
    for (const src of [runtimeIdentity?.phone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return profile?.id || "";
  })();
  const userName   = runtimeIdentity?.fullName || profile?.name || profile?.zalo_name || "Cing iu";
  const userAvatar = runtimeIdentity?.avatar   || profile?.avatar || "";

  const sockRef      = useRef(null);
  const gameIdRef    = useRef(null);
  const userIdRef    = useRef(null);
  const myReserveRef = useRef(60);
  const timerRef     = useRef(null);
  const moveTimerRef = useRef(null);

  const [phase,     setPhase]     = useState("lobby");
  const [chess,     setChess]     = useState(new Chess());
  const [myColor,   setMyColor]   = useState("w");
  const [gameId,    setGameId]    = useState(null);
  const [opponent,  setOpponent]  = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [legalMoves,setLegalMoves]= useState([]);
  const [lastMove,  setLastMove]  = useState(null);
  const [inCheck,   setInCheck]   = useState(false);
  const [gameOver,  setGameOver]  = useState(null);
  const [searchTime,setSearchTime]= useState(0);
  const [msg,       setMsg]       = useState("");
  const [showLB,    setShowLB]    = useState(false);
  const [myReserve, setMyReserve] = useState(60);
  const [moveTimer, setMoveTimer] = useState(30);
  const [chatMessages,setChatMessages] = useState([]);
  const [chatInput,   setChatInput]    = useState("");
  const [showChat,    setShowChat]     = useState(false);
  const [showEmoji,   setShowEmoji]    = useState(false);
  const [showTip,     setShowTip]      = useState(false);
  const [floatEmoji,  setFloatEmoji]   = useState(null);
  const [tipMsg,      setTipMsg]       = useState(null);
  const [unread,      setUnread]       = useState(0);

  userIdRef.current = userId;

  useEffect(() => {
    const s = io(`${GAME_SERVER}/chess`, { transports:["websocket"], reconnection:true });
    sockRef.current = s;

    s.on("chess:searching", () => { setPhase("searching"); setSearchTime(0); });

    s.on("chess:matched", (data) => {
      clearInterval(timerRef.current); clearInterval(moveTimerRef.current);
      setChess(new Chess());
      setMyColor(data.myColor);
      setGameId(data.gameId);
      setOpponent(data.myColor==="w" ? data.black : data.white);
      setSelected(null); setLegalMoves([]); setLastMove(null);
      setInCheck(false); setGameOver(null);
      myReserveRef.current = 60;
      gameIdRef.current = data.gameId;
      setMyReserve(60); setMoveTimer(30);
      setChatMessages([]); setUnread(0);
      setShowChat(false); setShowEmoji(false); setShowTip(false);
      setPhase("playing");
    });

    s.on("chess:moved", (data) => {
      setChess(new Chess(data.fen));
      setLastMove(data.lastMove);
      setInCheck(data.inCheck);
      setSelected(null); setLegalMoves([]);
    });

    s.on("chess:gameover", (data) => {
      setGameOver(data); setPhase("gameover");
      clearInterval(timerRef.current); clearInterval(moveTimerRef.current);
      try {
        let uid = "";
        for (const src of [useRuntimeCustomerIdentityStore.getState().identity?.phone, profile?.phone]) {
          if (!src || src==="pending") continue;
          const n = src.replace(/\D/g,"").replace(/^84/,"0");
          if (n.length>=9) { uid=n; break; }
        }
        if (!uid) uid = profile?.id||"";
        if (uid) {
          const won=data?.winner===userId, draw=!data?.winner;
          fetch((import.meta.env.VITE_API_BASE_URL||"https://cing-backend-production.up.railway.app/api")+"/game/score",{
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ game_key:"chess", user_id:uid, score:won?3:draw?1:0,
              player_name:userName, avatar:userAvatar }),
          }).catch(()=>{});
        }
      } catch(e) {}
    });

    s.on("chess:timeout",   () => { clearInterval(timerRef.current); setPhase("lobby"); setMsg("Không tìm được đối thủ!"); setTimeout(()=>setMsg(""),4000); });
    s.on("chess:cancelled", () => { clearInterval(timerRef.current); setPhase("lobby"); });
    s.on("chess:error",     ({message}) => setMsg(message));
    s.on("chess:chat",      (data) => { setChatMessages(prev=>[...prev,data]); setUnread(prev=>prev+1); });
    s.on("chess:emoji",     ({userId:fromId,emoji}) => { setFloatEmoji({emoji,fromMe:fromId===userIdRef.current}); setTimeout(()=>setFloatEmoji(null),2500); });
    s.on("chess:tip_received", ({fromUserId,amount}) => { setTipMsg({amount,fromMe:fromUserId===userIdRef.current}); setTimeout(()=>setTipMsg(null),3000); });

    return () => { s.disconnect(); clearInterval(timerRef.current); clearInterval(moveTimerRef.current); };
  }, []);

  useEffect(() => {
    if (phase!=="searching") return;
    timerRef.current = setInterval(()=>setSearchTime(t=>t+1),1000);
    return ()=>clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase!=="playing") return;
    clearInterval(moveTimerRef.current);
    setMoveTimer(30);
    if (chess.turn()!==myColor) return;
    let t=30;
    moveTimerRef.current = setInterval(()=>{
      if (t>1) { t--; setMoveTimer(t); }
      else {
        myReserveRef.current--;
        setMyReserve(myReserveRef.current);
        if (myReserveRef.current<=0) {
          clearInterval(moveTimerRef.current);
          sockRef.current?.emit("chess:resign",{gameId:gameIdRef.current,userId:userIdRef.current});
        }
      }
    },1000);
    return ()=>clearInterval(moveTimerRef.current);
  }, [chess, phase, myColor]);

  const findMatch = useCallback(() => {
    if (!userId) return;
    const id = useRuntimeCustomerIdentityStore.getState().identity;
    sockRef.current?.emit("chess:find",{userId, name:id?.fullName||userName, avatar:id?.avatar||userAvatar});
  }, [userId, userName, userAvatar]);

  const cancelSearch = useCallback(() => { sockRef.current?.emit("chess:cancel",{userId}); }, [userId]);

  const resign = useCallback(() => {
    if (!window.confirm("Bạn chắc chắn muốn đầu hàng?")) return;
    sockRef.current?.emit("chess:resign",{gameId,userId});
  }, [gameId, userId]);

  const sendChat = () => {
    if (!chatInput.trim()||!gameIdRef.current) return;
    sockRef.current?.emit("chess:chat",{gameId:gameIdRef.current,userId:userIdRef.current,name:userName,message:chatInput.trim()});
    setChatInput("");
  };

  const sendEmoji = (emoji) => {
    if (!gameIdRef.current) return;
    sockRef.current?.emit("chess:emoji",{gameId:gameIdRef.current,userId:userIdRef.current,emoji});
    setShowEmoji(false);
  };

  const sendTip = (amount) => {
    if (!gameIdRef.current) return;
    sockRef.current?.emit("chess:tip",{gameId:gameIdRef.current,fromUserId:userIdRef.current,toUserId:opponent?.userId||opponent?.id||"",amount});
    setShowTip(false);
  };

  const handleSquareClick = useCallback((sq) => {
    if (phase!=="playing"||chess.turn()!==myColor) return;
    if (selected) {
      if (legalMoves.includes(sq)) {
        const piece=chess.get(selected);
        const isProm=piece?.type==="p"&&((myColor==="w"&&sq[1]==="8")||(myColor==="b"&&sq[1]==="1"));
        sockRef.current?.emit("chess:move",{gameId,userId,move:isProm?{from:selected,to:sq,promotion:"q"}:{from:selected,to:sq}});
        setSelected(null); setLegalMoves([]); return;
      }
      const cp=chess.get(sq);
      if (cp&&cp.color===myColor) { setSelected(sq); setLegalMoves(chess.moves({square:sq,verbose:true}).map(m=>m.to)); return; }
      setSelected(null); setLegalMoves([]); return;
    }
    const piece=chess.get(sq);
    if (!piece||piece.color!==myColor) return;
    setSelected(sq); setLegalMoves(chess.moves({square:sq,verbose:true}).map(m=>m.to));
  }, [phase,chess,myColor,selected,legalMoves,gameId,userId]);

  const renderBoard = () => {
    const board=chess.board();
    const files=["a","b","c","d","e","f","g","h"];
    const ranks=myColor==="w"?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
    const fOrder=myColor==="w"?[0,1,2,3,4,5,6,7]:[7,6,5,4,3,2,1,0];
    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)",
        width:"min(92vw,420px)", aspectRatio:"1/1", borderRadius:4, overflow:"hidden",
        boxShadow:"0 0 0 6px #6B4C11, 0 0 0 8px #8B6914, 0 8px 32px rgba(0,0,0,0.8)" }}>
        {ranks.map(r=>fOrder.map(f=>{
          const sq=files[f]+(r+1);
          const piece=board[7-r]?.[f];
          const isLight=(f+r)%2===0;
          const isSel=selected===sq, isLegal=legalMoves.includes(sq);
          const isLast=lastMove&&(lastMove.from===sq||lastMove.to===sq);
          const isChk=inCheck&&piece?.type==="k"&&piece?.color===chess.turn()&&piece?.color===myColor;
          let bg=isLight?LIGHT_SQ:DARK_SQ;
          if(isSel) bg=isLight?LIGHT_HL:DARK_HL;
          if(isLast) bg=isLight?LIGHT_MV:DARK_MV;
          if(isChk) bg="#e74c3c";
          const pk=piece?(piece.color+piece.type.toUpperCase()):null;
          return (
            <div key={sq} onClick={()=>handleSquareClick(sq)}
              style={{background:bg,position:"relative",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                WebkitTapHighlightColor:"transparent"}}>
              {pk&&<span style={{fontSize:"min(7vw,34px)",lineHeight:1,userSelect:"none",
                pointerEvents:"none",zIndex:2,position:"relative",
                color:piece.color==="w"?"#fffff0":"#1a0a00",
                textShadow:piece.color==="w"?"0 0 3px #000,0 2px 4px rgba(0,0,0,0.9)":"0 1px 3px rgba(255,255,255,0.15)",
                filter:piece.color==="w"?"drop-shadow(0 2px 3px rgba(0,0,0,0.95))":"drop-shadow(0 1px 2px rgba(0,0,0,0.6))"}}>
                {UNICODE[pk]}
              </span>}
              {isLegal&&!piece&&<div style={{width:"30%",height:"30%",borderRadius:"50%",background:"rgba(0,0,0,0.22)",pointerEvents:"none",zIndex:3}}/>}
              {isLegal&&piece&&<div style={{position:"absolute",inset:0,border:"3px solid rgba(0,0,0,0.28)",background:"rgba(0,0,0,0.08)",pointerEvents:"none",zIndex:3}}/>}
              {f===0&&<span style={{position:"absolute",top:2,left:3,fontSize:9,fontWeight:700,color:isLight?DARK_SQ:LIGHT_SQ,opacity:0.75,pointerEvents:"none",zIndex:1}}>{r+1}</span>}
              {r===0&&<span style={{position:"absolute",bottom:2,right:3,fontSize:9,fontWeight:700,color:isLight?DARK_SQ:LIGHT_SQ,opacity:0.75,pointerEvents:"none",zIndex:1}}>{files[f]}</span>}
            </div>
          );
        }))}
      </div>
    );
  };

  const isMyTurn=chess.turn()===myColor;

  if (phase==="lobby") return (
    <div style={{background:"linear-gradient(160deg,#1a0a0a,#2d1a0a,#0a0a1a)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px"}}>
      <div style={{fontSize:56,marginBottom:8}}>♟️</div>
      <h1 style={{color:"#FFD700",fontSize:22,fontWeight:900,margin:"0 0 4px",letterSpacing:2}}>CỜ VUA</h1>
      <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"0 0 28px"}}>Cing Hu Tang Kinh Bắc · Đối kháng 1v1</p>
      {msg&&<div style={{background:"rgba(255,152,0,0.12)",border:"1px solid #FF9800",color:"#FF9800",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:13,textAlign:"center"}}>{msg}</div>}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"16px 20px",marginBottom:20,width:"100%",maxWidth:320,border:"1px solid rgba(255,255,255,0.08)"}}>
        {["♟ Tìm đối thủ tối đa 60 giây","⏱ Mỗi nước đi tối đa 30 giây","⏳ 60s quỹ dự trữ — hết quỹ là thua","♔ Chiếu hết đối thủ để thắng"].map((r,i)=><p key={i} style={{color:"rgba(255,255,255,0.5)",fontSize:12,margin:"0 0 5px"}}>{r}</p>)}
      </div>
      <button onClick={findMatch} style={{background:"linear-gradient(135deg,#D4531C,#FF6B35)",border:"none",color:"white",borderRadius:14,padding:"15px 48px",fontSize:16,fontWeight:900,cursor:"pointer",width:"100%",maxWidth:320,boxShadow:"0 4px 20px rgba(212,83,28,0.4)"}}>♟ Tìm đối thủ</button>
      <button onClick={()=>setShowLB(true)} style={{background:"rgba(255,215,0,0.06)",border:"1px solid rgba(255,215,0,0.2)",color:"#FFD700",borderRadius:12,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%",maxWidth:320,marginTop:10}}>🏆 Bảng xếp hạng</button>
      <button onClick={onExit} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",marginTop:14,fontSize:13,cursor:"pointer"}}>← Quay lại</button>
      {showLB&&<ChessLeaderboard onClose={()=>setShowLB(false)}/>}
    </div>
  );

  if (phase==="searching") return (
    <div style={{background:"linear-gradient(160deg,#1a0a0a,#2d1a0a,#0a0a1a)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontSize:56,marginBottom:20,display:"inline-block",animation:"spin 3s linear infinite"}}>♟️</div>
      <h2 style={{color:"white",fontSize:18,fontWeight:900,margin:"0 0 8px"}}>Đang tìm đối thủ...</h2>
      <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,margin:"0 0 20px"}}>{searchTime}s / 60s</p>
      <div style={{width:260,height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,marginBottom:28,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#D4531C,#FFD700)",width:`${Math.min((searchTime/60)*100,100)}%`,transition:"width 1s linear"}}/>
      </div>
      <button onClick={cancelSearch} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.5)",borderRadius:12,padding:"11px 28px",fontSize:13,cursor:"pointer"}}>Hủy</button>
    </div>
  );

  if (phase==="playing") return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"#080604",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:"env(safe-area-inset-top,0px)"}}>
      <style>{`@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-120px) scale(2)}} @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Branding */}
      <div style={{width:"100%",textAlign:"center",padding:"3px 0",background:"#080604",flexShrink:0}}>
        <p style={{color:"#FFD700",fontSize:12,fontWeight:900,margin:0,letterSpacing:1}}>Cing Hu Tang Kinh Bắc</p>
        <p style={{color:"rgba(255,215,0,0.5)",fontSize:10,margin:0}}>Kỳ thủ cờ vua</p>
      </div>

      {/* Opponent */}
      <div style={{width:"100%",maxWidth:460,padding:"8px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:10,background:!isMyTurn?"rgba(255,215,0,0.07)":"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{width:40,height:40,borderRadius:20,overflow:"hidden",flexShrink:0,border:`2px solid ${!isMyTurn?"#FFD700":"rgba(255,255,255,0.12)"}`,boxShadow:!isMyTurn?"0 0 10px rgba(255,215,0,0.35)":"none"}}>
          {opponent?.avatar?<img src={opponent.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            :<div style={{width:"100%",height:"100%",background:"#2a2a3a",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:16,fontWeight:900}}>{(opponent?.name||"?")[0]?.toUpperCase()}</div>}
        </div>
        <div style={{flex:1}}>
          <p style={{color:"white",fontSize:13,fontWeight:800,margin:0}}>{opponent?.name||"Đối thủ"}</p>
          <p style={{color:myColor==="w"?"rgba(255,255,255,0.4)":"#FFD700",fontSize:10,margin:0}}>{myColor==="w"?"♚ Quân Đen":"♔ Quân Trắng"}</p>
        </div>
        {!isMyTurn
          ?<span style={{background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.4)",color:"#FFD700",borderRadius:8,padding:"3px 10px",fontSize:10,fontWeight:800}}>⏳ Đang đi...</span>
          :<span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>Chờ...</span>}
      </div>

      {inCheck&&isMyTurn&&<div style={{width:"100%",maxWidth:460,padding:"4px 0",flexShrink:0,background:"rgba(231,76,60,0.18)",textAlign:"center",color:"#e74c3c",fontSize:11,fontWeight:800}}>⚠️ Vua đang bị chiếu!</div>}

      {/* Board */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"4px 0"}}>
        {renderBoard()}
      </div>

      {/* My bar */}
      <div style={{width:"100%",maxWidth:460,padding:"8px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:10,background:isMyTurn?"rgba(212,83,28,0.08)":"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{width:40,height:40,borderRadius:20,overflow:"hidden",flexShrink:0,border:`2px solid ${isMyTurn?"#D4531C":"rgba(255,255,255,0.12)"}`,boxShadow:isMyTurn?"0 0 10px rgba(212,83,28,0.4)":"none"}}>
          {userAvatar?<img src={userAvatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            :<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#D4531C,#FF6B35)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:16,fontWeight:900}}>{(userName||"?")[0]?.toUpperCase()}</div>}
        </div>
        <div style={{flex:1}}>
          <p style={{color:"white",fontSize:13,fontWeight:800,margin:0}}>{userName} <span style={{color:"#D4531C",fontSize:10}}>(bạn)</span></p>
          <p style={{color:myColor==="w"?"#FFD700":"rgba(255,255,255,0.4)",fontSize:10,margin:0}}>{myColor==="w"?"♔ Quân Trắng":"♚ Quân Đen"}</p>
        </div>
        <div style={{textAlign:"right"}}>
          {isMyTurn?<p style={{color:"#D4531C",fontSize:11,fontWeight:900,margin:"0 0 2px"}}>🎯 {moveTimer>0?`${moveTimer}s`:`⚠️${myReserve}s`}</p>:<p style={{color:"rgba(255,255,255,0.2)",fontSize:10,margin:"0 0 2px"}}>Chờ...</p>}
          <p style={{color:myReserve<15?"#e74c3c":"rgba(255,255,255,0.3)",fontSize:9,margin:0}}>🕐 {myReserve}s</p>
        </div>
        <button onClick={resign} style={{background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.35)",color:"#e74c3c",borderRadius:8,padding:"6px 10px",fontSize:10,cursor:"pointer",fontWeight:800,flexShrink:0}}>🏳 Đầu hàng</button>
      </div>

      {/* Action buttons */}
      <div style={{display:"flex",gap:12,justifyContent:"center",padding:"8px 0 calc(env(safe-area-inset-bottom,0px) + 10px)",background:"#080604",width:"100%",flexShrink:0}}>
        <button onClick={()=>{setShowEmoji(v=>!v);setShowTip(false);setShowChat(false);}}
          style={{width:46,height:46,borderRadius:23,border:`2px solid ${showEmoji?"#FF9632":"transparent"}`,cursor:"pointer",background:showEmoji?"rgba(255,150,50,0.2)":"rgba(255,150,50,0.85)",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>😄</button>
        <button onClick={()=>{setShowTip(v=>!v);setShowEmoji(false);setShowChat(false);}}
          style={{width:46,height:46,borderRadius:23,border:`2px solid ${showTip?"#FFD700":"transparent"}`,cursor:"pointer",background:showTip?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.85)",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>💎</button>
        <button onClick={()=>{setShowChat(v=>!v);setShowEmoji(false);setShowTip(false);if(!showChat)setUnread(0);}}
          style={{width:46,height:46,borderRadius:23,border:`2px solid ${showChat?"#D4531C":"transparent"}`,cursor:"pointer",background:showChat?"rgba(212,83,28,0.3)":"rgba(255,255,255,0.12)",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          💬
          {unread>0&&!showChat&&<div style={{position:"absolute",top:-3,right:-3,background:"#e74c3c",width:16,height:16,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"white"}}>{unread}</div>}
        </button>
      </div>

      {/* Float emoji via portal */}
      {floatEmoji&&createPortal(
        <div style={{position:"fixed",top:"40%",left:"50%",transform:"translateX(-50%)",fontSize:80,zIndex:9999,animation:"floatUp 2.5s ease-out forwards",pointerEvents:"none"}}>
          {floatEmoji.emoji}
        </div>,document.body
      )}

      {/* Tip message via portal */}
      {tipMsg&&createPortal(
        <div style={{position:"fixed",top:80,left:16,right:16,zIndex:9999,background:tipMsg.fromMe?"rgba(212,83,28,0.95)":"rgba(0,160,90,0.95)",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,animation:"fadeIn 0.3s ease"}}>
          <span style={{fontSize:22}}>💎</span>
          <p style={{color:"white",fontSize:13,fontWeight:800,margin:0}}>{tipMsg.fromMe?`Bạn đã tặng ${tipMsg.amount} điểm!`:`Đối thủ tặng bạn ${tipMsg.amount} điểm! 🎉`}</p>
        </div>,document.body
      )}

      {/* Emoji modal */}
      {showEmoji&&<Modal onClose={()=>setShowEmoji(false)}>
        <div style={{background:"#0d0a08",borderRadius:16,padding:"16px 20px",border:"1px solid rgba(255,215,0,0.25)"}}>
          <p style={{color:"#FFD700",fontSize:12,fontWeight:800,margin:"0 0 12px",textAlign:"center"}}>Gửi emoji</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,maxWidth:240,justifyContent:"center"}}>
            {["😄","😂","🤔","😮","👏","🔥","💀","🤝","😈","❤️"].map(e=>(
              <button key={e} onClick={()=>sendEmoji(e)}
                style={{fontSize:34,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"8px",cursor:"pointer",lineHeight:1}}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </Modal>}

      {/* Tip modal */}
      {showTip&&<Modal onClose={()=>setShowTip(false)}>
        <div style={{background:"#0d0a08",borderRadius:16,padding:"16px 20px",border:"1px solid rgba(255,215,0,0.25)",minWidth:220}}>
          <p style={{color:"#FFD700",fontSize:13,fontWeight:800,margin:"0 0 12px",textAlign:"center"}}>💎 Tặng điểm cho đối thủ</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[{amount:5,fx:"✨",label:"5 điểm",bg:"rgba(255,255,255,0.06)"},{amount:10,fx:"⭐",label:"10 điểm",bg:"rgba(100,180,255,0.12)"},{amount:20,fx:"🌟",label:"20 điểm",bg:"rgba(255,215,0,0.12)"},{amount:50,fx:"💫",label:"50 điểm",bg:"rgba(255,150,0,0.15)"},{amount:100,fx:"🔥",label:"100 điểm",bg:"rgba(212,83,28,0.25)"}].map(t=>(
              <button key={t.amount} onClick={()=>sendTip(t.amount)}
                style={{background:t.bg,border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 16px",color:"white",fontSize:14,fontWeight:700,cursor:"pointer",textAlign:"left"}}>
                {t.fx} {t.label}
              </button>
            ))}
          </div>
        </div>
      </Modal>}

      {/* Chat portal */}
      {showChat&&<ChatPortal messages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} sendChat={sendChat} onClose={()=>setShowChat(false)} userIdRef={userIdRef}/>}
    </div>
  );

  if (phase==="gameover") {
    const won=gameOver?.winner===userId, draw=!gameOver?.winner;
    const r={checkmate:"Chiếu hết",resign:"Đầu hàng",disconnect:"Đối thủ thoát",stalemate:"Hòa - Pat",repetition:"Hòa - Lặp nước",insufficient:"Hòa - Thiếu quân"}[gameOver?.reason]||gameOver?.reason;
    return (
      <div style={{background:"linear-gradient(160deg,#1a0a0a,#2d1a0a,#0a0a1a)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{fontSize:60,marginBottom:12}}>{won?"🏆":draw?"🤝":"💀"}</div>
        <h2 style={{color:won?"#FFD700":draw?"#888":"#e74c3c",fontSize:24,fontWeight:900,margin:"0 0 6px"}}>{won?"Chiến thắng!":draw?"Hòa cờ!":"Thất bại!"}</h2>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:"0 0 28px"}}>{r}</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:280}}>
          <button onClick={findMatch} style={{background:"linear-gradient(135deg,#D4531C,#FF6B35)",border:"none",color:"white",borderRadius:14,padding:"14px",fontSize:15,fontWeight:900,cursor:"pointer"}}>♟ Tìm ván mới</button>
          <button onClick={onExit} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.4)",borderRadius:14,padding:"12px",fontSize:14,cursor:"pointer"}}>← Thoát</button>
        </div>
      </div>
    );
  }
  return null;
}
