import test from 'node:test';import assert from 'node:assert/strict';
import {domainsForChange,invalidateLiveData,subscribeLiveData} from '../appLiveData.js';
test('score, reset, gift and order events invalidate every affected leaderboard domain',()=>{
 for(const name of ['game_score_updated','leaderboard.updated','leaderboard_reset','gift.received','order.status.updated','/game/cing-block-puzzle/session/submit'])assert.ok(domainsForChange(name).includes('leaderboard'),name);
 assert.ok(domainsForChange('menu:item_updated').includes('menu'));
 assert.deepEqual(domainsForChange('/auth/refresh'),[]);
});
test('domain routing, all-data reconciliation and cleanup never leave stale subscribers',()=>{
 let boards=0,orders=0,queries=0;
 const a=subscribeLiveData(['leaderboard'],()=>boards++),b=subscribeLiveData(['orders'],()=>orders++),c=subscribeLiveData(['*'],()=>queries++);
 invalidateLiveData(['leaderboard']);assert.deepEqual([boards,orders,queries],[1,0,1]);
 invalidateLiveData(['*']);assert.deepEqual([boards,orders,queries],[2,1,2]);a();b();c();invalidateLiveData(['*']);assert.deepEqual([boards,orders,queries],[2,1,2]);
});
