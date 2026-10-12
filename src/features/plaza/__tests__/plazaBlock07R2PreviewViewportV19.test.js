import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computePlazaPreviewDistanceV19} from '../scene/plazaPreviewFitV19.js';
import {PLAZA_PREVIEW_INITIAL_ZOOM_V19} from '../scene/plazaPreviewZoomV19.js';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const css = read('../pages/PlazaV19Block061.css');
const scene = read('../scene/PlazaAvatarPreviewV16.jsx');

test('wardrobe 3D viewport overrides legacy 76px header/30px footer with a stronger selector', () => {
  const legacy=read('../pages/PlazaV19Upgrade.css');
  assert.match(legacy,/inset:76px 0 30px!important/);
  const override=css.slice(css.indexOf('V19 BLOCK 07R2'));
  assert.ok(override.length>0);
  assert.match(override,/\.plaza-v19-avatar-stage\.plaza-v19-premium-stage \.plaza-v19-premium-character \.plaza-v16-preview \.plaza-v16-preview-canvas\s*\{[\s\S]*?inset:0!important/);
  assert.match(override,/top:0!important;right:0!important;bottom:0!important;left:0!important/);
  assert.match(override,/width:100%!important;height:100%!important/);
});

test('3D canvas uses full viewport height; title and controls remain overlays, not reserved strips', () => {
  assert.match(css,/\.plaza-v19-premium-character\s*\{[^}]*inset:0!important;width:100%!important;height:100%!important/s);
  assert.match(css,/\.plaza-v19-premium-rank\s*\{[^}]*position:absolute!important/);
  const fix=css.slice(css.indexOf('V19 BLOCK 07R2'));
  assert.match(fix,/\.plaza-v16-preview-canvas > canvas\s*\{[^}]*height:100%!important/s);
  assert.doesNotMatch(fix,/inset:76px|inset:66px|inset:0 0 22px/);
});

test('default avatar fit responds to real rendered viewport aspect; manual user zoom remains independent', () => {
  assert.equal(PLAZA_PREVIEW_INITIAL_ZOOM_V19,1);
  assert.match(scene,/const w=host\.clientWidth,h=host\.clientHeight/);
  assert.match(scene,/renderer\.setSize\(w,h,false\)/);
  assert.match(scene,/camera\.aspect=w\/h/);
  assert.match(scene,/computePlazaPreviewDistanceV19\(\{height:fitHeight,width:fitWidth,aspect:camera\.aspect,fov:camera\.fov,depth:fitDepth\}\)/);
  assert.match(scene,/const actualDistance=distance\/zoomScale/);
  assert.match(scene,/new ResizeObserver\(resize\)/);
  const geometry={height:1.8,width:1.0,depth:.25,fov:29};
  assert.ok(computePlazaPreviewDistanceV19({...geometry,aspect:.40}) > computePlazaPreviewDistanceV19({...geometry,aspect:1.2}));
});

test('manual horizontal rotation, vertical translation, and a single renderer stay untouched', () => {
  assert.match(scene,/yaw\+=dx\*\.012/);
  assert.match(scene,/dragPlazaPreviewVerticalPanV19\(panY,dy/);
  assert.match(scene,/camera\.lookAt\(0,targetY\+panY,0\)/);
  assert.equal((scene.match(/new THREE\.WebGLRenderer/g)||[]).length,1);
  assert.doesNotMatch(scene,/camera\.rotation\.x\s*=|vrm\.scene\.rotation\.x\s*=/);
});
