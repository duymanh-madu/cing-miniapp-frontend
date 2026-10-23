import { useEffect, useRef, useState } from 'react';
import { fetchBlockPuzzleWeeklyProgress } from '../runtime/blockPuzzleAuthorityClient.js';
import { getRuntimeSocket } from '../../../runtime/socket/runtimeSocketClient';
import { isWeeklySnapshotFresh, weeklyProgressForScore } from './blockPuzzleWeeklyProgress.js';
export function useBlockPuzzleWeeklyProgress({ownerKey,sessionId,score,onOvertake}) {
  const [snapshot,setSnapshot] = useState(null);
  const [clock,setClock] = useState(Date.now());
  const highWater = useRef(0);
  const callback = useRef(onOvertake); callback.current=onOvertake;
  const current = useRef(null);
  useEffect(()=>{
    setSnapshot(null);current.current=null;
    if (!ownerKey) return;
    let disposed=false;let controller=null;let inFlight=false;let lastRequest=0;
    async function refresh() {
      if(disposed || document.hidden || inFlight || Date.now()-lastRequest<5000) return;
      inFlight=true;lastRequest=Date.now();controller=new AbortController();
      try {
        const data=await fetchBlockPuzzleWeeklyProgress({signal:controller.signal});
        if(!disposed && isWeeklySnapshotFresh(data)) { current.current=data;setSnapshot(data); }
      } catch { /* Optional context must never interrupt gameplay. */ }
      finally {inFlight=false;}
    }
    const visible=()=>{if(!document.hidden) void refresh();};
    const changed=(payload)=>{
      if(payload?.type && payload.type!=='game') return;
      if(payload?.scope && payload.scope!=='weekly') return;
      if(payload?.game_key && payload.game_key!=='cing-block-puzzle') return;
      // Suppress stale goals immediately; refresh is throttled independently.
      current.current=null;setSnapshot(null);void refresh();
    };
    void refresh();
    const timer=setInterval(()=>{setClock(Date.now());void refresh();},30000);
    const socket=getRuntimeSocket();socket?.on('leaderboard.updated',changed);
    document.addEventListener('visibilitychange',visible);
    return ()=>{disposed=true;controller?.abort();clearInterval(timer);socket?.off('leaderboard.updated',changed);document.removeEventListener('visibilitychange',visible);};
  },[ownerKey]);
  useEffect(()=>{
    if(!snapshot) return;
    const expiry=Math.min(Date.parse(snapshot.period.ends_at),Date.parse(snapshot.generated_at)+snapshot.valid_for_ms);
    const timer=setTimeout(()=>setClock(Date.now()),Math.max(0,expiry-Date.now()+1));
    return ()=>clearTimeout(timer);
  },[snapshot]);
  useEffect(()=>{ highWater.current=score; },[sessionId]);
  useEffect(()=>{
    const previous=highWater.current;
    highWater.current=Math.max(previous,score);
    const progress=weeklyProgressForScore(current.current,previous,score);
    if(progress.passed.length) callback.current?.(progress.passed);
  },[score,sessionId]);
  return {snapshot:isWeeklySnapshotFresh(snapshot,clock) ? snapshot : null,
    ...weeklyProgressForScore(snapshot,score,score,clock)};
}
