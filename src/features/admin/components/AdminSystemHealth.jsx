import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = n => new Intl.NumberFormat("vi-VN").format(n || 0);

const fmtDate = str => str
  ? new Date(str).toLocaleString("vi-VN", {
      timeZone:"Asia/Ho_Chi_Minh",
      day:"2-digit",
      month:"2-digit",
      hour:"2-digit",
      minute:"2-digit",
    })
  : "—";

const badge = status => {
  if (status === "healthy") return { text:"Healthy", color:"#4CAF50", bg:"rgba(76,175,80,.15)" };
  if (status === "warning") return { text:"Warning", color:"#FF9800", bg:"rgba(255,152,0,.15)" };
  return { text:"Critical", color:"#f44336", bg:"rgba(244,67,54,.15)" };
};

const jobColor = status =>
  status === "done" ? "#4CAF50" :
  status === "failed" ? "#f44336" :
  status === "processing" ? "#2196F3" :
  "#FF9800";

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
      <p style={{ color:"#666", fontSize:11, fontWeight:800, margin:"0 0 6px" }}>{label}</p>
      <p style={{ color, fontSize:24, fontWeight:900, margin:0 }}>{fmt(value)}</p>
    </div>
  );
}

function RecoveryStats({ title, icon, stats }) {
  return (
    <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
      <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 12px" }}>
        {icon} {title}
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <StatCard label="Pending" value={stats?.pending} color="#FF9800" />
        <StatCard label="Processing" value={stats?.processing} color="#2196F3" />
        <StatCard label="Failed" value={stats?.failed} color="#f44336" />
        <StatCard label="Done hôm nay" value={stats?.done_today} color="#4CAF50" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
        <div style={{ background:"#0d0d18", border:"1px solid #252536", borderRadius:10, padding:10 }}>
          <p style={{ color:"#666", fontSize:10, fontWeight:800, margin:"0 0 4px" }}>Success Rate</p>
          <p style={{ color:"#4CAF50", fontSize:16, fontWeight:900, margin:0 }}>
            {stats?.success_rate ?? 100}%
          </p>
        </div>
        <div style={{ background:"#0d0d18", border:"1px solid #252536", borderRadius:10, padding:10 }}>
          <p style={{ color:"#666", fontSize:10, fontWeight:800, margin:"0 0 4px" }}>Last Processed</p>
          <p style={{ color:"#aaa", fontSize:12, fontWeight:800, margin:0 }}>
            {fmtDate(stats?.last_processed?.processed_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

function JobsTable({ title, jobs, type, onRetry }) {
  return (
    <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, overflow:"hidden" }}>
      <div style={{ padding:14, borderBottom:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>{title}</p>
      </div>

      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#0d0d18" }}>
            {["ID", type === "crm" ? "User" : "Order", "Source/Code", "Status", "Retry", "Created", "Processed", ""].map(h=>(
              <th key={h} style={{ padding:"10px", color:"#666", fontSize:10, textAlign:"left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map(j=>(
            <tr key={`${type}-${j.id}`} style={{ borderTop:"1px solid #12121a" }}>
              <td style={{ padding:"10px", color:"#888", fontSize:12 }}>{j.id}</td>
              <td style={{ padding:"10px", color:"white", fontSize:12 }}>
                {type === "crm" ? (j.phone || j.user_id) : (j.order_id || "—")}
              </td>
              <td style={{ padding:"10px", color:"#aaa", fontSize:12 }}>
                {type === "crm" ? j.source : (j.transaction_code || "—")}
              </td>
              <td style={{ padding:"10px", color:jobColor(j.status), fontSize:12, fontWeight:800 }}>
                {j.status}
              </td>
              <td style={{ padding:"10px", color:"#aaa", fontSize:12 }}>{j.retry_count}</td>
              <td style={{ padding:"10px", color:"#666", fontSize:11 }}>{fmtDate(j.created_at)}</td>
              <td style={{ padding:"10px", color:"#666", fontSize:11 }}>{fmtDate(j.processed_at)}</td>
              <td style={{ padding:"10px" }}>
                {j.status==="failed" && (
                  <button onClick={()=>onRetry(j.id)}
                    style={{ background:"rgba(255,152,0,.15)", border:"1px solid #FF9800",
                      color:"#FF9800", borderRadius:6, padding:"5px 8px",
                      cursor:"pointer", fontSize:11, fontWeight:800 }}>
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
          {jobs.length===0 && (
            <tr>
              <td colSpan={8} style={{ padding:30, textAlign:"center", color:"#666" }}>
                Không có job nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminSystemHealth({ token }) {
  const [health, setHealth] = useState(null);
  const [crmStats, setCrmStats] = useState(null);
  const [iposStats, setIposStats] = useState(null);
  const [crmJobs, setCrmJobs] = useState([]);
  const [iposJobs, setIposJobs] = useState([]);
  const [crmStatus, setCrmStatus] = useState("");
  const [iposStatus, setIposStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const h = { Authorization:`Bearer ${token}` };

  const showMsg = t => { setMsg(t); setTimeout(() => setMsg(""), 3500); };

  const load = async () => {
    const [healthRes, crmStatsRes, crmJobsRes, iposStatsRes, iposJobsRes] = await Promise.all([
      apiClient.get("/admin/system/health", { headers:h }),
      apiClient.get("/admin/system/crm-recovery/stats", { headers:h }),
      apiClient.get(`/admin/system/crm-recovery/jobs?limit=50${crmStatus ? `&status=${crmStatus}` : ""}`, { headers:h }),
      apiClient.get("/admin/system/ipos-recovery/stats", { headers:h }),
      apiClient.get(`/admin/system/ipos-recovery/jobs?limit=50${iposStatus ? `&status=${iposStatus}` : ""}`, { headers:h }),
    ]);

    setHealth(healthRes.data?.data);
    setCrmStats(crmStatsRes.data?.data);
    setCrmJobs(crmJobsRes.data?.data || []);
    setIposStats(iposStatsRes.data?.data);
    setIposJobs(iposJobsRes.data?.data || []);
  };

  useEffect(() => {
    load().catch(e => showMsg("❌ " + (e.response?.data?.error || e.message)));
  }, [crmStatus, iposStatus]);

  const runCrmWorker = async () => {
    try {
      const r = await apiClient.post("/admin/system/crm-recovery/run", {}, { headers:h });
      showMsg(`✅ CRM Worker: ${r.data?.stats?.success || 0}/${r.data?.stats?.total || 0}`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const runIposWorker = async () => {
    try {
      const r = await apiClient.post("/admin/system/ipos-recovery/run", {}, { headers:h });
      showMsg(`✅ iPOS Worker: ${r.data?.stats?.success || 0}/${r.data?.stats?.total || 0}`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const enqueueCrm = async () => {
    if (!phone.trim()) return showMsg("❌ Nhập số điện thoại");
    try {
      await apiClient.post("/admin/system/crm-recovery/enqueue", { phone }, { headers:h });
      showMsg("✅ Đã đưa CRM job vào queue");
      setPhone("");
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const retryCrmJob = async id => {
    try {
      await apiClient.post(`/admin/system/crm-recovery/retry/${id}`, {}, { headers:h });
      showMsg("✅ Đã retry CRM job");
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const retryIposJob = async id => {
    try {
      await apiClient.post(`/admin/system/ipos-recovery/retry/${id}`, {}, { headers:h });
      showMsg("✅ Đã retry iPOS job");
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const retryCrmFailed = async () => {
    try {
      const r = await apiClient.post("/admin/system/crm-recovery/retry-failed", {}, { headers:h });
      showMsg(`✅ Đã retry ${r.data?.count || 0} CRM job lỗi`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const retryIposFailed = async () => {
    try {
      const r = await apiClient.post("/admin/system/ipos-recovery/retry-failed", {}, { headers:h });
      showMsg(`✅ Đã retry ${r.data?.count || 0} iPOS job lỗi`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const cleanupCrm = async () => {
    try {
      const r = await apiClient.post("/admin/system/crm-recovery/cleanup", {}, { headers:h });
      showMsg(`✅ Đã dọn ${r.data?.deleted || 0} CRM job cũ`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>🛡 System Health</h2>
        <button onClick={load} style={{ background:"#D4531C", border:"none", borderRadius:8, color:"white", padding:"8px 14px", fontWeight:800, cursor:"pointer" }}>
          🔄 Làm mới
        </button>
      </div>

      {msg && (
        <div style={{
          background:msg.includes("✅")?"rgba(76,175,80,.12)":"rgba(244,67,54,.12)",
          border:`1px solid ${msg.includes("✅")?"#4CAF50":"#f44336"}`,
          borderRadius:10, padding:12, marginBottom:14,
          color:msg.includes("✅")?"#4CAF50":"#f44336", fontSize:13 }}>
          {msg}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 }}>
        <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 12px" }}>⚙️ Health Checks</p>
          {Object.entries(health?.checks || {}).map(([k,v]) => {
            const b = badge(v.status);
            return (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #2a2a38" }}>
                <span style={{ color:"#aaa", fontSize:13 }}>{k}</span>
                <span style={{ background:b.bg, color:b.color, borderRadius:6, padding:"4px 8px", fontSize:11, fontWeight:800 }}>{b.text}</span>
              </div>
            );
          })}
        </div>

        <RecoveryStats title="CRM Recovery" icon="🧩" stats={crmStats} />
        <RecoveryStats title="iPOS Recovery" icon="📦" stats={iposStats} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 12px" }}>🧩 CRM Recovery Actions</p>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Nhập SĐT cần sync"
              style={{ flex:1, background:"#0d0d18", border:"1px solid #333", borderRadius:8, padding:"9px 12px", color:"white" }}/>
            <button onClick={enqueueCrm} style={{ background:"#D4531C", border:"none", borderRadius:8, color:"white", padding:"9px 12px", fontWeight:800, cursor:"pointer" }}>Enqueue</button>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={runCrmWorker} style={{ background:"rgba(33,150,243,.15)", border:"1px solid #2196F3", color:"#2196F3", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>▶ Run CRM</button>
            <button onClick={retryCrmFailed} style={{ background:"rgba(255,152,0,.15)", border:"1px solid #FF9800", color:"#FF9800", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>↻ Retry CRM failed</button>
            <button onClick={cleanupCrm} style={{ background:"rgba(255,255,255,.06)", border:"1px solid #333", color:"#aaa", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>🧹 Cleanup CRM</button>
          </div>
        </div>

        <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 12px" }}>📦 iPOS Recovery Actions</p>
          <p style={{ color:"#777", fontSize:12, margin:"0 0 10px", lineHeight:1.5 }}>
            Tự động retry các đơn đã thanh toán nhưng đẩy sang iPOS thất bại.
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={runIposWorker} style={{ background:"rgba(33,150,243,.15)", border:"1px solid #2196F3", color:"#2196F3", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>▶ Run iPOS</button>
            <button onClick={retryIposFailed} style={{ background:"rgba(255,152,0,.15)", border:"1px solid #FF9800", color:"#FF9800", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>↻ Retry iPOS failed</button>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:18 }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"0 0 8px" }}>
            <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>📋 CRM Recovery Jobs</p>
            <select value={crmStatus} onChange={e=>setCrmStatus(e.target.value)}
              style={{ background:"#0d0d18", border:"1px solid #333", color:"white", borderRadius:8, padding:"7px 10px" }}>
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="done">Done</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <JobsTable title="CRM Jobs" jobs={crmJobs} type="crm" onRetry={retryCrmJob} />
        </div>

        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"0 0 8px" }}>
            <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>📦 iPOS Recovery Jobs</p>
            <select value={iposStatus} onChange={e=>setIposStatus(e.target.value)}
              style={{ background:"#0d0d18", border:"1px solid #333", color:"white", borderRadius:8, padding:"7px 10px" }}>
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="done">Done</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <JobsTable title="iPOS Jobs" jobs={iposJobs} type="ipos" onRetry={retryIposJob} />
        </div>
      </div>
    </div>
  );
}
