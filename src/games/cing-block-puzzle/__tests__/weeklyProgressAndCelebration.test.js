import test from 'node:test';import assert from 'node:assert/strict';
import {isWeeklySnapshotFresh,weeklyProgressForScore} from '../experience/blockPuzzleWeeklyProgress.js';
import {celebrationForEvent,createBlockPuzzleVoice} from '../experience/blockPuzzleCelebration.js';
const now=Date.parse('2026-10-23T10:00:00Z');
const snapshot={generated_at:new Date(now).toISOString(),valid_for_ms:45000,scoring:'weekly_best',period:{starts_at:'2026-10-18T17:00:00Z',ends_at:'2026-10-25T17:00:00Z'},self:{user_id:'me',best_score:100},rivals:[{user_id:'a',score:100},{user_id:'b',score:120},{user_id:'c',score:200},{user_id:'me',score:100}]};
test('weekly best baseline, strict ties, grouped overtakes and no repeat announcements',()=>{
 assert.equal(weeklyProgressForScore(snapshot,0,99,now).passed.length,0);
 assert.equal(weeklyProgressForScore(snapshot,0,100,now).passed.length,0);
 assert.equal(weeklyProgressForScore(snapshot,100,201,now).passed.length,3);
 assert.equal(weeklyProgressForScore(snapshot,201,202,now).passed.length,0);
 assert.equal(weeklyProgressForScore(snapshot,0,100,now).next.remaining,1);
});
test('stale and previous-week snapshots cannot announce goals or ranks',()=>{
 assert.equal(isWeeklySnapshotFresh(snapshot,now+45000),false);
 assert.deepEqual(weeklyProgressForScore(snapshot,0,10000,Date.parse(snapshot.period.ends_at)),{next:null,passed:[]});
 assert.equal(isWeeklySnapshotFresh({...snapshot,scoring:'sum'},now),false);
});
test('recorded voice decodes once, prioritizes strong moves and honors mute without a speech queue',async()=>{
 let time=1000,started=0,stopped=0,fetches=0;
 const context={state:'running',destination:{},decodeAudioData:async()=>({}),createBufferSource:()=>({playbackRate:{},connect(){},disconnect(){},start(){started++;},stop(){stopped++;}}),createGain:()=>({gain:{},connect(){},disconnect(){}})};
 const voice=createBlockPuzzleVoice({now:()=>time,fetchClip:async()=>{fetches++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};}});
 const prefs={voice:true,sound:true,volume:.7},nice=celebrationForEvent({type:'piece_placed',lineCount:2});
 assert.equal(voice.play(nice,prefs),false,'never fetch or queue from move path');
 await voice.prepare(context);await voice.prepare(context);assert.equal(fetches,4);
 assert.equal(voice.play(nice,prefs),true);assert.equal(voice.play(nice,prefs),false);
 assert.equal(voice.play(celebrationForEvent({type:'piece_placed',lineCount:1,perfectClear:true}),prefs),true);
 assert.equal(voice.play(nice,{...prefs,sound:false}),false);
 time+=2201;assert.equal(voice.play(nice,prefs),true);assert.equal(started,3);assert.equal(stopped,2);
 voice.stop();assert.equal(stopped,3);
 context.state='suspended';assert.equal(voice.play(nice,prefs),false);
});
