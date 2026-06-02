import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const TABS = [
  { key:"broadcast", label:"📢 Flash Sales" },
  { key:"zalo",      label:"💬 Zalo OA" },
  { key:"push",      label:"🔔 Push Notif" },
];

const inp = { width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8, padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" };

function MsgBox({ msg }) {
  if (!msg) return null;
  const ok = msg.startsWith("ok:");
  return (
    <div style={{ background:ok?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)",
      border:`1px solid ${ok?"#4CAF50":"#ff6b6b"}`,
      borderRadius:8, padding:"10px 14px", marginBottom:14,
      color:ok?"#4CAF50":"#ff6b6b", fontSize:12 }}>
      {msg.slice(3)}
    </div>
  );
}

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
    if (!title || !message) { setMsg("err:Nhập đầy đủ tiêu đề và nội dung"); return; }
    setSending(true); setMsg("");
    try {
      await apiClient.post("/admin/broadcast", { title, message, type }, { headers:h });
      setMsg("ok:Gửi thành công tới toàn server!");
      setTitle(""); setMessage("");
    } catch(e) { setMsg("err:" + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  const ok = msg.startsWith("ok:");
  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>📢 Broadcast Realtime tới toàn server</p>
      {msg && <div style={{ background:ok?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)", border:`1px solid ${ok?"#4CAF50":"#ff6b6b"}`, borderRadius:8, padding:"10px 14px", marginBottom:14, color:ok?"#4CAF50":"#ff6b6b", fontSize:12 }}>{msg.slice(4)}</div>}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Loại thông báo</p>
        <select value={type} onChange={e=>setType(e.target.value)} style={inp}>
          <option value="flash_sale">🔥 Flash Sale</option>
          <option value="event">🎉 Sự kiện</option>
          <option value="system">⚙️ Hệ thống</option>
          <option value="reward">🎁 Phần thưởng</option>
        </select>
      </div>
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Tiêu đề</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="🔥 Flash Sale hôm nay!" style={inp}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Nội dung</p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          placeholder="Nội dung thông báo..."
          style={{ ...inp, resize:"vertical" }}/>
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
  const [mode, setMode]               = useState("zbs");
  const [templates, setTemplates]     = useState([]);
  const [segment, setSegment]         = useState("all");
  const [selTpl, setSelTpl]           = useState(null);
  const [customPhones, setCustomPhones] = useState("");
  const [title, setTitle]             = useState("");
  const [message, setMessage]         = useState("");
  const [sending, setSending]         = useState(false);
  const [msg, setMsg]                 = useState("");

  useEffect(() => {
    apiClient.get("/admin/cdp/zbs-templates", { headers:h })
      .then(r => {
        const data = r.data?.data || [];
        setTemplates(data);
      })
      .catch(() => {});
  }, []);

  const parsePhones = () => customPhones.split(/[,\n]/).map(p => p.trim()).filter(Boolean);

  const sendZBS = async () => {
    if (!selTpl) { setMsg("err:Vui lòng chọn template ZBS"); return; }
    setSending(true); setMsg("");
    try {
      const phones = parsePhones();
      const body = phones.length
        ? { template_id: selTpl.id, custom_phones: phones }
        : { template_id: selTpl.id, segment_key: segment };
      const res = await apiClient.post("/admin/cdp/send-zbs-template", body, { headers:h });
      setMsg("ok:" + (res.data?.message || "Đã gửi thành công!"));
    } catch(e) { setMsg("err:Lỗi: " + (e.response?.data?.error || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 5000); }
  };

  const sendUID = async () => {
    if (!title || !message) { setMsg("err:Nhập đầy đủ tiêu đề và nội dung"); return; }
    setSending(true); setMsg("");
    try {
      const phones = parsePhones();
      const body = phones.length
        ? { title, message, custom_phones: phones }
        : { title, message, segment_key: segment };
      const res = await apiClient.post("/admin/cdp/send-uid", body, { headers:h });
      setMsg("ok:" + (res.data?.message || "Đang gửi..."));
    } catch(e) { setMsg("err:Lỗi: " + (e.response?.data?.error || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 5000); }
  };

  const ok = msg.startsWith("ok:");
  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      {/* Mode selector */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[
          { k:"zbs", label:"ZBS Template", desc:"Tin có template, gửi qua Zalo Broadcast" },
          { k:"uid", label:"OA Message",   desc:"Tin tự do, gửi qua CS message OA" },
        ].map(m => (
          <button key={m.k} onClick={() => setMode(m.k)}
            style={{ flex:1, background:mode===m.k?"rgba(0,212,255,0.15)":"rgba(255,255,255,0.04)",
              border:`1px solid ${mode===m.k?"#00d4ff":"#2a2a38"}`,
              borderRadius:10, padding:"10px 12px", cursor:"pointer", textAlign:"left" }}>
            <p style={{ color:mode===m.k?"#00d4ff":"#aaa", fontSize:12, fontWeight:800, margin:"0 0 2px" }}>{m.label}</p>
            <p style={{ color:"#555", fontSize:10, margin:0 }}>{m.desc}</p>
          </button>
        ))}
      </div>

      {msg && <div style={{ background:ok?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)", border:`1px solid ${ok?"#4CAF50":"#ff6b6b"}`, borderRadius:8, padding:"10px 14px", marginBottom:14, color:ok?"#4CAF50":"#ff6b6b", fontSize:12 }}>{msg.slice(4)}</div>}

      {/* Phân khúc */}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Phân khúc (bỏ qua nếu nhập SĐT cụ thể)</p>
        <select value={segment} onChange={e=>setSegment(e.target.value)} style={inp}>
          <option value="all">👥 Tất cả thành viên</option>
          <option value="diamond">💎 Hạng Kim Cương</option>
          <option value="gold">🥇 Hạng Vàng</option>
          <option value="inactive_7">😴 Không mua 7 ngày</option>
          <option value="inactive_30">💤 Không mua 30 ngày</option>
          <option value="birthday">🎂 Sinh nhật tháng này</option>
        </select>
      </div>

      {/* SĐT cụ thể */}
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>
          SĐT cụ thể (mỗi số 1 dòng hoặc cách nhau dấu phẩy — ưu tiên hơn phân khúc)
        </p>
        <textarea value={customPhones} onChange={e=>setCustomPhones(e.target.value)} rows={3}
          placeholder={"0984966336\n0961835636\n..."}
          style={{ ...inp, resize:"vertical" }}/>
      </div>

      {/* ZBS Template selector */}
      {mode === "zbs" && (
        <div style={{ marginBottom:16 }}>
          <p style={{ color:"#888", fontSize:11, margin:"0 0 8px" }}>Chọn template ZBS</p>
          {templates.length === 0
            ? <p style={{ color:"#555", fontSize:12, padding:"12px", background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
                Chưa có template. Tạo trong tab CDP.
              </p>
            : templates.map(t => (
              <div key={t.id}
                onClick={() => setSelTpl(prev => prev?.id === t.id ? null : t)}
                style={{ background:selTpl?.id===t.id?"rgba(0,212,255,0.12)":"rgba(255,255,255,0.04)",
                  border:`2px solid ${selTpl?.id===t.id?"#00d4ff":"#2a2a38"}`,
                  borderRadius:10, padding:"12px 16px", cursor:"pointer", marginBottom:8,
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p style={{ color:"white", fontSize:13, fontWeight:700, margin:"0 0 2px" }}>{t.name}</p>
                  {t.description && <p style={{ color:"#666", fontSize:11, margin:0 }}>{t.description}</p>}
                </div>
                {selTpl?.id === t.id && <span style={{ color:"#00d4ff", fontSize:18 }}>✓</span>}
              </div>
            ))}
          {selTpl && (
            <p style={{ color:"#00d4ff", fontSize:11, margin:"4px 0 0" }}>
              Đã chọn: <strong>{selTpl.name}</strong>
            </p>
          )}
        </div>
      )}

      {/* OA Message fields */}
      {mode === "uid" && (
        <>
          <div style={{ marginBottom:12 }}>
            <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Tiêu đề</p>
            <input value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="Tiêu đề tin nhắn" style={inp}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Nội dung</p>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
              placeholder="Nội dung tin nhắn OA..."
              style={{ ...inp, resize:"vertical" }}/>
          </div>
        </>
      )}

      <button onClick={mode==="zbs" ? sendZBS : sendUID} disabled={sending}
        style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00d4ff)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending ? "Đang gửi..." : mode==="zbs" ? "📤 Gửi ZBS Template" : "💬 Gửi OA Message"}
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
    if (!title || !message) { setMsg("err:Nhập đầy đủ tiêu đề và nội dung"); return; }
    setSending(true); setMsg("");
    try {
      await apiClient.post("/admin/cdp/send-notification",
        { title, message, segment_key: userId ? "custom" : "all", custom_phones: userId ? [userId] : [] },
        { headers:h });
      setMsg("ok:Đã gửi push notification thành công!");
    } catch(e) { setMsg("err:Lỗi: " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  const ok = msg.startsWith("ok:");
  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#4CAF50", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>🔔 Push Notification trong App</p>
      {msg && <div style={{ background:ok?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)", border:`1px solid ${ok?"#4CAF50":"#ff6b6b"}`, borderRadius:8, padding:"10px 14px", marginBottom:14, color:ok?"#4CAF50":"#ff6b6b", fontSize:12 }}>{msg.slice(4)}</div>}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>SĐT người nhận (để trống = gửi tất cả)</p>
        <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="0984966336" style={inp}/>
      </div>
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Tiêu đề</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tiêu đề thông báo" style={inp}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Nội dung</p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          placeholder="Nội dung thông báo..."
          style={{ ...inp, resize:"vertical" }}/>
      </div>
      <button onClick={send} disabled={sending}
        style={{ width:"100%", background:"linear-gradient(135deg,#2e7d32,#4CAF50)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending ? "Đang gửi..." : "🔔 Gửi Push Notification"}
      </button>
    </div>
  );
}
