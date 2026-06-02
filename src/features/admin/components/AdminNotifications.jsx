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
  const [mode, setMode]           = useState("zbs");
  const [templates, setTemplates] = useState([]);
  const [segment, setSegment]     = useState("all");
  const [selTpl, setSelTpl]       = useState(null);
  const [customPhones, setCustomPhones] = useState("");
  const [title, setTitle]         = useState("");
  const [message, setMessage]     = useState("");
  const [sending, setSending]     = useState(false);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    apiClient.get("/admin/cdp/zbs-templates", { headers:h })
      .then(r => setTemplates(r.data?.data||[]));
  }, []);

  const parsePhones = () => customPhones.split(/[,\n]/).map(p=>p.trim()).filter(Boolean);

  const sendZBS = async () => {
    if (!selTpl) { setMsg("Chon template"); return; }
    setSending(true); setMsg("");
    try {
      const phones = parsePhones();
      const body = phones.length ? { template_id: selTpl.id, custom_phones: phones } : { template_id: selTpl.id, segment_key: segment };
      const res = await apiClient.post("/admin/cdp/send-zbs-template", body, { headers:h });
      setMsg("OK " + (res.data?.message || "Da gui!"));
    } catch(e) { setMsg("LOI " + (e.response?.data?.error || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 5000); }
  };

  const sendUID = async () => {
    if (!title || !message) { setMsg("LOI Nhap day du tieu de va noi dung"); return; }
    setSending(true); setMsg("");
    try {
      const phones = parsePhones();
      const body = phones.length ? { title, message, custom_phones: phones } : { title, message, segment_key: segment };
      const res = await apiClient.post("/admin/cdp/send-uid", body, { headers:h });
      setMsg("OK " + (res.data?.message || "Dang gui..."));
    } catch(e) { setMsg("LOI " + (e.response?.data?.error || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 5000); }
  };

  const inp = { width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8, padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[{k:"zbs",label:"ZBS Template"},{k:"uid",label:"OA Message"}].map(m=>(
          <button key={m.k} onClick={()=>setMode(m.k)}
            style={{ flex:1, background:mode===m.k?"rgba(0,212,255,0.15)":"rgba(255,255,255,0.04)",
              border:"1px solid "+(mode===m.k?"#00d4ff":"#2a2a38"), borderRadius:10,
              padding:"10px", cursor:"pointer", color:mode===m.k?"#00d4ff":"#888",
              fontSize:12, fontWeight:800 }}>{m.label}</button>
        ))}
      </div>

      {msg && <div style={{ background:msg.startsWith("OK")?"rgba(76,175,80,0.1)":"rgba(255,80,80,0.1)",
        border:"1px solid "+(msg.startsWith("OK")?"#4CAF50":"#ff6b6b"),
        borderRadius:8, padding:"10px 14px", marginBottom:14,
        color:msg.startsWith("OK")?"#4CAF50":"#ff6b6b", fontSize:12 }}>
        {msg.startsWith("OK")?"OK "+msg.slice(2):"LOI "+msg.slice(3)}
      </div>}

      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Phan khuc (bo qua neu nhap SDT cu the)</p>
        <select value={segment} onChange={e=>setSegment(e.target.value)} style={inp}>
          <option value="all">Tat ca thanh vien</option>
          <option value="diamond">Hang Kim Cuong</option>
          <option value="gold">Hang Vang</option>
          <option value="inactive_7">Khong mua 7 ngay</option>
          <option value="inactive_30">Khong mua 30 ngay</option>
        </select>
      </div>

      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>SDT cu the (moi so 1 dong hoac cach dau phay)</p>
        <textarea value={customPhones} onChange={e=>setCustomPhones(e.target.value)} rows={3}
          placeholder="0984966336&#10;0961835636" style={{ ...inp, resize:"vertical" }}/>
      </div>

      {mode === "zbs" && (
        <div style={{ marginBottom:16 }}>
          <p style={{ color:"#888", fontSize:11, margin:"0 0 8px" }}>Chon template ZBS</p>
          {templates.length === 0
            ? <p style={{ color:"#555", fontSize:12 }}>Chua co template.</p>
            : templates.map(t=>(
              <div key={t.id} onClick={()=>setSelTpl(t)}
                style={{ background:selTpl?.id===t.id?"rgba(0,212,255,0.1)":"rgba(255,255,255,0.04)",
                  border:"1px solid "+(selTpl?.id===t.id?"#00d4ff":"#2a2a38"),
                  borderRadius:10, padding:"10px 14px", cursor:"pointer", marginBottom:6 }}>
                <p style={{ color:"white", fontSize:12, fontWeight:700, margin:0 }}>{t.name}</p>
              </div>
            ))}
        </div>
      )}

      {mode === "uid" && (<>
        <div style={{ marginBottom:12 }}>
          <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Tieu de</p>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tieu de" style={inp}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Noi dung</p>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
            placeholder="Noi dung..." style={{ ...inp, resize:"vertical" }}/>
        </div>
      </>)}

      <button onClick={mode==="zbs"?sendZBS:sendUID} disabled={sending}
        style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00d4ff)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending?"Dang gui...":mode==="zbs"?"Gui ZBS Template":"Gui OA Message"}
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
