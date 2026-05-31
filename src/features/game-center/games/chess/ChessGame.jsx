import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import ChessLeaderboard from "./ChessLeaderboard";

const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || "https://cing-backend-production.up.railway.app";

// SVG quân cờ Staunton style — đẹp, có chiều sâu
function ChessPiece({ type, color }) {
  const w = color === "w";
  const fill   = w ? "#FFFDE7" : "#1a1208";
  const stroke = w ? "#555"    : "#000";
  const hi     = w ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.08)";

  const pieces = {
    p: ( // Tốt
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          <path d="M22.5 19c-3.5 0-6 2-6 4.5v1c0 1.5 1 3 3 3h6c2 0 3-1.5 3-3v-1c0-2.5-2.5-4.5-6-4.5z"/>
          <path d="M15 36h15M16 32.5h13" strokeWidth="2"/>
          <path d="M16.5 32.5c0-1.5 1.5-2.5 6-2.5s6 1 6 2.5" fill={fill}/>
        </g>
        <path d="M22.5 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill={hi}/>
      </svg>
    ),
    r: ( // Xe
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12z" strokeLinecap="butt"/>
          <path d="M11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
          <path d="M34 14l-3 3H14l-3-3"/>
          <path d="M31 17v12.5H14V17" strokeLinecap="butt"/>
          <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
          <path d="M11 14h23" strokeLinejoin="miter"/>
        </g>
        <rect x="13" y="10" width="2" height="3" fill={hi} rx="0.5"/>
        <rect x="21.5" y="10" width="2" height="3" fill={hi} rx="0.5"/>
        <rect x="30" y="10" width="2" height="3" fill={hi} rx="0.5"/>
      </svg>
    ),
    n: ( // Mã
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
          <path d="M24 18c.38 5.12-5 9.5-9.5 9.5-4.67 0-9.44-4.33-9.5-9.5.13-2.38 1.28-3.26 2.5-4 2.5-1.5 5.88-.5 7.5 2"/>
          <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill={stroke} stroke={stroke}/>
          <path d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 6.9 4.05 1.5 1.9 1.5 3.9.8 5.5-.5 2-2.5 3.5-5 4.5-2 .8-5 1-7.8 1-3.8 0-7.7-1.5-8.5-4.5a5.5 5.5 0 0 1 2-5.5" fill={fill}/>
        </g>
        <path d="M24 12c2 1 5 3 6 5" stroke={hi} strokeWidth="1" fill="none"/>
      </svg>
    ),
    b: ( // Tượng
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <g fill={fill} strokeLinecap="butt">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
          </g>
          <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinejoin="miter"/>
        </g>
        <path d="M22.5 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill={hi}/>
      </svg>
    ),
    q: ( // Hậu
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="2.75"/>
          <circle cx="14" cy="9" r="2.75"/>
          <circle cx="22.5" cy="8" r="2.75"/>
          <circle cx="31" cy="9" r="2.75"/>
          <circle cx="39" cy="12" r="2.75"/>
          <path d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.7-8.2-13.7L14 25 6.5 13.5 9 26z" strokeLinecap="butt"/>
          <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
          <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0"/>
        </g>
      </svg>
    ),
    k: ( // Vua
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 11.63V6M20 8h5" strokeWidth="1.5"/>
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fill}/>
          <path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-3.5-6 1c-.5 4.5 6 7 6 7v13" strokeLinecap="butt"/>
          <path d="M12.5 30c5.5-3 14.5-3 20 0M12.5 33.5c5.5-3 14.5-3 20 0M12.5 37c5.5-3 14.5-3 20 0"/>
        </g>
        <path d="M22.5 7c1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2z" fill={hi}/>
      </svg>
    ),
  };

  return pieces[type] || null;
}

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
  const runtimeIdentity = useRuntimeCustomerIdentityStore(s => s.identity);
  
  const userId = (() => {
    for (const src of [runtimeIdentity?.phone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return profile?.id || "";
  })();
  const userName = runtimeIdentity?.fullName || profile?.name || profile?.zalo_name || profile?.displayName || "Cing iu";
  const userAvatar = runtimeIdentity?.avatar || profile?.avatar || "";

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
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [showTip,      setShowTip]      = useState(false);
  const [floatEmoji,   setFloatEmoji]   = useState(null); // {emoji, fromMe}
  const [tipResult,    setTipResult]    = useState(null); // {amount, fromMe}
  const [unreadCount,  setUnreadCount]  = useState(0);
  const chatEndRef = useRef(null);


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

    s.on("chess:emoji", ({ userId: fromId, emoji }) => {
      setFloatEmoji({ emoji, fromMe: fromId === userIdRef.current });
      setTimeout(() => setFloatEmoji(null), 2500);
    });

    s.on("chess:tip_received", ({ fromUserId, toUserId, amount }) => {
      const fromMe = fromUserId === userIdRef.current;
      setTipResult({ amount, fromMe });
      setTimeout(() => setTipResult(null), 3000);
    });

    // Chat
    s.on("chess:chat", (data) => {
      setChatMessages(prev => [...prev, data]);
      setUnreadCount(prev => showChat ? 0 : prev + 1);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
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
    console.log("[CHESS CHAT] sendChat", { chatInput, gameId: gameIdRef.current, userId: userIdRef.current, connected: sockRef.current?.connected });
    if (!chatInput.trim() || !gameIdRef.current) return;
    sockRef.current?.emit("chess:chat", {
      gameId: gameIdRef.current,
      userId: userIdRef.current,
      name: userName,
      message: chatInput.trim(),
    });
    setChatInput("");
  };



  const sendEmoji = (emoji) => {
    console.log("[EMOJI]", { gameId: gameIdRef.current, userId: userIdRef.current, emoji });
    if (!gameIdRef.current) return;
    sockRef.current?.emit("chess:emoji", { gameId: gameIdRef.current, userId: userIdRef.current, emoji });
    setShowEmoji(false);
  };

  const sendTip = (amount) => {
    console.log("[TIP]", { gameId: gameIdRef.current, opponent, amount });
    if (!gameIdRef.current) return;
    const opponentId = opponent?.userId || opponent?.id || "";
    sockRef.current?.emit("chess:tip", {
      gameId: gameIdRef.current,
      fromUserId: userIdRef.current,
      toUserId: opponentId,
      amount,
    });
    setShowTip(false);
  };

  const findMatch = useCallback(() => {
    if (!userId) return;
    // Lấy tên mới nhất từ runtime store tại thời điểm bấm
    const rtName = useRuntimeCustomerIdentityStore.getState().identity?.fullName;
    const rtAvatar = useRuntimeCustomerIdentityStore.getState().identity?.avatar;
    const name = rtName || userName;
    const avatar = rtAvatar || userAvatar;
    sockRef.current?.emit("chess:find", { userId, name, avatar });
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
      // Thử di chuyển — kể cả ô có quân đối phương (ăn quân)
      if (legalMoves.includes(sq)) {
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
      // Nếu click vào quân mình khác → đổi selection
      const clickedPiece = chess.get(sq);
      if (clickedPiece && clickedPiece.color === myColor) {
        const moves = chess.moves({ square: sq, verbose: true }).map(m => m.to);
        setSelected(sq);
        setLegalMoves(moves);
        return;
      }
      // Click vào ô trống không hợp lệ → bỏ selection
      setSelected(null);
      setLegalMoves([]);
      return;
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
          "⏱ Mỗi nước đi tối đa 30 giây",
          "⏳ Mỗi người có 60s quỹ thời gian dự trữ — kích hoạt khi hết 30s, hết quỹ là thua",
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

      {/* Branding */}
      <div style={{ width:"100%", textAlign:"center", padding:"4px 0 2px", background:"#0a0604" }}>
        <p style={{ color:"#FFD700", fontSize:13, fontWeight:900, margin:0, letterSpacing:1 }}>Cing Hu Tang Kinh Bắc</p>
        <p style={{ color:"#FFD700", fontSize:10, fontWeight:500, margin:0, opacity:0.6 }}>Kỳ thủ cờ vua</p>
      </div>

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
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%", padding:"4px 0" }}>
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



      {/* Portals — render ngoài stacking context để không bị block */}
      {createPortal(<>
        {floatEmoji && (
          <div style={{ position:"fixed", top:"40%", left:"50%", transform:"translate(-50%,-50%)",
            fontSize:72, zIndex:9999, animation:"floatUp 2.5s ease-out forwards", pointerEvents:"none" }}>
            {floatEmoji.emoji}
          </div>
        )}
        {tipResult && (
          <div style={{ position:"fixed", top:100, left:16, right:16, zIndex:9999,
            background: tipResult.fromMe ? "rgba(212,83,28,0.95)" : "rgba(0,180,100,0.95)",
            borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24 }}>💎</span>
            <p style={{ color:"white", fontSize:13, fontWeight:800, margin:0 }}>
              {tipResult.fromMe
                ? `Bạn đã tặng ${tipResult.amount} điểm cho đối thủ!`
                : `Đối thủ vừa tặng bạn ${tipResult.amount} điểm! 🎉`}
            </p>
          </div>
        )}
        {showEmoji && (
          <>
            <div onClick={() => setShowEmoji(false)} style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(0,0,0,0.5)" }}/>
            <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:9999,
              background:"rgba(10,6,4,0.98)", borderRadius:16, padding:"16px",
              border:"1px solid rgba(255,215,0,0.3)", display:"flex", gap:10, flexWrap:"wrap",
              maxWidth:240, boxShadow:"0 8px 32px rgba(0,0,0,0.8)" }}>
              {["😄","😂","🤔","😮","👏","🔥","💀","🤝","😈","❤️"].map(e => (
                <button key={e} onClick={() => sendEmoji(e)}
                  style={{ fontSize:32, background:"none", border:"none", cursor:"pointer", padding:4 }}>
                  {e}
                </button>
              ))}
            </div>
          </>
        )}
        {showTip && (
          <>
            <div onClick={() => setShowTip(false)} style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(0,0,0,0.5)" }}/>
            <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:9999,
              background:"rgba(10,6,4,0.98)", borderRadius:16, padding:"16px",
              border:"1px solid rgba(255,215,0,0.3)", minWidth:220,
              boxShadow:"0 8px 32px rgba(0,0,0,0.8)" }}>
              <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:"0 0 12px", textAlign:"center" }}>
                💎 Tặng điểm cho đối thủ
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { amount:5,   label:"5 điểm",   fx:"✨", bg:"rgba(255,255,255,0.08)" },
                  { amount:10,  label:"10 điểm",  fx:"⭐", bg:"rgba(100,200,255,0.15)" },
                  { amount:20,  label:"20 điểm",  fx:"🌟", bg:"rgba(255,215,0,0.15)" },
                  { amount:50,  label:"50 điểm",  fx:"💫", bg:"rgba(255,150,0,0.2)" },
                  { amount:100, label:"100 điểm", fx:"🔥", bg:"rgba(212,83,28,0.3)" },
                ].map(t => (
                  <button key={t.amount} onClick={() => sendTip(t.amount)}
                    style={{ background:t.bg, border:"1px solid rgba(255,255,255,0.15)",
                      borderRadius:10, padding:"10px 16px", color:"white", fontSize:14,
                      fontWeight:700, cursor:"pointer", textAlign:"left" }}>
                    {t.fx} {t.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTip(false)}
                style={{ width:"100%", marginTop:10, background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:12 }}>
                Huỷ
              </button>
            </div>
          </>
        )}
        {showChat && (
          <>
            <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:9998,
              background:"rgba(10,6,4,0.97)", borderRadius:"20px 20px 0 0",
              border:"1px solid rgba(255,215,0,0.2)", height:"40vh", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"12px 16px 8px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:0 }}>💬 Chat trong ván</p>
                <button onClick={() => setShowChat(false)} style={{ background:"none", border:"none", color:"#666", fontSize:18, cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
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
              <div style={{ padding:"8px 12px 24px", display:"flex", gap:8, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
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
          </>
        )}
      </>, document.body)}

      {/* Action buttons — nằm ngang dưới bàn cờ */}
      <div style={{ position:"relative", display:"flex", gap:10, justifyContent:"center", padding:"8px 0 16px", zIndex:200, pointerEvents:"all" }}>
        <button onClick={() => { setShowEmoji(v => !v); setShowTip(false); setShowChat(false); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: showEmoji?"#FF9632":"rgba(255,150,50,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          😄
        </button>
        <button onClick={() => { setShowTip(v => !v); setShowEmoji(false); setShowChat(false); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: showTip?"#FFD700":"rgba(255,215,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          💎
        </button>
        <button onClick={() => { setShowChat(v => !v); setShowEmoji(false); setShowTip(false); setUnreadCount(0); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: showChat?"#D4531C":"rgba(255,255,255,0.15)", position:"relative",
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
          fontWeight:700 }}></p>}
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
