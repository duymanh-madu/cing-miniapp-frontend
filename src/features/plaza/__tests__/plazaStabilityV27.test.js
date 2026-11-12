import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { createPlazaEnvironmentV27 } from '../scene/plazaEnvironmentV27.js';
import { acquireWardrobeGeometryV27 } from '../scene/plazaWardrobeResourcesV27.js';
import { createWardrobeFitting } from '../scene/plazaWardrobeFittingV34.js';
import { attachPlazaGarmentV27 } from '../scene/plazaGarmentV27.js';
import { createPlazaCameraV10 } from '../scene/plazaCameraV10.js';
import { createPlazaRealtimeClientV1 } from '../runtime/plazaRealtimeClientV1.js';

test('context restore regenerates environment and cleans temporary resources on success and failure',()=>{
 let builds=0,rooms=0,generators=0,freed=0,fail=false;
 const env=createPlazaEnvironmentV27({}, {
  createGenerator:()=>({fromScene(){builds++;if(fail)throw Error('GPU');return {texture:{generation:builds},dispose(){freed++;}};},dispose(){generators++;}}),
  createRoom:()=>({dispose(){rooms++;}}),
 });
 assert.equal(env.texture.generation,1);env.restore();assert.equal(env.texture.generation,2);assert.equal(freed,1);
 fail=true;assert.throws(()=>env.restore(),/GPU/);assert.equal(env.texture.generation,2);assert.equal(rooms,3);assert.equal(generators,3);
 env.dispose();env.dispose();assert.equal(freed,2);assert.equal(env.texture,null);env.restore();assert.equal(builds,3);
});

test('30 leases share fitted buffers; leaving 29 users cannot dispose the remaining geometry',()=>{
 const source=new T.BoxGeometry();let builds=0,disposed=0;
 const build=()=>{builds++;const g=source.clone();g.addEventListener('dispose',()=>disposed++);return g;};
 const leases=Array.from({length:30},()=>acquireWardrobeGeometryV27(source,'royal',build));
 assert.equal(builds,1);assert(leases.every(l=>l.geometry===leases[0].geometry));
 for(const l of leases.slice(0,29)){l.release();l.release();}assert.equal(disposed,0);
 const other=acquireWardrobeGeometryV27(source,'street',build);assert.notEqual(other.geometry,leases[29].geometry);
 other.release();assert.equal(disposed,1);leases[29].release();assert.equal(disposed,2);
 const fresh=acquireWardrobeGeometryV27(source,'royal',build);assert.equal(builds,3);fresh.release();source.dispose();
});
function actor(geometry){const root=new T.Group(),bone=new T.Bone();bone.name='Root';root.add(bone);const material=new T.MeshBasicMaterial();material.name='Body_SKIN';const mesh=new T.SkinnedMesh(geometry,material);mesh.bind(new T.Skeleton([bone]));root.add(mesh);return {root,bone,mesh};}
test('fitting shares the same recipe, separates different recipes and restores default body',async()=>{
 const source=new T.BoxGeometry(.1,.6,.1);source.translate(0,1.2,0);const actors=[actor(source),actor(source),actor(source)];
 const garmentRoot=new T.Group();for(const slot of ['top','bottom','shoes']){const bone=new T.Bone();bone.name='Root';garmentRoot.add(bone);const mesh=new T.SkinnedMesh(new T.BoxGeometry(),new T.MeshBasicMaterial());mesh.name=slot;mesh.bind(new T.Skeleton([bone]));garmentRoot.add(mesh);}
 const controllers=actors.map(a=>createWardrobeFitting(a.root,async()=>({scene:garmentRoot})));
 await Promise.all(controllers.map(c=>c.apply({top:'royal'})));
 const fitted=actors[0].mesh.geometry;assert.notEqual(fitted,source);assert(actors.every(a=>a.mesh.geometry===fitted));
 let freed=0;fitted.addEventListener('dispose',()=>freed++);
 await controllers[0].apply({top:'street'});assert.notEqual(actors[0].mesh.geometry,fitted);assert.equal(freed,0);
 controllers[1].dispose();assert.equal(freed,0);controllers[2].dispose();assert.equal(freed,1);
 assert.equal(actors[1].mesh.geometry,source);controllers[0].dispose();assert.equal(actors[0].mesh.geometry,source);
});
test('garments share asset geometry but have independent bones/materials and never dispose borrowed buffers',()=>{
 const source=actor(new T.BoxGeometry());source.mesh.name='top';const a=actor(new T.BoxGeometry()),b=actor(new T.BoxGeometry());
 let disposed=0;source.mesh.geometry.addEventListener('dispose',()=>disposed++);
 const ca=attachPlazaGarmentV27(a.root,source.root,'top',{part:'top'}),cb=attachPlazaGarmentV27(b.root,source.root,'top',{part:'top'});
 const ma=a.root.children.at(-1),mb=b.root.children.at(-1);
 assert.equal(ma.geometry,mb.geometry);assert.notEqual(ma.material,mb.material);assert.notEqual(ma.skeleton,mb.skeleton);
 assert.equal(ma.skeleton.bones[0],a.bone);assert.equal(mb.skeleton.bones[0],b.bone);
 ma.material.color.set('red');assert.notEqual(ma.material.color.getHex(),mb.material.color.getHex());
 ca.dispose();ca.dispose();assert.equal(disposed,0);assert.equal(mb.parent,b.root);cb.dispose();assert.equal(disposed,0);
});
test('2000 rapid camera input events coalesce into one ground query per frame',()=>{
 const handlers=new Map(),element={clientHeight:800,addEventListener:(k,f)=>handlers.set(k,f),removeEventListener:k=>handlers.delete(k),setPointerCapture(){}};
 const camera=new T.PerspectiveCamera();let queries=0;
 const controls=createPlazaCameraV10(camera,element,{minX:-30,maxX:30,minZ:-30,maxZ:30},{floorAt(){queries++;return 0;}});
 controls.update(new T.Vector3(0,1,0));queries=0;handlers.get('pointerdown')({button:0,pointerId:1,clientX:0,clientY:0});
 for(let i=1;i<=1000;i++)handlers.get('pointermove')({pointerId:1,clientX:i,clientY:i%200,preventDefault(){}});
 for(let i=0;i<1000;i++)handlers.get('wheel')({deltaY:1,deltaMode:0,preventDefault(){}});
 assert.equal(queries,0);controls.update();assert.equal(queries,1);assert(camera.position.toArray().every(Number.isFinite));
 controls.cancelGestures();controls.dispose();assert.equal(handlers.size,0);
});
function connection(){const handlers=new Map(),sent=[];const socket={connected:false,on:(k,f)=>handlers.set(k,f),off:k=>handlers.delete(k),connect(){socket.connected=true;handlers.get('connect')();},disconnect(){socket.connected=false;},emit:(event,payload,ack)=>sent.push({event,ack})};const client=createPlazaRealtimeClientV1({url:'https://game.example',getToken:()=> 'fixture',ioFactory:()=>socket,resumeOnConnect:true});return {handlers,sent,socket,client};}
const tick=()=>new Promise(r=>setImmediate(r));
for(const invalid of [undefined,{}, {room:undefined},{room:{}},{room:{roomId:''}}])test('malformed resume retains current room: '+JSON.stringify(invalid),async()=>{
 const s=connection();s.client.connect();s.handlers.get('plaza:room')({room:{roomId:'kept',memberCount:3}});
 s.sent.find(x=>x.event==='plaza:resume').ack({ok:true,data:invalid});await tick();
 assert.equal(s.client.getSnapshot().room.roomId,'kept');assert.equal(s.client.getSnapshot().lastError,'PLAZA_RESUME_UNAVAILABLE');s.client.dispose();
});
test('disconnect preserves room; an explicit server room:null still returns to lobby',async()=>{
 const s=connection();s.client.connect();s.handlers.get('plaza:room')({room:{roomId:'kept'}});
 s.socket.connected=false;s.handlers.get('disconnect')('ping timeout');assert.equal(s.client.getSnapshot().room.roomId,'kept');
 s.socket.connected=true;s.handlers.get('connect')();s.sent.filter(x=>x.event==='plaza:resume').at(-1).ack({ok:true,data:{room:null}});await tick();assert.equal(s.client.getSnapshot().room,null);s.client.dispose();
});
