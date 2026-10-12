import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  PLAZA_PREVIEW_INITIAL_ZOOM_V19,clampPlazaPreviewZoomV19,pinchPlazaPreviewZoomV19,
  clampPlazaPreviewVerticalPanV19,dragPlazaPreviewVerticalPanV19,
} from '../scene/plazaPreviewZoomV19.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('default preview fully fits avatar; zoom remains opt-in and bounded',()=>{
  assert.equal(PLAZA_PREVIEW_INITIAL_ZOOM_V19,1);
  assert.equal(clampPlazaPreviewZoomV19(-1),1);
  assert.equal(pinchPlazaPreviewZoomV19(1,120,180),1.5);
  assert.equal(clampPlazaPreviewZoomV19(99),2.8);
});
test('vertical pan follows drag and clamps to visible avatar bounds',()=>{
  assert.ok(dragPlazaPreviewVerticalPanV19(0,-80,2,1,400)<0);
  assert.ok(dragPlazaPreviewVerticalPanV19(0,80,2,1,400)>0);
  assert.ok(Math.abs(clampPlazaPreviewVerticalPanV19(99,2,1)-.57)<1e-10);
  assert.ok(Math.abs(clampPlazaPreviewVerticalPanV19(-99,2,1)+.57)<1e-10);
  assert.equal(dragPlazaPreviewVerticalPanV19(0,80,2,1,0),0);
  assert.equal(clampPlazaPreviewVerticalPanV19(NaN,2,1),0);
});
test('zeroed zoom leaves only a safe fit margin; resize re-clamps pan',()=>{
  assert.ok(clampPlazaPreviewVerticalPanV19(1,2,2.24)<.1);
  const scene=read('../scene/PlazaAvatarPreviewV16.jsx');
  assert.match(scene,/panY=interactiveZoom\?clampPlazaPreviewVerticalPanV19\(/);
  assert.match(scene,/const resetView=\(\)=>\{yaw=0;panY=0;setZoom\(/);
});
test('horizontal swipe rotates yaw only; vertical swipe translates camera without pitch',()=>{
  const scene=read('../scene/PlazaAvatarPreviewV16.jsx');
  assert.match(scene,/yaw\+=dx\*\.012/);
  assert.match(scene,/dragPlazaPreviewVerticalPanV19\(panY,dy/);
  assert.match(scene,/camera\.position\.set\(0,targetY\+panY,actualDistance\)/);
  assert.match(scene,/computePlazaPreviewDistanceV19/);
  assert.match(scene,/camera\.lookAt\(0,targetY\+panY,0\)/);
  assert.doesNotMatch(scene,/rotation\.x\s*[=+\-]|rotation\.z\s*[=+\-]/);
  assert.equal((scene.match(/new THREE\.WebGLRenderer/g)||[]).length,1);
});
test('viewport uses whole inventory stage; title only floats in compact overlay',()=>{
  const css=read('../pages/PlazaV19Block061.css');
  assert.match(css,/plaza-v19-premium-character\s*\{[^}]*inset:0!important;width:100%!important;height:100%!important/s);
  assert.match(css,/plaza-v19-premium-rank\s*\{[^}]*position:absolute!important/s);
  assert.match(css,/plaza-v16-preview-canvas\s*\{[^}]*inset:0 0 22px 0!important/s);
  const inventory=read('../pages/PlazaInventoryV16.jsx');
  assert.match(inventory,/import '\.\/PlazaV19Block061\.css'/);
  assert.match(inventory,/<Avatar character=\{character\} titleKey=\{selected\} interactiveZoom\/>/);
});
test('Plaza room drawer has ONLY members, chat, pose, never wardrobe camera buttons',()=>{
  const source=read('../scene/PlazaSceneV1.jsx');
  assert.match(source,/plaza-v19-tools/);
  assert.match(source,/Người trong phòng/);
  assert.match(source,/Trò chuyện/);
  assert.match(source,/Tạo dáng/);
  assert.doesNotMatch(source,/plaza-v19-tools-zoom|ZoomIn|ZoomOut|LocateFixed/);
  assert.match(source,/api\.current\?\.wave\(\)/);
});
test('money/coin operations, Zalo controls and avatar animation are outside scope',()=>{
  const inventory=read('../pages/PlazaInventoryV16.jsx');
  const scene=read('../scene/PlazaSceneV1.jsx');
  assert.match(inventory,/op:'convert'/);
  assert.match(inventory,/op:'buy_loudspeaker'/);
  assert.doesNotMatch(scene,/cing-boy-wave\.vrma/);
  assert.doesNotMatch(scene,/cing-zalo-shell/);
});
