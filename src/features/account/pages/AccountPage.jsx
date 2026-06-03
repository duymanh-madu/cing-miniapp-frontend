import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";
import { TierBadge } from "@/membership/components/TierBadge";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";
injectTierBadgeStyles();

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

const MENU_ITEMS = [
  { icon:"👤", label:"Hồ sơ của tôi",      path:"/profile",     desc:"Xem trang hồ sơ cá nhân" },
  { icon:"📦", label:"Lịch sử đơn hàng",  path:"/orders",      desc:"Xem các đơn đã đặt" },
  { icon:"🎟", label:"Voucher của tôi",    path:"/voucher",     desc:"Ưu đãi và mã giảm giá" },
  { icon:"⭐", label:"Điểm tích lũy",      path:"/loyalty",     desc:"Xem điểm và đổi quà" },
  { icon:"👑", label:"Đại Sảnh Danh Vọng", path:"/leaderboard", desc:"Bảng xếp hạng khách hàng" },
  { icon:"🎮", label:"Game Center",        path:"/game-center", desc:"Chơi game nhận thưởng" },
  { icon:"📞", label:"Liên hệ hỗ trợ",    path:null,           desc:"Hotline: 0989.585.355" },
];

function resizeToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 150;
      const ctx  = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      const sx   = (img.width  - size) / 2;
      const sy   = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8).split(",")[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function fmtDate(isoStr) {
  if (!isoStr) return "";
  // Parse trực tiếp tránh lệch timezone UTC
  const parts = isoStr.split("T")[0].split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

function EditProfileSheet({ userId, currentName, currentAvatar, cooldown, onClose, onSaved }) {
  const [name, setName]         = useState(currentName || "");
  const [preview, setPreview]   = useState(currentAvatar || null);
  const [avatarB64, setB64]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const fileRef = useRef();

  const blocked      = !cooldown.can_change_free;
  const nameChanged  = name.trim() !== currentName;
  const avaChanged   = !!avatarB64;
  const hasChange    = nameChanged || avaChanged;
  const btnDisabled  = saving || (blocked && !usePoints) || !hasChange;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    try { setB64(await resizeToBase64(file)); }
    catch { setError("Không thể xử lý ảnh, thử ảnh khác"); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Tên không được để trống"); return; }
    setSaving(true); setError("");
    try {
      const body = { use_points: blocked ? usePoints : false };
      if (nameChanged) body.display_name  = name.trim();
      if (avaChanged)  body.avatar_base64 = avatarB64;
      const res = await apiClient.post(`/profile-update/save/${userId}`, body);
      if (!res.data?.success) throw new Error(res.data?.error);
      onSaved({ name: res.data.display_name, avatarUrl: res.data.avatar_url, pointsUsed: res.data.points_used });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Lưu thất bại");
    } finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:101, background:"white", borderRadius:"24px 24px 0 0", padding:"0 20px 40px", maxHeight:"90vh", overflowY:"auto", animation:"slideUp 0.28s cubic-bezier(0.32,0.72,0,1)" }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 16px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#e0e0e0" }}/>
        </div>
        <p style={{ fontSize:17, fontWeight:800, color:"#1a1a1a", margin:"0 0 20px", textAlign:"center" }}>Chỉnh sửa hồ sơ</p>

        {blocked && (
          <div style={{ background:"#FFF8E1", border:"1px solid #FFD54F", borderRadius:14, padding:"12px 16px", marginBottom:20 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#F57F17", margin:"0 0 4px" }}>⏳ Chưa thể đổi miễn phí</p>
            <p style={{ fontSize:12, color:"#795548", margin:"0 0 10px" }}>
              Có thể đổi miễn phí vào ngày <strong>{fmtDate(cooldown.next_free_date)}</strong>
            </p>
            {cooldown.can_use_points ? (
              <div onClick={() => setUsePoints(v => !v)} style={{ display:"flex", alignItems:"center", gap:10, background: usePoints ? "#FFF3E0" : "white", border:`2px solid ${usePoints ? "#FF9800" : "#e0e0e0"}`, borderRadius:12, padding:"10px 14px", cursor:"pointer" }}>
                <div style={{ width:20, height:20, borderRadius:10, border:`2px solid ${usePoints ? "#FF9800" : "#ccc"}`, background: usePoints ? "#FF9800" : "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {usePoints && <span style={{ color:"white", fontSize:12 }}>✓</span>}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#E65100", margin:0 }}>Dùng {cooldown.point_cost} điểm để đổi ngay</p>
                  <p style={{ fontSize:11, color:"#999", margin:"2px 0 0" }}>Bạn đang có {cooldown.current_points} điểm</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize:12, color:"#e53935", margin:0 }}>Không đủ {cooldown.point_cost} điểm để đổi sớm (đang có {cooldown.current_points} điểm)</p>
            )}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
          <div onClick={() => fileRef.current?.click()} style={{ position:"relative", width:96, height:96, borderRadius:48, cursor: (blocked && !usePoints) ? "default" : "pointer", overflow:"hidden", border:"3px solid #D4531C", opacity: (blocked && !usePoints) ? 0.5 : 1, pointerEvents: (blocked && !usePoints) ? "none" : "auto" }}>
            {preview ? <img src={preview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : (
              <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#D4531C,#E8622A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:900, color:"white" }}>
                {(name||"?")[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.45)", padding:"6px 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:16 }}>📷</span>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#999", margin:"6px 0 0" }}>{(blocked && !usePoints) ? "Chọn cách đổi ở trên" : "Tap để đổi ảnh"}</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
        </div>

        {/* Đổi tên tạm ẩn — chỉ cho đổi avatar */}

        {error && <p style={{ color:"#e53935", fontSize:12, margin:"0 0 12px", textAlign:"center" }}>{error}</p>}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"14px", borderRadius:14, border:"1.5px solid #e0e0e0", background:"white", fontSize:14, fontWeight:700, color:"#666", cursor:"pointer" }}>Hủy</button>
          <button onClick={handleSave} disabled={btnDisabled}
            style={{ flex:2, padding:"14px", borderRadius:14, border:"none", background: btnDisabled ? "#ccc" : "linear-gradient(135deg,#D4531C,#E8622A)", fontSize:14, fontWeight:800, color:"white", cursor: btnDisabled ? "default" : "pointer" }}>
            {saving ? "Đang lưu..." : usePoints ? `Lưu (-${cooldown.point_cost} điểm)` : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AccountPage() {
  const navigate      = useNavigate();
  const profile       = useAuthStore(s => s.profile);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const runtimePhone       = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  const [showEdit, setShowEdit]   = useState(false);
  const [cooldown, setCooldown]   = useState(null);
  const [toast, setToast]         = useState("");
  const [membership, setMembership] = useState(null);
  const [birthday,   setBirthday]   = useState("");
  const [bdSaving,   setBdSaving]   = useState(false);
  const [bdMsg,      setBdMsg]      = useState("");

  const name      = profile?.name || profile?.displayName || "Khách";
  const avatarUrl = profile?.avatar || null;
  const phone     = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();
  const userId = phone || profile?.id || null;

  const authenticated = useAuthStore(s => s.authenticated);

  const saveBirthday = async () => {
    if (!birthday || !userId) return;
    setBdSaving(true); setBdMsg("");
    try {
      await apiClient.post(`/profile-update/birthday`, { user_id: userId, birthday });
      setBdMsg("✅ Đã lưu ngày sinh!");
    } catch(e) {
      setBdMsg("❌ " + (e.response?.data?.message || "Lỗi lưu ngày sinh"));
    }
    setBdSaving(false);
    setTimeout(() => setBdMsg(""), 3000);
  };

  // Fetch membership data thật từ iPOS
  useEffect(() => {
    if (!phone) return;
    apiClient.get(`/membership/${phone}`)
      .then(r => { setMembership(r.data?.data); })
      .catch(() => {});
  }, [phone]);

  // Fetch birthday từ players table (nguồn chính xác nhất)
  useEffect(() => {
    if (!phone) return;
    apiClient.get(`/profile-update/profile/${phone}`)
      .then(r => {
        const raw = r.data?.data?.birthday || "";
        if (raw) {
          const bd = raw.includes("T") ? raw.split("T")[0] : raw.split(" ")[0];
          setBirthday(bd);
        }
      })
      .catch(() => {});
  }, [phone]);

  const openEdit = async () => {
    if (!userId) return;
    // Chỉ cho phép Zalo authenticated user đổi thông tin
    if (!authenticated) {
      setToast("⚠️ Vui lòng đăng nhập qua Zalo để thay đổi thông tin!");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      const res = await apiClient.get(`/profile-update/status/${userId}`);
      setCooldown(res.data?.data);
    } catch {
      setCooldown({ can_change_free:true, days_left:0, can_use_points:false, current_points:0, point_cost:10 });
    }
    setShowEdit(true);
  };

  const handleSaved = ({ name: newName, avatarUrl: newAvatar, pointsUsed }) => {
    // Chỉ update identityStore — subscriber tự mirror sang authStore
    try {
      useRuntimeCustomerIdentityStore.getState().setIdentity({
        fullName: newName,
        avatar:   newAvatar || profile?.avatar || "",
      });
    } catch(e) {}
    setToast(pointsUsed > 0 ? `Đã lưu! Trừ ${pointsUsed} điểm 🎉` : "Cập nhật hồ sơ thành công! ✅");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:100 }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:"var(--app-safe-top, 0px)", background:"linear-gradient(135deg,#D4531C,#E8622A)", zIndex:99 }} />

      {toast && (
        <div style={{ position:"fixed", top:20, left:16, right:16, zIndex:200, background:"#1a1a1a", color:"white", borderRadius:14, padding:"14px 18px", fontSize:13, fontWeight:700, textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {showEdit && cooldown && userId && (
        <EditProfileSheet userId={userId} currentName={name} currentAvatar={avatarUrl} cooldown={cooldown} onClose={() => setShowEdit(false)} onSaved={handleSaved}/>
      )}

      <div style={{ background:"linear-gradient(135deg,#D4531C,#E8622A)", padding:"20px 20px 24px", paddingTop:"calc(env(safe-area-inset-top, 0px) + 8px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div onClick={openEdit} style={{ position:"relative", cursor:"pointer", flexShrink:0 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width:72, height:72, borderRadius:36, objectFit:"cover", border:"3px solid rgba(255,255,255,0.4)" }}/>
            ) : (
              <div style={{ width:72, height:72, borderRadius:36, background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, color:"white", border:"3px solid rgba(255,255,255,0.4)" }}>
                {name[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ position:"absolute", bottom:0, right:0, background:"white", borderRadius:10, width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}>✏️</div>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:"0 0 4px", fontWeight:600 }}>Xin chào 👋</p>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <p style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 4px" }}>{name}</p>
              <TierBadge tierKey={membership?.tierKey || "member"} size="sm"/>
              {false && <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>✏️</span>}
            </div>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:0 }}>{profile?.phone || "Thành viên Cing Hu Tang Kinh Bắc"}</p>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          {[
            { label:"Điểm tích lũy",   value: fmt(membership?.points || 0) },
            { label:"Hạng thành viên", value: membership?.tierName || profile?.tier || "Đồng" },
            { label:"Đơn hàng",        value: membership?.eatTimes || 0 },
          ].map((s,i) => (
            <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:14, padding:"10px 8px", textAlign:"center", border:"1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ color:"white", fontSize:15, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:10, margin:0, fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BIRTHDAY CARD */}
      <div style={{ padding:"12px 16px 0" }}>
        <div style={{ background:"white", borderRadius:20, padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", margin:"0 0 10px", display:"flex", alignItems:"center", gap:6 }}>🎂 Ngày sinh nhật</p>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
              max={new Date(Date.now() + 7*60*60*1000).toISOString().split("T")[0]}
              style={{ flex:1, padding:"10px 12px", border:"1.5px solid #e0e0e0", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
            <button onClick={saveBirthday} disabled={bdSaving || !birthday}
              style={{ padding:"10px 16px", background: bdSaving||!birthday ? "#ccc" : "#D4531C", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor: bdSaving||!birthday ? "default":"pointer", flexShrink:0 }}>
              {bdSaving ? "..." : "Lưu"}
            </button>
          </div>
          {bdMsg && <p style={{ fontSize:12, color: bdMsg.includes("✅") ? "#4CAF50" : "#e53935", margin:"8px 0 0" }}>{bdMsg}</p>}
          <p style={{ fontSize:11, color:"#aaa", margin:"8px 0 0" }}>Dùng để nhận ưu đãi sinh nhật đặc biệt từ Cing 🎁</p>
        </div>
      </div>

      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ background:"white", borderRadius:20, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          {MENU_ITEMS.map((item, idx) => (
            <div key={idx} onClick={() => item.path ? navigate(item.path) : null}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderTop: idx > 0 ? "1px solid #f5f5f5" : "none", cursor: item.path ? "pointer" : "default" }}>
              <div style={{ width:44, height:44, borderRadius:14, flexShrink:0, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px" }}>{item.label}</p>
                <p style={{ fontSize:11, color:"#999", margin:0 }}>{item.desc}</p>
              </div>
              {item.path && <span style={{ color:"#ccc", fontSize:18 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 16px", textAlign:"center" }}>
        <p style={{ fontSize:12, color:"#ccc", margin:0 }}>Cing Hu Tang Kinh Bắc</p>
        <p style={{ fontSize:11, color:"#ddd", margin:"4px 0 0" }}>576 Đường Trần Phú, Từ Sơn, Bắc Ninh</p>
      </div>
    </div>
  );
}
