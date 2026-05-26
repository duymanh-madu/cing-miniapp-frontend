import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

export default function OrderSuccessPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const profile   = useAuthStore(s => s.profile);

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Đọc params từ MoMo redirect hoặc state từ checkout
  const searchParams = new URLSearchParams(
    location.search || window.location.search ||
    location.hash?.split("?")[1] || ""
  );
  const momoOrderId   = searchParams.get("orderId");
  const momoResult    = searchParams.get("resultCode");
  const momoAmount    = searchParams.get("amount");
  const stateOrder    = location.state?.order;

  const isSuccess = momoResult === "0" || !momoResult; // null = từ điểm

  useEffect(() => {
    // Nếu có state từ checkout (thanh toán bằng điểm)
    if (stateOrder) {
      setOrder(stateOrder);
      setLoading(false);
      return;
    }

    // Nếu có orderId từ MoMo, fetch order detail
    if (momoOrderId && profile?.id) {
      apiClient.get(`/orders/by-transaction/${momoOrderId}`)
        .then(r => setOrder(r.data?.data || null))
        .catch(() => setOrder(null))
        .finally(() => setLoading(false));
      return;
    }

    // Fetch đơn mới nhất của user
    if (profile?.id) {
      apiClient.get(`/orders/latest/${profile.id}`)
        .then(r => setOrder(r.data?.data || null))
        .catch(() => setOrder(null))
        .finally(() => setLoading(false));
      return;
    }

    setLoading(false);
  }, []);

  if (!isSuccess) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", minHeight:"80vh", padding:"0 24px", textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:16 }}>😢</div>
        <h1 style={{ fontSize:22, fontWeight:900, color:"#e53935", margin:"0 0 8px" }}>
          Thanh toán thất bại
        </h1>
        <p style={{ fontSize:14, color:"#666", margin:"0 0 32px", lineHeight:1.6 }}>
          Giao dịch không thành công.<br/>Vui lòng thử lại.
        </p>
        <button onClick={() => navigate("/checkout")}
          style={{ width:"100%", maxWidth:300, padding:"14px", borderRadius:14,
            background:"#D4531C", color:"white", border:"none",
            fontSize:15, fontWeight:900, cursor:"pointer", marginBottom:12 }}>
          Thử lại
        </button>
        <button onClick={() => navigate("/")}
          style={{ width:"100%", maxWidth:300, padding:"14px", borderRadius:14,
            background:"white", color:"#666", border:"1.5px solid #e0e0e0",
            fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:40 }}>

      {/* SUCCESS HEADER */}
      <div style={{ background:"linear-gradient(135deg,#D4531C,#E8622A)",
        padding:"48px 24px 32px", textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:12,
          filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>🎉</div>
        <h1 style={{ color:"white", fontSize:24, fontWeight:900, margin:"0 0 8px" }}>
          Đặt hàng thành công!
        </h1>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, margin:0, lineHeight:1.6 }}>
          Đơn hàng của bạn đang được xử lý
        </p>
      </div>

      <div style={{ padding:"16px" }}>

        {/* ORDER INFO CARD */}
        {loading ? (
          <div style={{ background:"white", borderRadius:16, padding:"24px",
            textAlign:"center", color:"#999", marginBottom:12 }}>
            Đang tải thông tin đơn hàng...
          </div>
        ) : order ? (
          <div style={{ background:"white", borderRadius:16, padding:"20px",
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:12 }}>

            {/* Order code */}
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:16,
              paddingBottom:16, borderBottom:"1px solid #f5f5f5" }}>
              <div>
                <p style={{ fontSize:11, color:"#999", margin:"0 0 4px", fontWeight:600 }}>
                  MÃ ĐƠN HÀNG
                </p>
                <p style={{ fontSize:18, fontWeight:900, color:"#D4531C", margin:0,
                  fontFamily:"monospace", letterSpacing:1 }}>
                  #{order.order_code || order.id || momoOrderId || "---"}
                </p>
              </div>
              <div style={{ background:"#E8F5E9", borderRadius:10, padding:"6px 12px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#2E7D32", margin:0 }}>
                  ✓ Đã xác nhận
                </p>
              </div>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div style={{ marginBottom:16, paddingBottom:16, borderBottom:"1px solid #f5f5f5" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#999", margin:"0 0 10px" }}>
                  SẢN PHẨM
                </p>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:6 }}>
                    <p style={{ fontSize:13, color:"#333", margin:0 }}>
                      {item.name || item.item_name} × {item.quantity || item.qty}
                    </p>
                    <p style={{ fontSize:13, fontWeight:700, color:"#333", margin:0 }}>
                      {fmt((item.price || 0) * (item.quantity || item.qty || 1))}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div>
              {order.shipping_fee > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <p style={{ fontSize:13, color:"#666", margin:0 }}>Phí ship</p>
                  <p style={{ fontSize:13, color:"#666", margin:0 }}>{fmt(order.shipping_fee)}</p>
                </div>
              )}
              {order.points_used > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <p style={{ fontSize:13, color:"#666", margin:0 }}>Điểm đã dùng</p>
                  <p style={{ fontSize:13, color:"#4CAF50", margin:0 }}>
                    -{fmt(order.points_used * 1000)}
                  </p>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between",
                marginTop:10, paddingTop:10, borderTop:"1px solid #f5f5f5" }}>
                <p style={{ fontSize:15, fontWeight:900, color:"#1a1a1a", margin:0 }}>
                  Tổng thanh toán
                </p>
                <p style={{ fontSize:15, fontWeight:900, color:"#D4531C", margin:0 }}>
                  {fmt(order.total_amount || momoAmount || 0)}
                </p>
              </div>
            </div>

            {/* Delivery info */}
            {order.shipping_address && (
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #f5f5f5" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#999", margin:"0 0 6px" }}>
                  ĐỊA CHỈ GIAO HÀNG
                </p>
                <p style={{ fontSize:13, color:"#333", margin:0, lineHeight:1.5 }}>
                  {order.shipping_address}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:"white", borderRadius:16, padding:"20px",
            textAlign:"center", marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:14, color:"#666", margin:0 }}>
              Đơn hàng đang được xử lý 🍵
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <button onClick={() => navigate("/")}
          style={{ width:"100%", padding:"14px", borderRadius:14,
            background:"#D4531C", color:"white", border:"none",
            fontSize:15, fontWeight:900, cursor:"pointer", marginBottom:10 }}>
          Về trang chủ
        </button>
        <button onClick={() => navigate("/menu")}
          style={{ width:"100%", padding:"14px", borderRadius:14,
            background:"white", color:"#D4531C", border:"1.5px solid #D4531C",
            fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Tiếp tục mua
        </button>
      </div>
    </div>
  );
}
