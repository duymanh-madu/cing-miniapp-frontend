import React, { useEffect, useState, useCallback } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminAppConfig({ token }) {
  const [config, setConfig] = useState(null);
  const [msg, setMsg] = useState("");
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/app-config/public")
      .then(r => setConfig(r.data?.data))
      .catch(console.error);
  }, []);

  const save = async () => {
    try {
      // Chi gui cac field co trong DB
      const payload = {
        app_name: config.app_name,
        slogan: config.slogan,
        primary_color: config.primary_color,
        maintenance_mode: config.maintenance_mode,
        ordering_enabled: config.ordering_enabled,
        payment_enabled: config.payment_enabled,
        minigame_enabled: config.minigame_enabled,
        leaderboard_enabled: config.leaderboard_enabled,
        voucher_enabled: config.voucher_enabled,
        banner_enabled: config.banner_enabled,
        momo_enabled: config.momo_enabled,
        delivery_enabled: config.delivery_enabled,
        hotline: config.hotline,
        support_zalo: config.support_zalo,
        facebook_url: config.facebook_url,
        opening_time: config.opening_time,
        closing_time: config.closing_time,
        popup_enabled: config.popup_enabled,
        popup_title: config.popup_title,
        popup_content: config.popup_content,
        popup_button_text: config.popup_button_text,
        popup_button_link: config.popup_button_link,
        custom_leaderboard_name: config.custom_leaderboard_name,
        custom_leaderboard_from: config.custom_leaderboard_from,
        custom_leaderboard_to: config.custom_leaderboard_to,
        store_address: config.store_address,
        minimum_order_amount: config.minimum_order_amount,
        free_shipping_threshold: config.free_shipping_threshold,
        max_delivery_distance: config.max_delivery_distance,
        shipping_fee_per_km: config.shipping_fee_per_km,
        spend_per_play: config.spend_per_play,
        bank_name: config.bank_name,
        bank_account_number: config.bank_account_number,
        bank_account_name: config.bank_account_name,
      };
      await apiClient.put("/app-config/1", payload, { headers: h });
      setMsg("✅ Đã lưu cấu hình!");
    } catch(e) {
      setMsg("❌ " + (e.response?.data?.message || e.message));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const upd = useCallback((k, v) => {
    setConfig(c => ({ ...c, [k]: v }));
  }, []);

  if (!config) return <div style={{ color:"#666", padding:20 }}>Đang tải...</div>;

  const Section = ({ title, children }) => (
    <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
      marginBottom:16, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#888", fontSize:11, fontWeight:800, letterSpacing:2,
        margin:"0 0 16px", textTransform:"uppercase" }}>{title}</p>
      {children}
    </div>
  );

  const Field = ({ k, label, type="text" }) => {
    return (
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>{label}</p>
        <input
          type={type}
          defaultValue={config[k] || ""}
          onBlur={e => upd(k, type==="number" ? Number(e.target.value) : e.target.value)}
          key={k + "_" + (config[k] || "")}
          style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
            borderRadius:8, padding:"9px 12px", color:"white",
            fontSize:13, boxSizing:"border-box" }}/>
      </div>
    );
  };

  const Toggle = ({ k, label }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"10px 0", borderBottom:"1px solid #2a2a38" }}>
      <p style={{ color:"white", fontSize:13, margin:0 }}>{label}</p>
      <button onClick={() => upd(k, !config[k])}
        style={{ background: config[k] ? "rgba(76,175,80,0.2)" : "rgba(255,80,80,0.2)",
          border: `1px solid ${config[k] ? "#4CAF50" : "#ff6b6b"}`,
          color: config[k] ? "#4CAF50" : "#ff6b6b",
          borderRadius:8, padding:"6px 16px", fontWeight:700, cursor:"pointer", fontSize:12 }}>
        {config[k] ? "BẬT" : "TẮT"}
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>⚙️ Cấu hình App</h2>
        <button onClick={save}
          style={{ background:"#D4531C", border:"none", color:"white",
            borderRadius:10, padding:"10px 24px", fontWeight:800, cursor:"pointer" }}>
          💾 Lưu thay đổi
        </button>
      </div>
      {msg && <div style={{ padding:"10px 14px", borderRadius:10, marginBottom:16, fontSize:13,
        background: msg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(255,80,80,0.1)",
        color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b",
        border: `1px solid ${msg.includes("✅") ? "#4CAF50" : "#ff6b6b"}` }}>{msg}</div>}

      <Section title="Thông tin cơ bản">
        <Field k="app_name" label="Tên app" />
        <Field k="slogan" label="Slogan" />
        <Field k="store_address" label="Địa chỉ cửa hàng" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field k="hotline" label="Hotline" />
          <Field k="support_zalo" label="Zalo hỗ trợ" />
          <Field k="opening_time" label="Giờ mở cửa" />
          <Field k="closing_time" label="Giờ đóng cửa" />
        </div>
      </Section>

      <Section title="Bật / Tắt tính năng">
        <Toggle k="maintenance_mode" label="🔧 Chế độ bảo trì (tắt toàn bộ app)" />
        <Toggle k="ordering_enabled" label="🛍 Cho phép đặt hàng" />
        <Toggle k="payment_enabled" label="💳 Cho phép thanh toán" />
        <Toggle k="momo_enabled" label="💜 Thanh toán MoMo" />
        <Toggle k="minigame_enabled" label="🎮 Mini Game" />
        <Toggle k="leaderboard_enabled" label="🏆 Bảng xếp hạng" />
        <Toggle k="voucher_enabled" label="🎟 Voucher" />
        <Toggle k="delivery_enabled" label="🚀 Giao hàng" />
        <Toggle k="banner_enabled" label="🖼 Banner quảng cáo" />
        <Toggle k="popup_enabled" label="💬 Popup thông báo" />
      </Section>

      <Section title="Cấu hình game">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field k="spend_per_play" label="Chi tiêu / lượt chơi (đ)" type="number" />
          <Field k="minimum_order_amount" label="Đơn tối thiểu (đ)" type="number" />
        </div>
      </Section>

      <Section title="Popup thông báo">
        <Field k="popup_title" label="Tiêu đề popup" />
        <Field k="popup_content" label="Nội dung" />
        <Field k="popup_button_text" label="Text nút bấm" />
        <Field k="popup_button_link" label="Link nút bấm" />
      </Section>

      <Section title="Bảng xếp hạng tùy chỉnh">
        <Field k="custom_leaderboard_name" label="Tên bảng xếp hạng" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field k="custom_leaderboard_from" label="Từ ngày" type="date" />
          <Field k="custom_leaderboard_to" label="Đến ngày" type="date" />
        </div>
      </Section>

      <Section title="Bảng giá ship theo giá trị đơn hàng">
        <ShippingTiersConfig config={config} upd={upd} />
      </Section>

      <Section title="Ngân hàng / Chuyển khoản">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field k="bank_name" label="Tên ngân hàng" />
          <Field k="bank_account_number" label="Số tài khoản" />
          <Field k="bank_account_name" label="Chủ tài khoản" />
        </div>
      </Section>

      <Section title="📢 Gửi thông báo Flash Sales">
        <FlashSalesBroadcast token={token} h={h} />
      </Section>
    </div>
  );
}


function ShippingTiersConfig({ config, upd }) {
  const tiers = config.shipping_tiers || [
    { min_km: 0, max_km: 3,  min_order: 0,      max_order: 99999,    base_fee: 15000, fee_per_km: 0, label: '<3km, <100k' },
    { min_km: 0, max_km: 3,  min_order: 100000, max_order: 999999999, base_fee: 10000, fee_per_km: 0, label: '<3km, ≥100k' },
    { min_km: 3, max_km: 5,  min_order: 0,      max_order: 99999,    base_fee: 25000, fee_per_km: 0, label: '3-5km, <100k' },
    { min_km: 3, max_km: 5,  min_order: 100000, max_order: 199999,   base_fee: 15000, fee_per_km: 0, label: '3-5km, 100-200k' },
    { min_km: 3, max_km: 5,  min_order: 200000, max_order: 999999999, base_fee: 0,    fee_per_km: 0, label: '3-5km, ≥200k' },
    { min_km: 5, max_km: 8,  min_order: 0,      max_order: 99999,    base_fee: 35000, fee_per_km: 0, label: '5-8km, <100k' },
    { min_km: 5, max_km: 8,  min_order: 100000, max_order: 199999,   base_fee: 30000, fee_per_km: 0, label: '5-8km, 100-200k' },
    { min_km: 5, max_km: 8,  min_order: 200000, max_order: 499999,   base_fee: 20000, fee_per_km: 0, label: '5-8km, 200-500k' },
    { min_km: 5, max_km: 8,  min_order: 500000, max_order: 999999999, base_fee: 0,    fee_per_km: 0, label: '5-8km, ≥500k' },
    { min_km: 8, max_km: 10, min_order: 0,      max_order: 99999,    base_fee: 50000, fee_per_km: 0, label: '8-10km, <100k' },
    { min_km: 8, max_km: 10, min_order: 100000, max_order: 199999,   base_fee: 35000, fee_per_km: 0, label: '8-10km, 100-200k' },
    { min_km: 8, max_km: 10, min_order: 200000, max_order: 499999,   base_fee: 25000, fee_per_km: 0, label: '8-10km, 200-500k' },
    { min_km: 8, max_km: 10, min_order: 500000, max_order: 999999999, base_fee: 0,    fee_per_km: 0, label: '8-10km, ≥500k' },
  ];

  const updateTier = (i, field, val) => {
    const updated = [...tiers];
    updated[i] = { ...updated[i], [field]: Number(val) };
    upd('shipping_tiers', updated);
  };

  const addTier = () => {
    upd('shipping_tiers', [...tiers, { min_km:0, max_km:10, min_order:0, max_order:999999999, fee_per_km:0, base_fee:10000, label:'Mức mới' }]);
  };

  const removeTier = (i) => {
    upd('shipping_tiers', tiers.filter((_,idx) => idx !== i));
  };

  return (
    <div>
      <p style={{ color:'#666', fontSize:12, margin:'0 0 14px', lineHeight:1.5 }}>
        Cấu hình phí ship theo giá trị đơn hàng. Hệ thống sẽ tự chọn mức phù hợp khi tính ship.
      </p>
      {tiers.map((tier, i) => (
        <div key={i} style={{ background:'#12121a', borderRadius:10, padding:'14px',
          marginBottom:10, border:'1px solid #333' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <input defaultValue={tier.label || ""} onBlur={e => {
              const updated = [...tiers]; updated[i] = { ...updated[i], label: e.target.value };
              upd('shipping_tiers', updated);
            }} placeholder='Tên mức' style={{ flex:1, background:'#2a2a38', border:'1px solid #444',
              borderRadius:8, padding:'7px 10px', color:'white', fontSize:12 }}/>
            <button onClick={() => removeTier(i)} style={{ background:'rgba(255,80,80,0.15)',
              border:'1px solid #ff6b6b', color:'#ff6b6b', borderRadius:6,
              padding:'6px 10px', fontSize:11, cursor:'pointer' }}>🗑</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', gap:8 }}>
            {[
              ['min_km',     'Km từ'],
              ['max_km',     'Km đến'],
              ['min_order',  'Đơn từ (đ)'],
              ['max_order',  'Đơn đến (đ)'],
              ['base_fee',   'Phí ship (đ)'],
              ['fee_per_km', 'Phí / km (đ)'],
            ].map(([field, label]) => (
              <div key={field}>
                <p style={{ color:'#666', fontSize:10, margin:'0 0 3px' }}>{label}</p>
                <input type='number' defaultValue={tier[field]}
                  onBlur={e => updateTier(i, field, e.target.value)}
                  style={{ width:'100%', background:'#2a2a38', border:'1px solid #444',
                    borderRadius:8, padding:'7px 10px', color:'white',
                    fontSize:12, boxSizing:'border-box' }}/>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addTier} style={{ background:'rgba(255,255,255,0.06)',
        border:'1px solid #333', color:'#888', borderRadius:8,
        padding:'8px 16px', fontSize:12, cursor:'pointer', width:'100%', marginTop:4 }}>
        + Thêm mức giá
      </button>
    </div>
  );
}

function FlashSalesBroadcast({ token, h }) {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const send = async () => {
    if (!title) return;
    setSending(true);
    try {
      const api = (await import("@/infra/api/apiClient")).default;
      await api.post("/admin/broadcast", { title, message }, { headers: h });
      setMsg("✅ Đã gửi đến tất cả người dùng!");
      setTitle(""); setMessage("");
    } catch(e) { setMsg("❌ " + (e.response?.data?.message || e.message)); }
    setSending(false);
    setTimeout(() => setMsg(""), 4000);
  };
  return (
    <div>
      {msg && <div style={{ color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b", fontSize:13, marginBottom:10 }}>{msg}</div>}
      <div style={{ marginBottom:10 }}>
        <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Tiêu đề *</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="🔥 Flash Sale - Giảm 30% hôm nay!"
          style={{ width:"100%", background:"#2a2a38", border:"1px solid #333", borderRadius:8, padding:"9px 12px", color:"white", fontSize:13, boxSizing:"border-box" }}/>
      </div>
      <div style={{ marginBottom:14 }}>
        <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Nội dung</p>
        <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Mô tả chi tiết ưu đãi..."
          style={{ width:"100%", background:"#2a2a38", border:"1px solid #333", borderRadius:8, padding:"9px 12px", color:"white", fontSize:13, boxSizing:"border-box" }}/>
      </div>
      <button onClick={send} disabled={sending || !title}
        style={{ background: title ? "#D4531C" : "#333", border:"none", color:"white", borderRadius:10, padding:"10px 24px", fontWeight:800, cursor: title ? "pointer" : "not-allowed" }}>
        {sending ? "Đang gửi..." : "📢 Gửi ngay cho tất cả"}
      </button>
    </div>
  );
}
