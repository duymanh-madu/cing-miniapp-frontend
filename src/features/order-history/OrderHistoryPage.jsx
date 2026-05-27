import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

function fmtDate(str) {
  if (!str) return "";
  const d = new Date(str.replace(" ", "T"));
  return d.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" })
    + " " + d.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" });
}

function typeLabel(type) {
  if (type === "DELI" || type === "FOODBOOK") return { label:"Giao hàng", color:"#1565C0", bg:"#E3F2FD" };
  if (type === "TA")   return { label:"Mang về",  color:"#2E7D32", bg:"#E8F5E9" };
  if (type === "OTS")  return { label:"Tại quán", color:"#E65100", bg:"#FFF3E0" };
  return { label: type || "Tại quán", color:"#666", bg:"#f5f5f5" };
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const type = typeLabel(order.type);
  return (
    <div style={{ background:"white", borderRadius:16, marginBottom:10,
      boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden" }}>
      <div onClick={() => setExpanded(e => !e)}
        style={{ padding:"14px 16px", cursor:"pointer",
          display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
          background:"#fff7ed", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:22 }}>🧋</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <span style={{ fontSize:11, fontWeight:700, color:type.color,
              background:type.bg, borderRadius:6, padding:"2px 8px" }}>{type.label}</span>
            {order.tran_no && <span style={{ fontSize:10, color:"#999" }}>#{order.tran_no}</span>}
          </div>
          <p style={{ fontSize:12, color:"#999", margin:0 }}>{fmtDate(order.date)}</p>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <p style={{ fontSize:15, fontWeight:900, color:"#D4531C", margin:"0 0 2px" }}>{fmt(order.amount)}</p>
          <p style={{ fontSize:10, color:"#bbb", margin:0 }}>{expanded ? "▲ Thu gọn" : "▼ Chi tiết"}</p>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop:"1px solid #f5f5f5", padding:"12px 16px" }}>
          {order.items?.length > 0 ? (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:"#999", margin:"0 0 8px", letterSpacing:1 }}>SẢN PHẨM</p>
              {order.items.map((item, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:6 }}>
                  <p style={{ fontSize:13, color:"#333", margin:0, flex:1 }}>
                    {item.name} × {item.quantity}
                  </p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#333", margin:0, flexShrink:0 }}>
                    {fmt(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div style={{ borderTop:"1px solid #f5f5f5", marginTop:10, paddingTop:10,
                display:"flex", justifyContent:"space-between" }}>
                <p style={{ fontSize:13, color:"#666", margin:0 }}>Thanh toán</p>
                <p style={{ fontSize:13, color:"#666", margin:0 }}>{order.payment}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize:13, color:"#999", margin:0, textAlign:"center" }}>Không có chi tiết</p>
          )}
          {order.pos_name && (
            <p style={{ fontSize:11, color:"#bbb", margin:"8px 0 0" }}>📍 {order.pos_name}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderHistoryPage() {
  const navigate  = useNavigate();
  const profile   = useAuthStore(s => s.profile);
  const phone     = (profile?.phone || profile?.phoneNumber || "").replace(/\D/g, "");
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    if (!phone) { setLoading(false); return; }
    apiClient.get(`/orders/history/${phone}`)
      .then(r => { setOrders(r.data?.data || []); setTotal(r.data?.total || 0); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [phone]);

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:80 }}>
      <div style={{ background:"white", padding:"14px 16px",
        display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)}
          style={{ background:"none", border:"none", fontSize:22, cursor:"pointer" }}>←</button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0 }}>📦 Lịch sử đơn hàng</h1>
        {total > 0 && <span style={{ marginLeft:"auto", fontSize:12, color:"#999" }}>{total} đơn</span>}
      </div>
      <div style={{ padding:"16px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#bbb" }}>
            <p style={{ fontSize:40, margin:"0 0 12px" }}>⏳</p>
            <p>Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : !phone ? (
          <div style={{ textAlign:"center", padding:"60px 24px" }}>
            <p style={{ fontSize:48, margin:"0 0 12px" }}>📦</p>
            <p style={{ fontSize:15, fontWeight:700, color:"#666", margin:"0 0 8px" }}>Chưa đăng nhập</p>
            <p style={{ fontSize:13, color:"#999", margin:0 }}>Đăng nhập qua Zalo để xem lịch sử đơn hàng</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 24px" }}>
            <p style={{ fontSize:48, margin:"0 0 12px" }}>📦</p>
            <p style={{ fontSize:15, fontWeight:700, color:"#666", margin:"0 0 8px" }}>Chưa có đơn hàng nào</p>
            <p style={{ fontSize:13, color:"#999", margin:"0 0 24px" }}>Hãy đặt đồ để bắt đầu tích điểm!</p>
            <button onClick={() => navigate("/menu")}
              style={{ padding:"12px 28px", borderRadius:14, border:"none",
                background:"#D4531C", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
              Đặt đồ ngay
            </button>
          </div>
        ) : orders.map((order, i) => <OrderCard key={i} order={order} />)}
      </div>
    </div>
  );
}
