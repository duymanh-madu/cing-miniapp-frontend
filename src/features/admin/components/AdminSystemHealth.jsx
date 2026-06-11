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

export default function AdminSystemHealth({ token }) {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const h = { Authorization:`Bearer ${token}` };

  const showMsg = t => { setMsg(t); setTimeout(() => setMsg(""), 3500); };

  const load = async () => {
    const [healthRes, statsRes, jobsRes] = await Promise.all([
      apiClient.get("/admin/system/health", { headers:h }),
      apiClient.get("/admin/system/crm-recovery/stats", { headers:h }),
      apiClient.get(`/admin/system/crm-recovery/jobs?limit=50${status ? `&status=${status}` : ""}`, { headers:h }),
    ]);
    setHealth(healthRes.data?.data);
    setStats(statsRes.data?.data);
    setJobs(jobsRes.data?.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, [status]);

  const runWorker = async () => {
    try {
      const r = await apiClient.post("/admin/system/crm-recovery/run", {}, { headers:h });
      showMsg(`✅ Worker chạy xong: ${r.data?.stats?.success || 0}/${r.data?.stats?.total || 0}`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const enqueue = async () => {
    if (!phone.trim()) return showMsg("❌ Nhập số điện thoại");
    try {
      await apiClient.post("/admin/system/crm-recovery/enqueue", { phone }, { headers:h });
      showMsg("✅ Đã đưa vào queue");
      setPhone("");
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const retryJob = async id => {
    try {
      await apiClient.post(`/admin/system/crm-recovery/retry/${id}`, {}, { headers:h });
      showMsg("✅ Đã retry job");
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const retryFailed = async () => {
    try {
      const r = await apiClient.post("/admin/system/crm-recovery/retry-failed", {}, { headers:h });
      showMsg(`✅ Đã retry ${r.data?.count || 0} job lỗi`);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.error || e.message)); }
  };

  const cleanup = async () => {
    try {
      const r = await apiClient.post("/admin/system/crm-recovery/cleanup", {}, { headers:h });
      showMsg(`✅ Đã dọn ${r.data?.deleted || 0} job cũ`);
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
        <div style={{ background:msg.includes("✅")?"rgba(76,175,80,.12)":"rgba(244,67,54,.12)", border:`1px solid ${msg.includes("✅")?"#4CAF50":"#f44336"}`, borderRadius:10, padding:12, marginBottom:14, color:msg.includes("✅")?"#4CAF50":"#f44336", fontSize:13 }}>
          {msg}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Pending", value:stats?.pending, color:"#FF9800" },
          { label:"Processing", value:stats?.processing, color:"#2196F3" },
          { label:"Failed", value:stats?.failed, color:"#f44336" },
          { label:"Done hôm nay", value:stats?.done_today, color:"#4CAF50" },
        ].map((x,i)=>(
          <div key={i} style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
            <p style={{ color:"#666", fontSize:11, fontWeight:800, margin:"0 0 6px" }}>{x.label}</p>
            <p style={{ color:x.color, fontSize:24, fontWeight:900, margin:0 }}>{fmt(x.value)}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
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

        <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, padding:16 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:"0 0 12px" }}>🧩 CRM Recovery Actions</p>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Nhập SĐT cần sync"
              style={{ flex:1, background:"#0d0d18", border:"1px solid #333", borderRadius:8, padding:"9px 12px", color:"white" }}/>
            <button onClick={enqueue} style={{ background:"#D4531C", border:"none", borderRadius:8, color:"white", padding:"9px 12px", fontWeight:800, cursor:"pointer" }}>Enqueue</button>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={runWorker} style={{ background:"rgba(33,150,243,.15)", border:"1px solid #2196F3", color:"#2196F3", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>▶ Run worker</button>
            <button onClick={retryFailed} style={{ background:"rgba(255,152,0,.15)", border:"1px solid #FF9800", color:"#FF9800", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>↻ Retry failed</button>
            <button onClick={cleanup} style={{ background:"rgba(255,255,255,.06)", border:"1px solid #333", color:"#aaa", borderRadius:8, padding:"8px 12px", fontWeight:800, cursor:"pointer" }}>🧹 Cleanup</button>
          </div>
        </div>
      </div>

      <div style={{ background:"#1a1a24", border:"1px solid #2a2a38", borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:14, borderBottom:"1px solid #2a2a38" }}>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>📋 CRM Recovery Jobs</p>
          <select value={status} onChange={e=>setStatus(e.target.value)}
            style={{ background:"#0d0d18", border:"1px solid #333", color:"white", borderRadius:8, padding:"7px 10px" }}>
            <option value="">Tất cả</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="done">Done</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#0d0d18" }}>
              {["ID","User","Source","Status","Retry","Created","Processed",""].map(h=>(
                <th key={h} style={{ padding:"10px", color:"#666", fontSize:10, textAlign:"left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map(j=>(
              <tr key={j.id} style={{ borderTop:"1px solid #12121a" }}>
                <td style={{ padding:"10px", color:"#888", fontSize:12 }}>{j.id}</td>
                <td style={{ padding:"10px", color:"white", fontSize:12 }}>{j.phone || j.user_id}</td>
                <td style={{ padding:"10px", color:"#aaa", fontSize:12 }}>{j.source}</td>
                <td style={{ padding:"10px", color:j.status==="done"?"#4CAF50":j.status==="failed"?"#f44336":"#FF9800", fontSize:12, fontWeight:800 }}>{j.status}</td>
                <td style={{ padding:"10px", color:"#aaa", fontSize:12 }}>{j.retry_count}</td>
                <td style={{ padding:"10px", color:"#666", fontSize:11 }}>{fmtDate(j.created_at)}</td>
                <td style={{ padding:"10px", color:"#666", fontSize:11 }}>{fmtDate(j.processed_at)}</td>
                <td style={{ padding:"10px" }}>
                  {j.status==="failed" && (
                    <button onClick={()=>retryJob(j.id)} style={{ background:"rgba(255,152,0,.15)", border:"1px solid #FF9800", color:"#FF9800", borderRadius:6, padding:"5px 8px", cursor:"pointer", fontSize:11, fontWeight:800 }}>
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {jobs.length===0 && (
              <tr><td colSpan={8} style={{ padding:30, textAlign:"center", color:"#666" }}>Không có job nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
