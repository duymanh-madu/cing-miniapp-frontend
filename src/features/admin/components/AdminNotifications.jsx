import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const TABS = [
  { key:"broadcast", label:"📢 🔥 Flash Sales" },
  { key:"zalo",      label:"💬 Zalo OA" },
  { key:"push",      label:"🔔 Push Notif" },
];

export default function AdminNotifications({ token }) {
  const [tab, setTab] = useState("broadcast");
  const h = { Authorization: `Bearer ${token}` };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:18, fontWeight:900, margin:"0 0 16px" }}>🔔 Quản lý thông báo</h2>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ background: tab===t.key?"#D4531C":"rgba(255,255,255,0.07)",
              border:"none", borderRadius:20, padding:"7px 16px", cursor:"pointer",
              color: tab===t.key?"white":"#aaa", fontSize:12, fontWeight:700 }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "broadcast" && <BroadcastPanel h={h} />}
      {tab === "zalo"      && <ZaloPanel h={h} />}
      {tab === "push"      && <PushPanel h={h} />}
    </div>
  );
}

function BroadcastPanel({ h }) {
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [type, setType]       = useState("flash_sale");
  const [sending, setSending] = useState(false);
  const [msg, setMsg]         = useState("");

  const send = async () => {
    if (!title || !message) { setMsg("Nhập đầy đủ tieu de va noi dung"); return; }
    setSending(true); setMsg("");
    try {
      await apiClient.post("/admin/broadcast", { title, message, type }, { headers:h });
      setMsg("✅ Gửi thành công tới toàn server!");
      setTitle(""); setMessage("");
    } catch(e) { setMsg("❌ Lỗi: " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>📢 Broadcast Realtime tới toàn server</p>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#4CAF50", fontSize:12 }}>{msg}</div>}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Loại thông báo</p>
        <select value={type} onChange={e=>setType(e.target.value)}
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}>
          <option value="flash_sale">🔥 Flash Sale</option>
          <option value="event">🎉 Sự kiện</option>
          <option value="system">⚙️ Hệ thống</option>
          <option value="reward">🎁 Phần thưởng</option>
        </select>
      </div>
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Tiêu đề</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="🔥 🔥 Flash Sale hôm nay!"
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Nội dung</p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
      </div>
      <button onClick={send} disabled={sending}
        style={{ width:"100%", background:"linear-gradient(135deg,#D4531C,#FF6B35)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending ? "Đang gửi..." : "📢 Gửi ngay tới toàn server"}
      </button>
    </div>
  );
}

function ZaloPanel({ h }) {
  const [templates, setTemplates] = useState([]);
  const [segment, setSegment]     = useState("all");
  const [selTpl, setSelTpl]       = useState(null);
  const [sending, setSending]     = useState(false);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    apiClient.get("/admin/cdp/zbs-templates", { headers:h })
      .then(r => setTemplates(r.data?.data||[]));
  }, []);

  const send = async () => {
    if (!selTpl) { setMsg("Chọn template"); return; }
    setSending(true); setMsg("");
    try {
      const res = await apiClient.post("/admin/cdp/send-zbs-template",
        { template_id: selTpl.id, segment }, { headers:h });
      setMsg("Đã gửi tới " + (res.data?.sent||0) + " người!");
    } catch(e) { setMsg("Lỗi: " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#00d4ff", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>💬 Gửi tin Zalo OA</p>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#4CAF50", fontSize:12 }}>{msg}</div>}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Phân khúc người nhận</p>
        <select value={segment} onChange={e=>setSegment(e.target.value)}
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}>
          <option value="all">👥 Tất cả thành viên</option>
          <option value="diamond">💎 Hạng Kim Cương</option>
          <option value="gold">🥇 Hạng Vàng</option>
          <option value="inactive_7">😴 Không mua 7 ngày</option>
          <option value="inactive_30">💤 Không mua 30 ngày</option>
          <option value="birthday">🎂 Sinh nhật tháng này</option>
        </select>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 8px" }}>Chọn template</p>
        {templates.length === 0
          ? <p style={{ color:"#555", fontSize:12 }}>Chưa có template. Tạo trong tab CDP.</p>
          : templates.map(t => (
            <div key={t.id} onClick={() => setSelTpl(t)}
              style={{ background: selTpl?.id===t.id?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",
                border:`1px solid ${selTpl?.id===t.id?"#00d4ff":"#2a2a38"}`,
                borderRadius:10, padding:"10px 14px", cursor:"pointer", marginBottom:6 }}>
              <p style={{ color:"white", fontSize:12, fontWeight:700, margin:0 }}>{t.name}</p>
            </div>
          ))}
      </div>
      <button onClick={send} disabled={sending||!selTpl}
        style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00d4ff)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending ? "Đang gửi..." : "💬 Gửi tin Zalo OA"}
      </button>
    </div>
  );
}

function PushPanel({ h }) {
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId]   = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg]         = useState("");

  const send = async () => {
    if (!title || !message) { setMsg("Nhập đầy đủ"); return; }
    setSending(true); setMsg("");
    try {
      await apiClient.post("/admin/cdp/send-notification",
        { title, message, segment_key: userId ? "custom" : "all", custom_phones: userId ? [userId] : [] }, { headers:h });
      setMsg("✅ Đã gửi push notification!");
    } catch(e) { setMsg("Lỗi: " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#4CAF50", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>🔔 Push Notification</p>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#4CAF50", fontSize:12 }}>{msg}</div>}
      {[
        { label:"SĐT (để trống = gửi tất cả)", val:userId, set:setUserId, ph:"0984966336" },
        { label:"Tiêu đề", val:title, set:setTitle, ph:"Tiêu đề thong bao" },
        { label:"Nội dung", val:message, set:setMessage, ph:"Nội dung...", area:true },
      ].map((f,i) => (
        <div key={i} style={{ marginBottom:12 }}>
          <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>{f.label}</p>
          {f.area
            ? <textarea value={f.val} onChange={e=>f.set(e.target.value)} rows={3} placeholder={f.ph}
                style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
                  padding:"8px 12px", color:"white", fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
            : <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
                  padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          }
        </div>
      ))}
      <button onClick={send} disabled={sending}
        style={{ width:"100%", background:"linear-gradient(135deg,#2e7d32,#4CAF50)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending ? "Đang gửi..." : "Gui 🔔 Push Notification"}
      </button>
    </div>
  );
}
