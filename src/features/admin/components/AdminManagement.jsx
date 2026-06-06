import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const ROLES = [
  { value: "super_admin", label: "Super Admin", color: "#FFD700", icon: "👑" },
  { value: "manager",     label: "Manager",     color: "#D4531C", icon: "🧑‍💼" },
  { value: "cashier",     label: "Thu ngân",    color: "#2196F3", icon: "💳" },
  { value: "kitchen",     label: "Bếp",         color: "#FF9800", icon: "👨‍🍳" },
  { value: "shipper",     label: "Shipper",     color: "#4CAF50", icon: "🚀" },
  { value: "marketing",   label: "Marketing",   color: "#9C27B0", icon: "📢" },
];

const ROLE_PERMISSIONS = {
  super_admin: ["Toàn quyền hệ thống"],
  manager:     ["Xem dashboard", "Quản lý đơn hàng", "Xem thanh toán", "Giao hàng", "Analytics", "Thông báo", "Chiến dịch"],
  cashier:     ["Xem dashboard", "Quản lý đơn hàng", "Xem thanh toán"],
  kitchen:     ["Xem đơn hàng", "Cập nhật trạng thái bếp"],
  shipper:     ["Xem giao hàng", "Cập nhật giao hàng"],
  marketing:   ["Xem dashboard", "Analytics", "Chiến dịch", "Thông báo"],
};

const inp = {
  width: "100%", background: "#0d0d18", border: "1px solid #2a2a38",
  borderRadius: 8, padding: "9px 12px", color: "white",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};

export default function AdminManagement({ token }) {
  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("list");
  const [msg, setMsg]             = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]           = useState({ username: "", password: "", role: "manager" });
  const [saving, setSaving]       = useState(false);
  const [pwForm, setPwForm]       = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwMsg, setPwMsg]         = useState("");
  const [resetId, setResetId]     = useState(null);
  const [resetPw, setResetPw]     = useState("");
  const h = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const res = await apiClient.get("/admin/auth/list", { headers: h });
      setAdmins(res.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, ms = 4000) => {
    setMsg(text);
    setTimeout(() => setMsg(""), ms);
  };

  const createAdmin = async () => {
    if (!form.username || !form.password || !form.role) {
      showMsg("❌ Vui lòng nhập đầy đủ thông tin"); return;
    }
    if (form.password.length < 6) {
      showMsg("❌ Mật khẩu phải ít nhất 6 ký tự"); return;
    }
    setSaving(true);
    try {
      await apiClient.post("/admin/auth/create", form, { headers: h });
      showMsg("✅ Tạo tài khoản thành công!");
      setForm({ username: "", password: "", role: "manager" });
      setShowCreate(false);
      load();
    } catch(e) {
      showMsg("❌ " + (e.response?.data?.message || e.message));
    } finally { setSaving(false); }
  };

  const toggleAdmin = async (admin) => {
    try {
      const res = await apiClient.put(`/admin/auth/toggle/${admin.id}`, {}, { headers: h });
      showMsg("✅ " + res.data?.message);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
  };

  const changePassword = async () => {
    if (!pwForm.current_password || !pwForm.new_password) {
      setPwMsg("❌ Nhập đầy đủ mật khẩu"); return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMsg("❌ Mật khẩu xác nhận không khớp"); return;
    }
    if (pwForm.new_password.length < 6) {
      setPwMsg("❌ Mật khẩu mới phải ít nhất 6 ký tự"); return;
    }
    setSaving(true);
    try {
      await apiClient.put("/admin/auth/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      }, { headers: h });
      setPwMsg("✅ Đổi mật khẩu thành công!");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch(e) {
      setPwMsg("❌ " + (e.response?.data?.message || e.message));
    } finally { setSaving(false); }
    setTimeout(() => setPwMsg(""), 4000);
  };

  const resetPassword = async () => {
    if (!resetPw || resetPw.length < 6) {
      showMsg("❌ Mật khẩu phải ít nhất 6 ký tự"); return;
    }
    try {
      await apiClient.put(`/admin/auth/reset-password/${resetId}`, { new_password: resetPw }, { headers: h });
      showMsg("✅ Đã reset mật khẩu thành công!");
      setResetId(null); setResetPw("");
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
  };

  const getRoleInfo = (role) => ROLES.find(r => r.value === role) || { label: role, color: "#666", icon: "👤" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:0 }}>🔐 Quản lý tài khoản Admin</h2>
        <button onClick={() => setShowCreate(v => !v)}
          style={{ background:"#D4531C", border:"none", color:"white",
            borderRadius:10, padding:"9px 20px", fontWeight:800, cursor:"pointer", fontSize:13 }}>
          {showCreate ? "✕ Đóng" : "+ Tạo tài khoản"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {[
          { key:"list", label:"👥 Danh sách" },
          { key:"password", label:"🔑 Đổi mật khẩu" },
          { key:"roles", label:"📋 Phân quyền" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab===t.key ? "#D4531C" : "rgba(255,255,255,0.07)",
            border:"none", borderRadius:20, padding:"7px 16px", cursor:"pointer",
            color: tab===t.key ? "white" : "#aaa", fontSize:12, fontWeight:700,
          }}>{t.label}</button>
        ))}
      </div>

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(255,80,80,0.1)",
          border: `1px solid ${msg.includes("✅") ? "#4CAF50" : "#ff6b6b"}`,
          borderRadius:8, padding:"10px 14px", marginBottom:16,
          color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b", fontSize:13,
        }}>{msg}</div>
      )}

      {/* Form tạo tài khoản */}
      {showCreate && (
        <div style={{ background:"#1a1a24", borderRadius:14, padding:20,
          marginBottom:20, border:"1px solid #D4531C44" }}>
          <p style={{ color:"#D4531C", fontSize:13, fontWeight:800, margin:"0 0 16px" }}>
            ➕ Tạo tài khoản admin mới
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <div>
              <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Tên đăng nhập *</p>
              <input value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))}
                placeholder="vd: manager01" style={inp}/>
            </div>
            <div>
              <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Mật khẩu * (ít nhất 6 ký tự)</p>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                placeholder="••••••" style={inp}/>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Vai trò *</p>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} style={inp}>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
              ))}
            </select>
          </div>
          {form.role && (
            <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"10px 12px", marginBottom:14 }}>
              <p style={{ color:"#888", fontSize:11, margin:"0 0 6px", fontWeight:700 }}>Quyền hạn:</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {(ROLE_PERMISSIONS[form.role] || []).map((p, i) => (
                  <span key={i} style={{ background:"rgba(212,83,28,0.15)", color:"#D4531C",
                    borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{p}</span>
                ))}
              </div>
            </div>
          )}
          <button onClick={createAdmin} disabled={saving}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:10, padding:"10px 24px", fontWeight:800, cursor:"pointer", fontSize:13 }}>
            {saving ? "Đang tạo..." : "✅ Tạo tài khoản"}
          </button>
        </div>
      )}

      {/* Tab danh sách */}
      {tab === "list" && (
        <div>
          {loading ? (
            <p style={{ color:"#666", textAlign:"center", padding:40 }}>Đang tải...</p>
          ) : admins.length === 0 ? (
            <p style={{ color:"#666", textAlign:"center", padding:40 }}>Chưa có tài khoản nào</p>
          ) : admins.map((a, i) => {
            const role = getRoleInfo(a.role);
            return (
              <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"14px 18px",
                marginBottom:10, border:`1px solid ${a.active ? "#2a2a38" : "rgba(255,80,80,0.2)"}`,
                display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:21, flexShrink:0,
                  background:`${role.color}22`, border:`1px solid ${role.color}44`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  {role.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <p style={{ color:"white", fontSize:14, fontWeight:800, margin:0 }}>{a.username}</p>
                    <span style={{ background:`${role.color}22`, color:role.color,
                      borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>
                      {role.icon} {role.label}
                    </span>
                    {!a.active && (
                      <span style={{ background:"rgba(255,80,80,0.15)", color:"#ff6b6b",
                        borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>
                        Vô hiệu hóa
                      </span>
                    )}
                  </div>
                  <p style={{ color:"#555", fontSize:11, margin:0 }}>
                    Tạo lúc: {new Date(a.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setResetId(a.id); setResetPw(""); }}
                    style={{ background:"rgba(255,152,0,0.15)", border:"1px solid #FF9800",
                      color:"#FF9800", borderRadius:8, padding:"6px 12px",
                      fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    🔑 Reset mật khẩu
                  </button>
                  <button onClick={() => toggleAdmin(a)}
                    style={{ background: a.active ? "rgba(255,80,80,0.15)" : "rgba(76,175,80,0.15)",
                      border: `1px solid ${a.active ? "#ff6b6b" : "#4CAF50"}`,
                      color: a.active ? "#ff6b6b" : "#4CAF50",
                      borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    {a.active ? "🚫 Vô hiệu hóa" : "✅ Kích hoạt"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal reset mật khẩu */}
      {resetId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setResetId(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#1a1a24", borderRadius:16, padding:24,
              width:"100%", maxWidth:400, border:"1px solid #2a2a38" }}>
            <p style={{ color:"white", fontSize:16, fontWeight:900, margin:"0 0 16px" }}>
              🔑 Reset mật khẩu
            </p>
            <div style={{ marginBottom:16 }}>
              <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>Mật khẩu mới *</p>
              <input type="password" value={resetPw} onChange={e => setResetPw(e.target.value)}
                placeholder="Ít nhất 6 ký tự" style={inp}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setResetId(null)}
                style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid #333",
                  color:"#aaa", borderRadius:10, padding:"10px", cursor:"pointer" }}>Huỷ</button>
              <button onClick={resetPassword}
                style={{ flex:2, background:"#FF9800", border:"none", color:"white",
                  borderRadius:10, padding:"10px", fontWeight:800, cursor:"pointer" }}>
                🔑 Xác nhận reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab đổi mật khẩu */}
      {tab === "password" && (
        <div style={{ background:"#1a1a24", borderRadius:14, padding:20, border:"1px solid #2a2a38", maxWidth:480 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 16px" }}>
            🔑 Đổi mật khẩu của bạn
          </p>
          {pwMsg && (
            <div style={{
              background: pwMsg.includes("✅") ? "rgba(76,175,80,0.1)" : "rgba(255,80,80,0.1)",
              border: `1px solid ${pwMsg.includes("✅") ? "#4CAF50" : "#ff6b6b"}`,
              borderRadius:8, padding:"10px 14px", marginBottom:14,
              color: pwMsg.includes("✅") ? "#4CAF50" : "#ff6b6b", fontSize:13,
            }}>{pwMsg}</div>
          )}
          {[
            { key:"current_password", label:"Mật khẩu hiện tại *", placeholder:"Nhập mật khẩu hiện tại" },
            { key:"new_password",     label:"Mật khẩu mới *",      placeholder:"Ít nhất 6 ký tự" },
            { key:"confirm",          label:"Xác nhận mật khẩu *", placeholder:"Nhập lại mật khẩu mới" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:12 }}>
              <p style={{ color:"#666", fontSize:11, margin:"0 0 4px" }}>{f.label}</p>
              <input type="password" value={pwForm[f.key]}
                onChange={e => setPwForm(p => ({...p, [f.key]: e.target.value}))}
                placeholder={f.placeholder} style={inp}/>
            </div>
          ))}
          <button onClick={changePassword} disabled={saving}
            style={{ background:"#D4531C", border:"none", color:"white",
              borderRadius:10, padding:"11px", width:"100%",
              fontWeight:800, cursor:"pointer", fontSize:13, marginTop:4 }}>
            {saving ? "Đang lưu..." : "💾 Đổi mật khẩu"}
          </button>
        </div>
      )}

      {/* Tab phân quyền */}
      {tab === "roles" && (
        <div>
          <p style={{ color:"#888", fontSize:12, margin:"0 0 16px" }}>
            Mỗi vai trò có quyền hạn được định nghĩa sẵn trong hệ thống.
          </p>
          {ROLES.map(role => (
            <div key={role.value} style={{ background:"#1a1a24", borderRadius:12, padding:"16px 20px",
              marginBottom:10, border:`1px solid ${role.color}22` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{role.icon}</span>
                <p style={{ color:role.color, fontSize:14, fontWeight:800, margin:0 }}>{role.label}</p>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {(ROLE_PERMISSIONS[role.value] || []).map((p, i) => (
                  <span key={i} style={{ background:`${role.color}15`, color:role.color,
                    borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
