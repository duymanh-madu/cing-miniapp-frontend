import { useState, useEffect, useCallback } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = n => new Intl.NumberFormat("vi-VN").format(n||0);
const fmtDate = str => {
  if (!str) return "";
  return new Date(str).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
};

const STATUS_CONFIG = {
  assigned:   { label:"Đã gán shipper", color:"#2196F3", bg:"rgba(33,150,243,0.15)",  icon:"👤" },
  picked_up:  { label:"Đã lấy hàng",   color:"#FF9800", bg:"rgba(255,152,0,0.15)",   icon:"📦" },
  delivering: { label:"Đang giao",      color:"#9C27B0", bg:"rgba(156,39,176,0.15)",  icon:"🛵" },
  arrived:    { label:"Đã đến nơi",     color:"#00BCD4", bg:"rgba(0,188,212,0.15)",   icon:"📍" },
  completed:  { label:"Hoàn thành",     color:"#4CAF50", bg:"rgba(76,175,80,0.15)",   icon:"✅" },
  cancelled:  { label:"Đã huỷ",         color:"#f44336", bg:"rgba(244,67,54,0.15)",   icon:"🚫" },
};

const NEXT_STATUS = {
  assigned:   ["picked_up","cancelled"],
  picked_up:  ["delivering","cancelled"],
  delivering: ["arrived","completed","cancelled"],
  arrived:    ["completed"],
  completed:  [],
  cancelled:  [],
};

const inp = { background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
  padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" };

export default function AdminDelivery({ token }) {
  const [stats, setStats]           = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState("active");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected]     = useState(null);
  const [assignForm, setAssignForm] = useState({ order_id:"", shipper_name:"", shipper_phone:"", note:"" });
  const [lastShipperUrl, setLastShipperUrl] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [msg, setMsg]               = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const h = { Authorization: `Bearer ${token}` };

  const showMsg = (text, ms=4000) => { setMsg(text); setTimeout(()=>setMsg(""),ms); };

  const loadStats = async () => {
    try {
      const res = await apiClient.get("/admin/delivery/stats", { headers:h });
      setStats(res.data?.data);
    } catch(e) {}
  };

  const loadDeliveries = useCallback(async (status="", q="") => {
    setLoading(true);
    try {
      let url = "/admin/delivery/list?limit=100";
      if (status) url += `&status=${status}`;
      if (q)      url += `&search=${encodeURIComponent(q)}`;
      const res = await apiClient.get(url, { headers:h });
      setDeliveries(res.data?.data || []);
    } catch(e) {}
    finally { setLoading(false); }
  }, []);

  const loadReadyOrders = async () => {
    try {
      const res = await apiClient.get("/admin/delivery/orders-ready", { headers:h });
      setReadyOrders(res.data?.data || []);
    } catch(e) {}
  };

  useEffect(() => {
    loadStats();
    loadDeliveries();
    loadReadyOrders();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      loadStats();
      loadDeliveries(filterStatus, search);
      loadReadyOrders();
    }, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, filterStatus, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    loadDeliveries(filterStatus, searchInput);
  };

  const updateStatus = async (trackingId, newStatus) => {
    setUpdating(true);
    try {
      const res = await apiClient.put(`/admin/delivery/status/${trackingId}`,
        { status: newStatus }, { headers:h });
      showMsg("✅ " + res.data?.message);
      setSelected(prev => prev ? { ...prev, status: newStatus } : null);
      loadStats();
      loadDeliveries(filterStatus, search);
      loadReadyOrders();
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
    finally { setUpdating(false); }
  };

  const assignShipper = async () => {
    if (!assignForm.order_id || !assignForm.shipper_name) {
      showMsg("❌ Vui lòng chọn đơn hàng và nhập tên shipper"); return;
    }
    setUpdating(true);
    try {
      const res = await apiClient.post("/admin/delivery/assign", assignForm, { headers:h });
      const url = res.data?.shipper_url || "";
      setLastShipperUrl(url);

      if (url && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url).catch(() => {});
      }

      showMsg("✅ " + res.data?.message + (url ? " — đã copy link shipper" : ""));
      setShowAssign(false);
      setAssignForm({ order_id:"", shipper_name:"", shipper_phone:"", note:"" });
      loadStats();
      loadDeliveries(filterStatus, search);
      loadReadyOrders();
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
    finally { setUpdating(false); }
  };

  const activeDeliveries = deliveries.filter(d => !["completed","cancelled"].includes(d.status));
  const displayList = tab === "active" ? activeDeliveries : deliveries;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>🚀 Quản lý giao hàng</h2>
        {lastShipperUrl && (
  <button
    onClick={() => {
      navigator.clipboard.writeText(lastShipperUrl);
      showMsg("✅ Đã copy link shipper");
    }}
    style={{
      background:"rgba(33,150,243,0.15)",
      border:"1px solid #2196F3",
      borderRadius:10,
      color:"#2196F3",
      padding:"10px 14px",
      fontSize:12,
      fontWeight:800,
      cursor:"pointer"
    }}
  >
    📋 Copy link shipper
  </button>
)}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setAutoRefresh(v=>!v)} style={{
            background:autoRefresh?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.07)",
            border:`1px solid ${autoRefresh?"#4CAF50":"#333"}`,
            color:autoRefresh?"#4CAF50":"#888",
            borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            {autoRefresh?"🟢 Live":"⚫ Live"}
          </button>
          <button onClick={() => setShowAssign(true)}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            + Gán shipper
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Tổng",          value:fmt(stats.total),     color:"#2196F3", icon:"📦" },
            { label:"Hôm nay",       value:fmt(stats.today),     color:"#D4531C", icon:"🌅" },
            { label:"Đang giao",     value:fmt(stats.active),    color:"#FF9800", icon:"🛵" },
            { label:"Hoàn thành",    value:fmt(stats.completed), color:"#4CAF50", icon:"✅" },
            { label:"Đã huỷ",        value:fmt(stats.cancelled), color:"#f44336", icon:"🚫" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"12px",
              border:`1px solid ${s.color}22`, textAlign:"center" }}>
              <p style={{ fontSize:16, margin:"0 0 4px" }}>{s.icon}</p>
              <p style={{ color:s.color, fontSize:18, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:"#555", fontSize:9, margin:0, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Đơn chờ gán shipper */}
      {readyOrders.length > 0 && (
        <div style={{ background:"rgba(255,152,0,0.08)", border:"1px solid rgba(255,152,0,0.3)",
          borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ color:"#FF9800", fontSize:12, fontWeight:800, margin:"0 0 10px" }}>
            ⚠ {readyOrders.length} đơn chờ gán shipper
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {readyOrders.slice(0,5).map((o,i) => (
              <button key={i} onClick={() => { setAssignForm(f=>({...f, order_id:o.id})); setShowAssign(true); }}
                style={{ background:"rgba(255,152,0,0.15)", border:"1px solid #FF9800",
                  color:"#FF9800", borderRadius:8, padding:"5px 10px", fontSize:11,
                  fontWeight:700, cursor:"pointer" }}>
                📦 {o.order_code||o.id?.slice(0,8)} — {o.customer_name}
              </button>
            ))}
            {readyOrders.length > 5 && (
              <span style={{ color:"#FF9800", fontSize:11, padding:"5px 0" }}>
                +{readyOrders.length-5} đơn nữa
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs + filters */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
        <button onClick={()=>setTab("active")} style={{
          background:tab==="active"?"#D4531C":"rgba(255,255,255,0.07)",
          border:"none", borderRadius:20, padding:"6px 14px",
          color:tab==="active"?"white":"#aaa", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          🛵 Đang giao ({activeDeliveries.length})
        </button>
        <button onClick={()=>setTab("all")} style={{
          background:tab==="all"?"#D4531C":"rgba(255,255,255,0.07)",
          border:"none", borderRadius:20, padding:"6px 14px",
          color:tab==="all"?"white":"#aaa", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          📋 Tất cả
        </button>
        {tab==="all" && (
          <>
            <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);loadDeliveries(e.target.value,search);}}
              style={{ ...inp, minWidth:140 }}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k,v])=>(
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <form onSubmit={handleSearch} style={{ display:"flex", gap:6 }}>
              <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
                placeholder="Tên/SĐT shipper..."
                style={{ ...inp, width:160 }}/>
              <button type="submit" style={{ background:"#D4531C", border:"none", borderRadius:8,
                padding:"6px 12px", color:"white", fontSize:12, cursor:"pointer" }}>Tìm</button>
            </form>
          </>
        )}
      </div>

      {msg && (
        <div style={{ background:msg.includes("✅")?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)",
          border:`1px solid ${msg.includes("✅")?"#4CAF50":"#ff6b6b"}`,
          borderRadius:8, padding:"10px 14px", marginBottom:12,
          color:msg.includes("✅")?"#4CAF50":"#ff6b6b", fontSize:13 }}>{msg}</div>
      )}

      {/* Delivery list */}
      {loading ? (
        <p style={{ color:"#666", textAlign:"center", padding:40 }}>Đang tải...</p>
      ) : displayList.length === 0 ? (
        <p style={{ color:"#666", textAlign:"center", padding:40 }}>Không có dữ liệu</p>
      ) : displayList.map((d,i) => {
        const sc = STATUS_CONFIG[d.status] || { label:d.status, color:"#888", bg:"transparent", icon:"📦" };
        const order = d.orders;
        return (
          <div key={i} style={{ background:"#1a1a24", borderRadius:14, padding:"16px 18px",
            marginBottom:10, border:`1px solid ${sc.color}22`,
            cursor:"pointer" }} onClick={() => setSelected(d)}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                background:sc.bg, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:22 }}>{sc.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <span style={{ background:sc.bg, color:sc.color,
                    borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
                    {sc.label}
                  </span>
                  <span style={{ color:"#aaa", fontSize:11 }}>
                    {order?.order_code || d.order_id?.slice(0,8)}
                  </span>
                </div>
                <div style={{ display:"flex", gap:16 }}>
                  <div>
                    <p style={{ color:"#666", fontSize:10, margin:"0 0 1px" }}>Shipper</p>
                    <p style={{ color:"white", fontSize:12, fontWeight:700, margin:0 }}>
                      {d.shipper_name} {d.shipper_phone && <span style={{ color:"#888", fontWeight:400 }}>· {d.shipper_phone}</span>}
                    </p>
                  </div>
                  {order && (
                    <div>
                      <p style={{ color:"#666", fontSize:10, margin:"0 0 1px" }}>Khách hàng</p>
                      <p style={{ color:"white", fontSize:12, fontWeight:700, margin:0 }}>
                        {order.customer_name} · {fmt(order.total_amount)}đ
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ color:"#555", fontSize:10, margin:0 }}>{fmtDate(d.updated_at||d.created_at)}</p>
                {order?.shipping_address && (
                  <p style={{ color:"#666", fontSize:10, margin:"4px 0 0",
                    maxWidth:160, overflow:"hidden", whiteSpace:"nowrap",
                    textOverflow:"ellipsis" }}>
                    📍 {order.shipping_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal gán shipper */}
      {showAssign && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setShowAssign(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#1a1a24", borderRadius:18, padding:24,
              width:"100%", maxWidth:460, border:"1px solid #2a2a38" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>🛵 Gán shipper</p>
              <button onClick={()=>setShowAssign(false)}
                style={{ background:"none", border:"none", color:"#666", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            <div style={{ marginBottom:12 }}>
              <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Chọn đơn hàng *</p>
              <select value={assignForm.order_id} onChange={e=>setAssignForm(f=>({...f,order_id:e.target.value}))}
                style={{ width:"100%", ...inp }}>
                <option value="">-- Chọn đơn --</option>
                {readyOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.order_code||o.id?.slice(0,8)} — {o.customer_name} — {fmt(o.total_amount)}đ
                  </option>
                ))}
              </select>
            </div>

            {[
              { key:"shipper_name",  label:"Tên shipper *",    placeholder:"Nguyễn Văn A" },
              { key:"shipper_phone", label:"SĐT shipper",      placeholder:"0984966336" },
              { key:"note",          label:"Ghi chú",          placeholder:"Giao trước 12h..." },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:12 }}>
                <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>{f.label}</p>
                <input value={assignForm[f.key]} onChange={e=>setAssignForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder} style={{ width:"100%", ...inp }}/>
              </div>
            ))}

            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={()=>setShowAssign(false)}
                style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid #333",
                  color:"#aaa", borderRadius:10, padding:"10px", cursor:"pointer" }}>Huỷ</button>
              <button onClick={assignShipper} disabled={updating}
                style={{ flex:2, background:"#D4531C", border:"none", color:"white",
                  borderRadius:10, padding:"10px", fontWeight:800, cursor:"pointer", fontSize:13 }}>
                {updating ? "Đang xử lý..." : "🛵 Gán shipper"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết & cập nhật */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setSelected(null)}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:"#1a1a24", borderRadius:18, padding:24,
              width:"100%", maxWidth:480, border:"1px solid #2a2a38", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={{ color:"white", fontSize:16, fontWeight:900, margin:0 }}>Chi tiết giao hàng</p>
              <button onClick={()=>setSelected(null)}
                style={{ background:"none", border:"none", color:"#666", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>

            {/* Info */}
            <div style={{ background:"#12121a", borderRadius:12, padding:14, marginBottom:14 }}>
              {[
                ["Mã đơn",       selected.orders?.order_code || selected.order_id?.slice(0,8)],
                ["Khách hàng",   selected.orders?.customer_name||"—"],
                ["SĐT khách",    selected.orders?.customer_phone||"—"],
                ["Địa chỉ",      selected.orders?.shipping_address||"—"],
                ["Shipper",      selected.shipper_name||"—"],
                ["SĐT shipper",  selected.shipper_phone||"—"],
                ["Ghi chú",      selected.note||"—"],
                ["Tạo lúc",      fmtDate(selected.created_at)],
                ["Cập nhật",     fmtDate(selected.updated_at)],
              ].map(([label,value],i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  padding:"6px 0", borderBottom:"1px solid #2a2a38" }}>
                  <span style={{ color:"#666", fontSize:12 }}>{label}</span>
                  <span style={{ color:"white", fontSize:12, fontWeight:600,
                    maxWidth:280, textAlign:"right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Cập nhật trạng thái */}
            {(NEXT_STATUS[selected.status]||[]).length > 0 && (
              <div style={{ border:"1px solid #2a2a38", borderRadius:12, padding:14 }}>
                <p style={{ color:"white", fontSize:13, fontWeight:800, margin:"0 0 12px" }}>
                  🔄 Cập nhật trạng thái
                </p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {(NEXT_STATUS[selected.status]||[]).map(nextStatus => {
                    const nc = STATUS_CONFIG[nextStatus];
                    return (
                      <button key={nextStatus} onClick={() => updateStatus(selected.id, nextStatus)}
                        disabled={updating}
                        style={{ background:nc.bg, border:`1px solid ${nc.color}`,
                          color:nc.color, borderRadius:8, padding:"9px 16px",
                          fontSize:12, fontWeight:700, cursor:"pointer" }}>
                        {nc.icon} {nc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(selected.status==="completed"||selected.status==="cancelled") && (
              <div style={{ background:selected.status==="completed"?"rgba(76,175,80,0.1)":"rgba(244,67,54,0.1)",
                border:`1px solid ${selected.status==="completed"?"#4CAF50":"#f44336"}`,
                borderRadius:10, padding:12, textAlign:"center" }}>
                <p style={{ color:selected.status==="completed"?"#4CAF50":"#f44336",
                  fontSize:14, fontWeight:800, margin:0 }}>
                  {STATUS_CONFIG[selected.status]?.icon} {STATUS_CONFIG[selected.status]?.label}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
