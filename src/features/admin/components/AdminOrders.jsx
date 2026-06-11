import { useState, useEffect, useCallback } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = n => new Intl.NumberFormat("vi-VN").format(n||0);
const fmtDate = str => {
  if (!str) return "";
  return new Date(str).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
};

const STATUS_CONFIG = {
  pending:    { label:"Chờ xác nhận", color:"#FF9800", bg:"rgba(255,152,0,0.15)",    next:["confirmed","cancelled"] },
  confirmed:  { label:"Đã xác nhận",  color:"#2196F3", bg:"rgba(33,150,243,0.15)",   next:["processing","cancelled"] },
  processing: { label:"Đang chế biến",color:"#9C27B0", bg:"rgba(156,39,176,0.15)",   next:["ready","cancelled"] },
  ready:      { label:"Sẵn sàng",     color:"#00BCD4", bg:"rgba(0,188,212,0.15)",    next:["delivering","completed"] },
  delivering: { label:"Đang giao",    color:"#FF5722", bg:"rgba(255,87,34,0.15)",    next:["completed"] },
  completed:  { label:"Hoàn thành",   color:"#4CAF50", bg:"rgba(76,175,80,0.15)",    next:[] },
  cancelled:  { label:"Đã huỷ",       color:"#f44336", bg:"rgba(244,67,54,0.15)",    next:[] },
};

const PAYMENT_METHODS = {
  momo:          { label:"MoMo",         icon:"💜" },
  bank_transfer: { label:"Chuyển khoản", icon:"🏦" },
  cash:          { label:"Tiền mặt",     icon:"💵" },
  points:        { label:"Đổi điểm",     icon:"⭐" },
};

const IPOS_STATUS = {
  success: { label:"Đã sync iPOS", color:"#4CAF50", bg:"rgba(76,175,80,.15)" },
  failed:  { label:"Lỗi iPOS",     color:"#f44336", bg:"rgba(244,67,54,.15)" },
  pending: { label:"Chờ sync",     color:"#FF9800", bg:"rgba(255,152,0,.15)" },
};

const inp = { background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
  padding:"8px 12px", color:"white", fontSize:13, outline:"none" };

export default function AdminOrders({ token }) {
  const [stats, setStats]       = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterMethod, setFilterMethod]   = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]   = useState("");
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelForm, setCancelForm] = useState({ reason:"" });
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [retryingIpos, setRetryingIpos] = useState(false);
  const [msg, setMsg]           = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  const showMsg = (text, ms=4000) => { setMsg(text); setTimeout(()=>setMsg(""),ms); };

  const loadStats = async () => {
    try {
      const res = await apiClient.get("/admin/orders/stats", { headers:h });
      setStats(res.data?.data);
    } catch(e) { console.error(e); }
  };

  const loadOrders = useCallback(async (p=1, status="", method="", q="", from="", to="") => {
    setLoading(true);
    try {
      let url = `/admin/orders/list?page=${p}&limit=50`;
      if (status) url += `&status=${status}`;
      if (method) url += `&payment_method=${method}`;
      if (q)      url += `&search=${encodeURIComponent(q)}`;
      if (from)   url += `&date_from=${from}`;
      if (to)     url += `&date_to=${to}`;
      const res = await apiClient.get(url, { headers:h });
      setOrders(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadStats();
    loadOrders(1);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      loadStats();
      loadOrders(page, filterStatus, filterMethod, search, filterDateFrom, filterDateTo);
    }, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, page, filterStatus, filterMethod, search, filterDateFrom, filterDateTo]);

  const applyFilters = () => {
    setPage(1);
    loadOrders(1, filterStatus, filterMethod, search, filterDateFrom, filterDateTo);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadOrders(1, filterStatus, filterMethod, searchInput, filterDateFrom, filterDateTo);
  };

  const openDetail = async (order) => {
    try {
      const res = await apiClient.get(`/admin/orders/detail/${order.id}`, { headers:h });
      setSelected(res.data?.data || order);
    } catch { setSelected(order); }
    setStatusNote("");
    setCancelForm({ reason:"" });
  };

  const updateStatus = async (newStatus) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await apiClient.put(`/admin/orders/status/${selected.id}`,
        { status: newStatus, note: statusNote }, { headers:h });
      showMsg("✅ " + res.data?.message);
      setSelected(prev => ({ ...prev, status: newStatus }));
      loadStats();
      loadOrders(page, filterStatus, filterMethod, search, filterDateFrom, filterDateTo);
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
    finally { setUpdating(false); }
  };

  const cancelOrder = async () => {
    if (!cancelForm.reason.trim()) { showMsg("❌ Vui lòng nhập lý do huỷ"); return; }
    setUpdating(true);
    try {
      const res = await apiClient.put(`/admin/orders/cancel/${selected.id}`,
        { reason: cancelForm.reason }, { headers:h });
      showMsg("✅ " + res.data?.message);
      setSelected(prev => ({ ...prev, status:"cancelled" }));
      loadStats();
      loadOrders(page, filterStatus, filterMethod, search, filterDateFrom, filterDateTo);
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
    finally { setUpdating(false); }
  };

  const retryIpos = async () => {
    if (!selected) return;
    setRetryingIpos(true);

    try {
      const res = await apiClient.put(
        `/admin/orders/retry-ipos/${selected.id}`,
        {},
        { headers:h }
      );

      showMsg(res.data?.success ? "✅ Retry iPOS thành công" : "❌ Retry iPOS thất bại");

      const detail = await apiClient.get(`/admin/orders/detail/${selected.id}`, { headers:h });
      setSelected(detail.data?.data);

      loadOrders(page, filterStatus, filterMethod, search, filterDateFrom, filterDateTo);
    } catch(e) {
      showMsg("❌ " + (e.response?.data?.message || e.response?.data?.error || e.message));
    } finally {
      setRetryingIpos(false);
    }
  };

  const statusCfg = (s) => STATUS_CONFIG[s] || { label:s, color:"#888", bg:"transparent", next:[] };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>📦 Quản lý đơn hàng</h2>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setAutoRefresh(v=>!v)} style={{
            background: autoRefresh?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.07)",
            border:`1px solid ${autoRefresh?"#4CAF50":"#333"}`,
            color:autoRefresh?"#4CAF50":"#888",
            borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            {autoRefresh?"🟢 Live":"⚫ Live"}
          </button>
          <button onClick={() => { loadStats(); loadOrders(page,filterStatus,filterMethod,search,filterDateFrom,filterDateTo); }}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Tổng đơn",      value:fmt(stats.total),      color:"#2196F3", icon:"📦" },
            { label:"Hôm nay",       value:fmt(stats.today),      color:"#D4531C", icon:"🌅" },
            { label:"Chờ xác nhận",  value:fmt(stats.pending),    color:"#FF9800", icon:"⏳" },
            { label:"Đang chế biến", value:fmt(stats.processing), color:"#9C27B0", icon:"👨‍🍳" },
          ].map((s,i) => (
            <div key={i} onClick={() => { setFilterStatus(i===2?"pending":i===3?"processing":""); applyFilters(); }}
              style={{ background:"#1a1a24", borderRadius:12, padding:"12px",
                border:`1px solid ${s.color}22`, textAlign:"center", cursor:"pointer" }}>
              <p style={{ fontSize:16, margin:"0 0 4px" }}>{s.icon}</p>
              <p style={{ color:s.color, fontSize:18, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:"#555", fontSize:9, margin:0, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status filter pills */}
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
        <button onClick={() => { setFilterStatus(""); setPage(1); loadOrders(1,"",filterMethod,search,filterDateFrom,filterDateTo); }}
          style={{ background:filterStatus===""?"#D4531C":"rgba(255,255,255,0.07)",
            border:"none", borderRadius:20, padding:"5px 12px", cursor:"pointer",
            color:filterStatus===""?"white":"#aaa", fontSize:11, fontWeight:700 }}>
          Tất cả ({fmt(total)})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key,cfg]) => (
          <button key={key} onClick={() => { setFilterStatus(key); setPage(1); loadOrders(1,key,filterMethod,search,filterDateFrom,filterDateTo); }}
            style={{ background:filterStatus===key?cfg.color:"rgba(255,255,255,0.05)",
              border:`1px solid ${filterStatus===key?cfg.color:"#2a2a38"}`,
              borderRadius:20, padding:"5px 12px", cursor:"pointer",
              color:filterStatus===key?"white":cfg.color, fontSize:11, fontWeight:700 }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        <form onSubmit={handleSearch} style={{ display:"flex", gap:8, flex:1 }}>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
            placeholder="🔍 Mã đơn, SĐT, tên khách..."
            style={{ ...inp, flex:1, minWidth:180 }}/>
          <button type="submit" style={{ background:"#D4531C", border:"none", borderRadius:8,
            padding:"8px 14px", color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>Tìm</button>
        </form>
        <select value={filterMethod} onChange={e=>{setFilterMethod(e.target.value);setPage(1);loadOrders(1,filterStatus,e.target.value,search,filterDateFrom,filterDateTo);}}
          style={{ ...inp, minWidth:130 }}>
          <option value="">Tất cả TT</option>
          {Object.entries(PAYMENT_METHODS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <input type="date" value={filterDateFrom} onChange={e=>{setFilterDateFrom(e.target.value);setPage(1);loadOrders(1,filterStatus,filterMethod,search,e.target.value,filterDateTo);}}
          style={{ ...inp, width:130 }} title="Từ ngày"/>
        <input type="date" value={filterDateTo} onChange={e=>{setFilterDateTo(e.target.value);setPage(1);loadOrders(1,filterStatus,filterMethod,search,filterDateFrom,e.target.value);}}
          style={{ ...inp, width:130 }} title="Đến ngày"/>
      </div>

      {msg && (
        <div style={{ background:msg.includes("✅")?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)",
          border:`1px solid ${msg.includes("✅")?"#4CAF50":"#ff6b6b"}`,
          borderRadius:8, padding:"10px 14px", marginBottom:12,
          color:msg.includes("✅")?"#4CAF50":"#ff6b6b", fontSize:13 }}>{msg}</div>
      )}

      {/* Orders table */}
      <div style={{ background:"#1a1a24", borderRadius:14, overflow:"hidden", border:"1px solid #2a2a38" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#0d0d18" }}>
              {["Mã đơn","Khách hàng","Tổng tiền","Thanh toán","iPOS","Trạng thái","Thời gian",""].map(h=>(
                <th key={h} style={{ padding:"10px 12px", color:"#555", fontSize:10, fontWeight:700, textAlign:"left", letterSpacing:1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#666" }}>Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#666" }}>Không có đơn hàng nào</td></tr>
            ) : orders.map((o,i) => {
              const sc = statusCfg(o.status);
              const pm = PAYMENT_METHODS[o.payment_method] || { label:o.payment_method||"—", icon:"💳" };
              return (
                <tr key={i} style={{ borderTop:"1px solid #12121a",
                  background:o.status==="pending"?"rgba(255,152,0,0.03)":"transparent" }}>
                  <td style={{ padding:"10px 12px", color:"#aaa", fontSize:11, fontFamily:"monospace" }}>
                    {o.order_code || o.id?.slice(0,8)}
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <p style={{ color:"white", fontSize:12, fontWeight:600, margin:0 }}>{o.customer_name||"—"}</p>
                    <p style={{ color:"#555", fontSize:10, margin:0 }}>{o.customer_phone}</p>
                  </td>
                  <td style={{ padding:"10px 12px", color:"#FFD700", fontSize:13, fontWeight:800 }}>
                    {fmt(o.total_amount)}đ
                  </td>
                  <td style={{ padding:"10px 12px", color:"#aaa", fontSize:12 }}>
                    {pm.icon} {pm.label}
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    {(() => {
                      const cfg = IPOS_STATUS[o.pos_sync_status || "pending"] || IPOS_STATUS.pending;
                      return (
                        <span style={{ background:cfg.bg, color:cfg.color,
                          borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700 }}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ background:sc.bg, color:sc.color,
                      borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", color:"#555", fontSize:11 }}>
                    {fmtDate(o.created_at)}
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <button onClick={() => openDetail(o)}
                      style={{ background:"rgba(255,255,255,0.06)", border:"1px solid #333",
                        color:"#aaa", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>
                      Xử lý
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
        <p style={{ color:"#555", fontSize:12, margin:0 }}>Tổng: {fmt(total)} đơn</p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>{const p=Math.max(1,page-1);setPage(p);loadOrders(p,filterStatus,filterMethod,search,filterDateFrom,filterDateTo);}}
            disabled={page<=1}
            style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
              padding:"6px 16px", color:page<=1?"#444":"white",
              cursor:page<=1?"not-allowed":"pointer", fontSize:12 }}>← Trước</button>
          <span style={{ color:"#666", fontSize:12, padding:"6px 0" }}>Trang {page}</span>
          <button onClick={()=>{const p=page+1;setPage(p);loadOrders(p,filterStatus,filterMethod,search,filterDateFrom,filterDateTo);}}
            disabled={orders.length<50}
            style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
              padding:"6px 16px", color:orders.length<50?"#444":"white",
              cursor:orders.length<50?"not-allowed":"pointer", fontSize:12 }}>Sau →</button>
        </div>
      </div>

      {/* Modal chi tiết & xử lý đơn */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setSelected(null)}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#1a1a24", borderRadius:18, padding:24,
              width:"100%", maxWidth:560, border:"1px solid #2a2a38",
              maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>
                Đơn {selected.order_code || selected.id?.slice(0,8)}
              </p>
              <button onClick={() => setSelected(null)}
                style={{ background:"none", border:"none", color:"#666", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            {/* Thông tin cơ bản */}
            <div style={{ background:"#12121a", borderRadius:12, padding:14, marginBottom:14 }}>
              {[
                ["Khách hàng",    selected.customer_name||"—"],
                ["Số điện thoại", selected.customer_phone||"—"],
                ["Tổng tiền",     fmt(selected.total_amount)+"đ"],
                ["Thanh toán",    (PAYMENT_METHODS[selected.payment_method]||{icon:"💳",label:selected.payment_method||"—"}).icon+" "+(PAYMENT_METHODS[selected.payment_method]||{label:selected.payment_method||"—"}).label],
                ["iPOS",          (IPOS_STATUS[selected.pos_sync_status || "pending"] || IPOS_STATUS.pending).label],
                ["iPOS Sync",     selected.pos_synced_at ? fmtDate(selected.pos_synced_at) : "Chưa sync"],
                ["Địa chỉ",       selected.shipping_address||"Tại quán"],
                ["Thời gian",     fmtDate(selected.created_at)],
              ].map(([label,value],i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  padding:"6px 0", borderBottom:"1px solid #2a2a38" }}>
                  <span style={{ color:"#666", fontSize:12 }}>{label}</span>
                  <span style={{ color:"white", fontSize:12, fontWeight:600, maxWidth:300, textAlign:"right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Sản phẩm */}
            {Array.isArray(selected.items) && selected.items.length > 0 && (
              <div style={{ background:"#12121a", borderRadius:12, padding:14, marginBottom:14 }}>
                <p style={{ color:"#888", fontSize:11, fontWeight:700, margin:"0 0 10px", letterSpacing:1 }}>SẢN PHẨM</p>
                {selected.items.map((item,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"6px 0", borderBottom:"1px solid #2a2a38" }}>
                    <p style={{ color:"white", fontSize:12, margin:0, flex:1 }}>
                      {item.name||item.product_name} × {item.quantity||item.qty||1}
                    </p>
                    <p style={{ color:"#FFD700", fontSize:12, fontWeight:700, margin:0, flexShrink:0 }}>
                      {fmt((item.price||0)*(item.quantity||item.qty||1))}đ
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Cập nhật trạng thái */}
            {selected.status !== "completed" && selected.status !== "cancelled" && (
              <div style={{ border:"1px solid #2a2a38", borderRadius:12, padding:14, marginBottom:14 }}>
                <p style={{ color:"white", fontSize:13, fontWeight:800, margin:"0 0 10px" }}>
                  🔄 Cập nhật trạng thái
                </p>
                <div style={{ marginBottom:10 }}>
                  <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Ghi chú (tuỳ chọn)</p>
                  <input value={statusNote} onChange={e=>setStatusNote(e.target.value)}
                    placeholder="Ghi chú cho khách hàng..."
                    style={{ width:"100%", ...inp, boxSizing:"border-box" }}/>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {(statusCfg(selected.status).next||[]).map(nextStatus => {
                    const nc = statusCfg(nextStatus);
                    return (
                      <button key={nextStatus} onClick={() => updateStatus(nextStatus)} disabled={updating}
                        style={{ background:nc.bg, border:`1px solid ${nc.color}`,
                          color:nc.color, borderRadius:8, padding:"8px 14px",
                          fontSize:12, fontWeight:700, cursor:"pointer" }}>
                        → {nc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Huỷ đơn */}
            {selected.status !== "completed" && selected.status !== "cancelled" && (
              <div style={{ border:"1px solid rgba(244,67,54,0.3)", borderRadius:12, padding:14 }}>
                <p style={{ color:"#f44336", fontSize:13, fontWeight:800, margin:"0 0 10px" }}>🚫 Huỷ đơn hàng</p>
                <div style={{ marginBottom:10 }}>
                  <input value={cancelForm.reason} onChange={e=>setCancelForm({reason:e.target.value})}
                    placeholder="Lý do huỷ *"
                    style={{ width:"100%", ...inp, boxSizing:"border-box", borderColor:"rgba(244,67,54,0.4)" }}/>
                </div>
                <button onClick={cancelOrder} disabled={updating}
                  style={{ width:"100%", background:"rgba(244,67,54,0.15)",
                    border:"1px solid #f44336", color:"#f44336",
                    borderRadius:8, padding:"9px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
                  {updating ? "Đang xử lý..." : "🚫 Xác nhận huỷ đơn"}
                </button>
              </div>
            )}

            {/* Trạng thái cuối */}
            {(selected.status === "completed" || selected.status === "cancelled") && (
              <div style={{ background: selected.status==="completed"?"rgba(76,175,80,0.1)":"rgba(244,67,54,0.1)",
                border:`1px solid ${selected.status==="completed"?"#4CAF50":"#f44336"}`,
                borderRadius:10, padding:12, textAlign:"center" }}>
                <p style={{ color:selected.status==="completed"?"#4CAF50":"#f44336",
                  fontSize:14, fontWeight:800, margin:0 }}>
                  {selected.status==="completed" ? "✅ Đơn hàng đã hoàn thành" : "🚫 Đơn hàng đã bị huỷ"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
