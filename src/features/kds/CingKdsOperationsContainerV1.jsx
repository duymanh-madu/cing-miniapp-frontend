import React, {useEffect,useRef,useState} from "react";
import apiClient from "@/infra/api/apiClient";
import CingKdsProPage from "./CingKdsProPage";
import "./CingKdsOperationsContainerV1.css";
import {createKdsOperationsSessionV1} from "./cingKdsOperationsSessionV1.js";
import {kdsOperationsStatusV1} from "./cingKdsOperationsStatusV1.js";

import {consumeKdsEventsV1} from "./cingKdsEventStreamV1.js";

const initial={snapshot:null,loading:false,error:"",connectionState:"offline",busyCupIds:[]};
export default function CingKdsOperationsContainerV1({token}) {
  const [branches,setBranches]=useState([]),[selected,setSelected]=useState("");
  const [sessionState,setSessionState]=useState(initial),[notice,setNotice]=useState("");
  const [range,setRange]=useState({from:"",to:"",durationMin:"",durationMax:""});
  const [policy,setPolicy]=useState({warning:"",critical:""});
  const [saving,setSaving]=useState(false);
  const session=useRef(null);
  const branch=branches.find(x=>JSON.stringify([x.pos_parent,x.pos_id])===selected);
  const headers={Authorization:`Bearer ${token}`};

  useEffect(()=>{
    let active=true;const controller=new AbortController();
    setBranches([]);setSelected("");setSessionState(initial);setNotice("");
    if(!token) {setNotice("Vui lòng đăng nhập quản trị.");return;}
    apiClient.get("/admin/kds/branches",{headers:{Authorization:`Bearer ${token}`},signal:controller.signal})
      .then(({data})=>{
        if(!active)return;
        if(!data?.success || !Array.isArray(data.data?.branches))throw new Error();
        const rows=data.data.branches;
        setBranches(rows);
        if(rows.length===1)setSelected(JSON.stringify([rows[0].pos_parent,rows[0].pos_id]));
        if(!rows.length)setNotice("Tài khoản chưa được cấp quyền KDS cho chi nhánh nào.");
      }).catch(()=>{if(active)setNotice("Không thể tải quyền chi nhánh. Vui lòng kiểm tra phiên quản trị và thử lại.");});
    return()=>{active=false;controller.abort();};
  },[token]);

  useEffect(()=>{
    setSessionState(initial);setPolicy({warning:"",critical:""});
    if(!branch || !token)return;
    setNotice("");
    const auth={Authorization:`Bearer ${token}`};
    const api={
      snapshot:async(b,history,signal)=>(await apiClient.get("/admin/kds/snapshot",{params:{...b,...history},headers:auth,signal,timeout:10000})).data,
      events:(b,getHistory,signal,onSnapshot,onOffline)=>consumeKdsEventsV1({
        url:()=>`${String(apiClient.defaults.baseURL||"/api").replace(/\/$/,"")}/admin/kds/events?${new URLSearchParams({...b,...getHistory()})}`,
        headers:{...auth,Accept:"text/event-stream"},signal,onSnapshot,onOffline}),
      transition:async(b,body,signal)=>(await apiClient.post("/admin/kds/cups/transition",body,{params:b,headers:auth,signal,timeout:10000})).data
    };
    const coordinator=createKdsOperationsSessionV1({api,branch,onState:setSessionState});
    session.current=coordinator;coordinator.start();
    const reconnect=()=>coordinator.reconnect();
    const disconnect=()=>coordinator.disconnect();
    const visible=()=>{if(document.visibilityState==="visible")reconnect();};
    window.addEventListener("online",reconnect);
    window.addEventListener("offline",disconnect);
    document.addEventListener("visibilitychange",visible);
    return()=>{coordinator.stop();if(session.current===coordinator)session.current=null;
      window.removeEventListener("online",reconnect);window.removeEventListener("offline",disconnect);document.removeEventListener("visibilitychange",visible);};
  },[selected,token,branches]);

  const snapshot=sessionState.snapshot;
  const status=kdsOperationsStatusV1(sessionState.error);
  async function transition(command) {
    setNotice("");
    try {await session.current?.transition(command);}
    catch {setNotice("Thao tác chưa được xác nhận. Danh sách đã được đồng bộ lại; vui lòng kiểm tra trạng thái trước khi thử tiếp.");}
  }
  async function savePolicy(event) {
    event.preventDefault();if(!branch || saving)return;
    setSaving(true);setNotice("");
    try {
      await apiClient.put("/admin/kds/policy",{warning_minutes:Number(policy.warning),critical_minutes:Number(policy.critical)},
        {params:branch,headers});
      await session.current?.refresh();setNotice("Đã lưu ngưỡng SLA.");
    } catch {setNotice("Không thể lưu ngưỡng SLA. Kiểm tra quyền và giá trị nhập.");}
    finally {setSaving(false);}
  }
  return <section className="ckds-live-shell">
    <div className="ckds-live-controls">
      <label>Chi nhánh <select value={selected} onChange={e=>setSelected(e.target.value)}>
        <option value="">Chọn chi nhánh được cấp quyền</option>
        {branches.map(b=><option key={JSON.stringify([b.pos_parent,b.pos_id])}
          value={JSON.stringify([b.pos_parent,b.pos_id])}>{b.pos_parent} · {b.pos_id}</option>)}
      </select></label>
      {snapshot && <span>Cập nhật: {new Date(snapshot.sampled_at).toLocaleTimeString("vi-VN")} · Đồng bộ khi dữ liệu thay đổi</span>}
    </div>
    {notice && <p role="status" className="ckds-banner">{notice}</p>}
    {sessionState.error && !status.hold && <p role={status.hold?"status":"alert"} className={`ckds-banner${status.hold?"":" error"}`}>
      {status.message}
    </p>}
    {branch?.can_manage_policy && <form onSubmit={savePolicy} className="ckds-live-controls">
      <label>Cảnh báo sau (phút) <input type="number" min="1" max="1439" required value={policy.warning}
        placeholder={snapshot?.policy?.warning_minutes || "Nhập ngưỡng"}
        onChange={e=>setPolicy({...policy,warning:e.target.value})}/></label>
      <label>Nghiêm trọng sau (phút) <input type="number" min="2" max="1440" required value={policy.critical}
        placeholder={snapshot?.policy?.critical_minutes || "Nhập ngưỡng"}
        onChange={e=>setPolicy({...policy,critical:e.target.value})}/></label>
      <button disabled={saving} type="submit">{saving?"Đang lưu…":"Lưu SLA"}</button>
    </form>}
    <CingKdsProPage branch={snapshot?.branch || null}
      branchName={branch?`${branch.pos_parent} · ${branch.pos_id}`:"Chưa chọn chi nhánh"}
      {...sessionState} {...(snapshot || {})}
      error={status.hold?"":sessionState.error}
      snapshotReady={Boolean(snapshot)}
      onRefresh={()=>session.current?.refresh()}
      onTransition={snapshot?.transitionsEnabled?transition:null}
      previewMessage={sessionState.error && status.hold?status.message:"Đang chờ cấp quyền và mở dữ liệu vận hành cho chi nhánh."}/>
    {snapshot && <section className="ckds-panel">
      <h2>Lịch sử hoàn thành</h2>
      <form className="ckds-live-controls" onSubmit={event=>{
        event.preventDefault();
        if(!range.from || !range.to)return;
        if(!Number.isFinite(Date.parse(range.from)) || !Number.isFinite(Date.parse(range.to)))return;
        session.current?.setHistoryRange({history_from:new Date(range.from).toISOString(),history_to:new Date(range.to).toISOString(),
          duration_min:range.durationMin,duration_max:range.durationMax});
      }}>
        <label>Từ <input type="datetime-local" required value={range.from} onChange={e=>setRange({...range,from:e.target.value})}/></label>
        <label>Đến <input type="datetime-local" required value={range.to} onChange={e=>setRange({...range,to:e.target.value})}/></label>
        <label>Thời gian phục vụ từ (phút) <input type="number" min="0" step="0.1" value={range.durationMin} onChange={e=>setRange({...range,durationMin:e.target.value})}/></label>
        <label>Đến (phút) <input type="number" min="0" step="0.1" value={range.durationMax} onChange={e=>setRange({...range,durationMax:e.target.value})}/></label>
        <button type="submit">Lọc lịch sử</button>
      </form>
      {snapshot.history.length ? <div className="ckds-history-table"><table><thead><tr>
        <th>Hóa đơn</th><th>Hoàn thành</th><th>Thời gian</th><th>Số đơn vị</th>
      </tr></thead><tbody>{snapshot.history.map((row,i)=><tr key={row.order_id || i}>
        <td>{row.tran_no || row.order_id}</td><td>{new Date(row.completed_at).toLocaleString("vi-VN")}</td>
        <td>{Number(row.duration_minutes).toFixed(1)} phút</td><td>{row.cup_count}</td>
      </tr>)}</tbody></table></div>:<p>Không có đơn hoàn thành trong khoảng đã chọn.</p>}
    </section>}
  </section>;
}
