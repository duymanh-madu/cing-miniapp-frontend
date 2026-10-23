import test from 'node:test';
import assert from 'node:assert/strict';
import { BlockPuzzleAudioRuntime } from '../audio/blockPuzzleAudioRuntime.js';
function gain() {
  const calls=[];
  return {calls,gain:{value:1,cancelScheduledValues:(...args)=>calls.push(['cancel',...args]),setTargetAtTime:(...args)=>calls.push(['target',...args]),setValueAtTime:()=>{},linearRampToValueAtTime:(...args)=>calls.push(['ramp',...args])}};
}
test('muting fades active sound and music buses immediately',()=>{
  const audio=new BlockPuzzleAudioRuntime(); audio.context={currentTime:10};audio.master=gain();audio.sfx=gain();audio.music=gain();
  audio.setPreferences({sound:false,music:false,volume:.5});
  assert.equal(audio.musicRequested,false);
  assert.deepEqual(audio.sfx.calls.at(-1),['target',0,10,.012]);
  assert.deepEqual(audio.music.calls.at(-1),['target',0,10,.025]);
  audio.duckMusic(.4,.6);
  assert.equal(audio.music.calls.at(-1)[1],0,'combo must never unmute the music bus');
});
test('background timer stall never schedules a burst of overdue music',()=>{
  const audio=new BlockPuzzleAudioRuntime();audio.context={currentTime:600,state:'running'};audio.musicRequested=true;audio.nextMusicTime=1;
  const times=[]; audio.scheduleMusicStep=(time)=>times.push(time); audio.runMusicScheduler();
  assert.ok(times.length>0 && times.length<=2); assert.ok(times.every(time=>time>=600));
});
test('sound preference prevents cue allocation and disabled music cannot start',()=>{
  const audio=new BlockPuzzleAudioRuntime();audio.preferences.sound=false;audio.preferences.music=false;
  audio.playPlacement=()=>assert.fail('muted sound must not allocate oscillators');
  audio.playMoveEvent({type:'piece_placed',lineCount:0});audio.startMusic();assert.equal(audio.musicRequested,false);
});
