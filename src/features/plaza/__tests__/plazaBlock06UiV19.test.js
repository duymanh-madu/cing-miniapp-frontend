import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {clampPlazaPreviewZoomV19,pinchPlazaPreviewZoomV19,PLAZA_PREVIEW_INITIAL_ZOOM_V19} from '../scene/plazaPreviewZoomV19.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
test('preview starts closer, clamps zoom without spawning renderers',()=>{
 assert.equal(PLAZA_PREVIEW_INITIAL_ZOOM_V19,1);
 assert.equal(clampPlazaPreviewZoomV19(0),1);
 assert.equal(clampPlazaPreviewZoomV19(200),2.8);
 assert.equal(clampPlazaPreviewZoomV19(Infinity),1);
});
test('pinch distances increase and decrease zoom smoothly',()=>{
 assert.equal(pinchPlazaPreviewZoomV19(1.5,100,200),2.8);
 assert.equal(pinchPlazaPreviewZoomV19(1.5,100,50),1);
 assert.equal(pinchPlazaPreviewZoomV19(1.5,0,100),1.5);
});
test('room heading and mini chat share the same compact dock',()=>{
 const page=read('../pages/PlazaPageV1.jsx');
 assert.match(page,/plaza-v19-room-dock/);
 assert.equal((page.match(/<PlazaChatPeekV15 /g)||[]).length,1);
 assert.match(page,/PlazaChatPeekV15 [^]*?<\/div>\}/);
});
test('chat close button is centred and away from native Zalo close',()=>{
 const css=read('../pages/PlazaV19Block06.css');
 assert.match(css,/plaza-v19-chat-premium header>button/);
 assert.match(css,/left:50%!important/);
 assert.match(css,/translate\(-50%,-50%\)/);
});
test('preview uses same single WebGL instance with interactive zoom',()=>{
 const src=read('../scene/PlazaAvatarPreviewV16.jsx');
 assert.match(src,/interactiveZoom/);
 assert.match(src,/plaza-v19-preview-zoom-controls/);
 assert.match(src,/pinchPlazaPreviewZoomV19/);
 assert.equal((src.match(/new THREE\.WebGLRenderer/g)||[]).length,1);
 const inventory=read('../pages/PlazaInventoryV16.jsx');
 assert.match(inventory,/<Avatar character=\{character\} titleKey=\{selected\} interactiveZoom\/>/);
});
test('financial and server data paths not modified by block 06',()=>{
 const page=read('../pages/PlazaPageV1.jsx');
 const inventory=read('../pages/PlazaInventoryV16.jsx');
 assert.doesNotMatch(page,/\/plaza\/social\/command/);
 assert.match(inventory,/op:'convert'/);
 assert.match(inventory,/op:'buy_loudspeaker'/);
});
