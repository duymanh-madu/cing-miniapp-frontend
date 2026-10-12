import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {friendPresenceLabelV19,sortFriendsV19} from '../runtime/plazaFriendPresenceV19.js';
import {selectChatChannelsV16} from '../runtime/plazaSocialClientV16.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('online friends before offline, unknown never guessed offline',()=>{
 const values=sortFriendsV19([{displayName:'C',online:false},{displayName:'B'},{displayName:'A',online:true}]);
 assert.deepEqual(values.map(x=>x.displayName),['A','C','B']);
 assert.equal(friendPresenceLabelV19({}), 'Chưa rõ hoạt động');
});
test('server lastSeenAt governs offline duration',()=>{
 const now=Date.parse('2026-10-12T12:00:00Z');
 assert.equal(friendPresenceLabelV19({online:true},now),'Đang online');
 assert.equal(friendPresenceLabelV19({online:false,lastSeenAt:'2026-10-12T11:55:00Z'},now),'Offline 5 phút');
 assert.equal(friendPresenceLabelV19({online:false,lastSeenAt:'2026-10-11T11:00:00Z'},now),'Offline 1 ngày');
 assert.equal(friendPresenceLabelV19({online:false,lastSeenAt:'2030-01-01T00:00:00Z'},now),'Offline');
});
test('no redundant chat and roster headers',()=>{
 assert.doesNotMatch(read('../pages/PlazaChatV7.jsx'),/CÙNG CING IU/);
 assert.doesNotMatch(read('../pages/PlazaMembersV15.jsx'),/CÙNG CING IU/);
 assert.match(read('../pages/PlazaChatV7.jsx'),/\.slice\(-20\)/);
});
test('chat channel colors and relationship are server gated',()=>{
 const s=read('../pages/PlazaChatV7.jsx');const c=read('../pages/PlazaV19Block05.css');
 assert.match(s,/relationshipVerified===true/);
 for(const v of ['--room','--world','--pm','--romance'])assert.ok(c.includes(v));
});
test('tool drawer omits room zoom buttons; one existing renderer remains',()=>{
 const scene=read('../scene/PlazaSceneV1.jsx');const source=read('../scene/createPlazaSceneV1.js');
 const camera=read('../scene/plazaCameraV10.js');
 assert.match(scene,/plaza-v19-tools/);
 assert.doesNotMatch(scene,/plaza-v19-tools-zoom|api\.current\?\.zoom/);
 assert.match(source,/zoom: direction/);
 assert.match(camera,/zoom\(direction\)/);
 assert.equal((source.match(/new THREE\.WebGLRenderer/g)||[]).length,1);
});
test('no added API financial writes, chat uses existing client authority',()=>{
 const page=read('../pages/PlazaPageV1.jsx');const chat=read('../pages/PlazaChatV7.jsx');
 assert.match(chat,/social\.run\(compose==='world'/);
 assert.match(page,/client\.sendMessage\(/);
 assert.doesNotMatch(page,/\/plaza\/social\/command/);
});

test('Tất cả aggregates all available channel messages without an independent 20-message cut',()=>{
 const roomId='room-01';
 const regional=Array.from({length:15},(_,i)=>({messageId:`room-${i}`,roomId,body:`R${i}`,createdAt:i*1000}));
 const world=Array.from({length:12},(_,i)=>({messageId:`world-${i}`,channel:'world',body:`W${i}`,createdAt:(i+15)*1000}));
 const pm=Array.from({length:45},(_,i)=>({messageId:`pm-${i}`,channel:'pm',peerId:`friend-${Math.floor(i/15)}`,body:`P${i}`,createdAt:(i+27)*1000}));
 const all=selectChatChannelsV16({tab:'all',roomId,regional,social:[...world,...pm],peerId:null});
 assert.equal(all.length,72);
 assert.equal(all.filter(m=>m.channel==='room').length,15);
 assert.equal(all.filter(m=>m.channel==='world').length,12);
 assert.equal(all.filter(m=>m.channel==='pm').length,45);
 assert.ok(all.every((m,i)=>i===0||all[i-1].createdAt<=m.createdAt));
 const chat=read('../pages/PlazaChatV7.jsx');
 assert.match(chat,/tab==='all'\?selected:selected\.slice\(-20\)/);
 assert.doesNotMatch(chat,/selectChatChannelsV16\([^;]*\)\.slice\(-20\)/);
});
