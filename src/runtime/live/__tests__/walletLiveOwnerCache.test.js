import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
test('wallet cache and coalesced reads stay with their owner during overlapping account reads',async()=>{
 const requests=[];const context={fetchWalletOverview:()=>{const d=deferred();requests.push(d);return d.promise;},Date,module:{exports:{}}};
 const source=fs.readFileSync(new URL('../../../features/wallet/hooks/useWalletOverview.js',import.meta.url),'utf8');
 const start=source.indexOf('const CACHE_TTL_MS'),end=source.indexOf('export function invalidateWalletOverviewCache');
 vm.runInNewContext(source.slice(start,end)+'\nmodule.exports=loadSharedWallet;',context);const read=context.module.exports;
 const first=read({owner:'first'}),second=read({owner:'second'});assert.equal(requests.length,2);
 requests[0].resolve({balance:999});await first;requests[1].resolve({balance:20});await second;
 assert.equal((await read({owner:'second'})).balance,20);assert.equal(requests.length,2);
 const again=read({owner:'first'});assert.equal(requests.length,3);requests[2].resolve({balance:81});assert.equal((await again).balance,81);
});
