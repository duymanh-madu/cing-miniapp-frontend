import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const source={
 api:`export default {post:(...x)=>globalThis.__v42.post(...x),get:(...x)=>globalThis.__v42.get(...x)};`,
 store:`export default {getState:()=>globalThis.__v42.auth};`,
 session:`export function destroySession(){globalThis.__v42.epoch++;globalThis.__v42.auth={authenticated:false};globalThis.__v42.destroyed=true;}export function createSession(s){globalThis.__v42.created.push(s);globalThis.__v42.auth={authenticated:true,...s};globalThis.__v42.persisted={...s,session:s};globalThis.__v42.epoch++;}`,
 persisted:`export const getCanonicalAccessToken=()=>globalThis.__v42.persisted.accessToken;export function getPersistedAuthSession(){return globalThis.__v42.persisted;}`,
 epoch:`export const authSessionEpochV42=()=>globalThis.__v42.epoch;export const advanceAuthSessionEpochV42=()=>++globalThis.__v42.epoch;export function requireAuthSessionEpochV42(e){if(e!==globalThis.__v42.epoch)throw Object.assign(new Error('superseded'),{code:'AUTH_SESSION_SUPERSEDED'});}`,
 device:`export const getOrCreateRuntimeDeviceId=()=> 'fixture-device';`,
 local:`export const registerLocalDeviceReauthCredential=async()=>false;export const clearLocalDeviceReauthCredential=()=>true;`,
 misc:`export const runtimeLogger={info:()=>{}};export const resetQueryCache=()=>{};export const clearCachedZaloUserInfo=()=>{};`,
 recovery:`export const recoverBackendAuthSession=async()=>{throw new Error('unexpected refresh')};export const isDefinitiveAuthRecoveryRejection=e=>!!e.authRejected;`,
};
async function load(entry){
 const dir=await mkdtemp(path.join(tmpdir(),'cing-v42-contract-'));
 const output=path.join(dir,'test.mjs');
 const result=await build({entryPoints:[path.join(root,entry)],bundle:true,write:false,platform:'node',format:'esm',define:{'import.meta.env.VITE_API_BASE_URL':'"https://fixture.invalid/api"'},plugins:[{name:'fixture-boundaries',setup(b){b.onResolve({filter:/.*/},a=>{
 if(a.kind==='entry-point')return;
 const x=a.path;
 const key=x.includes('runtimeLogger')||x==='@/query'||x.includes('runtimeCustomerPermissionEngine')?'misc':x.includes('authSessionEpochV42')?'epoch':x.includes('apiClient')?'api':/stores\/auth/.test(x)?'store':/\/authSession(?:\.js)?$/.test(x)?'session':x.includes('persistedAuthSession')?'persisted':x.includes('runtimeDeviceIdentity')?'device':x.includes('localDeviceReauth')?'local':x.includes('authRecovery')?'recovery':null;
 if(key)return {path:key,namespace:'fixture'};
 if(x.startsWith('@/'))return {path:path.join(root,x.slice(2))};
 });b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:source[a.path],loader:'js'}));}}]});
 await writeFile(output,result.outputFiles[0].text);
 const mod=await import(pathToFileURL(output));
 return {mod,close:()=>rm(dir,{recursive:true,force:true})};
}
function setup(){globalThis.__v42={epoch:0,created:[],auth:{authenticated:false,profile:{id:'old-cached',phone:'0970000000'}},persisted:{accessToken:'fixture-token',refreshToken:null,session:null},post:async()=>({data:{success:true}}),get:async()=>({data:{data:{customer:{id:'member-A',phone:'+84 980 000 000',name:'Member A'}}}})};return globalThis.__v42;}
const tick=()=>new Promise(r=>setImmediate(r));
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};}
test('session open without customer resolves protected backend identity and normalizes phone',async()=>{const f=setup();let gets=0;const get=f.get;f.get=(...a)=>{gets++;assert.equal(a[0],'/auth/session');assert.equal(a[1].headers.Authorization,'Bearer fixture-token');return get(...a)};const x=await load('infra/auth/authenticatedRuntimeSession.ts');try{assert.equal(await x.mod.openAuthenticatedRuntimeSession(),'authenticated');assert.equal(gets,1);assert.equal(f.created[0].profile.id,'member-A');assert.equal(f.created[0].profile.phone,'0980000000');}finally{await x.close();}});
test('late session open after logout cannot hydrate previous identity',async()=>{const f=setup(),d=deferred();f.post=()=>d.promise;const x=await load('infra/auth/authenticatedRuntimeSession.ts');try{const pending=x.mod.openAuthenticatedRuntimeSession();await tick();f.epoch++;d.resolve({data:{customer:{id:'member-A',phone:'0980000000'}}});assert.equal(await pending,'transient_failure');assert.equal(f.created.length,0);}finally{await x.close();}});
test('old rejected session does not reject the new account',async()=>{const f=setup(),d=deferred();f.post=()=>d.promise;const x=await load('infra/auth/authenticatedRuntimeSession.ts');try{const pending=x.mod.openAuthenticatedRuntimeSession();await tick();f.epoch++;d.reject({response:{status:401}});assert.equal(await pending,'transient_failure');assert.equal(f.created.length,0);}finally{await x.close();}});
test('late refresh cannot replace a newer account',async()=>{const f=setup(),d=deferred();f.persisted.refreshToken='fixture-refresh';f.post=()=>d.promise;const x=await load('infra/auth/authRecovery.js');try{const pending=x.mod.recoverBackendAuthSession();await tick();f.epoch++;d.resolve({data:{accessToken:'new-old-token'}});await assert.rejects(pending,{code:'AUTH_SESSION_SUPERSEDED'});assert.equal(f.created.length,0);}finally{await x.close();}});
test('login identity comes from authenticated backend, never supplied or cached phone',async()=>{const f=setup();globalThis.fetch=async(url)=>({ok:true,json:async()=>url.endsWith('/login')?{data:{accessToken:'fixture-login-token'}}:{data:{customer:{id:'member-A',phone:'+84 980000000',name:'Member A'}}}});const x=await load('zalo/activation/activationApi.ts');try{const r=await x.mod.activateMiniAppUser({phone:'0970000000',phoneGranted:true,oaFollowed:true,activated:true,source:'fixture'});assert.equal(r.phone,'0980000000');assert.equal(f.created[0].profile.id,'member-A');assert.equal(f.created[0].profile.phone,'0980000000');}finally{delete globalThis.fetch;await x.close();}});
test('membership-only login response cannot create a backend session',async()=>{const f=setup();globalThis.fetch=async()=>({ok:true,json:async()=>({data:{customer:{id:'member-A',phone:'0980000000'}}})});const x=await load('zalo/activation/activationApi.ts');try{await assert.rejects(x.mod.activateMiniAppUser({phone:'0980000000',source:'fixture'}),{code:'AUTH_LOGIN_SESSION_MISSING'});assert.equal(f.created.length,0);}finally{delete globalThis.fetch;await x.close();}});

test('legacy runtime writes cannot introduce a different phone or grant membership from cache',async()=>{const f=setup();const x=await load('runtime/customer/runtimeCustomerIdentityStore.ts');try{const store=x.mod.useRuntimeCustomerIdentityStore;store.getState().setIdentity({customerId:'cached',phone:'0970000000',fullName:'Cached',memberActivated:true});assert.equal(store.getState().identity.phone,'');assert.equal(store.getState().memberActivated,false);f.auth={authenticated:true,accessToken:'fixture',profile:{id:'owner',phone:'0980000000',name:'Accepted'}};store.getState().setIdentity({customerId:'forged',phone:'0970000000',fullName:'Wrong account',memberActivated:true});assert.equal(store.getState().identity.phone,'0980000000');assert.equal(store.getState().identity.customerId,'owner');assert.equal(store.getState().identity.fullName,'Accepted');}finally{await x.close();}});

test('logout completes local destruction with synchronous device credential clearing',async()=>{const f=setup();globalThis.window={dispatchEvent:()=>true};const x=await load('infra/auth/logout.js');try{assert.doesNotThrow(()=>x.mod.logout());assert.equal(f.destroyed,true);assert.equal(f.auth.authenticated,false);}finally{delete globalThis.window;await x.close();}});
