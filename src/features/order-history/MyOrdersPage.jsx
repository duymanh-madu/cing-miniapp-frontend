import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

const STATUS_STEPS = [
  { key:"pending_payment", label:"Chờ thanh toán", icon:"⏳" },
  { key:"confirmed",       label:"Đã xác nhận",    icon:"✅" },
  { key:"processing",      label:"Đang chuẩn bị",  icon:"👨‍🍳" },
  { key:"delivering",      label:"Đang giao",       icon:"🛵" },
  { key:"completed",       label:"Hoàn thành",      icon:"🎉" },
];

const DELIVERY_STATUS = {
  assigned:   { label:"Đã gán shipper",  icon:"👤", color:"#2196F3" },
  picked_up:  { label:"Đã lấy hàng",    icon:"📦", color:"#FF9800" },
  delivering: { label:"Đang giao",       icon:"🛵", color:"#FF5722" },
  delivered:  { label:"Đã giao",         icon:"✅", color:"#4CAF50" },
  failed:     { label:"Giao thất bại",   icon:"❌", color:"#f44336" },
};

function StatusBar({ status }) {
  const activeIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, margin:"12px 0" }}>
      {STATUS_STEPS.filter(s => s.key !== "pending_payment").map((s, i) => {
        const idx = STATUS_STEPS.indexOf(s);
        const done = activeIdx >= idx;
        const active = activeIdx === idx;
        return (
          <div key={s.key} style={{ display:"flex", alignItems:"center", flex: i < 3 ? 1 : 0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background: done ? (active ? "#D4531C" : "#4CAF50") : "rgba(255,255,255,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, border: active ? "2px solid #FF6B35" : "none",
                boxShadow: active ? "0 0 12px rgba(212,83,28,0.6)" : "none",
              }}>{s.icon}</div>
              <p style={{ fontSize:9, color: done ? (active ? "#FF6B35" : "#4CAF50") : "#555",
                margin:0, fontWeight: active ? 800 : 500, textAlign:"center", maxWidth:60 }}>{s.label}</p>
            </div>
            {i < 3 && (
              <div style={{ flex:1, height:2, background: done && activeIdx > idx ? "#4CAF50" : "rgba(255,255,255,0.1)",
                margin:"0 4px", marginBottom:20 }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const profile  = useAuthStore(s => s.profile);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const phone = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();

  const fetchOrders = async () => {
    if (!phone) return;
    try {
      const r = await apiClient.get(`/orders/active/${phone}`);
      setOrders(r.data?.data || []);
    } catch(e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [phone]);

  // Realtime update
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.on("delivery.status.updated", fetchOrders);
        socket.on("order.status.updated", fetchOrders);
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();
    return () => {
      getRuntimeSocket()?.off("delivery.status.updated", fetchOrders);
      getRuntimeSocket()?.off("order.status.updated", fetchOrders);
    };
  }, [phone]);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", paddingBottom:100 }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#D4531C,#E8622A)",
        paddingTop:"max(env(safe-area-inset-top,0px) + 8px, 48px)",
        paddingBottom:16, paddingLeft:16, paddingRight:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate(-1)} style={{ background:"rgba(255,255,255,0.2)",
            border:"none", color:"white", borderRadius:12, width:36, height:36,
            cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <h1 style={{ color:"white", fontSize:18, fontWeight:900, margin:0 }}>Đơn hàng của tôi</h1>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:0 }}>Theo dõi đơn đang xử lý</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"16px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.3)" }}>Đang tải...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🧋</div>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:15, fontWeight:700, margin:"0 0 8px" }}>Không có đơn hàng đang xử lý</p>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13, margin:"0 0 24px" }}>Các đơn hoàn thành sẽ hiển thị trong lịch sử</p>
            <button onClick={() => navigate("/menu")} style={{
              background:"linear-gradient(135deg,#D4531C,#FF6B35)", border:"none",
              color:"white", borderRadius:14, padding:"12px 24px",
              fontSize:14, fontWeight:900, cursor:"pointer" }}>
              🧋 Đặt hàng ngay
            </button>
          </div>
        ) : orders.map((order, i) => (
          <div key={i} style={{ background:"#1a1a24", borderRadius:16, marginBottom:12,
            border:"1px solid rgba(255,255,255,0.08)", overflow:"hidden" }}>
            {/* Order header */}
            <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ color:"white", fontSize:13, fontWeight:800, margin:0 }}>{order.order_code}</p>
                <p style={{ color:"#888", fontSize:11, margin:"2px 0 0" }}>
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <p style={{ color:"#FFD700", fontSize:15, fontWeight:900, margin:0 }}>{fmt(order.total_amount)}</p>
            </div>

            {/* Status bar */}
            <div style={{ padding:"12px 16px 0" }}>
              <StatusBar status={order.status} />
            </div>

            {/* Delivery info */}
            {order.delivery && (
              <div style={{ margin:"0 16px 12px", padding:"10px 14px",
                background:"rgba(255,87,34,0.08)", borderRadius:10,
                border:"1px solid rgba(255,87,34,0.2)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>
                    {DELIVERY_STATUS[order.delivery.status]?.icon || "🛵"}
                  </span>
                  <div>
                    <p style={{ color: DELIVERY_STATUS[order.delivery.status]?.color || "#FF5722",
                      fontSize:12, fontWeight:800, margin:0 }}>
                      {DELIVERY_STATUS[order.delivery.status]?.label || order.delivery.status}
                    </p>
                    {order.delivery.shipper_name && (
                      <p style={{ color:"#aaa", fontSize:11, margin:"2px 0 0" }}>
                        Shipper: {order.delivery.shipper_name}
                        {order.delivery.shipper_phone && ` · ${order.delivery.shipper_phone}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div style={{ padding:"0 16px 14px" }}>
              {(order.items||[]).slice(0,3).map((item, j) => (
                <div key={j} style={{ display:"flex", justifyContent:"space-between",
                  padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color:"#ccc", fontSize:12 }}>{item.name} ×{item.quantity||item.qty||1}</span>
                  <span style={{ color:"#FFD700", fontSize:12, fontWeight:700 }}>{fmt(item.price)}</span>
                </div>
              ))}
              {(order.items||[]).length > 3 && (
                <p style={{ color:"#666", fontSize:11, margin:"6px 0 0" }}>+{order.items.length-3} món nữa</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
