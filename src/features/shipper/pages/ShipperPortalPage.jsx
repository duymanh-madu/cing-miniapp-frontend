import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";

const STATUS_LABEL = {
  assigned: "Đã gán shipper",
  picked_up: "Đã lấy hàng",
  delivering: "Đang giao",
  arrived: "Đã đến nơi",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
};

const NEXT_ACTIONS = {
  assigned: [
    { status:"picked_up", label:"📦 Đã lấy hàng" },
    { status:"cancelled", label:"❌ Huỷ giao" },
  ],
  picked_up: [
    { status:"delivering", label:"🛵 Bắt đầu giao" },
    { status:"cancelled", label:"❌ Huỷ giao" },
  ],
  delivering: [
    { status:"arrived", label:"📍 Đã đến nơi" },
    { status:"completed", label:"✅ Đã giao xong" },
    { status:"cancelled", label:"❌ Huỷ giao" },
  ],
  arrived: [
    { status:"completed", label:"✅ Hoàn thành" },
  ],
};

const fmt = n => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

export default function ShipperPortalPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/shipper/order/${token}`);
      setData(res.data?.data || null);
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const updateStatus = async (status) => {
    if (!window.confirm(`Xác nhận: ${STATUS_LABEL[status] || status}?`)) return;

    setSaving(status);
    setMsg("");

    try {
      const res = await apiClient.post(`/shipper/status/${token}`, { status });
      setMsg(res.data?.message || "Đã cập nhật");
      await load();
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f0f14", color:"#888" }}>
        Đang tải đơn giao...
      </div>
    );
  }

  if (!data?.tracking) {
    return (
      <div style={{ minHeight:"100vh", padding:20, background:"#0f0f14", color:"#fff" }}>
        <h2>Không tìm thấy đơn giao</h2>
        {msg && <p style={{ color:"#ff8b8b" }}>{msg}</p>}
      </div>
    );
  }

  const tracking = data.tracking;
  const order = data.order || {};
  const status = tracking.status || tracking.delivery_status;
  const actions = NEXT_ACTIONS[status] || [];

  const address = order.shipping_address || "";
  const phone = order.customer_phone || "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f14", color:"#fff", padding:16, boxSizing:"border-box" }}>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        <div style={{ background:"#171722", border:"1px solid #282838", borderRadius:18, padding:18, marginBottom:14 }}>
          <p style={{ color:"#D4531C", fontSize:12, fontWeight:900, margin:"0 0 6px", letterSpacing:1 }}>
            SHIPPER PORTAL
          </p>
          <h1 style={{ fontSize:22, margin:"0 0 6px" }}>
            📦 Đơn {order.order_code || tracking.order_id}
          </h1>
          <p style={{ margin:0, color:"#aaa", fontSize:13 }}>
            Trạng thái: <b style={{ color:"#FFD700" }}>{STATUS_LABEL[status] || status}</b>
          </p>
        </div>

        {msg && (
          <div style={{ background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.25)", color:"#FFD700", borderRadius:12, padding:12, marginBottom:14 }}>
            {msg}
          </div>
        )}

        <div style={{ background:"#171722", border:"1px solid #282838", borderRadius:18, padding:18, marginBottom:14 }}>
          <p style={{ color:"#888", fontSize:11, fontWeight:800, margin:"0 0 10px", letterSpacing:1 }}>
            THÔNG TIN KHÁCH
          </p>

          <p style={{ margin:"0 0 8px", fontWeight:800 }}>
            👤 {order.customer_name || "Khách hàng"}
          </p>

          <p style={{ margin:"0 0 8px", color:"#ccc" }}>
            📞 {phone || "Không có SĐT"}
          </p>

          <p style={{ margin:"0 0 8px", color:"#ccc", lineHeight:1.45 }}>
            📍 {address || "Không có địa chỉ"}
          </p>

          <p style={{ margin:0, color:"#FFD700", fontWeight:900 }}>
            💰 {fmt(order.total_amount)}đ
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <a
            href={phone ? `tel:${phone}` : undefined}
            style={{ textAlign:"center", textDecoration:"none", background:"#1e2a1e", border:"1px solid #4CAF50", color:"#4CAF50", borderRadius:14, padding:"14px 10px", fontWeight:900 }}
          >
            📞 Gọi khách
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textAlign:"center", textDecoration:"none", background:"#1b2533", border:"1px solid #2196F3", color:"#2196F3", borderRadius:14, padding:"14px 10px", fontWeight:900 }}
          >
            🗺️ Mở bản đồ
          </a>
        </div>

        <div style={{ background:"#171722", border:"1px solid #282838", borderRadius:18, padding:18 }}>
          <p style={{ color:"#888", fontSize:11, fontWeight:800, margin:"0 0 12px", letterSpacing:1 }}>
            CẬP NHẬT TRẠNG THÁI
          </p>

          {actions.length === 0 ? (
            <p style={{ color:"#777", margin:0 }}>
              Đơn này đã kết thúc, không còn thao tác.
            </p>
          ) : (
            <div style={{ display:"grid", gap:10 }}>
              {actions.map(a => (
                <button
                  key={a.status}
                  onClick={() => updateStatus(a.status)}
                  disabled={!!saving}
                  style={{
                    width:"100%",
                    border:"none",
                    borderRadius:14,
                    padding:"15px 12px",
                    background: a.status === "cancelled" ? "#3a1515" : "#D4531C",
                    color:"#fff",
                    fontSize:15,
                    fontWeight:950,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving === a.status ? "Đang cập nhật..." : a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
