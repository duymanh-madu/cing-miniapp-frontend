import { buildKdsUiSnapshot, sameBranch } from "./cingKdsUiDataAdapterV1.js";

export function adaptKdsOperationsSnapshotV1(data, branch) {
  if (!data?.success || !sameBranch(data.branch, branch) ||
      !Array.isArray(data.history) || !Array.isArray(data.alerts) || !Array.isArray(data.performance) ||
      !Number.isFinite(Date.parse(data.sampled_at))) throw new Error("KDS_SNAPSHOT_INVALID");
  const response = values => ({success:true,branch:data.branch,data:values});
  const snapshot = buildKdsUiSnapshot({branch,ordersResponse:response(data.preparation),
    servingResponse:response(data.serving),alertsResponse:response(data.alerts),performanceResponse:response(data.performance)});
  const enabled = data.capabilities?.transitions_enabled === true;
  return {...snapshot, history:data.history, policy:data.policy, sampled_at:data.sampled_at,
    transitionsEnabled:enabled,
    preparation:snapshot.preparation.map(x=>({...x,transition_ready:enabled && x.version !== null})),
    serving:snapshot.serving.map(x=>({...x,transition_ready:enabled && x.version !== null}))};
}

// One settled request at a time. Server snapshots replace all local data.
// A failed request clears stale rows and locks mutations. No optimistic update.
export function createKdsOperationsSessionV1({api,branch,onState,
  schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id),
  actionKey=()=>crypto.randomUUID(),intervalMs=3000}) {
  let active=false,epoch=0,timer=null,inflight=null,dirty=false,snapshot=null,mutation=null;
  const pendingActions=new Map();
  let failures=0;
  let historyRange={};
  let state={loading:false,connectionState:"offline",error:"",snapshot:null,busyCupIds:[]};
  function publish(patch) { state={...state,...patch}; if(active) onState(state); }
  function later() { if(active) timer=schedule(()=>{timer=null;refresh();},Math.min(30000,intervalMs*(2**Math.min(failures,4)))); }
  async function refresh() {
    if(!active) return;
    if(timer!==null) {cancel(timer);timer=null;}
    dirty=true;
    if(inflight) return inflight.promise;
    const session=epoch;
    const controller=new AbortController();
    const running=(async()=>{
      do {
        dirty=false;
        publish({loading:true});
        try {
          const data=await api.snapshot(branch,historyRange,controller.signal);
          if(!active || epoch!==session) return;
          snapshot=adaptKdsOperationsSnapshotV1(data,branch);
          failures=0;
          publish({snapshot,loading:false,connectionState:"online",error:""});
        } catch(e) {
          if(!active || epoch!==session) return;
          snapshot=null;
          failures++;
          const code=e?.response?.data?.code;
          publish({snapshot:null,loading:false,connectionState:"offline",
            error:/^KDS_OPS_[A-Z_]+$/.test(code||"")?code:"KDS_OPS_UNAVAILABLE"});
        }
      } while(active && epoch===session && dirty);
    })();
    inflight={promise:running,abort:()=>controller.abort()};
    try {await running;} finally { if(inflight?.promise===running) inflight=null; if(active && epoch===session) later(); }
  }
  async function transition(command) {
    if(!active || state.loading || mutation || !snapshot?.transitionsEnabled) throw new Error("KDS_MUTATION_DISABLED");
    const cup=[...snapshot.preparation,...snapshot.serving].find(x=>x.cup_id===command.cup_id);
    const next={pending:"preparing",preparing:"prepared",prepared:"served"};
    if(!cup?.transition_ready || cup.order_id!==command.order_id || next[cup.status]!==command.target_status)
      throw new Error("KDS_MUTATION_DISABLED");
    const previous=pendingActions.get(cup.cup_id);
    const payload=previous || {cup_id:cup.cup_id,expected_version:cup.version,
      target_status:command.target_status,action_key:actionKey()};
    if(payload.target_status!==command.target_status || payload.expected_version!==cup.version) {
      pendingActions.delete(cup.cup_id); await refresh(); throw new Error("KDS_MUTATION_STALE");
    }
    pendingActions.set(cup.cup_id,payload);
    const controller=new AbortController(); mutation=controller;
    const session=epoch;
    publish({busyCupIds:[cup.cup_id]});
    try {
      const result=await api.transition(branch,payload,controller.signal);
      if(result?.success!==true) throw new Error("KDS_MUTATION_UNCONFIRMED");
      pendingActions.delete(cup.cup_id);
    } catch(e) {
      if(e?.response?.status && e.response.status<500) pendingActions.delete(cup.cup_id);
      // For an ambiguous timeout, keep exactly the same idempotency key.
      throw e;
    } finally {
      mutation=null;
      if(active && epoch===session) { publish({busyCupIds:[]}); await refresh(); }
    }
  }
  return {
    start() {if(active)return;active=true;epoch++;return refresh();},
    refresh,transition,
    setHistoryRange(value) {historyRange={...value};return refresh();},
    disconnect() {epoch++;dirty=false;if(timer!==null)cancel(timer);timer=null;
      inflight?.abort();inflight=null;mutation?.abort();snapshot=null;
      publish({snapshot:null,loading:false,connectionState:"offline",error:"KDS_OPS_UNAVAILABLE",busyCupIds:[]});},
    stop() {active=false;epoch++;dirty=false; if(timer!==null)cancel(timer);timer=null;
      inflight?.abort();inflight=null;mutation?.abort();snapshot=null;},
  };
}
