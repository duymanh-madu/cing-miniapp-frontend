import test from 'node:test';
import assert from 'node:assert/strict';
import {createFittingSessionV36,applyFittingItemV36,optimisticEquipV36} from '../runtime/plazaFittingSessionV36.js';
test('try-on composes slots, keeps other character isolated and clears on exit',()=>{
 const s=createFittingSessionV36();let updates=0;const off=s.subscribe(()=>updates++);
 for(const slot of ['top','bottom','shoes','skin'])s.tryItem('boy',{slot,id:slot});
 s.tryItem('boy',{slot:'top',id:'new-top'});s.tryItem('girl',{slot:'top',id:'girl-top'});
 assert.deepEqual(s.getSnapshot().boy,{top:'new-top',bottom:'bottom',shoes:'shoes',skin:'skin'});
 assert.equal(s.getSnapshot().girl.top,'girl-top');assert.equal(updates,6);
 s.dispose();assert.deepEqual(s.getSnapshot(),{});off();
});
test('whole outfit resets parts, single part then overrides only that slot',()=>{
 const full=applyFittingItemV36({top:'old',shoes:'old',skin:'skin'},{slot:'outfit',id:'set'});
 assert.deepEqual(full,{skin:'skin',outfit:'set'});assert.deepEqual(applyFittingItemV36(full,{slot:'top',id:'shirt'}),{skin:'skin',outfit:'set',top:'shirt'});
});
test('shared asset is loaded once across remounts and released once on exit',async()=>{
 const s=createFittingSessionV36();let loads=0,releases=0;const load=async()=>{loads++;return{scene:{}}},release=()=>releases++;
 const [a,b]=await Promise.all([s.load('a',load,release),s.load('a',load,release)]);assert.equal(a,b);await s.load('a',load,release);assert.equal(loads,1);
 s.dispose();await Promise.resolve();assert.equal(releases,1);
});
test('in-flight load after exit is released and cannot repopulate cache',async()=>{
 const s=createFittingSessionV36();let resolve,releases=0;const p=s.load('a',()=>new Promise(r=>resolve=r),()=>releases++);await Promise.resolve();s.dispose();resolve({scene:{}});await assert.rejects(p,/FITTING_SESSION_ENDED/);assert.equal(releases,1);
});
test('failed asset retries; optimistic equip never grants unknown or unowned items',async()=>{
 const s=createFittingSessionV36();await assert.rejects(s.load('a',async()=>{throw Error('offline')},()=>{}));assert.ok(await s.load('a',async()=>({scene:{}}),()=>{}));s.dispose();
 const appearance={catalog:[{id:'top',slot:'top'}],owned:['top'],equipped:{bottom:'pants',skin:'skin'}};
 assert.deepEqual(optimisticEquipV36(appearance,'top'),{top:'top',bottom:'pants',skin:'skin'});assert.equal(optimisticEquipV36({...appearance,owned:[]},'top'),null);assert.equal(optimisticEquipV36(appearance,'missing'),null);
});

test('accepting one item retains other trial parts and rollback can reveal previous saved slot',()=>{
 const s=createFittingSessionV36();s.tryItem('boy',{slot:'top',id:'trial-shirt'});s.tryItem('boy',{slot:'bottom',id:'trial-pants'});s.accept('boy','top');assert.deepEqual(s.getSnapshot().boy,{bottom:'trial-pants'});
 const catalog=['outfit','top','bottom','shoes'].map(slot=>({id:'boy_campus_'+slot,character:'boy',style:'campus',slot}));s.tryItem('boy',catalog[0]);s.accept('boy','top',catalog);assert.deepEqual(s.getSnapshot().boy,{bottom:'boy_campus_bottom',shoes:'boy_campus_shoes'});
});
