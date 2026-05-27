import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

function fmtDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" })
    + " " + d.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}

const TYPE_CONFIG = {
  order:     { label:"Đơn hàng",    icon:"🛍",  color:"#1565C0", bg:"#E3F2FD" },
  game:      { label:"Game",        icon:"🎮",  color:"#7c3aed", bg:"#f5f3ff" },
  payment:   { label:"Thanh toán",  icon:"💳",  color:"#2E7D32", bg:"#E8F5E9" },
  analytics: { label:"Sự kiện",     icon:"📊",  color:"#E65100", bg:"#FFF3E0" },
};

const FILTERS = [
  { key:"all",       label:"Tất cả" },
  { key:"orders",    label:"Đơn hàng" },
  { key:"payments",  label:"Thanh toán" },
  { key:"games",     label:"Game" },
  { key:"points",    label:"Điểm/Sự kiện" },
];

function LogItem({ log }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[log._type] || TYPE_CONFIG.analytics;

  const title = () => {
    if (log._type === "order") return `${log.customer_name || "Khách"} — ${fmt(log.total_amount)}`;
    if (log._type === "game")  return `${log.player_name || log.user_id} — ${(log.score||0).toLocaleString()} điểm`;
    if (log._type === "payment") return `${log.customer_name || log.user_id} — ${fmt(log.amount)}`;
    return `${log.event_name} — ${log.user_id}`;
  };

  const status = () => {
    if (log._type === "order")   return { text: log.status || "pending", ok: log.status === "confirmed" };
    if (log._type === "payment") return { text: log.payment_status, ok: log.payment_status === "paid", warn: log.payment_status === "pending" };
    return null;
  };

  const s = status();

  return (
    <div style={{ background:"#1a1a24", borderRadius:12, marginBottom:8, overflow:"hidden",
      border:"1px solid #2a2a38" }}>
      <div onClick={() => setExpanded(e => !e)}
        style={{ padding:"12px 16px", cursor:"pointer",
          display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
          background:cfg.bg, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:18 }}>{cfg.icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
            <span style={{ fontSize:10, fontWeight:700, color:cfg.color,
              background: cfg.bg + "33", borderRadius:5, padding:"1px 6px" }}>
              {cfg.label}
            </span>
            {s && (
              <span style={{ fontSize:10, fontWeight:700,
                color: s.ok ? "#4CAF50" : s.warn ? "#FF9800" : "#f44336",
                background: s.ok ? "#E8F5E933" : s.warn ? "#FFF3E033" : "#FFEBEE33",
                borderRadius:5, padding:"1px 6px" }}>
                {s.text}
              </span>
            )}
            {log._type === "payment" && !log.callback_received && (
              <span style={{ fontSize:10, fontWeight:700, color:"#f44336",
                background:"#FFEBEE33", borderRadius:5, padding:"1px 6px" }}>
                ⚠ Chưa nhận callback
              </span>
            )}
          </div>
          <p style={{ color:"white", fontSize:12, fontWeight:600, margin:0,
            overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
            {title()}
          </p>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <p style={{ color:"#666", fontSize:10, margin:0 }}>{fmtDate(log.created_at)}</p>
          <p style={{ color:"#444", fontSize:10, margin:"2px 0 0" }}>
            {expanded ? "▲" : "▼"}
          </p>
        </div>
      </div>

      {expanded && (
        <div style={{ padding:"10px 16px 14px", borderTop:"1px solid #2a2a38",
          background:"#12121a" }}>
          <pre style={{ color:"#888", fontSize:11, margin:0, overflowX:"auto",
            whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AdminLogs({ token }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [page, setPage]       = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const fetchLogs = async (f = filter, p = page) => {
    try {
      const res = await apiClient.get(`/admin/logs?type=${f}&limit=50&page=${p}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error("Logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchLogs(filter, 1);
  }, [filter]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchLogs(filter, page), 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, filter, page]);

  const stats = {
    orders:   logs.filter(l => l._type === "order").length,
    payments: logs.filter(l => l._type === "payment").length,
    games:    logs.filter(l => l._type === "game").length,
    alerts:   logs.filter(l => l._type === "payment" && !l.callback_received).length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 4px" }}>
            📋 Activity Logs
          </h2>
          <p style={{ color:"#666", fontSize:12, margin:0 }}>
            Theo dõi realtime mọi hoạt động trong hệ thống
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => fetchLogs(filter, page)}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid #333",
              color:"white", borderRadius:8, padding:"6px 14px",
              fontSize:12, fontWeight:700, cursor:"pointer" }}>
            🔄 Refresh
          </button>
          <button onClick={() => setAutoRefresh(a => !a)}
            style={{ background: autoRefresh ? "rgba(212,83,28,0.2)" : "rgba(255,255,255,0.06)",
              border:`1px solid ${autoRefresh ? "#D4531C" : "#333"}`,
              color: autoRefresh ? "#D4531C" : "#666",
              borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {autoRefresh ? "⏸ Auto ON" : "▶ Auto OFF"}
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {stats.alerts > 0 && (
        <div style={{ background:"rgba(244,67,54,0.1)", border:"1px solid rgba(244,67,54,0.3)",
          borderRadius:12, padding:"12px 16px", marginBottom:16,
          display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <p style={{ color:"#f44336", fontSize:13, fontWeight:700, margin:0 }}>
            {stats.alerts} giao dịch chưa nhận được callback từ MoMo — cần kiểm tra!
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {[
          { label:"Đơn hàng",   value: stats.orders,   color:"#1565C0" },
          { label:"Thanh toán", value: stats.payments,  color:"#2E7D32" },
          { label:"Game",       value: stats.games,     color:"#7c3aed" },
          { label:"⚠ Cần xử lý", value: stats.alerts,  color:"#f44336" },
        ].map((s, i) => (
          <div key={i} style={{ background:"#1a1a24", borderRadius:12,
            padding:"14px", border:"1px solid #2a2a38", textAlign:"center" }}>
            <p style={{ color:s.color, fontSize:22, fontWeight:900, margin:"0 0 4px" }}>
              {s.value}
            </p>
            <p style={{ color:"#666", fontSize:11, margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
              background: filter === f.key ? "#D4531C" : "#2a2a38",
              color: filter === f.key ? "white" : "#888",
              fontSize:12, fontWeight:700 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Logs */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#666" }}>
          <p style={{ fontSize:32 }}>⏳</p>
          <p>Đang tải logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#666" }}>
          <p style={{ fontSize:32 }}>📋</p>
          <p>Chưa có log nào</p>
        </div>
      ) : (
        <>
          {logs.map((log, i) => <LogItem key={i} log={log} />)}
          <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:16 }}>
            {page > 1 && (
              <button onClick={() => { setPage(p => p-1); fetchLogs(filter, page-1); }}
                style={{ background:"#2a2a38", border:"none", color:"white",
                  borderRadius:8, padding:"8px 16px", fontSize:12, cursor:"pointer" }}>
                ← Trước
              </button>
            )}
            <span style={{ color:"#666", fontSize:12, padding:"8px" }}>Trang {page}</span>
            {logs.length === 50 && (
              <button onClick={() => { setPage(p => p+1); fetchLogs(filter, page+1); }}
                style={{ background:"#2a2a38", border:"none", color:"white",
                  borderRadius:8, padding:"8px 16px", fontSize:12, cursor:"pointer" }}>
                Sau →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
