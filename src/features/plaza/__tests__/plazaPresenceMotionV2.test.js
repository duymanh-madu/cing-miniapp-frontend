import test from 'node:test';import assert from 'node:assert/strict';
import {addPresenceSample,samplePresence} from '../scene/plazaPresenceMotionV2.js';
test('interpolation uses shortest turn across pi, clamps gaps, rejects stale and resets reconnect samples',()=>{
 const v=(seq,x,heading,presenceId='p')=>({seq,x,y:0,z:0,heading,presenceId});
 let s=addPresenceSample([],v(1,0,3),0);s=addPresenceSample(s,v(2,1,-3),100);
 const mid=samplePresence(s,170);assert.equal(mid.x,.5);assert.ok(Math.abs(mid.heading-Math.PI)<.001);
 assert.equal(samplePresence(s,10000).x,1);assert.equal(addPresenceSample(s,v(1,5,0),200),s);
 assert.equal(addPresenceSample(s,v(0,6,0,'new'),200).length,1);
});