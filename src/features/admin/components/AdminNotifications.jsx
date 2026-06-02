import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const TABS = [
  { key:"broadcast", label:"📢 Flash Sales" },
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
    if (!title || !message) { setMsg("Nhap day du tieu de va noi dung"); return; }
    setSending(true); setMsg("");
    try {
      await apiClient.post("/admin/broadcast", { title, message, type }, { headers:h });
      setMsg("ok Gửi thành công tới toàn server!");
      setTitle(""); setMessage("");
    } catch(e) { setMsg("loi " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>Broadcast Realtime toi toan server</p>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#4CAF50", fontSize:12 }}>{msg}</div>}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Loai thong bao</p>
        <select value={type} onChange={e=>setType(e.target.value)}
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}>
          <option value="flash_sale">Flash Sale</option>
          <option value="event">Su kien</option>
          <option value="system">He thong</option>
          <option value="reward">Phan thuong</option>
        </select>
      </div>
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Tieu de</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Flash Sale hom nay!"
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Noi dung</p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
      </div>
      <button onClick={send} disabled={sending}
        style={{ width:"100%", background:"linear-gradient(135deg,#D4531C,#FF6B35)", border:"none",
          borderRadius:10, padding:"12px", color:"white", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {sending ? "Dang gui..." : "Gui ngay toi toan server"}
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
    if (!selTpl) { setMsg("Chon template"); return; }
    setSending(true); setMsg("");
    try {
      const res = await apiClient.post("/admin/cdp/send-zbs-template",
        { template_id: selTpl.id, segment }, { headers:h });
      setMsg("Da gui toi " + (res.data?.sent||0) + " nguoi!");
    } catch(e) { setMsg("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#00d4ff", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>Gui tin Zalo OA</p>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#4CAF50", fontSize:12 }}>{msg}</div>}
      <div style={{ marginBottom:12 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 4px" }}>Phan khuc nguoi nhan</p>
        <select value={segment} onChange={e=>setSegment(e.target.value)}
          style={{ width:"100%", background:"#0d0d18", border:"1px solid #2a2a38", borderRadius:8,
            padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}>
          <option value="all">Tat ca thanh vien</option>
          <option value="diamond">Hang Kim Cuong</option>
          <option value="gold">Hang Vang</option>
          <option value="inactive_7">Khong mua 7 ngay</option>
          <option value="inactive_30">Khong mua 30 ngay</option>
          <option value="birthday">Sinh nhat thang nay</option>
        </select>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:11, margin:"0 0 8px" }}>Chon template</p>
        {templates.length === 0
          ? <p style={{ color:"#555", fontSize:12 }}>Chua co template. Tao trong tab CDP.</p>
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
        {sending ? "Dang gui..." : "Gui tin Zalo OA"}
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
    if (!title || !message) { setMsg("Nhap day du"); return; }
    setSending(true); setMsg("");
    try {
      await apiClient.post("/admin/cdp/send-notification",
        { title, message, user_id: userId||null }, { headers:h });
      setMsg("Da gui push notification!");
    } catch(e) { setMsg("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setSending(false); setTimeout(()=>setMsg(""), 4000); }
  };

  return (
    <div style={{ background:"#1a1a24", borderRadius:16, padding:20, border:"1px solid #2a2a38" }}>
      <p style={{ color:"#4CAF50", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>Push Notification</p>
      {msg && <div style={{ background:"rgba(76,175,80,0.1)", border:"1px solid #4CAF50",
        borderRadius:8, padding:"10px 14px", marginBottom:14, color:"#4CAF50", fontSize:12 }}>{msg}</div>}
      {[
        { label:"SDT (bo trong = gui tat ca)", val:userId, set:setUserId, ph:"0984966336" },
        { label:"Tieu de", val:title, set:setTitle, ph:"Tieu de thong bao" },
        { label:"Noi dung", val:message, set:setMessage, ph:"Noi dung...", area:true },
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
        {sending ? "Dang gui..." : "Gui Push Notification"}
      </button>
    </div>
  );
}
