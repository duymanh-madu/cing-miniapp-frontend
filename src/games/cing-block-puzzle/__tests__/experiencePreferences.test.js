import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePreferences, readPreferences, savePreferences, previewCompletedLines, playHaptic, moveHapticPattern } from '../experience/blockPuzzleExperience.js';
test('preferences survive malformed, absent and denied storage with safe defaults', () => {
  assert.equal(readPreferences(null).volume, .7);
  assert.equal(readPreferences({getItem: () => '{broken'}).sound, true);
  assert.equal(normalizePreferences(null).music, true);
  assert.deepEqual(normalizePreferences({sound:false,music:false,voice:true,vibration:false,effects:'calm',volume:9}),{sound:false,music:false,voice:true,vibration:false,effects:'calm',volume:1});
  assert.equal(savePreferences(null, {}), false);
});
test('line preview highlights row-column intersection once and never changes board', () => {
  const board = Array.from({length:8}, () => Array(8).fill(0));
  board[3].fill(1); for(let r=0;r<8;r++) board[r][4]=1; board[3][4]=0;
  const before = JSON.stringify(board);
  const result=previewCompletedLines(board,{valid:true,cells:[{row:3,col:4}]});
  assert.equal(result.size,15); assert.ok(result.has('0:4')); assert.ok(result.has('3:7'));
  assert.equal(JSON.stringify(board),before);
  assert.equal(previewCompletedLines(board,{valid:false,cells:[{row:3,col:4}]}).size,0);
  assert.equal(previewCompletedLines(board,null).size,0);
});
test('haptics follow confirmed placement events and safely degrade on unsupported devices', () => {
  const event={type:'piece_placed',lineCount:2,comboAdvanced:true};
  assert.deepEqual(moveHapticPattern(null),[]);
  assert.deepEqual(moveHapticPattern({type:'piece_placed',lineCount:0}),[7]);
  let calls=0;
  const device={vibrate:(pattern)=>{calls++;assert.deepEqual(pattern,[12,28,18]);return true;}};
  assert.equal(playHaptic(event,{vibration:false},device),false);assert.equal(calls,0);
  assert.equal(playHaptic(event,{vibration:true},device),true);assert.equal(calls,1);
  assert.equal(playHaptic(event,{vibration:true},{}),false);
  assert.equal(playHaptic(event,{vibration:true},{vibrate:()=>{throw Error();}}),false);
});
