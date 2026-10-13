import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createPlazaFloorIndexV19} from '../scene/plazaFloorIndexV19.js';
import {createPlazaFramePacerV19} from '../scene/plazaFramePacerV19.js';
import {createPlazaUiStoreV19} from '../runtime/plazaUiStoreV19.js';
import {createPlazaLightingV4} from '../scene/plazaLightingV4.js';
test('floor broad phase preserves actual ray hits at boundaries and raised surfaces',()=>{
 const floors=[];for(let i=0;i<100;i++){const m=new T.Mesh(new T.BoxGeometry(4,.1,4));m.position.set((i%10)*8,i===11?1:0,Math.floor(i/10)*8);m.updateMatrixWorld();floors.push(m);}
 const index=createPlazaFloorIndexV19(floors),ray=new T.Raycaster();let full=0,indexed=0;
 for(const [x,z] of [[0,0],[8,8],[10,8],[6,8],[72,72],[-1,-1],[4,4]]){ray.set(new T.Vector3(x,3,z),new T.Vector3(0,-1,0));const selected=index.query(x,z);full+=floors.length;indexed+=selected.length;
  const a=ray.intersectObjects(floors,false),b=ray.intersectObjects(selected,false);assert.deepEqual(b.map(h=>[h.object.uuid,h.distance]),a.map(h=>[h.object.uuid,h.distance]));}
 assert.ok(indexed<full/10);floors.forEach(m=>{m.geometry.dispose();m.material.dispose();});
});
test('60fps pacer halves redundant work at 120Hz and processes late frames',()=>{
 const p=createPlazaFramePacerV19(60);let count=0;for(let i=0;i<120;i++)if(p.shouldRender(i*1000/120))count++;assert.equal(count,60);assert.equal(p.shouldRender(2000),true);p.reset();assert.equal(p.shouldRender(2001),true);
 const low=createPlazaFramePacerV19(60);for(let i=0;i<20;i++)assert.equal(low.shouldRender(i*50),true);
});
test('100 movement/correction updates reach scene with zero React UI notifications',()=>{
 const listeners=new Set();let snapshot={status:'connected',selfId:'self',room:{roomId:'r'},members:[{memberId:'self',presenceId:'p',character:'girl',x:0}],correction:null};
 const client={getSnapshot:()=>snapshot,subscribe:f=>{listeners.add(f);return()=>listeners.delete(f);}};const ui=createPlazaUiStoreV19(client);let uiCalls=0,sceneCalls=0;const unsub=ui.subscribe(()=>uiCalls++),sceneUnsub=client.subscribe(()=>sceneCalls++);
 for(let i=1;i<=100;i++){snapshot={...snapshot,members:[{...snapshot.members[0],seq:i,x:i*.1}],correction:{seq:i,x:i*.1}};for(const f of listeners)f();}assert.equal(sceneCalls,100);assert.equal(uiCalls,0);
 snapshot={...snapshot,members:[{...snapshot.members[0],selectedBadge:'new'}]};for(const f of listeners)f();assert.equal(uiCalls,1);
 snapshot={...snapshot,status:'resuming'};for(const f of listeners)f();assert.equal(uiCalls,2);snapshot={...snapshot,members:[]};for(const f of listeners)f();assert.equal(uiCalls,3);unsub();sceneUnsub();assert.equal(listeners.size,0);
});
test('zero contribution lamps are excluded in day and retain authored night intensity',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),actor=new T.Group(),lights=createPlazaLightingV4(scene,camera,actor),hemisphere=new T.HemisphereLight(),sun=new T.DirectionalLight(),renderer={};
 lights.attachWorld({lampAnchors:[new T.Vector3(),new T.Vector3(),new T.Vector3()],nightMaterials:[]});
 lights.apply({sun:2,hemisphere:1,exposure:1,environment:1,light:new T.Color()},hemisphere,renderer,sun);assert.ok(lights.lamps.every(l=>l.intensity===0&&!l.visible));
 lights.apply({sun:.3,hemisphere:1,exposure:1,environment:1,light:new T.Color()},hemisphere,renderer,sun);assert.deepEqual(lights.lamps.map(l=>l.intensity),[1.5,1.5,5]);assert.ok(lights.lamps.every(l=>l.visible));
});

import {batchPlazaMapV1} from '../scene/batchPlazaMapV1.js';
test('batching preserves transformed root world geometry and render layers/shadow policy',async()=>{
 const root=new T.Group();root.position.x=10;root.scale.x=2;const material=new T.MeshBasicMaterial();
 for(const x of [0,.2]){const m=new T.Mesh(new T.BoxGeometry(.1,.1,.1),material);m.position.x=x;m.layers.set(1);m.castShadow=false;m.receiveShadow=false;root.add(m);}
 root.updateMatrixWorld(true);const before=new T.Box3().setFromObject(root);const result=await batchPlazaMapV1(root);assert.equal(result.after,1);root.updateMatrixWorld(true);const after=new T.Box3().setFromObject(root);assert.ok(before.min.distanceTo(after.min)<1e-6);assert.ok(before.max.distanceTo(after.max)<1e-6);const batch=root.children[0];assert.equal(batch.layers.mask,2);assert.equal(batch.castShadow,false);assert.equal(batch.receiveShadow,false);
 batch.geometry.dispose();material.dispose();
});
test('opaque meshes with different layers or shadow flags cannot enter the same batch',async()=>{
 const root=new T.Group(),material=new T.MeshBasicMaterial();for(let i=0;i<3;i++){const m=new T.Mesh(new T.BoxGeometry(.1,.1,.1),material);m.layers.set(i===1?1:0);m.castShadow=i===2;root.add(m);}
 const result=await batchPlazaMapV1(root);assert.equal(result.after,3);root.children.forEach(m=>m.geometry.dispose());material.dispose();
});

import {createPlazaPresenceClockV19} from '../scene/plazaPresenceClockV19.js';
import {addPresenceSample,samplePresence} from '../scene/plazaPresenceMotionV2.js';
test('moving packet jitter is buffered without rewinding or extrapolating and resets on reincarnation',()=>{
 const clock=createPlazaPresenceClockV19();let samples=[];const value=(seq,x,id='p')=>({seq,x,y:0,z:0,heading:0,motion:'walk',seatId:null,presenceId:id});
 samples=addPresenceSample(samples,value(1,0),0);samples=addPresenceSample(samples,value(2,.15),100);assert.equal(clock.sample(samples,170).x,.075);assert.equal(clock.delay,120);
 let before=clock.sample(samples,250).x;samples=addPresenceSample(samples,value(3,.45),300);let after=clock.sample(samples,300).x;assert.ok(after>=before);assert.equal(clock.delay,220);
 for(let t=310;t<700;t+=10){const v=clock.sample(samples,t);assert.ok(v.x>=after-1e-9&&v.x<=.45+1e-9);after=v.x;}
 samples=addPresenceSample(samples,value(0,10,'new'),700);assert.equal(clock.sample(samples,700).x,10);assert.equal(clock.delay,120);
});
test('37fps sender plus 100ms server flush no longer repeatedly starves 120ms viewer buffer',()=>{
 const sends=[];let last=-Infinity,seq=0;for(let i=0;i<400;i++){const now=i*1000/37;if(now-last>=100){last=now;sends.push({now,seq:++seq,x:now*.0015});}}
 const packets=[];let seen=0;for(let t=100;t<9000;t+=100){const v=sends.filter(s=>s.now<=t).at(-1);if(v&&v.seq!==seen){seen=v.seq;packets.push({time:t,...v});}}
 const clock=createPlazaPresenceClockV19();let samples=[],index=0,prevA=null,prevB=null,stallsA=0,stallsB=0,learnedAt=null;
 for(let now=0;now<8800;now+=1000/60){while(packets[index]?.time<=now){const p=packets[index++];samples=addPresenceSample(samples,{seq:p.seq,x:p.x,y:0,z:0,heading:0,motion:'walk',presenceId:'p'},p.time);}
  if(!samples.length)continue;const a=samplePresence(samples,now),b=clock.sample(samples,now);
  if(clock.delay>120&&learnedAt===null)learnedAt=now;
  if(learnedAt!==null&&now>learnedAt+500&&prevA!==null){if(Math.abs(a.x-prevA)<1e-8)stallsA++;if(Math.abs(b.x-prevB)<1e-8)stallsB++;}prevA=a.x;prevB=b.x;
 }
 assert.ok(stallsA>0);assert.ok(stallsB<stallsA/4,`${stallsA} -> ${stallsB}`);assert.ok(clock.delay<=240);
 console.log('F11_JITTER_REPLAY',JSON.stringify({fixedBufferStalledFrames:stallsA,adaptiveBufferStalledFrames:stallsB,learnedDelayMs:clock.delay}));
});
