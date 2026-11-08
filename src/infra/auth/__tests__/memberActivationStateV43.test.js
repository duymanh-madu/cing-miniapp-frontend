import test from 'node:test';import assert from 'node:assert/strict';
import {memberActivationStateV43 as gate} from '../memberActivationStateV43.js';
const guest={authenticated:false,profile:{id:'cache',phone:'0980000000'}};
test('runtime activated flag and cached phone never grant membership',()=>assert.deepEqual(gate(guest,{activationStatus:'activated',profileHydrated:true,bootGraceDone:true}),{ready:false,restoring:false}));
test('stale checking state cannot lock activation after bounded startup grace',()=>{assert.equal(gate(guest,{activationStatus:'checking',bootGraceDone:false}).restoring,true);assert.equal(gate(guest,{activationStatus:'checking',bootGraceDone:true}).restoring,false);});
test('tokens in shell cannot grant identity or suppress reactivation indefinitely',()=>assert.deepEqual(gate(guest,{phoneToken:'fixture',miniAccessToken:'fixture',bootGraceDone:true}),{ready:false,restoring:false}));
test('accepted backend session alone releases member gate',()=>assert.deepEqual(gate({authenticated:true,accessToken:'fixture',profile:{id:'backend-member',phone:'0980000000'}},{activationStatus:'checking'}),{ready:true,restoring:false}));
