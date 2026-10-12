import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computePlazaPreviewDistanceV19} from '../scene/plazaPreviewFitV19.js';
import {createPlazaAdaptiveQualityV19} from '../scene/plazaAdaptiveQualityV19.js';

test('camera fits full height and width including foreground depth',()=>{
 const f={height:1.8,width:.8,depth:.35,aspect:.8,fov:29};
 const d=computePlazaPreviewDistanceV19(f);
 assert.ok(d>f.height/(2*Math.tan(29*Math.PI/360)));
 assert.ok(computePlazaPreviewDistanceV19({...f,width:3})>d);
 assert.ok(computePlazaPreviewDistanceV19({...f,depth:1})>d);
 assert.equal(computePlazaPreviewDistanceV19({...f,height:NaN}),4);
});
test('pixel density only changes after sustained regression and cool down',()=>{
 const q=createPlazaAdaptiveQualityV19(1.5,1.65);
 for(let i=0;i<3;i++)assert.equal(q.sample(30,1000*i),null);
 assert.equal(q.sample(30,3000),1.4);
 for(let i=4;i<=8;i++)assert.equal(q.sample(60,1000*i),null);
 for(let i=9;i<=17;i++)q.sample(60,1000*i);
 assert.ok(q.ratio>=1.4);
 assert.ok(q.ratio<=1.65);
});
test('scene has guarded render loop and all errors surface via existing retry UI',()=>{
 const scene=readFileSync(new URL('../scene/createPlazaSceneV1.js',import.meta.url),'utf8');
 assert.match(scene,/try \{\s*const dt/);
 assert.match(scene,/catch \(error\) \{[\s\S]*onProgress\(\{ready:false,error:/);
 assert.match(scene,/const adjusted=quality\.sample\(stats\.fps,now\)/);
 assert.match(scene,/if\(now-labelLast>=50\)/);
});
