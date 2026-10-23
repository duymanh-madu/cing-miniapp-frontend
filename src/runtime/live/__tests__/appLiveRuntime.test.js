import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {domainsForChange,invalidateLiveData,subscribeLiveData} from '../appLiveData.js';
function setup(){
 const listeners=()=>{const map=new Map();return {map,addEventListener:(name,fn)=>map.set(name,fn),removeEventListener:(name,fn)=>{if(map.get(name)===fn)map.delete(name);},dispatchEvent:event=>map.get(event.type)?.(event)};};
 const win=listeners(),doc={...listeners(),visibilityState:'visible'},any=new Set(),socketHandlers=new Map(),timers=new Map(),intervals=new Map(),queries=[];let next=1;
 const socket={connected:true,onAny:fn=>any.add(fn),offAny:fn=>any.delete(fn),on:(event,fn)=>socketHandlers.set(event,fn),off:(event,fn)=>{if(socketHandlers.get(event)===fn)socketHandlers.delete(event);}};
 const ctx={getRuntimeSocket:()=>socket,queryClient:{invalidateQueries:options=>queries.push(options)},domainsForChange,invalidateLiveData,subscribeLiveData,window:win,document:doc,CustomEvent:class{constructor(type,init={}){this.type=type;this.detail=init.detail;}},setInterval:(fn)=>{const id=next++;intervals.set(id,fn);return id;},clearInterval:id=>intervals.delete(id),setTimeout:fn=>{const id=next++;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),module:{exports:{}}};
 const source=fs.readFileSync(new URL('../appLiveRuntime.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function startAppLiveRuntime','function startAppLiveRuntime');vm.runInNewContext(source+'\nmodule.exports=startAppLiveRuntime;',ctx);
 return {...ctx,any,queries,intervals,timers,stop:ctx.module.exports(),flush:()=>{for(const [id,fn]of [...timers]){timers.delete(id);fn();}}};
}
test('server hints reconcile active reads, retain event ownership and catch up after visibility/reconnect',()=>{
 let boardRefreshes=0;const off=subscribeLiveData(['leaderboard'],()=>boardRefreshes++);const r=setup();
 try{
  r.flush();const initial=boardRefreshes;
  for(const fn of r.any)fn('app.data.changed',{domains:['leaderboard']});r.flush();assert.equal(boardRefreshes,initial+1);assert.ok(r.queries.every(options=>options.refetchType==='active'));
  r.document.visibilityState='hidden';for(const fn of r.any)fn('leaderboard.updated',{});assert.equal(boardRefreshes,initial+1);
  r.document.visibilityState='visible';r.document.map.get('visibilitychange')();r.flush();assert.equal(boardRefreshes,initial+2);
  r.window.map.get('online')();r.flush();assert.equal(boardRefreshes,initial+3);
 }finally{r.stop();off();}
 assert.equal(r.any.size,0);assert.equal(r.intervals.size,0);assert.equal(r.window.map.size,0);assert.equal(r.document.map.size,0);
});
