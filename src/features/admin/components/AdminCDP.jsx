import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

export default function AdminCDP({ token }) {
  const [segments, setSegments]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [users, setUsers]           = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [title, setTitle]           = useState("");
  const [message, setMessage]       = useState("");
  const [sending, setSending]       = useState(false);
  const [msg, setMsg]               = useState("");
  const [preview, setPreview]       = useState(false);
  const [customPhones, setCustomPhones] = useState([]);
  const [customInput, setCustomInput]   = useState("");
  const fileRef = useRef();
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/cdp/segments", { headers: h })
      .then(r => setSegments(r.data?.data || []))
      .catch(console.error);
  }, []);

  const selectSegment = async (seg) => {
    setSelected(seg);
    setUsers([]);
    if (seg.key === "birthday" || seg.key === "custom") return;
    setLoadingUsers(true);
    try {
      const r = await apiClient.get(`/admin/cdp/segment-users/${seg.key}?limit=10`, { headers: h });
      setUsers(r.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoadingUsers(false); }
  };

  const sendNotif = async () => {
    if (!selected || !title || !message) return;
    setSending(true); setMsg("");
    try {
      const res = await apiClient.post("/admin/cdp/send-notification", {
        segment_key: selected.key, title, message,
      }, { headers: h });
      setMsg(`✅ ${res.data?.message}`);
      setTitle(""); setMessage(""); setPreview(false);
    } catch(e) {
      setMsg("❌ " + (e.response?.data?.error || e.message));
    } finally {
      setSending(false);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 4px" }}>
          📡 CDP — Customer Data Platform
        </h2>
        <p style={{ color:"#666", fontSize:12, margin:0 }}>
          Phân khúc khách hàng và gửi thông báo có mục tiêu
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20 }}>

        {/* SEGMENT LIST */}
        <div>
          <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:2,
            margin:"0 0 12px", textTransform:"uppercase" }}>Phân khúc</p>
          {segments.map(seg => (
            <div key={seg.key}
              onClick={() => selectSegment(seg)}
              style={{
                background: selected?.key === seg.key ? "rgba(212,83,28,0.15)" : "#1a1a24",
                border: `1px solid ${selected?.key === seg.key ? "#D4531C" : "#2a2a38"}`,
                borderRadius:12, padding:"14px 16px", marginBottom:8, cursor:"pointer",
                transition:"all 0.2s",
              }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{seg.icon}</span>
                  <div>
                    <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>
                      {seg.label}
                    </p>
                    {seg.note && (
                      <p style={{ color:"#666", fontSize:10, margin:"2px 0 0" }}>{seg.note}</p>
                    )}
                  </div>
                </div>
                <div style={{ background: seg.color + "22", borderRadius:8,
                  padding:"4px 10px", textAlign:"center" }}>
                  <p style={{ color:seg.color, fontSize:16, fontWeight:900, margin:0 }}>
                    {seg.count.toLocaleString()}
                  </p>
                  <p style={{ color:seg.color + "88", fontSize:9, margin:0 }}>khách</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div>
          {!selected ? (
            <div style={{ background:"#1a1a24", borderRadius:14, padding:"60px 24px",
              textAlign:"center", border:"1px solid #2a2a38" }}>
              <p style={{ fontSize:40, margin:"0 0 12px" }}>👈</p>
              <p style={{ color:"#666", fontSize:14 }}>Chọn phân khúc để bắt đầu</p>
            </div>
          ) : (
            <>
              {/* Custom segment UI */}
              {selected.key === "custom" && (
                <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
                  marginBottom:16, border:"1px solid #2a2a38" }}>
                  <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 14px" }}>
                    📋 Danh sách khách hàng tuỳ chỉnh
                  </p>

                  {/* Nhập SĐT */}
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    <input
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && customInput.trim()) {
                          const phone = customInput.trim().replace(/D/g,"");
                          if (phone && !customPhones.includes(phone)) {
                            setCustomPhones(p => [...p, phone]);
                          }
                          setCustomInput("");
                        }
                      }}
                      placeholder="Nhập SĐT rồi Enter..."
                      style={{ flex:1, background:"#2a2a38", border:"1px solid #333",
                        borderRadius:8, padding:"9px 12px", color:"white", fontSize:13 }}
                    />
                    <button onClick={() => {
                      const phone = customInput.trim().replace(/D/g,"");
                      if (phone && !customPhones.includes(phone)) {
                        setCustomPhones(p => [...p, phone]);
                      }
                      setCustomInput("");
                    }} style={{ background:"#D4531C", border:"none", color:"white",
                      borderRadius:8, padding:"9px 16px", fontWeight:700, cursor:"pointer" }}>
                      Thêm
                    </button>
                    <button onClick={() => fileRef.current?.click()}
                      style={{ background:"rgba(255,255,255,0.1)", border:"1px solid #333",
                        color:"white", borderRadius:8, padding:"9px 16px", fontSize:12,
                        fontWeight:700, cursor:"pointer" }}>
                      📊 Excel
                    </button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv"
                      style={{ display:"none" }}
                      onChange={async e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const buf = await file.arrayBuffer();
                        const wb  = XLSX.read(buf);
                        const ws  = wb.Sheets[wb.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(ws, { header:1 });
                        const phones = rows.flat()
                          .map(v => String(v || "").replace(/D/g,""))
                          .filter(v => v.length >= 9);
                        setCustomPhones(prev => [...new Set([...prev, ...phones])]);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {/* Danh sách SĐT */}
                  {customPhones.length > 0 && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"center", marginBottom:8 }}>
                        <p style={{ color:"#888", fontSize:11, margin:0 }}>
                          {customPhones.length} khách hàng
                        </p>
                        <button onClick={() => setCustomPhones([])}
                          style={{ background:"none", border:"none", color:"#ff6b6b",
                            fontSize:11, cursor:"pointer" }}>
                          Xóa tất cả
                        </button>
                      </div>
                      <div style={{ maxHeight:150, overflowY:"auto",
                        display:"flex", flexWrap:"wrap", gap:6 }}>
                        {customPhones.map((p, i) => (
                          <div key={i} style={{ background:"#2a2a38", borderRadius:6,
                            padding:"4px 10px", display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ color:"white", fontSize:12 }}>{p}</span>
                            <button onClick={() => setCustomPhones(prev => prev.filter((_,idx) => idx !== i))}
                              style={{ background:"none", border:"none", color:"#ff6b6b",
                                fontSize:12, cursor:"pointer", padding:0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Segment info */}
              <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
                marginBottom:16, border:"1px solid #2a2a38" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <span style={{ fontSize:28 }}>{selected.icon}</span>
                  <div>
                    <p style={{ color:"white", fontSize:16, fontWeight:800, margin:0 }}>
                      {selected.label}
                    </p>
                    <p style={{ color:"#666", fontSize:12, margin:"2px 0 0" }}>
                      {selected.count.toLocaleString()} khách hàng trong phân khúc này
                    </p>
                  </div>
                </div>

                {/* Preview users */}
                {loadingUsers ? (
                  <p style={{ color:"#666", fontSize:13 }}>Đang tải danh sách...</p>
                ) : users.length > 0 && (
                  <div>
                    <p style={{ color:"#888", fontSize:11, fontWeight:700, letterSpacing:1,
                      margin:"0 0 8px", textTransform:"uppercase" }}>
                      Xem trước (10 người đầu)
                    </p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {users.slice(0, 10).map((u, i) => (
                        <div key={i} style={{ background:"#12121a", borderRadius:8,
                          padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:14,
                            background:"rgba(212,83,28,0.2)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:12, color:"#D4531C", fontWeight:800, flexShrink:0 }}>
                            {(u.zalo_name || u.user_id || "?")[0]?.toUpperCase()}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <p style={{ color:"white", fontSize:11, fontWeight:700,
                              margin:0, overflow:"hidden", whiteSpace:"nowrap",
                              textOverflow:"ellipsis" }}>
                              {u.zalo_name || u.user_id}
                            </p>
                            <p style={{ color:"#666", fontSize:10, margin:0 }}>
                              {fmt(u.crm_spend_alltime)} · {u.crm_orders_alltime} đơn
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compose notification */}
              <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
                border:"1px solid #2a2a38" }}>
                <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 16px" }}>
                  📝 Soạn thông báo
                </p>

                {msg && (
                  <div style={{ background: msg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
                    border: `1px solid ${msg.includes("✅") ? "#4CAF50" : "#f44336"}`,
                    borderRadius:8, padding:"10px 14px", marginBottom:14,
                    color: msg.includes("✅") ? "#4CAF50" : "#f44336", fontSize:13 }}>
                    {msg}
                  </div>
                )}

                <div style={{ marginBottom:12 }}>
                  <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Tiêu đề *</p>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="VD: 🎁 Ưu đãi đặc biệt dành cho bạn!"
                    style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                      borderRadius:8, padding:"10px 12px", color:"white",
                      fontSize:13, boxSizing:"border-box" }}/>
                </div>

                <div style={{ marginBottom:16 }}>
                  <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Nội dung *</p>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="VD: Chúng tôi nhớ bạn! Ghé Cing Hu Tang hôm nay và nhận ngay ưu đãi đặc biệt..."
                    rows={3}
                    style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                      borderRadius:8, padding:"10px 12px", color:"white", fontSize:13,
                      boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
                </div>

                {/* Preview */}
                {preview && title && message && (
                  <div style={{ background:"#12121a", borderRadius:12, padding:"14px",
                    marginBottom:16, border:"1px solid #333" }}>
                    <p style={{ color:"#888", fontSize:10, fontWeight:700,
                      margin:"0 0 10px", letterSpacing:1 }}>XEM TRƯỚC THÔNG BÁO</p>
                    <div style={{ background:"#1a1a24", borderRadius:10, padding:"12px 14px" }}>
                      <p style={{ color:"white", fontSize:13, fontWeight:700, margin:"0 0 4px" }}>
                        {title}
                      </p>
                      <p style={{ color:"#888", fontSize:12, margin:0, lineHeight:1.5 }}>
                        {message}
                      </p>
                    </div>
                    <p style={{ color:"#666", fontSize:11, margin:"8px 0 0" }}>
                      Sẽ gửi đến: <strong style={{ color:"#D4531C" }}>
                        {selected.count.toLocaleString()} khách
                      </strong> trong phân khúc "{selected.label}"
                    </p>
                  </div>
                )}

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setPreview(p => !p)}
                    disabled={!title || !message}
                    style={{ flex:1, background:"rgba(255,255,255,0.06)",
                      border:"1px solid #333", color: (!title || !message) ? "#444" : "white",
                      borderRadius:8, padding:"10px", fontSize:13,
                      fontWeight:700, cursor: (!title || !message) ? "default" : "pointer" }}>
                    {preview ? "Ẩn xem trước" : "👁 Xem trước"}
                  </button>
                  <button onClick={sendNotif}
                    disabled={sending || !title || !message}
                    style={{ flex:2, background: (sending || !title || !message) ? "#333" : "#D4531C",
                      border:"none", color:"white", borderRadius:8, padding:"10px",
                      fontSize:13, fontWeight:800,
                      cursor: (sending || !title || !message) ? "default" : "pointer" }}>
                    {sending ? "Đang gửi..." : `📡 Gửi đến ${selected.count.toLocaleString()} khách`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
