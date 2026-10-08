// Same files and volume as Game Center's ChessGame. No context at import/construction.
export const PLAZA_CHESS_SOUND_FILES=Object.freeze({
 move:'/sounds/move-sound.mp3',
 capture:'/sounds/An-quan-sound.mp3',
 check:'/sounds/chess-sound.mp3',
 warning:'/sounds/timesup-sound.mp3',
});
export function createPlazaChessAudioV4({
 AudioContextClass=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext,
 fetcher=(...args)=>globalThis.fetch(...args),
 isHidden=()=>globalThis.document?.hidden===true,
}={}){
 let context=null,loading=null,disposed=false,generation=0,abort=null,paused=false;
 const buffers=new Map(),playing=new Set();
 function stopSources(){for(const source of playing){try{source.stop();}catch{}}playing.clear();}
 function unlockFromGesture(){
  if(disposed||!AudioContextClass)return Promise.resolve(false);
  // Creation/resume must run synchronously inside the actual tap/keyboard handler.
  try{if(!context)context=new AudioContextClass();paused=false;if(context.state==='suspended')context.resume().catch(()=>{});}catch{return Promise.resolve(false);}
  if(loading)return loading;
  if(buffers.size===Object.keys(PLAZA_CHESS_SOUND_FILES).length)return Promise.resolve(true);
  abort=new AbortController();const version=generation,ctx=context;
  loading=Promise.allSettled(Object.entries(PLAZA_CHESS_SOUND_FILES).filter(([key])=>!buffers.has(key)).map(async([key,url])=>{
   const response=await fetcher(url,{signal:abort.signal});if(!response.ok)throw new Error('CHESS_AUDIO_UNAVAILABLE');
   const bytes=await response.arrayBuffer(),buffer=await ctx.decodeAudioData(bytes);
   if(!disposed&&generation===version)buffers.set(key,buffer);
  })).then(()=>!disposed&&buffers.size===Object.keys(PLAZA_CHESS_SOUND_FILES).length).finally(()=>{if(generation===version)loading=null;});
  return loading;
 }
 function play(type){
  if(disposed||paused||isHidden()||context?.state!=='running'||!buffers.has(type))return false;
  try{const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers.get(type);gain.gain.value=.65;source.connect(gain);gain.connect(context.destination);playing.add(source);source.onended=()=>{playing.delete(source);source.disconnect();gain.disconnect();};source.start(0);return true;}catch{return false;}
 }
 return Object.freeze({unlockFromGesture,play,
  suspend(){paused=true;stopSources();try{context?.suspend().catch(()=>{});}catch{}},
  resumeExisting(){if(disposed||isHidden())return;paused=false;try{if(context?.state==='suspended')context.resume().catch(()=>{});}catch{}},
  dispose(){if(disposed)return;disposed=true;generation++;abort?.abort();stopSources();buffers.clear();try{context?.close().catch(()=>{});}catch{}},
 });
}
// Only newly received authoritative changes produce cues. Joining/reconnecting never replays history.
export function plazaChessAudioCuesV4(previous,current,selfId){
 if(!previous||!current||previous.matchId!==current.matchId)return [];
 if(current.ply<previous.ply)return [];
 if(current.ply>previous.ply){const san=current.lastMove?.san||'';if(/[+#]/.test(san))return ['check'];if(san.includes('x'))return ['capture'];}
 const player=current.players.find(p=>p.memberId===selfId);
 if(!player||current.phase!=='active')return [];
 const turn=current.fen.split(' ')[1],oldTurn=previous.fen.split(' ')[1];
 return turn===player.color&&(previous.phase!=='active'||oldTurn!==turn)?['move']:[];
}
