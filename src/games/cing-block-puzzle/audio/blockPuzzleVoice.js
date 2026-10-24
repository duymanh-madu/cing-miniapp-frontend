const CLIPS = Object.freeze({nice:'nice',amazing:'amazing',perfect:'perfect',rise:'rise'});
// Recorded Vietnamese clips, decoded once into the same unlocked game AudioContext.
// No speech engine, delayed speech queue or network request on a scoring move.
export function createBlockPuzzleVoice({ now=Date.now, fetchClip=(url)=>fetch(url), getHidden=()=>globalThis.document?.hidden }={}) {
  let context=null, buffers=new Map(), loading=null, active=null, lastTime=-Infinity, lastPriority=0;
  function stop() { if(active) {try {active.stop();} catch {} active=null;} }
  return {
    prepare(audioContext) {
      if (!audioContext || loading) return loading;
      context=audioContext;
      loading=Promise.all(Object.entries(CLIPS).map(async ([key,file])=>{
        try {
          const response=await fetchClip(`/sounds/block-puzzle/${file}.wav`);
          if(!response.ok) return;
          const bytes=await response.arrayBuffer();
          buffers.set(key,await context.decodeAudioData(bytes));
        } catch { /* Audio is optional; never delay the move or retry on its path. */ }
      }));
      return loading;
    },
    play(plan,prefs) {
      if (!plan?.clip || !prefs.voice || !prefs.sound || prefs.volume<=0 || getHidden() || context?.state!=='running') return false;
      const buffer=buffers.get(plan.clip);if(!buffer)return false;
      if(now()-lastTime<2200 && plan.priority<=lastPriority)return false;
      try {
        stop();const source=context.createBufferSource(),gain=context.createGain();
        source.buffer=buffer;source.playbackRate.value=1.06;
        gain.gain.value=prefs.volume*.85;source.connect(gain);gain.connect(context.destination);
        source.onended=()=>{source.disconnect();gain.disconnect();if(active===source)active=null;};
        source.start();active=source;lastTime=now();lastPriority=plan.priority;return true;
      } catch {return false;}
    },stop,
  };
}
export const blockPuzzleVoice=createBlockPuzzleVoice();
