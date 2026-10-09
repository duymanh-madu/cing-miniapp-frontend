import PlazaChessPieceV7 from "./PlazaChessPieceV7.jsx";
import React,{useEffect,useRef,useState} from 'react';
import './PlazaChessPanelV3.css';
import {plazaChessAudioCuesV4} from './plazaChessAudioV4.js';
const ERRORS={PLAZA_SEAT_TAKEN:'Ghế vừa có người ngồi.',PLAZA_SEAT_TOO_FAR:'Hãy đến gần ghế hơn.',PLAZA_PK_NOT_ENABLED:'PK chưa mở trên máy chủ.',PLAZA_NOT_YOUR_TURN:'Chưa đến lượt của bạn.',PLAZA_STALE_MOVE:'Bàn cờ đã đổi. Hãy chọn lại.',PLAZA_OUTCOME_UNKNOWN:'Chưa nhận được xác nhận. Kiểm tra bàn cờ trước khi thử lại.',PLAZA_CHESS_PERSIST_FAILED:'Chưa lưu được nước cờ. Hãy thử lại.',PLAZA_MATCH_IN_PROGRESS:'Bàn đang có trận đấu.'};
function squares(fen){return fen.split(' ')[0].split('/').flatMap(row=>[...row].flatMap(c=>/\d/.test(c)?Array(+c).fill(null):[c]));}
export default function PlazaChessPanelV3({table,selfId,client,onStand,audio=null}){
 const match=table.match,player=match?.players.find(p=>p.memberId===selfId),spectator=!player;
 const [selected,setSelected]=useState(null),[promotion,setPromotion]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now());
 const previousMatch=useRef(null),warned=useRef(new Set());
 useEffect(()=>{for(const cue of plazaChessAudioCuesV4(previousMatch.current,match,selfId))audio?.play(cue);previousMatch.current=match||null;},[match,selfId,audio]);
 const pending=useRef(null),alive=useRef(true),lock=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{setSelected(null);setPromotion(null);pending.current=null;},[match?.matchId,match?.revision]);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(timer);},[]);
 async function act(payload){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const base={tableId:table.tableId,matchId:match?.matchId,...payload};const signature=JSON.stringify(base);if(pending.current?.signature!==signature)pending.current={signature,payload:{...base,commandId:crypto.randomUUID()}};await client.tableAction(pending.current.payload);pending.current=null;}catch(e){if(alive.current)setError(ERRORS[e.code]||'Chưa hoàn tất thao tác. Hãy thử lại.');}finally{lock.current=false;if(alive.current)setBusy(false);}}
 const turn=match?.fen.split(' ')[1];
 useEffect(()=>{if(!match||match.phase!=='active'||!player||turn!==player.color)return;const remaining=match.clocks[player.color]-Math.max(0,now-match.turnStartedAt);const key=match.matchId+':'+player.color;if(remaining>0&&remaining<=10000&&!warned.current.has(key)){if(audio?.play('warning'))warned.current.add(key);}},[match,player,turn,now,audio]);
 const board=match?squares(match.fen):[];
 const reversed=player?.color==='b';const indices=Array.from({length:64},(_,i)=>reversed?63-i:i);
 const square=i=>'abcdefgh'[i%8]+(8-Math.floor(i/8));
 const legal=match?.legalMoves||[];
 const targets=legal.filter(m=>m.from===selected).map(m=>m.to);
 function choose(i){const to=square(i);if(busy||spectator||match?.phase!=='active'||player.color!==turn)return;const options=legal.filter(m=>m.from===selected&&m.to===to);if(options.length){if(options.some(m=>m.promotion)){setPromotion({from:selected,to});return;}act({action:'move',from:selected,to,expectedPly:match.ply});setSelected(null);}else setSelected(legal.some(m=>m.from===to)?to:null);}
 function clock(color){if(!match)return '';const elapsed=match.phase==='active'&&turn===color?Math.max(0,now-match.turnStartedAt):0;const secs=Math.ceil(Math.max(0,match.clocks[color]-elapsed)/1000);return `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;}
 const winner=match?.players.find(p=>p.memberId===match.result?.winnerId);
 return <aside className="plaza-pk" aria-label="Bàn chơi Cờ vua" onPointerDownCapture={()=>audio?.unlockFromGesture()} onKeyDownCapture={event=>{if(event.key==='Enter'||event.key===' ')audio?.unlockFromGesture();}}>
  <div className="plaza-pk__head"><strong>♟ {table.gameName||'Chọn game PK'}</strong><button disabled={busy} onClick={onStand}>Đứng dậy</button></div>
  {!table.gameId&&<>{table.ownerId===selfId?<button disabled={busy||!table.pkEnabled} onClick={()=>act({action:'select',gameId:'chess'})}>Chọn Cờ vua</button>:<p>Chờ chủ bàn chọn game.</p>}{!table.pkEnabled&&<p>PK chưa mở trên máy chủ.</p>}</>}
  {table.gameId&&!match&&<p>Chờ người chơi thứ hai · {table.seats.filter(p=>p.role==='player').length}/2</p>}
  {match&&<>
   <div className="plaza-pk__players">{match.players.map(p=><span key={p.memberId}>{p.color==='w'?'♔':'♚'} {p.displayName} <b>{clock(p.color)}</b></span>)}</div>
   {spectator&&<p>Bạn đang xem trận đấu.</p>}
   {match.phase==='preparing'&&!spectator&&<button disabled={busy||match.ready.includes(selfId)} onClick={()=>act({action:'ready'})}>{match.ready.includes(selfId)?'Đã sẵn sàng — chờ đối thủ':'Sẵn sàng đấu'}</button>}
   {match.phase==='active'&&<p>{spectator?`Lượt ${turn==='w'?'Trắng':'Đen'}`:turn===player.color?'Đến lượt bạn':'Đang chờ đối thủ'}</p>}
   <div className="plaza-pk__board" role="group" aria-label="Bàn cờ"><>{indices.map(i=><button key={i} type="button" aria-label={`${square(i)} ${board[i]||'trống'}`} className={`${(Math.floor(i/8)+i%8)%2?'dark':'light'} ${square(i)===selected?'selected':''} ${targets.includes(square(i))?'target':''}`} disabled={busy||spectator||match.phase!=='active'||turn!==player?.color} onClick={()=>choose(i)}><span className={board[i]&&board[i]===board[i].toUpperCase()?'white-piece':'black-piece'}><PlazaChessPieceV7 piece={board[i]}/></span></button>)}</></div>
   {promotion&&<div>Phong cấp: {['q','r','b','n'].map(p=><button key={p} disabled={busy} onClick={()=>{act({action:'move',...promotion,promotion:p,expectedPly:match.ply});setPromotion(null);}}>{({q:'Hậu',r:'Xe',b:'Tượng',n:'Mã'})[p]}</button>)}</div>}
   {match.phase==='active'&&!spectator&&<button disabled={busy} onClick={()=>act({action:'resign'})}>Đầu hàng</button>}
   {match.phase==='finished'&&<><p>{match.result?.reason==='cancelled'?'Trận chưa bắt đầu — đã hủy':winner?`${winner.displayName} thắng`:'Hai người hòa nhau'} · {({checkmate:'Chiếu hết',resign:'Đầu hàng',timeout:'Hết giờ',draw:'Hòa',cancelled:'Hủy trước khi bắt đầu'})[match.result?.reason]}</p><p>{match.ranked===true?'Kết quả đã cập nhật BXH của cả hai người.':match.result?.reason==='cancelled'?'Không tính kết quả BXH.':'Trận thử nghiệm — không ghi BXH.'}</p>{table.ownerId===selfId&&<button disabled={busy} onClick={()=>act({action:'select',gameId:'chess'})}>Trận mới</button>}</>}
  </>}
  {error&&<p role="alert">{error}</p>}
 </aside>;
}
