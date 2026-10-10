
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  transformAvatarPointersV17 as gesture
} from "../runtime/plazaAvatarGestureV17.js";

const p=(x,y)=>({x,y});
const rect={left:0,top:0,width:320,height:320};

function run(before,after,options={}){
  return gesture({
    before,
    after,
    rect,
    size:320,
    zoom:1,
    offset:{x:0,y:0},
    ...options
  });
}

test("one-finger drag",()=>{
  const r=run([p(100,100)],[p(120,115)]);
  assert.equal(r.zoom,1);
  assert.deepEqual(r.offset,{x:20,y:15});
});

test("two stationary fingers do not move image",()=>{
  const points=[p(110,160),p(210,160)];
  const r=run(points,points);
  assert.equal(r.zoom,1);
  assert.deepEqual(r.offset,{x:0,y:0});
});

test("centered pinch doubles zoom",()=>{
  const r=run(
    [p(110,160),p(210,160)],
    [p(60,160),p(260,160)]
  );
  assert.equal(r.zoom,2);
  assert.deepEqual(r.offset,{x:0,y:0});
});

test("off-center pinch preserves image anchor",()=>{
  const r=run(
    [p(200,160),p(280,160)],
    [p(160,160),p(320,160)]
  );

  assert.equal(r.zoom,2);
  assert.equal(r.offset.x,-80);
  assert.equal(r.offset.y,0);
});

test("two-finger translation pans image",()=>{
  const r=run(
    [p(100,120),p(220,120)],
    [p(120,150),p(240,150)]
  );
  assert.equal(r.zoom,1);
  assert.deepEqual(r.offset,{x:20,y:30});
});

test("zoom remains between 1 and 3",()=>{
  const large=run(
    [p(140,160),p(180,160)],
    [p(0,160),p(320,160)],
    {zoom:2.5}
  );

  const small=run(
    [p(0,160),p(320,160)],
    [p(140,160),p(180,160)]
  );

  assert.equal(large.zoom,3);
  assert.equal(small.zoom,1);
});

test("responsive canvas coordinates",()=>{
  const r=run(
    [p(50,50)],
    [p(70,50)],
    {rect:{left:0,top:0,width:160,height:160}}
  );
  assert.equal(r.offset.x,40);
});

test("near-overlapping fingers cannot cause zoom jump",()=>{
  const r=run(
    [p(160,160),p(161,160)],
    [p(140,160),p(180,160)]
  );
  assert.equal(r.zoom,1);
});

test("invalid pointer lists are rejected",()=>{
  assert.throws(
    ()=>run([p(1,1)],[]),
    /GESTURE_INVALID/
  );
});

test("Avatar JSX mounts the multi-touch handlers",()=>{
  const s=fs.readFileSync(
    "src/features/plaza/pages/PlazaAvatarCropV17.jsx",
    "utf8"
  );

  assert.match(s,/new Map\(\)/);
  assert.match(s,/transformAvatarPointersV17/);
  assert.match(s,/onPointerDown/);
  assert.match(s,/onPointerMove/);
  assert.match(s,/onPointerUp/);
  assert.match(s,/onPointerCancel/);
  assert.match(s,/onLostPointerCapture/);
  assert.match(s,/touchAction:"none"/);
  assert.match(s,/pointerEvents:"none"/);
});
