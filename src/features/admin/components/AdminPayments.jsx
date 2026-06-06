import { useState, useEffect, useCallback } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt  = n => new Intl.NumberFormat("vi-VN").format(n || 0);
const fmtM = n => {
  if (n >= 1000000) return (n/1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n/1000).toFixed(0) + "K";
  return fmt(n);
};
const fmtDate = str => {
  if (!str) return "";
  return new Date(str).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
};

const STATUS_CONFIG = {
  paid:     { label:"Đã thanh toán", color:"#4CAF50", bg:"rgba(76,175,80,0.15)"    },
  pending:  { label:"Chờ xử lý",     color:"#FF9800", bg:"rgba(255,152,0,0.15)"    },
  failed:   { label:"Thất bại",       color:"#f44336", bg:"rgba(244,67,54,0.15)"    },
  refunded: { label:"Đã hoàn tiền",  color:"#9C27B0", bg:"rgba(156,39,176,0.15)"   },
};

const METHOD_CONFIG = {
  momo:          { label:"MoMo",         icon:"💜" },
  bank_transfer: { label:"Chuyển khoản", icon:"🏦" },
  cash:          { label:"Tiền mặt",     icon:"💵" },
  points:        { label:"Đổi điểm",     icon:"⭐" },
};

export default function AdminPayments({ token }) {
  const [stats, setStats]         = useState(null);
  const [txns, setTxns]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected]   = useState(null);
  const [refundForm, setRefundForm] = useState({ reason:"", amount:"" });
  const [refunding, setRefunding] = useState(false);
  const [msg, setMsg]             = useState("");
  const [tab, setTab]             = useState("list");
  const [failed, setFailed]       = useState([]);
  const h = { Authorization: `Bearer ${token}` };

  const showMsg = (text, ms=4000) => { setMsg(text); setTimeout(()=>setMsg(""), ms); };

  const loadStats = async () => {
    try {
      const res = await apiClient.get("/admin/payment-dashboard/stats", { headers:h });
      setStats(res.data?.data);
    } catch(e) { console.error(e); }
  };

  const loadTxns = useCallback(async (p=1, status="", method="", q="") => {
    setLoading(true);
    try {
      let url = `/admin/payment-dashboard/list?page=${p}&limit=50`;
      if (status) url += `&status=${status}`;
      if (method) url += `&method=${method}`;
      if (q)      url += `&search=${encodeURIComponent(q)}`;
      const res = await apiClient.get(url, { headers:h });
      setTxns(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const loadFailed = async () => {
    try {
      const res = await apiClient.get("/admin/payment-dashboard/failed", { headers:h });
      setFailed(res.data?.data || []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadStats(); loadTxns(1); }, []);

  const applyFilter = () => { setPage(1); loadTxns(1, filterStatus, filterMethod, search); };

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); loadTxns(1, filterStatus, filterMethod, searchInput); };

  const openDetail = async (txn) => {
    try {
      const res = await apiClient.get(`/admin/payment-dashboard/detail/${txn.id}`, { headers:h });
      setSelected(res.data?.data);
      setRefundForm({ reason:"", amount: res.data?.data?.amount || "" });
    } catch(e) { setSelected(txn); }
  };

  const doRefund = async () => {
    if (!refundForm.reason.trim()) { showMsg("❌ Vui lòng nhập lý do hoàn tiền"); return; }
    setRefunding(true);
    try {
      const res = await apiClient.post(`/admin/payment-dashboard/refund/${selected.id}`,
        { reason: refundForm.reason, amount: refundForm.amount }, { headers:h });
      showMsg("✅ " + res.data?.message);
      setSelected(null);
      loadStats();
      loadTxns(page, filterStatus, filterMethod, search);
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
    finally { setRefunding(false); }
  };

  const inp = { background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
    padding:"8px 12px", color:"white", fontSize:13, outline:"none" };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>💳 Quản lý thanh toán</h2>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Tổng doanh thu",   value: fmtM(stats.total_revenue)+"đ",  color:"#D4531C", icon:"💰" },
            { label:"Doanh thu tháng",  value: fmtM(stats.revenue_month)+"đ",  color:"#2196F3", icon:"📅" },
            { label:"Chờ xử lý",        value: fmt(stats.total_pending),        color:"#FF9800", icon:"⏳" },
            { label:"Thất bại",          value: fmt(stats.total_failed),         color:"#f44336", icon:"❌" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"14px 16px",
              border:`1px solid ${s.color}22`, textAlign:"center" }}>
              <p style={{ fontSize:18, margin:"0 0 4px" }}>{s.icon}</p>
              <p style={{ color:s.color, fontSize:18, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:"#555", fontSize:10, margin:0, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[
          { key:"list",   label:"📋 Tất cả giao dịch" },
          { key:"failed", label:`❌ Thất bại (${failed.length || stats?.total_failed || 0})` },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); if(t.key==="failed") loadFailed(); }}
            style={{ background:tab===t.key?"#D4531C":"rgba(255,255,255,0.07)",
              border:"none", borderRadius:20, padding:"7px 16px", cursor:"pointer",
              color:tab===t.key?"white":"#aaa", fontSize:12, fontWeight:700 }}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div style={{ background:msg.includes("✅")?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)",
          border:`1px solid ${msg.includes("✅")?"#4CAF50":"#ff6b6b"}`,
          borderRadius:8, padding:"10px 14px", marginBottom:14,
          color:msg.includes("✅")?"#4CAF50":"#ff6b6b", fontSize:13 }}>{msg}</div>
      )}

      {tab === "list" && (<>
        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <form onSubmit={handleSearch} style={{ display:"flex", gap:8, flex:1 }}>
            <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
              placeholder="🔍 Mã GD, SĐT, tên khách..."
              style={{ ...inp, flex:1, minWidth:200 }}/>
            <button type="submit"
              style={{ background:"#D4531C", border:"none", borderRadius:8,
                padding:"8px 16px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Tìm
            </button>
          </form>
          <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);loadTxns(1,e.target.value,filterMethod,search);}}
            style={{ ...inp, minWidth:140 }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterMethod} onChange={e=>{setFilterMethod(e.target.value);setPage(1);loadTxns(1,filterStatus,e.target.value,search);}}
            style={{ ...inp, minWidth:140 }}>
            <option value="">Tất cả phương thức</option>
            {Object.entries(METHOD_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background:"#1a1a24", borderRadius:14, overflow:"hidden", border:"1px solid #2a2a38" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#0d0d18" }}>
                {["Mã GD","Khách hàng","Số tiền","Phương thức","Trạng thái","Thời gian",""].map(h => (
                  <th key={h} style={{ padding:"10px 12px", color:"#555", fontSize:10,
                    fontWeight:700, textAlign:"left", letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#666" }}>Đang tải...</td></tr>
              ) : txns.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#666" }}>Không có dữ liệu</td></tr>
              ) : txns.map((t, i) => {
                const status = STATUS_CONFIG[t.payment_status] || { label:t.payment_status, color:"#888", bg:"transparent" };
                const method = METHOD_CONFIG[t.payment_method] || { label:t.payment_method||"—", icon:"💳" };
                return (
                  <tr key={i} style={{ borderTop:"1px solid #12121a",
                    background: i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                    <td style={{ padding:"10px 12px", color:"#aaa", fontSize:11, fontFamily:"monospace" }}>
                      {t.transaction_code || t.id?.slice(0,8)}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <p style={{ color:"white", fontSize:12, fontWeight:600, margin:0 }}>{t.customer_name || t.user_id || "—"}</p>
                      <p style={{ color:"#555", fontSize:10, margin:0 }}>{t.user_id}</p>
                    </td>
                    <td style={{ padding:"10px 12px", color:"#FFD700", fontSize:13, fontWeight:800 }}>
                      {fmt(t.amount)}đ
                    </td>
                    <td style={{ padding:"10px 12px", color:"#aaa", fontSize:12 }}>
                      {method.icon} {method.label}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <span style={{ background:status.bg, color:status.color,
                        borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700 }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding:"10px 12px", color:"#555", fontSize:11 }}>
                      {fmtDate(t.created_at)}
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      <button onClick={() => openDetail(t)}
                        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid #333",
                          color:"#aaa", borderRadius:6, padding:"4px 10px",
                          fontSize:11, cursor:"pointer" }}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display:"flex", gap:8, justifyContent:"space-between",
          alignItems:"center", marginTop:12 }}>
          <p style={{ color:"#555", fontSize:12, margin:0 }}>
            Tổng: {fmt(total)} giao dịch
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{ const p=Math.max(1,page-1); setPage(p); loadTxns(p,filterStatus,filterMethod,search); }}
              disabled={page<=1}
              style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
                padding:"6px 16px", color:page<=1?"#444":"white",
                cursor:page<=1?"not-allowed":"pointer", fontSize:12 }}>← Trước</button>
            <span style={{ color:"#666", fontSize:12, padding:"6px 0" }}>Trang {page}</span>
            <button onClick={()=>{ const p=page+1; setPage(p); loadTxns(p,filterStatus,filterMethod,search); }}
              disabled={txns.length<50}
              style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
                padding:"6px 16px", color:txns.length<50?"#444":"white",
                cursor:txns.length<50?"not-allowed":"pointer", fontSize:12 }}>Sau →</button>
          </div>
        </div>
      </>)}

      {/* Tab thất bại */}
      {tab === "failed" && (
        <div>
          {failed.length === 0 ? (
            <p style={{ color:"#666", textAlign:"center", padding:40 }}>Không có giao dịch thất bại</p>
          ) : failed.map((t, i) => (
            <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"14px 18px",
              marginBottom:8, border:"1px solid rgba(244,67,54,0.2)",
              display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                  <span style={{ color:"#aaa", fontSize:11, fontFamily:"monospace" }}>
                    {t.transaction_code || t.id?.slice(0,8)}
                  </span>
                  <span style={{ color:"white", fontSize:12, fontWeight:700 }}>
                    {t.customer_name || t.user_id}
                  </span>
                </div>
                <p style={{ color:"#555", fontSize:11, margin:0 }}>
                  {fmtDate(t.created_at)} ·
                  {(METHOD_CONFIG[t.payment_method]||{icon:"💳",label:t.payment_method||"—"}).icon}
                  {(METHOD_CONFIG[t.payment_method]||{label:t.payment_method||"—"}).label}
                  {t.metadata?.error && ` · Lỗi: ${t.metadata.error}`}
                </p>
              </div>
              <p style={{ color:"#f44336", fontSize:14, fontWeight:900, margin:0, flexShrink:0 }}>
                {fmt(t.amount)}đ
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết & hoàn tiền */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setSelected(null)}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#1a1a24", borderRadius:18, padding:24,
              width:"100%", maxWidth:500, border:"1px solid #2a2a38", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>Chi tiết giao dịch</p>
              <button onClick={() => setSelected(null)}
                style={{ background:"none", border:"none", color:"#666", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            {/* Info */}
            <div style={{ background:"#12121a", borderRadius:12, padding:16, marginBottom:16 }}>
              {[
                ["Mã giao dịch",    selected.transaction_code || selected.id],
                ["Khách hàng",      selected.customer_name || selected.user_id || "—"],
                ["Số điện thoại",   selected.user_id || "—"],
                ["Số tiền",         fmt(selected.amount) + "đ"],
                ["Phương thức",     (METHOD_CONFIG[selected.payment_method]||{icon:"💳",label:selected.payment_method||"—"}).icon + " " + (METHOD_CONFIG[selected.payment_method]||{label:selected.payment_method||"—"}).label],
                ["Trạng thái",      (STATUS_CONFIG[selected.payment_status]||{label:selected.payment_status}).label],
                ["Thời gian tạo",   fmtDate(selected.created_at)],
                ["Cập nhật lúc",    fmtDate(selected.updated_at)],
              ].map(([label, value], i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  padding:"7px 0", borderBottom:"1px solid #2a2a38" }}>
                  <span style={{ color:"#666", fontSize:12 }}>{label}</span>
                  <span style={{ color:"white", fontSize:12, fontWeight:600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Hoàn tiền */}
            {selected.payment_status === "paid" && (
              <div style={{ border:"1px solid rgba(244,67,54,0.3)", borderRadius:12, padding:16 }}>
                <p style={{ color:"#f44336", fontSize:13, fontWeight:800, margin:"0 0 12px" }}>
                  🔄 Hoàn tiền thủ công
                </p>
                <div style={{ marginBottom:10 }}>
                  <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Số tiền hoàn (để trống = hoàn toàn bộ)</p>
                  <input type="number" value={refundForm.amount}
                    onChange={e=>setRefundForm(f=>({...f,amount:e.target.value}))}
                    placeholder={fmt(selected.amount)}
                    style={{ width:"100%", ...inp, boxSizing:"border-box" }}/>
                </div>
                <div style={{ marginBottom:14 }}>
                  <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Lý do hoàn tiền *</p>
                  <input value={refundForm.reason}
                    onChange={e=>setRefundForm(f=>({...f,reason:e.target.value}))}
                    placeholder="VD: Khách yêu cầu huỷ, lỗi hệ thống..."
                    style={{ width:"100%", ...inp, boxSizing:"border-box" }}/>
                </div>
                {msg && <p style={{ color:msg.includes("✅")?"#4CAF50":"#f44336",
                  fontSize:12, margin:"0 0 10px" }}>{msg}</p>}
                <button onClick={doRefund} disabled={refunding}
                  style={{ width:"100%", background:"rgba(244,67,54,0.2)",
                    border:"1px solid #f44336", color:"#f44336",
                    borderRadius:10, padding:"10px", fontWeight:800,
                    cursor:"pointer", fontSize:13 }}>
                  {refunding ? "Đang xử lý..." : "🔄 Xác nhận hoàn tiền"}
                </button>
              </div>
            )}

            {selected.payment_status === "refunded" && selected.metadata?.refund_reason && (
              <div style={{ background:"rgba(156,39,176,0.1)", border:"1px solid rgba(156,39,176,0.3)",
                borderRadius:10, padding:12 }}>
                <p style={{ color:"#9C27B0", fontSize:12, fontWeight:700, margin:"0 0 6px" }}>
                  ✅ Đã hoàn tiền
                </p>
                <p style={{ color:"#aaa", fontSize:12, margin:0 }}>
                  Lý do: {selected.metadata.refund_reason}
                </p>
                <p style={{ color:"#666", fontSize:11, margin:"4px 0 0" }}>
                  Bởi: {selected.metadata.refunded_by} lúc {fmtDate(selected.metadata.refunded_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
