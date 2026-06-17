import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

const fmtDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_CONFIG = {
  assigned: {
    label: "Đã gán shipper",
    color: "#2196F3",
    bg: "rgba(33,150,243,0.15)",
    icon: "👤",
  },
  picked_up: {
    label: "Đã lấy hàng",
    color: "#FF9800",
    bg: "rgba(255,152,0,0.15)",
    icon: "📦",
  },
  delivering: {
    label: "Đang giao",
    color: "#9C27B0",
    bg: "rgba(156,39,176,0.15)",
    icon: "🛵",
  },
  arrived: {
    label: "Đã đến nơi",
    color: "#00BCD4",
    bg: "rgba(0,188,212,0.15)",
    icon: "📍",
  },
  completed: {
    label: "Hoàn thành",
    color: "#4CAF50",
    bg: "rgba(76,175,80,0.15)",
    icon: "✅",
  },
  cancelled: {
    label: "Đã huỷ",
    color: "#f44336",
    bg: "rgba(244,67,54,0.15)",
    icon: "🚫",
  },
};

const NEXT_STATUS = {
  assigned: ["picked_up", "cancelled"],
  picked_up: ["delivering", "cancelled"],
  delivering: ["arrived", "completed", "cancelled"],
  arrived: ["completed"],
  completed: [],
  cancelled: [],
};

const inputStyle = {
  background: "#0d0d18",
  border: "1px solid #2a2a38",
  borderRadius: 8,
  padding: "8px 12px",
  color: "white",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const primaryButton = {
  background: "#D4531C",
  border: "none",
  color: "white",
  borderRadius: 8,
  padding: "6px 14px",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostButton = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid #333",
  color: "#aaa",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const linkButton = {
  background: "rgba(33,150,243,0.15)",
  border: "1px solid #2196F3",
  color: "#2196F3",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
};

function getDeliveryStatus(delivery) {
  return delivery?.status || delivery?.delivery_status || "assigned";
}

function getOrderCode(delivery) {
  return delivery?.orders?.order_code || delivery?.order_code || delivery?.order_id?.slice?.(0, 8) || "—";
}

export default function AdminDelivery({ token }) {
  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [assignForm, setAssignForm] = useState({
    order_id: "",
    shipper_name: "",
    shipper_phone: "",
    note: "",
  });
  const [showAssign, setShowAssign] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const showMsg = useCallback((text, ms = 4000) => {
    setMsg(text);
    window.clearTimeout(showMsg._timer);
    showMsg._timer = window.setTimeout(() => setMsg(""), ms);
  }, []);

  const copyText = useCallback(async (value, successText = "✅ Đã copy") => {
    if (!value) {
      showMsg("❌ Không có link để copy");
      return false;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      showMsg(successText);
      return true;
    } catch (error) {
      showMsg("❌ Không copy được link shipper");
      return false;
    }
  }, [showMsg]);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient.get("/admin/delivery/stats", { headers });
      setStats(res.data?.data || null);
    } catch {
      setStats(null);
    }
  }, [headers]);

  const loadDeliveries = useCallback(async (status = "", q = "") => {
    setLoading(true);
    try {
      let url = "/admin/delivery/list?limit=100";
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;

      const res = await apiClient.get(url, { headers });
      setDeliveries(res.data?.data || []);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const loadReadyOrders = useCallback(async () => {
    try {
      const res = await apiClient.get("/admin/delivery/orders-ready", { headers });
      setReadyOrders(res.data?.data || []);
    } catch {
      setReadyOrders([]);
    }
  }, [headers]);

  const refreshAll = useCallback(() => {
    loadStats();
    loadDeliveries(filterStatus, search);
    loadReadyOrders();
  }, [filterStatus, loadDeliveries, loadReadyOrders, loadStats, search]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    const id = window.setInterval(() => {
      refreshAll();
    }, 15000);

    return () => window.clearInterval(id);
  }, [autoRefresh, refreshAll]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput);
    loadDeliveries(filterStatus, searchInput);
  };

  const updateStatus = async (trackingId, newStatus) => {
    setUpdating(true);
    try {
      const res = await apiClient.put(
        `/admin/delivery/status/${trackingId}`,
        { status: newStatus },
        { headers },
      );

      showMsg(`✅ ${res.data?.message || "Đã cập nhật trạng thái"}`);
      setSelected((prev) => prev ? { ...prev, status: newStatus, delivery_status: newStatus } : null);
      refreshAll();
    } catch (error) {
      showMsg(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const assignShipper = async () => {
    if (!assignForm.order_id || !assignForm.shipper_name.trim()) {
      showMsg("❌ Vui lòng chọn đơn hàng và nhập tên shipper");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        ...assignForm,
        shipper_name: assignForm.shipper_name.trim(),
        shipper_phone: assignForm.shipper_phone.trim(),
        note: assignForm.note.trim(),
      };

      const res = await apiClient.post("/admin/delivery/assign", payload, { headers });
      const shipperUrl = res.data?.shipper_url || res.data?.data?.shipper_url || "";

      if (shipperUrl) {
        await copyText(shipperUrl, "✅ Đã gán shipper và copy link shipper");
      } else {
        showMsg(`✅ ${res.data?.message || "Đã gán shipper"}`);
      }

      setShowAssign(false);
      setAssignForm({ order_id: "", shipper_name: "", shipper_phone: "", note: "" });
      refreshAll();
    } catch (error) {
      showMsg(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const activeDeliveries = useMemo(
    () => deliveries.filter((delivery) => !["completed", "cancelled"].includes(getDeliveryStatus(delivery))),
    [deliveries],
  );

  const displayList = tab === "active" ? activeDeliveries : deliveries;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ color: "white", fontSize: 20, fontWeight: 900, margin: 0 }}>
          🚀 Quản lý giao hàng
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setAutoRefresh((value) => !value)}
            style={{
              background: autoRefresh ? "rgba(76,175,80,0.2)" : "rgba(255,255,255,0.07)",
              border: `1px solid ${autoRefresh ? "#4CAF50" : "#333"}`,
              color: autoRefresh ? "#4CAF50" : "#888",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {autoRefresh ? "🟢 Live" : "⚫ Live"}
          </button>

          <button onClick={() => setShowAssign(true)} style={primaryButton}>
            + Gán shipper
          </button>
        </div>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Tổng", value: fmt(stats.total), color: "#2196F3", icon: "📦" },
            { label: "Hôm nay", value: fmt(stats.today), color: "#D4531C", icon: "🌅" },
            { label: "Đang giao", value: fmt(stats.active), color: "#FF9800", icon: "🛵" },
            { label: "Hoàn thành", value: fmt(stats.completed), color: "#4CAF50", icon: "✅" },
            { label: "Đã huỷ", value: fmt(stats.cancelled), color: "#f44336", icon: "🚫" },
          ].map((item) => (
            <div key={item.label} style={{ background: "#1a1a24", borderRadius: 12, padding: 12, border: `1px solid ${item.color}22`, textAlign: "center" }}>
              <p style={{ fontSize: 16, margin: "0 0 4px" }}>{item.icon}</p>
              <p style={{ color: item.color, fontSize: 18, fontWeight: 900, margin: "0 0 2px" }}>{item.value}</p>
              <p style={{ color: "#555", fontSize: 9, margin: 0, fontWeight: 700 }}>{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {readyOrders.length > 0 && (
        <div style={{ background: "rgba(255,152,0,0.08)", border: "1px solid rgba(255,152,0,0.3)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ color: "#FF9800", fontSize: 12, fontWeight: 800, margin: "0 0 10px" }}>
            ⚠ {readyOrders.length} đơn chờ gán shipper
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {readyOrders.slice(0, 5).map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setAssignForm((form) => ({ ...form, order_id: order.id }));
                  setShowAssign(true);
                }}
                style={{ background: "rgba(255,152,0,0.15)", border: "1px solid #FF9800", color: "#FF9800", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                📦 {order.order_code || order.id?.slice(0, 8)} — {order.customer_name}
              </button>
            ))}
            {readyOrders.length > 5 && (
              <span style={{ color: "#FF9800", fontSize: 11, padding: "5px 0" }}>
                +{readyOrders.length - 5} đơn nữa
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => setTab("active")}
          style={{
            background: tab === "active" ? "#D4531C" : "rgba(255,255,255,0.07)",
            border: "none",
            borderRadius: 20,
            padding: "6px 14px",
            color: tab === "active" ? "white" : "#aaa",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🛵 Đang giao ({activeDeliveries.length})
        </button>

        <button
          onClick={() => setTab("all")}
          style={{
            background: tab === "all" ? "#D4531C" : "rgba(255,255,255,0.07)",
            border: "none",
            borderRadius: 20,
            padding: "6px 14px",
            color: tab === "all" ? "white" : "#aaa",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          📋 Tất cả
        </button>

        {tab === "all" && (
          <>
            <select
              value={filterStatus}
              onChange={(event) => {
                setFilterStatus(event.target.value);
                loadDeliveries(event.target.value, search);
              }}
              style={{ ...inputStyle, minWidth: 140 }}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>{value.icon} {value.label}</option>
              ))}
            </select>

            <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tên/SĐT shipper..."
                style={{ ...inputStyle, width: 160 }}
              />
              <button type="submit" style={primaryButton}>Tìm</button>
            </form>
          </>
        )}
      </div>

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(255,80,80,0.1)",
          border: `1px solid ${msg.includes("✅") ? "#4CAF50" : "#ff6b6b"}`,
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 12,
          color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b",
          fontSize: 13,
        }}>
          {msg}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#666", textAlign: "center", padding: 40 }}>Đang tải...</p>
      ) : displayList.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: 40 }}>Không có dữ liệu</p>
      ) : displayList.map((delivery) => {
        const status = getDeliveryStatus(delivery);
        const statusConfig = STATUS_CONFIG[status] || { label: status, color: "#888", bg: "transparent", icon: "📦" };
        const order = delivery.orders;
        const shipperUrl = delivery.shipper_url || delivery.shipperUrl || "";

        return (
          <div
            key={delivery.id || `${delivery.order_id}-${delivery.shipper_phone}`}
            style={{ background: "#1a1a24", borderRadius: 14, padding: "16px 18px", marginBottom: 10, border: `1px solid ${statusConfig.color}22`, cursor: "pointer" }}
            onClick={() => setSelected(delivery)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: statusConfig.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {statusConfig.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ background: statusConfig.bg, color: statusConfig.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                    {statusConfig.label}
                  </span>
                  <span style={{ color: "#aaa", fontSize: 11 }}>{getOrderCode(delivery)}</span>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ color: "#666", fontSize: 10, margin: "0 0 1px" }}>Shipper</p>
                    <p style={{ color: "white", fontSize: 12, fontWeight: 700, margin: 0 }}>
                      {delivery.shipper_name || "—"} {delivery.shipper_phone && <span style={{ color: "#888", fontWeight: 400 }}>· {delivery.shipper_phone}</span>}
                    </p>
                  </div>

                  {order && (
                    <div>
                      <p style={{ color: "#666", fontSize: 10, margin: "0 0 1px" }}>Khách hàng</p>
                      <p style={{ color: "white", fontSize: 12, fontWeight: 700, margin: 0 }}>
                        {order.customer_name} · {fmt(order.total_amount)}đ
                      </p>
                    </div>
                  )}
                </div>

                {shipperUrl && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }} onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => copyText(shipperUrl, "✅ Đã copy link shipper")} style={linkButton}>
                      📋 Copy link
                    </button>
                    <a href={shipperUrl} target="_blank" rel="noreferrer" style={linkButton}>
                      🔗 Mở portal
                    </a>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ color: "#555", fontSize: 10, margin: 0 }}>{fmtDate(delivery.updated_at || delivery.created_at)}</p>
                {order?.shipping_address && (
                  <p style={{ color: "#666", fontSize: 10, margin: "4px 0 0", maxWidth: 160, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    📍 {order.shipping_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showAssign && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowAssign(false)}>
          <div onClick={(event) => event.stopPropagation()} style={{ background: "#1a1a24", borderRadius: 18, padding: 24, width: "100%", maxWidth: 460, border: "1px solid #2a2a38" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p style={{ color: "white", fontSize: 16, fontWeight: 900, margin: 0 }}>🛵 Gán shipper</p>
              <button onClick={() => setShowAssign(false)} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <p style={{ color: "#666", fontSize: 11, margin: "0 0 4px" }}>Chọn đơn hàng *</p>
              <select value={assignForm.order_id} onChange={(event) => setAssignForm((form) => ({ ...form, order_id: event.target.value }))} style={{ width: "100%", ...inputStyle }}>
                <option value="">-- Chọn đơn --</option>
                {readyOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_code || order.id?.slice(0, 8)} — {order.customer_name} — {fmt(order.total_amount)}đ
                  </option>
                ))}
              </select>
            </div>

            {[
              { key: "shipper_name", label: "Tên shipper *", placeholder: "Nguyễn Văn A" },
              { key: "shipper_phone", label: "SĐT shipper", placeholder: "0984966336" },
              { key: "note", label: "Ghi chú", placeholder: "Giao trước 12h..." },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 12 }}>
                <p style={{ color: "#666", fontSize: 11, margin: "0 0 4px" }}>{field.label}</p>
                <input
                  value={assignForm[field.key]}
                  onChange={(event) => setAssignForm((form) => ({ ...form, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: "100%", ...inputStyle }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAssign(false)} style={{ flex: 1, ...ghostButton, padding: 10 }}>
                Huỷ
              </button>
              <button onClick={assignShipper} disabled={updating} style={{ flex: 2, ...primaryButton, borderRadius: 10, padding: 10, fontWeight: 800, fontSize: 13, cursor: updating ? "not-allowed" : "pointer", opacity: updating ? 0.7 : 1 }}>
                {updating ? "Đang xử lý..." : "🛵 Gán shipper"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setSelected(null)}>
          <div onClick={(event) => event.stopPropagation()} style={{ background: "#1a1a24", borderRadius: 18, padding: 24, width: "100%", maxWidth: 480, border: "1px solid #2a2a38", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ color: "white", fontSize: 16, fontWeight: 900, margin: 0 }}>Chi tiết giao hàng</p>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ background: "#12121a", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              {[
                ["Mã đơn", getOrderCode(selected)],
                ["Khách hàng", selected.orders?.customer_name || "—"],
                ["SĐT khách", selected.orders?.customer_phone || "—"],
                ["Địa chỉ", selected.orders?.shipping_address || "—"],
                ["Shipper", selected.shipper_name || "—"],
                ["SĐT shipper", selected.shipper_phone || "—"],
                ["Ghi chú", selected.note || "—"],
                ["Tạo lúc", fmtDate(selected.created_at)],
                ["Cập nhật", fmtDate(selected.updated_at)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderBottom: "1px solid #2a2a38" }}>
                  <span style={{ color: "#666", fontSize: 12 }}>{label}</span>
                  <span style={{ color: "white", fontSize: 12, fontWeight: 600, maxWidth: 280, textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {(selected.shipper_url || selected.shipperUrl) && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <button onClick={() => copyText(selected.shipper_url || selected.shipperUrl, "✅ Đã copy link shipper")} style={linkButton}>
                  📋 Copy link shipper
                </button>
                <a href={selected.shipper_url || selected.shipperUrl} target="_blank" rel="noreferrer" style={linkButton}>
                  🔗 Mở portal shipper
                </a>
              </div>
            )}

            {(NEXT_STATUS[getDeliveryStatus(selected)] || []).length > 0 && (
              <div style={{ border: "1px solid #2a2a38", borderRadius: 12, padding: 14 }}>
                <p style={{ color: "white", fontSize: 13, fontWeight: 800, margin: "0 0 12px" }}>
                  🔄 Cập nhật trạng thái
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(NEXT_STATUS[getDeliveryStatus(selected)] || []).map((nextStatus) => {
                    const nextConfig = STATUS_CONFIG[nextStatus];
                    return (
                      <button key={nextStatus} onClick={() => updateStatus(selected.id, nextStatus)} disabled={updating} style={{ background: nextConfig.bg, border: `1px solid ${nextConfig.color}`, color: nextConfig.color, borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer", opacity: updating ? 0.7 : 1 }}>
                        {nextConfig.icon} {nextConfig.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {["completed", "cancelled"].includes(getDeliveryStatus(selected)) && (
              <div style={{ background: getDeliveryStatus(selected) === "completed" ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", border: `1px solid ${getDeliveryStatus(selected) === "completed" ? "#4CAF50" : "#f44336"}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                <p style={{ color: getDeliveryStatus(selected) === "completed" ? "#4CAF50" : "#f44336", fontSize: 14, fontWeight: 800, margin: 0 }}>
                  {STATUS_CONFIG[getDeliveryStatus(selected)]?.icon} {STATUS_CONFIG[getDeliveryStatus(selected)]?.label}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
