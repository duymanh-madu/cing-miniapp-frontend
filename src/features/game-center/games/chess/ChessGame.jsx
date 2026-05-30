import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import useAuthStore from "@/stores/auth/authStore";
import ChessLeaderboard from "./ChessLeaderboard";

const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || "https://cing-backend-production.up.railway.app";

// Màu quân cờ
const LIGHT_SQ = "#F0D9B5";
const DARK_SQ  = "#B58863";
const LIGHT_HL = "#F6F669";
const DARK_HL  = "#BACA2B";
const LIGHT_MV = "#CDD16E";
const DARK_MV  = "#AABA4B";

// Unicode quân cờ đẹp
const PIECES = {
  wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙",
  bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟",
};

const PIECE_COLORS = { w:"#FFFDE7", b:"#212121" };
const PIECE_SHADOW = { w:"rgba(0,0,0,0.5)", b:"rgba(255,255,255,0.15)" };

export default function ChessGame({ onExit }) {
  const profile  = useAuthStore(s => s.profile);
  const userId   = profile?.id || profile?.phone;
  const userName = profile?.name || profile?.zalo_name || "Cing iu";
  const userAvatar = profile?.avatar || "";

  const sockRef  = useRef(null);
  const [phase,  setPhase]  = useState("lobby"); // lobby | searching | playing | gameover
  const [chess,  setChess]  = useState(new Chess());
  const [myColor,setMyColor]= useState("w");
  const [gameId, setGameId] = useState(null);
  const [opponent,setOpponent]=useState(null);
  const [selected,setSelected]=useState(null);
  const [legalMoves,setLegalMoves]=useState([]);
  const [lastMove,setLastMove]=useState(null);
  const [inCheck,setInCheck]=useState(false);
  const [gameOver,setGameOver]=useState(null);
  const [searchTime,setSearchTime]=useState(0);
  const [msg,setMsg]=useState("");
  const [showLB,setShowLB]=useState(false);
  const timerRef    = useRef(null);
  const moveTimerRef  = useRef(null);
  const myReserveRef  = useRef(60);
  const gameIdRef     = useRef(null);
  const userIdRef     = useRef(null);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput,    setChatInput]    = useState("");
  const [showChat,     setShowChat]     = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const chatEndRef = useRef(null);

  // Voice WebRTC
  const [voiceState,   setVoiceState]   = useState("idle"); // idle | requesting | active | denied
  const peerRef        = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [myReserve,  setMyReserve]  = useState(60);
  const [oppReserve, setOppReserve] = useState(60);
  const [moveTimer,  setMoveTimer]  = useState(30);

  // Socket connection
  useEffect(() => {
    const s = io(`${GAME_SERVER}/chess`, {
      transports:["websocket"],
      reconnection:true,
    });
    sockRef.current = s;

    s.on("chess:searching", () => {
      setPhase("searching");
      setSearchTime(0);
    });

    s.on("chess:matched", (data) => {
      clearInterval(timerRef.current);
      clearInterval(moveTimerRef.current);
      const c = new Chess();
      setChess(c);
      setMyColor(data.myColor);
      setGameId(data.gameId);
      setOpponent(data.myColor === "w" ? data.black : data.white);
      setSelected(null);
      setLegalMoves([]);
      setLastMove(null);
      setInCheck(false);
      setGameOver(null);
      // Reset timer cho ván mới
      myReserveRef.current = 60;
      gameIdRef.current = data.gameId;
      setMyReserve(60);
      setOppReserve(60);
      setMoveTimer(30);
      setPhase("playing");
    });

    s.on("chess:moved", (data) => {
      setChess(prev => {
        const c = new Chess(data.fen);
        return c;
      });
      setLastMove(data.lastMove);
      setInCheck(data.inCheck);
      setSelected(null);
      setLegalMoves([]);
    });

    s.on("chess:gameover", (data) => {
      setGameOver(data);
      setPhase("gameover");
      clearInterval(timerRef.current);
      clearInterval(moveTimerRef.current);
      // Save score
      try {
        const sources = [
          useRuntimeCustomerIdentityStore?.getState()?.identity?.phone,
          profile?.phone,
        ];
        let uid = "";
        for (const src of sources) {
          if (!src || src === "pending") continue;
          const n = src.replace(/\D/g,"").replace(/^84/,"0");
          if (n.length >= 9) { uid = n; break; }
        }
        if (!uid) uid = profile?.id || "";
        if (uid) {
          const won  = data?.winner === userId;
          const draw = !data?.winner;
          const score = won ? 3 : draw ? 1 : 0;
          fetch((import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api") + "/game/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              game_key: "chess", user_id: uid, score,
              player_name: profile?.name || userName,
              avatar: profile?.avatar || userAvatar,
            }),
          }).catch(() => {});
        }
      } catch(e) {}
    });

    s.on("chess:timeout", () => {
      clearInterval(timerRef.current);
      setPhase("lobby");
      setMsg("Không tìm được đối thủ. Thử lại sau!");
      setTimeout(() => setMsg(""), 4000);
    });

    s.on("chess:cancelled", () => {
      clearInterval(timerRef.current);
      setPhase("lobby");
    });

    s.on("chess:error", ({ message }) => setMsg(message));

    // Chat
    s.on("chess:chat", (data) => {
      setChatMessages(prev => [...prev, data]);
      setUnreadCount(prev => showChat ? 0 : prev + 1);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    });

    // Voice signaling
    s.on("chess:voice_request", () => setVoiceState("requesting"));
    s.on("chess:voice_accept",  () => startVoiceCall());
    s.on("chess:voice_end",     () => endVoiceCall());
    s.on("chess:signal", async ({ signal }) => {
      if (!peerRef.current) return;
      try {
        if (signal.type === "offer") {
          await peerRef.current.setRemoteDescription(signal);
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          s.emit("chess:signal", { gameId: gameIdRef.current, userId: userIdRef.current, signal: answer });
        } else if (signal.type === "answer") {
          await peerRef.current.setRemoteDescription(signal);
        } else if (signal.candidate) {
          await peerRef.current.addIceCandidate(signal);
        }
      } catch(e) {}
    });

    return () => { s.disconnect(); clearInterval(timerRef.current); };
  }, []);

  // Search timer
  useEffect(() => {
    if (phase === "searching") {
      timerRef.current = setInterval(() => setSearchTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Move timer 30s + reserve 60s
  useEffect(() => {
    if (phase !== "playing") return;
    const myTurn = chess.turn() === myColor;
    clearInterval(moveTimerRef.current);
    setMoveTimer(30);

    if (myTurn) {
      let move = 30;
      moveTimerRef.current = setInterval(() => {
        if (move > 1) {
          move--;
          setMoveTimer(move);
        } else {
          // Hết 30s → dùng reserve
          myReserveRef.current = myReserveRef.current - 1;
          setMyReserve(myReserveRef.current);
          if (myReserveRef.current <= 0) {
            // Hết reserve → thua
            clearInterval(moveTimerRef.current);
            sockRef.current?.emit("chess:resign", {
              gameId: gameIdRef.current,
              userId: userIdRef.current || userId,
            });
          }
        }
      }, 1000);
    }
    return () => clearInterval(moveTimerRef.current);
  }, [chess, phase, myColor]);

  // Sync refs
  userIdRef.current = userId;

  // Send chat
  const sendChat = () => {
    if (!chatInput.trim() || !gameIdRef.current) return;
    sockRef.current?.emit("chess:chat", {
      gameId: gameIdRef.current,
      userId: userIdRef.current,
      name: userName,
      message: chatInput.trim(),
    });
    setChatInput("");
  };

  // Voice call
  const requestVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peerRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.onicecandidate = (e) => {
        if (e.candidate) sockRef.current?.emit("chess:signal", { gameId: gameIdRef.current, userId: userIdRef.current, signal: e.candidate });
      };
      pc.ontrack = (e) => {
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sockRef.current?.emit("chess:signal", { gameId: gameIdRef.current, userId: userIdRef.current, signal: offer });
      sockRef.current?.emit("chess:voice_request", { gameId: gameIdRef.current, userId: userIdRef.current });
      setVoiceState("requesting");
    } catch(e) { console.warn("Voice request failed:", e.message); }
  };

  const startVoiceCall = async () => {
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        peerRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        pc.onicecandidate = (e) => {
          if (e.candidate) sockRef.current?.emit("chess:signal", { gameId: gameIdRef.current, userId: userIdRef.current, signal: e.candidate });
        };
        pc.ontrack = (e) => {
          if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
        };
        sockRef.current?.emit("chess:voice_accept", { gameId: gameIdRef.current, userId: userIdRef.current });
      } catch(e) {}
    } else {
      sockRef.current?.emit("chess:voice_accept", { gameId: gameIdRef.current, userId: userIdRef.current });
    }
    setVoiceState("active");
  };

  const endVoiceCall = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setVoiceState("idle");
    sockRef.current?.emit("chess:voice_end", { gameId: gameIdRef.current, userId: userIdRef.current });
  };

  const findMatch = useCallback(() => {
    if (!userId) return;
    sockRef.current?.emit("chess:find", { userId, name: userName, avatar: userAvatar });
  }, [userId, userName, userAvatar]);

  const cancelSearch = useCallback(() => {
    sockRef.current?.emit("chess:cancel", { userId });
  }, [userId]);

  const resign = useCallback(() => {
    if (window.confirm("Bạn chắc chắn muốn đầu hàng?")) {
      sockRef.current?.emit("chess:resign", { gameId, userId });
    }
  }, [gameId, userId]);

  // Click ô cờ
  const handleSquareClick = useCallback((sq) => {
    if (phase !== "playing") return;
    if (chess.turn() !== myColor) return; // không phải lượt mình

    if (selected) {
      // Thử di chuyển
      if (legalMoves.includes(sq)) {
        // Kiểm tra phong cờ
        const piece = chess.get(selected);
        const isPromotion = piece?.type === "p" &&
          ((myColor === "w" && sq[1] === "8") || (myColor === "b" && sq[1] === "1"));

        const move = isPromotion
          ? { from: selected, to: sq, promotion: "q" }
          : { from: selected, to: sq };

        sockRef.current?.emit("chess:move", { gameId, move, userId });
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      // Chọn quân khác
      setSelected(null);
      setLegalMoves([]);
    }

    const piece = chess.get(sq);
    if (!piece || piece.color !== myColor) return;

    const moves = chess.moves({ square: sq, verbose: true }).map(m => m.to);
    setSelected(sq);
    setLegalMoves(moves);
  }, [phase, chess, myColor, selected, legalMoves, gameId, userId]);

  // Render bàn cờ
  const renderBoard = () => {
    const board  = chess.board();
    const files  = ["a","b","c","d","e","f","g","h"];
    const ranks  = myColor === "w" ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
    const fOrder = myColor === "w" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

    return (
      <div style={{ position:"relative" }}>
        {/* Bàn cờ */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(8,1fr)",
          gridTemplateRows:"repeat(8,1fr)",
          width:"min(94vw,440px)", aspectRatio:"1/1",
          borderRadius:4, overflow:"hidden",
          boxShadow:"0 12px 40px rgba(0,0,0,0.8), 0 0 0 8px #6B4C11, 0 0 0 10px #8B6914",
          border:"none",
        }}>
          {ranks.map(r => fOrder.map(f => {
            const sq    = files[f] + (r+1);
            const piece = board[7-r]?.[f];
            const isLight  = (f+r)%2 === 0;
            const isSel    = selected === sq;
            const isLegal  = legalMoves.includes(sq);
            const isLast   = lastMove && (lastMove.from===sq || lastMove.to===sq);
            const isKingChk= inCheck && piece?.type==="k" && piece?.color===chess.turn() && piece?.color===myColor;

            let bg = isLight ? LIGHT_SQ : DARK_SQ;
            if (isSel)     bg = isLight ? LIGHT_HL  : DARK_HL;
            if (isLast)    bg = isLight ? LIGHT_MV  : DARK_MV;
            if (isKingChk) bg = "#FF4444";

            const pieceKey = piece ? (piece.color + piece.type.toUpperCase()) : null;

            return (
              <div key={sq} onClick={() => handleSquareClick(sq)}
                style={{ background:bg, display:"flex", alignItems:"center",
                  justifyContent:"center", position:"relative", cursor:"pointer",
                  transition:"background 0.1s" }}>

                {/* Quân cờ — Unicode rõ nét, đúng màu */}
                {pieceKey && (
                  <div style={{
                    position:"absolute", inset:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"min(6.5vw,32px)",
                    color: piece.color==="w" ? "#fffff0" : "#1a1208",
                    textShadow: piece.color==="w"
                      ? "0 0 2px #000, 0 1px 3px rgba(0,0,0,1), 1px 1px 0 #000, -1px -1px 0 #333"
                      : "0 1px 2px rgba(255,255,255,0.2)",
                    userSelect:"none", lineHeight:1,
                    filter: piece.color==="w"
                      ? "drop-shadow(0 2px 2px rgba(0,0,0,1))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                    zIndex:2, pointerEvents:"none",
                    WebkitFontSmoothing:"antialiased",
                  }}>
                    {{"wK":"♔","wQ":"♕","wR":"♖","wB":"♗","wN":"♘","wP":"♙",
                      "bK":"♚","bQ":"♛","bR":"♜","bB":"♝","bN":"♞","bP":"♟"}[pieceKey]}
                  </div>
                )}

                {/* Nước đi hợp lệ */}
                {isLegal && !piece && (
                  <div style={{
                    width:"32%", height:"32%", borderRadius:"50%",
                    background:"rgba(0,0,0,0.2)", zIndex:3,
                  }}/>
                )}
                {isLegal && piece && (
                  <div style={{
                    position:"absolute", inset:0, borderRadius:0,
                    border:"3px solid rgba(0,0,0,0.3)",
                    background:"rgba(0,0,0,0.1)", zIndex:3,
                  }}/>
                )}

                {/* Tọa độ */}
                {f===0 && (
                  <span style={{ position:"absolute", top:2, left:3, fontSize:9,
                    fontWeight:700, color:isLight?DARK_SQ:LIGHT_SQ, opacity:0.7, zIndex:1 }}>
                    {r+1}
                  </span>
                )}
                {r===0 && (
                  <span style={{ position:"absolute", bottom:2, right:3, fontSize:9,
                    fontWeight:700, color:isLight?DARK_SQ:LIGHT_SQ, opacity:0.7, zIndex:1 }}>
                    {files[f]}
                  </span>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    );
  };

  const isMyTurn = chess.turn() === myColor;

  // ── LOBBY ──
  if (phase === "lobby") return (
    <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1a0a,#1a0a0a)",
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ fontSize:60, marginBottom:8 }}>♟️</div>
      <h1 style={{ color:"#FFD700", fontSize:24, fontWeight:900, margin:"0 0 4px",
        textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>CỜ VUA</h1>
      <p style={{ color:"#888", fontSize:13, margin:"0 0 32px" }}>Đối kháng 1v1 realtime</p>

      {msg && <div style={{ background:"rgba(255,152,0,0.15)", border:"1px solid #FF9800",
        color:"#FF9800", borderRadius:12, padding:"10px 16px",
        marginBottom:16, fontSize:13, textAlign:"center" }}>{msg}</div>}

      <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:16,
        padding:"20px", marginBottom:24, width:"100%", maxWidth:320,
        border:"1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2,
          margin:"0 0 12px", textTransform:"uppercase" }}>Luật chơi</p>
        {[
          "♟ Tìm đối thủ tối đa 60 giây",
          "🎯 Bạn chỉ mất lượt chơi khi vào ván",
          "⚔️ Trận đấu bắt đầu khi 2 người vào",
          "♔ Chiếu hết đối thủ để thắng",
          "📊 BXH theo số trận thắng & chuỗi thắng",
        ].map((r,i) => <p key={i} style={{ color:"#aaa", fontSize:12, margin:"0 0 6px" }}>{r}</p>)}
      </div>

      <button onClick={findMatch} style={{ background:"linear-gradient(135deg,#D4531C,#FF6B35)",
        border:"none", color:"white", borderRadius:16, padding:"16px 48px",
        fontSize:17, fontWeight:900, cursor:"pointer", width:"100%", maxWidth:320,
        boxShadow:"0 4px 20px rgba(212,83,28,0.4)" }}>
        ♟ Tìm đối thủ
      </button>
      <button onClick={() => setShowLB(true)} style={{ background:"rgba(255,215,0,0.08)",
        border:"1px solid rgba(255,215,0,0.2)", color:"#FFD700",
        borderRadius:12, padding:"12px", fontSize:13, fontWeight:700,
        cursor:"pointer", width:"100%", maxWidth:320, marginTop:10 }}>
        🏆 Bảng xếp hạng Kỳ thủ
      </button>
      <button onClick={onExit} style={{ background:"none", border:"none",
        color:"#666", marginTop:14, fontSize:13, cursor:"pointer" }}>← Quay lại</button>
      {showLB && <ChessLeaderboard onClose={() => setShowLB(false)} />}
    </div>
  );

  // ── SEARCHING ──
  if (phase === "searching") return (
    <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1a0a,#1a0a0a)",
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ fontSize:60, marginBottom:20,
        animation:"spin 3s linear infinite",
        display:"inline-block" }}>♟️</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 8px" }}>Đang tìm đối thủ...</h2>
      <p style={{ color:"#888", fontSize:14, margin:"0 0 24px" }}>
        {searchTime < 60 ? `${searchTime}s / 60s` : "Sắp hết thời gian..."}
      </p>
      {/* Progress bar */}
      <div style={{ width:"100%", maxWidth:280, height:6,
        background:"rgba(255,255,255,0.1)", borderRadius:3, marginBottom:32, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:3,
          background:"linear-gradient(90deg,#D4531C,#FFD700)",
          width:`${(searchTime/60)*100}%`, transition:"width 1s linear" }}/>
      </div>
      <button onClick={cancelSearch} style={{ background:"rgba(255,255,255,0.08)",
        border:"1px solid rgba(255,255,255,0.2)", color:"#888",
        borderRadius:12, padding:"12px 32px", fontSize:14, cursor:"pointer" }}>
        Hủy tìm kiếm
      </button>
    </div>
  );

  // ── PLAYING ──
  if (phase === "playing") return (
    <div style={{ background:"#0a0604", position:"fixed", inset:0, zIndex:200,
      display:"flex", flexDirection:"column", alignItems:"center",
      paddingTop:"env(safe-area-inset-top, 0px)" }}>

      {/* Đối thủ (trên) */}
      <div style={{ width:"100%", maxWidth:480, padding:"10px 16px",
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
        background: !isMyTurn ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
        borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width:44, height:44, borderRadius:22, overflow:"hidden", flexShrink:0,
          border:`3px solid ${!isMyTurn?"#FFD700":"rgba(255,255,255,0.15)"}`,
          boxShadow: !isMyTurn?"0 0 12px rgba(255,215,0,0.4)":"none" }}>
          {opponent?.avatar
            ? <img src={opponent.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#333,#555)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:18,fontWeight:900}}>
                {(opponent?.name||"?")[0]?.toUpperCase()}
              </div>}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 2px" }}>{opponent?.name||"Đối thủ"}</p>
          <p style={{ color: myColor==="w"?"#aaa":"#FFD700", fontSize:11, margin:0, fontWeight:600 }}>
            {myColor==="w"?"♚ Quân Đen":"♔ Quân Trắng"}
          </p>
        </div>
        {!isMyTurn
          ? <div style={{ background:"rgba(255,215,0,0.15)", border:"1px solid #FFD700", borderRadius:10, padding:"5px 12px" }}>
              <p style={{ color:"#FFD700", fontSize:11, fontWeight:900, margin:0 }}>⏳ Đang đi...</p>
            </div>
          : <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"5px 12px" }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11, fontWeight:600, margin:0 }}>Chờ...</p>
            </div>}
      </div>

      {/* Check warning */}
      {inCheck && isMyTurn && (
        <div style={{ background:"rgba(255,68,68,0.2)", border:"1px solid #FF4444",
          color:"#FF4444", padding:"5px 20px", fontSize:12, fontWeight:800,
          width:"100%", maxWidth:480, textAlign:"center", flexShrink:0 }}>
          ⚠️ Vua đang bị chiếu!
        </div>
      )}

      {/* Bàn cờ — flex:1 để fill hết phần giữa */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"8px 0" }}>
        {renderBoard()}
      </div>

      {/* Mình (dưới) */}
      <div style={{ width:"100%", maxWidth:480, padding:"10px 16px",
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
        background: isMyTurn ? "rgba(212,83,28,0.1)" : "rgba(255,255,255,0.03)",
        borderTop:"1px solid rgba(255,255,255,0.08)",
        paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 10px)" }}>
        <div style={{ width:44, height:44, borderRadius:22, overflow:"hidden", flexShrink:0,
          border:`3px solid ${isMyTurn?"#D4531C":"rgba(255,255,255,0.15)"}`,
          boxShadow: isMyTurn?"0 0 12px rgba(212,83,28,0.5)":"none" }}>
          {userAvatar
            ? <img src={userAvatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#D4531C,#FF6B35)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:18,fontWeight:900}}>
                {(userName||"?")[0]?.toUpperCase()}
              </div>}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 2px" }}>{userName} <span style={{color:"#D4531C",fontSize:11}}>(bạn)</span></p>
          <p style={{ color: myColor==="w"?"#FFD700":"#aaa", fontSize:11, margin:0, fontWeight:600 }}>
            {myColor==="w"?"♔ Quân Trắng":"♚ Quân Đen"}
          </p>
        </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            {isMyTurn
              ? <div style={{ background:"rgba(212,83,28,0.2)", border:"1px solid #D4531C", borderRadius:10, padding:"4px 10px" }}>
                  <p style={{ color:"#D4531C", fontSize:11, fontWeight:900, margin:0 }}>
                    🎯 {moveTimer > 0 ? `${moveTimer}s` : `⚠️${myReserve}s`}
                  </p>
                </div>
              : <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"4px 10px" }}>
                  <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11, margin:0 }}>Chờ...</p>
                </div>}
            <p style={{ color: myReserve < 15 ? "#FF4444" : "rgba(255,255,255,0.4)", fontSize:10, margin:0 }}>
              🕐 {myReserve}s dự trữ
            </p>
          </div>
        <button onClick={resign} style={{ background:"rgba(244,67,54,0.12)",
          border:"1px solid rgba(244,67,54,0.4)", color:"#f44336",
          borderRadius:10, padding:"7px 14px", fontSize:11, cursor:"pointer", fontWeight:800 }}>
          🏳 Đầu hàng
        </button>
      </div>

      {msg && <p style={{ color:"#FF9800", fontSize:12, position:"absolute", bottom:80, textAlign:"center" }}>{msg}</p>}

      {/* Audio element cho voice */}
      <audio ref={remoteAudioRef} autoPlay style={{ display:"none" }} />

      {/* Voice request notification */}
      {voiceState === "requesting" && (
        <div style={{ position:"fixed", top:80, left:16, right:16, zIndex:300,
          background:"rgba(0,200,100,0.95)", borderRadius:16, padding:"14px 18px",
          display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>🎙️</span>
          <div style={{ flex:1 }}>
            <p style={{ color:"white", fontWeight:800, fontSize:13, margin:0 }}>Yêu cầu voice chat</p>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:11, margin:"2px 0 0" }}>Đối thủ muốn nói chuyện</p>
          </div>
          <button onClick={startVoiceCall} style={{ background:"white", color:"#00c864", border:"none", borderRadius:10, padding:"6px 12px", fontWeight:800, cursor:"pointer", fontSize:12 }}>Chấp nhận</button>
          <button onClick={() => setVoiceState("idle")} style={{ background:"rgba(255,255,255,0.2)", color:"white", border:"none", borderRadius:10, padding:"6px 12px", fontWeight:700, cursor:"pointer", fontSize:12 }}>Từ chối</button>
        </div>
      )}

      {/* Chat bubble button */}
      <div style={{ position:"fixed", bottom:120, right:16, zIndex:200, display:"flex", flexDirection:"column", gap:8 }}>
        {/* Voice button */}
        <button onClick={voiceState === "active" ? endVoiceCall : requestVoice}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: voiceState === "active" ? "#ff4444" : "rgba(0,200,100,0.9)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          {voiceState === "active" ? "🔇" : "🎙️"}
        </button>
        {/* Chat button */}
        <button onClick={() => { setShowChat(v => !v); setUnreadCount(0); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background:"rgba(255,215,0,0.9)", position:"relative",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          💬
          {unreadCount > 0 && (
            <div style={{ position:"absolute", top:-4, right:-4, background:"#ff4444", color:"white",
              borderRadius:10, width:18, height:18, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:10, fontWeight:900 }}>{unreadCount}</div>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {showChat && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:250,
          background:"rgba(10,6,4,0.97)", borderRadius:"20px 20px 0 0",
          border:"1px solid rgba(255,215,0,0.2)", maxHeight:"50vh", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"12px 16px 8px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:0 }}>💬 Chat trong ván</p>
            <button onClick={() => setShowChat(false)} style={{ background:"none", border:"none", color:"#666", fontSize:18, cursor:"pointer" }}>✕</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"8px 12px", minHeight:120 }}>
            {chatMessages.length === 0 && (
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textAlign:"center", marginTop:20 }}>Chưa có tin nhắn</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ marginBottom:8, display:"flex", flexDirection:"column",
                alignItems: m.userId === userIdRef.current ? "flex-end" : "flex-start" }}>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, margin:"0 0 2px" }}>{m.name}</p>
                <div style={{ background: m.userId === userIdRef.current ? "#D4531C" : "rgba(255,255,255,0.1)",
                  borderRadius:12, padding:"6px 12px", maxWidth:"75%" }}>
                  <p style={{ color:"white", fontSize:13, margin:0 }}>{m.message}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>
          <div style={{ padding:"8px 12px 16px", display:"flex", gap:8, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Nhập tin nhắn..." maxLength={100}
              style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:10, padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}/>
            <button onClick={sendChat} disabled={!chatInput.trim()}
              style={{ background: chatInput.trim() ? "#D4531C" : "rgba(255,255,255,0.1)",
                border:"none", borderRadius:10, padding:"8px 14px", color:"white",
                fontSize:13, fontWeight:700, cursor:"pointer" }}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );

  // ── GAME OVER ──
  if (phase === "gameover") {
    const won  = gameOver?.winner === userId;
    const draw = !gameOver?.winner;
    const reasonText = {
      checkmate:    "Chiếu hết",
      resign:       "Đầu hàng",
      disconnect:   "Đối thủ thoát",
      stalemate:    "Hòa - Pat",
      repetition:   "Hòa - Lặp nước",
      insufficient: "Hòa - Thiếu quân",
    }[gameOver?.reason] || gameOver?.reason;

    return (
      <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1a0a,#1a0a0a)",
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ fontSize:64, marginBottom:12 }}>
          {won?"🏆":draw?"🤝":"💀"}
        </div>
        <h2 style={{ color: won?"#FFD700":draw?"#888":"#f44336",
          fontSize:26, fontWeight:900, margin:"0 0 6px" }}>
          {won?"Chiến thắng!":draw?"Hòa cờ!":"Thất bại!"}
        </h2>
        <p style={{ color:"#666", fontSize:14, margin:"0 0 8px" }}>{reasonText}</p>
        {won && <p style={{ color:"#4CAF50", fontSize:13, margin:"0 0 24px",
          fontWeight:700 }}>+20 điểm tích lũy 🎉</p>}
        {!won && !draw && <p style={{ color:"#888", fontSize:13, margin:"0 0 24px" }}>
          Cố gắng hơn ở ván tiếp theo!</p>}

        <div style={{ display:"flex", flexDirection:"column", gap:10,
          width:"100%", maxWidth:280 }}>
          <button onClick={findMatch} style={{ background:"linear-gradient(135deg,#D4531C,#FF6B35)",
            border:"none", color:"white", borderRadius:14, padding:"14px",
            fontSize:15, fontWeight:900, cursor:"pointer" }}>
            ♟ Tìm ván mới
          </button>
          <button onClick={onExit} style={{ background:"none",
            border:"1px solid #333", color:"#888",
            borderRadius:14, padding:"12px", fontSize:14, cursor:"pointer" }}>
            ← Thoát
          </button>
        </div>
      </div>
    );
  }

  return null;
}
