import test from 'node:test';
import assert from 'node:assert/strict';
import {validRoomNameV15, roomNameV15, findRoomNumberV15, latestRegionalMessageV15, selectRosterV15} from '../pages/plazaSocialV15.js';
test('room names normalize Vietnamese accents; 30 Unicode characters allowed and 31 rejected',()=>{
  assert.equal(roomNameV15('  He\u0323n nhau  '),'Hẹn nhau');
  assert.equal(validRoomNameV15('🧋'.repeat(30)),true);
  assert.equal(validRoomNameV15('🧋'.repeat(31)),false);
  assert.equal(validRoomNameV15('a\nb'),false);
  assert.equal(validRoomNameV15('   '),false);
});
test('room numbers resolve leading zeros and retain password; nonexistent/full rooms never join',()=>{
  const room={roomId:'protected',roomNumber:2,memberCount:3,capacity:30,hasPassword:true};
  const rooms=[room,{roomId:'full',roomNumber:3,memberCount:30,capacity:30},{roomNumber:4,memberCount:0,capacity:30}];
  for(const value of ['2','02','002'])assert.equal(findRoomNumberV15(rooms,value).room,room);
  for(const value of ['3','4','0','-2','2.0','2e0','abc','99'])assert.ok(findRoomNumberV15(rooms,value).error);
});
test('compact regional chat never exposes another room or lobby history',()=>{
  const m={roomId:'one',body:'hello',createdAt:4};
  const messages=[m,{roomId:'two',body:'private room',createdAt:8},{roomId:'one',body:'older',createdAt:2}];
  assert.equal(latestRegionalMessageV15('one',messages),m);
  assert.equal(latestRegionalMessageV15(null,messages),null);
});
test('roster includes background members without requiring a 3D avatar; repeated IDs deduplicate',()=>{
  const roster=[{memberId:'a',background:true},{memberId:'a'},{memberId:'b'}];
  assert.deepEqual(selectRosterV15({capacity:30},roster),[roster[0],roster[2]]);
  assert.deepEqual(selectRosterV15(null,roster),[]);
});
