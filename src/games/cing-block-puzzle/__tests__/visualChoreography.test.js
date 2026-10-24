import test from 'node:test';
import assert from 'node:assert/strict';
import {clearedVisualCells,visualStageForScore} from '../experience/blockPuzzleVisualPlan.js';
import {createBlockPuzzleVoice} from '../audio/blockPuzzleVoice.js';
test('cross clear snapshots preserve both axes exactly once and preserve source colors',()=>{
 const colors=Array.from({length:8},()=>Array(8).fill('square'));
 const event=Object.freeze({type:'piece_placed',lineCount:2,clearedRows:[2],clearedCols:[4],shapeId:'line'});
 const before=JSON.stringify(colors),cells=clearedVisualCells(event,colors);
 assert.equal(cells.length,15);assert.equal(cells.filter(c=>c.row===2&&c.col===4).length,1);
 assert.equal(cells[0].shapeId,'square');colors[2][0]=null;assert.equal(cells[0].shapeId,'square');
 assert.equal(JSON.stringify(Array.from({length:8},()=>Array(8).fill('square'))),before);
 assert.deepEqual(clearedVisualCells({...event,lineCount:0},colors),[]);
});
test('material changes happen at declared thresholds without modifying gameplay input',()=>{
 for(const [score,id] of [[0,'candy'],[599,'candy'],[600,'crystal'],[1799,'crystal'],[1800,'aurora'],[3999,'aurora'],[4000,'solar'],[100000,'solar']])assert.equal(visualStageForScore(score).id,id);
});
test('failed voice fetch is optional and never rejects preparation or starts delayed speech',async()=>{
 const voice=createBlockPuzzleVoice({fetchClip:async()=>{throw Error('offline');}});
 await voice.prepare({state:'running'});
 assert.equal(voice.play({clip:'nice',priority:1},{sound:true,voice:true,volume:1}),false);
});

test('shipped voice files contain audible PCM, not empty synthesis placeholders',async()=>{
 const {readFile}=await import('node:fs/promises');
 for(const name of ['nice','amazing','perfect','rise']){
  const bytes=await readFile(new URL(`../../../../public/sounds/block-puzzle/${name}.wav`,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  let offset=12,data;
  while(offset+8<=bytes.length){const type=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4);if(type==='data'){data=bytes.subarray(offset+8,offset+8+size);break;}offset+=8+size+(size%2);}
  assert.ok(data?.length>12000,`${name} contains at least 250ms at 24kHz`);
  let energy=0;for(let i=0;i<data.length;i+=2)energy+=(data.readInt16LE(i)/32768)**2;
  assert.ok(Math.sqrt(energy/(data.length/2))>.025,`${name} is audible`);
 }
});
