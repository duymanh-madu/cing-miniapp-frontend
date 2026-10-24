import { buildKdsUiSnapshot, sameBranch } from "./cingKdsUiDataAdapterV1.js";

export function adaptKdsOperationsSnapshotV1(data, branch) {
  if (!data?.success || !sameBranch(data.branch, branch) ||
      !Array.isArray(data.history) || !Array.isArray(data.alerts) || !Array.isArray(data.performance) ||
      !Number.isFinite(Date.parse(data.sampled_at))) throw new Error("KDS_SNAPSHOT_INVALID");
  const response = values => ({success:true,branch:data.branch,data:values});
  const snapshot = buildKdsUiSnapshot({branch,ordersResponse:response(data.preparation),
    servingResponse:response(data.serving),alertsResponse:response(data.alerts),performanceResponse:response(data.performance)});
  const cancellations=data.source_cancellations||[];
  if(!Array.isArray(cancellations)||cancellations.length>50||cancellations.some(row=>!row||typeof row.cup_id!=="string"||typeof row.item_name!=="string"||!["pending","preparing","prepared","served"].includes(row.prior_status)||!Number.isFinite(Date.parse(row.occurred_at))))throw new Error("KDS_CANCELLATIONS_INVALID");
  const enabled = data.capabilities?.transitions_enabled === true;
  const seen=new Set();
  const bills=(data.bills||[]).map(bill=>{
    if(!bill.order_id || !Array.isArray(bill.cups) || !bill.cups.length)throw new Error("KDS_BILL_INVALID");
    for(const cup of bill.cups){
      if(!cup.cup_id || seen.has(cup.cup_id) || !["pending","preparing","prepared","served"].includes(cup.status))throw new Error("KDS_BILL_INVALID");
      seen.add(cup.cup_id);
      const row=[...snapshot.preparation,...snapshot.serving].find(c=>c.cup_id===cup.cup_id);
      if(cup.status!=="served" && (!row || row.order_id!==bill.order_id || row.status!==cup.status || row.version!==cup.version))throw new Error("KDS_BILL_INVALID");
    }
    return bill;
  });
  if(data.bills && [...snapshot.preparation,...snapshot.serving].some(c=>!seen.has(c.cup_id)))throw new Error("KDS_BILL_INVALID");
  return {...snapshot,bills,source_cancellations:cancellations,history_range:data.history_range,duration_filter:data.duration_filter, history:data.history, policy:data.policy, sampled_at:data.sampled_at,
    canReport:data.capabilities?.can_report === true,transitionsEnabled:enabled,
    preparation:snapshot.preparation.map(x=>({...x,transition_ready:enabled && data.capabilities?.can_prepare !== false && x.version !== null})),
    serving:snapshot.serving.map(x=>({...x,transition_ready:enabled && data.capabilities?.can_serve !== false && x.version !== null}))};
}

// One settled request at a time. Server snapshots replace all local data.
// A failed request clears stale rows and locks mutations. No optimistic update.
export function createKdsOperationsSessionV1({api,branch,onState,
  schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id),
  actionKey=()=>crypto.randomUUID(),intervalMs=5000}) {
  let streamAbort=null,streamHealthy=false;
  let active=false,epoch=0,timer=null,inflight=null,dirty=false,snapshot=null;
  const mutations=new Map();
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
        if(!snapshot) publish({loading:true});
        try {
          const data=await api.snapshot(branch,historyRange,controller.signal);
          if(!active || epoch!==session) return;
          if(snapshot && Date.parse(data.sampled_at)<Date.parse(snapshot.sampled_at))return;
          snapshot=adaptKdsOperationsSnapshotV1(data,branch);
          failures=0;
          publish({snapshot,loading:false,connectionState:"online",error:"",syncNotice:streamHealthy?"":"Đang dùng kết nối dự phòng để duy trì đồng bộ."});
        } catch(e) {
          if(!active || epoch!==session) return;
          failures++;
          const code=e?.response?.data?.code;
          const authority=/^KDS_OPS_(FORBIDDEN|UNAUTHORIZED|SOURCE_STALE|READ_DISABLED|POLICY_REQUIRED)$/.test(code||"");
          if(authority || !api.events) snapshot=null;
          publish({snapshot,loading:false,connectionState:"offline",syncNotice:snapshot?"Đang nối lại kết nối. Dữ liệu giữ nguyên; thao tác tạm khóa.":"",
            error:snapshot?"":/^KDS_OPS_[A-Z_]+$/.test(code||"")?code:"KDS_OPS_UNAVAILABLE"});
        }
      } while(active && epoch===session && dirty);
    })();
    inflight={promise:running,abort:()=>controller.abort()};
    try {await running;} finally { if(inflight?.promise===running) inflight=null; if(active && epoch===session && (!api.events || !streamHealthy)) later(); }
  }
  async function transition(command) {
    if(!active || mutations.has(command.cup_id) || !snapshot?.transitionsEnabled) throw new Error("KDS_MUTATION_DISABLED");
    const cup=[...snapshot.preparation,...snapshot.serving].find(x=>x.cup_id===command.cup_id);
    const next={pending:"prepared",preparing:"prepared",prepared:"served"};
    if(!cup?.transition_ready || cup.order_id!==command.order_id || next[cup.status]!==command.target_status)
      throw new Error("KDS_MUTATION_DISABLED");
    const previous=pendingActions.get(cup.cup_id);
    const payload=previous || {cup_id:cup.cup_id,expected_version:cup.version,
      target_status:command.target_status,action_key:actionKey()};
    if(payload.target_status!==command.target_status || payload.expected_version!==cup.version) {
      pendingActions.delete(cup.cup_id); await refresh(); throw new Error("KDS_MUTATION_STALE");
    }
    pendingActions.set(cup.cup_id,payload);
    const controller=new AbortController(); mutations.set(cup.cup_id,controller);
    const session=epoch;
    publish({busyCupIds:[...mutations.keys()]});
    try {
      const result=await api.transition(branch,payload,controller.signal);
      if(result?.success!==true) throw new Error("KDS_MUTATION_UNCONFIRMED");
      pendingActions.delete(cup.cup_id);
    } catch(e) {
      if(e?.response?.status && e.response.status<500) pendingActions.delete(cup.cup_id);
      // For an ambiguous timeout, keep exactly the same idempotency key.
      throw e;
    } finally {
      mutations.delete(cup.cup_id);
      if(active && epoch===session) { publish({busyCupIds:[...mutations.keys()]}); await refresh(); }
    }
  }
  return {
    start() {if(active)return;active=true;epoch++;
      if(api.events){
        streamAbort=new AbortController();
        const startEpoch=epoch;
        void api.events(branch,()=>historyRange,streamAbort.signal, async(data)=>{
          if(!active || startEpoch!==epoch)return;
          try{streamHealthy=true;if(timer!==null){cancel(timer);timer=null;}if(snapshot && Date.parse(data.sampled_at)<Date.parse(snapshot.sampled_at))return;
          snapshot=adaptKdsOperationsSnapshotV1(data,branch);failures=0;
            publish({snapshot,loading:false,connectionState:"online",error:"",syncNotice:streamHealthy?"":"Đang dùng kết nối dự phòng để duy trì đồng bộ."});}
          catch{snapshot=null;publish({snapshot:null,loading:false,connectionState:"offline",error:"KDS_OPS_UNAVAILABLE"});throw new Error("KDS_SNAPSHOT_INVALID");}
        },(reason={})=>{
          if(active && startEpoch===epoch){streamHealthy=false;
            if(reason.code==="KDS_OPS_FORBIDDEN")historyRange={};
            const authority=/^KDS_OPS_(FORBIDDEN|UNAUTHORIZED|SOURCE_STALE|READ_DISABLED|POLICY_REQUIRED)$/.test(reason.code||"");
            if(authority)snapshot=null;
            publish({snapshot,loading:false,connectionState:"offline",error:authority?reason.code:"",
              syncNotice:snapshot?"Đang khôi phục kết nối; dữ liệu được giữ nguyên.":""});
            void refresh();
          }
        });
      }
      if(api.events){publish({loading:!snapshot});return;}
      return refresh();},
    refresh,transition,
    reconnect() {this.stop();return this.start();},
    setHistoryRange(value) {historyRange={...value};
      if(api.events){this.stop();return this.start();}return refresh();},
    disconnect() {streamAbort?.abort();streamAbort=null;epoch++;dirty=false;if(timer!==null)cancel(timer);timer=null;
      inflight?.abort();inflight=null;for(const controller of mutations.values())controller.abort();mutations.clear();snapshot=null;
      publish({snapshot:null,loading:false,connectionState:"offline",error:"KDS_OPS_UNAVAILABLE",busyCupIds:[]});},
    stop() {streamHealthy=false;streamAbort?.abort();streamAbort=null;active=false;epoch++;dirty=false; if(timer!==null)cancel(timer);timer=null;
      inflight?.abort();inflight=null;for(const controller of mutations.values())controller.abort();mutations.clear();snapshot=null;},
  };
}
