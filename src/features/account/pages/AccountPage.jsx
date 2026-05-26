import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

const MENU_ITEMS = [
  { icon:"📦", label:"Lịch sử đơn hàng",   path:"/orders",      desc:"Xem các đơn đã đặt" },
  { icon:"🎟", label:"Voucher của tôi",     path:"/voucher",     desc:"Ưu đãi và mã giảm giá" },
  { icon:"⭐", label:"Điểm tích lũy",       path:"/loyalty",     desc:"Xem điểm và đổi quà" },
  { icon:"👑", label:"Đại Sảnh Danh Vọng",  path:"/leaderboard", desc:"Bảng xếp hạng khách hàng" },
  { icon:"🎮", label:"Game Center",         path:"/game-center", desc:"Chơi game nhận thưởng" },
  { icon:"📞", label:"Liên hệ hỗ trợ",     path:null,           desc:"Hotline: 0989.585.355" },
];

/**
 * Resize ảnh về 150x150 bằng Canvas API (client-side, ~10ms, invisible to user)
 */
function resizeImageToBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = 150;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");

      // Cover crop — giống Facebook
      const size = Math.min(img.width, img.height);
      const sx   = (img.width  - size) / 2;
      const sy   = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);

      URL.revokeObjectURL(url);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/jpeg", 0.8);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * EDIT PROFILE BOTTOM SHEET
 */
function EditProfileSheet({ profile, userId, onClose, onSaved }) {
  const [name, setName]         = useState(profile?.name || profile?.displayName || "");
  const [preview, setPreview]   = useState(profile?.avatar || null);
  const [avatarBlob, setBlob]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const fileRef                 = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ngay lập tức — UX mượt
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Resize ngầm
    try {
      const blob = await resizeImageToBlob(file);
      setBlob(blob);
    } catch {
      setError("Không thể xử lý ảnh, thử ảnh khác");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Tên không được để trống"); return; }
    setSaving(true);
    setError("");

    try {
      let avatarUrl = profile?.avatar || null;

      // Upload avatar nếu có ảnh mới
      if (avatarBlob) {
        const formData = new FormData();
        formData.append("avatar", avatarBlob, "avatar.jpg");
        const res = await apiClient.post(`/profile-update/avatar/${userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.success) avatarUrl = res.data.avatar_url;
      }

      // Cập nhật tên
      if (name.trim() !== (profile?.name || profile?.displayName || "")) {
        await apiClient.post(`/profile-update/display-name/${userId}`, { display_name: name.trim() });
      }

      onSaved({ avatarUrl, name: name.trim() });
      onClose();
    } catch (err) {
      setError("Lưu thất bại, thử lại nhé");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
        zIndex:100, backdropFilter:"blur(2px)",
      }}/>

      {/* Sheet */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:101,
        background:"white", borderRadius:"24px 24px 0 0",
        padding:"0 20px 40px", maxHeight:"85vh", overflowY:"auto",
        animation:"slideUp 0.28s cubic-bezier(0.32,0.72,0,1)",
      }}>
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        `}</style>

        {/* Handle bar */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 20px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#e0e0e0" }}/>
        </div>

        <p style={{ fontSize:17, fontWeight:800, color:"#1a1a1a", margin:"0 0 24px", textAlign:"center" }}>
          Chỉnh sửa hồ sơ
        </p>

        {/* Avatar picker */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              position:"relative", width:96, height:96, borderRadius:48,
              cursor:"pointer", overflow:"hidden",
              border:"3px solid #D4531C",
            }}
          >
            {preview ? (
              <img src={preview} alt="avatar"
                style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            ) : (
              <div style={{
                width:"100%", height:"100%",
                background:"linear-gradient(135deg,#D4531C,#E8622A)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:32, fontWeight:900, color:"white",
              }}>
                {(name||"?")[0]?.toUpperCase()}
              </div>
            )}
            {/* Camera overlay */}
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              background:"rgba(0,0,0,0.45)", padding:"6px 0",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <span style={{ fontSize:16 }}>📷</span>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#999", margin:"8px 0 0" }}>Tap để đổi ảnh</p>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display:"none" }} onChange={handleFileChange} />
        </div>

        {/* Name input */}
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#666", margin:"0 0 8px" }}>
            TÊN HIỂN THỊ
          </p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
            placeholder="Nhập tên hiển thị..."
            style={{
              width:"100%", padding:"14px 16px", borderRadius:14,
              border:"1.5px solid #e0e0e0", fontSize:15, fontWeight:600,
              outline:"none", boxSizing:"border-box",
              background:"#fafafa", color:"#1a1a1a",
            }}
          />
          <p style={{ fontSize:11, color:"#ccc", margin:"6px 0 0", textAlign:"right" }}>
            {name.length}/30
          </p>
        </div>

        {error && (
          <p style={{ color:"#e53935", fontSize:12, margin:"0 0 12px", textAlign:"center" }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"14px", borderRadius:14, border:"1.5px solid #e0e0e0",
            background:"white", fontSize:14, fontWeight:700, color:"#666", cursor:"pointer",
          }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex:2, padding:"14px", borderRadius:14, border:"none",
            background: saving ? "#ccc" : "linear-gradient(135deg,#D4531C,#E8622A)",
            fontSize:14, fontWeight:800, color:"white", cursor: saving ? "default" : "pointer",
          }}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * ACCOUNT PAGE
 */
export default function AccountPage() {
  const navigate       = useNavigate();
  const profile        = useAuthStore(s => s.profile);
  const updateProfile  = useAuthStore(s => s.updateProfile);
  const [showEdit, setShowEdit] = useState(false);

  const name      = profile?.name || profile?.displayName || "Khách";
  const avatarUrl = profile?.avatar || null;
  const userId    = profile?.phone || profile?.id || null;

  const handleSaved = ({ avatarUrl: newAvatar, name: newName }) => {
    updateProfile({
      ...profile,
      name:        newName,
      displayName: newName,
      avatar:      newAvatar,
    });
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:100 }}>

      {/* EDIT SHEET */}
      {showEdit && userId && (
        <EditProfileSheet
          profile={{ ...profile, avatar: avatarUrl }}
          userId={userId}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(135deg,#D4531C,#E8622A)",
        padding:"32px 20px 24px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>

          {/* Avatar — tap để edit */}
          <div
            onClick={() => setShowEdit(true)}
            style={{ position:"relative", cursor:"pointer", flexShrink:0 }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{
                width:72, height:72, borderRadius:36, objectFit:"cover",
                border:"3px solid rgba(255,255,255,0.4)",
              }}/>
            ) : (
              <div style={{
                width:72, height:72, borderRadius:36,
                background:"rgba(255,255,255,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28, fontWeight:900, color:"white",
                border:"3px solid rgba(255,255,255,0.4)",
              }}>
                {(name)[0]?.toUpperCase()}
              </div>
            )}
            <div style={{
              position:"absolute", bottom:0, right:0,
              background:"white", borderRadius:10, width:20, height:20,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
            }}>✏️</div>
          </div>

          <div style={{ flex:1 }}>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:"0 0 4px", fontWeight:600 }}>
              Xin chào 👋
            </p>
            {/* Tap tên để edit */}
            <div onClick={() => setShowEdit(true)} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <p style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 4px" }}>{name}</p>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>✏️</span>
            </div>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:0 }}>
              {profile?.phone || "Thành viên Cing Hu Tang"}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          {[
            { label:"Điểm tích lũy", value: fmt(profile?.points || 0) },
            { label:"Hạng thành viên", value: profile?.tier || "Đồng" },
            { label:"Đơn hàng", value: profile?.totalOrders || 0 },
          ].map((s,i) => (
            <div key={i} style={{
              flex:1, background:"rgba(255,255,255,0.15)",
              borderRadius:14, padding:"10px 8px", textAlign:"center",
              border:"1px solid rgba(255,255,255,0.2)",
            }}>
              <p style={{ color:"white", fontSize:15, fontWeight:900, margin:"0 0 2px" }}>{s.value}</p>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:10, margin:0, fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MENU LIST */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ background:"white", borderRadius:20, overflow:"hidden",
          boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          {MENU_ITEMS.map((item, idx) => (
            <div key={idx}
              onClick={() => item.path ? navigate(item.path) : null}
              style={{
                display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                borderTop: idx > 0 ? "1px solid #f5f5f5" : "none",
                cursor: item.path ? "pointer" : "default",
              }}>
              <div style={{
                width:44, height:44, borderRadius:14, flexShrink:0,
                background:"#f5f5f5",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22,
              }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px" }}>{item.label}</p>
                <p style={{ fontSize:11, color:"#999", margin:0 }}>{item.desc}</p>
              </div>
              {item.path && <span style={{ color:"#ccc", fontSize:18 }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* APP INFO */}
      <div style={{ padding:"20px 16px", textAlign:"center" }}>
        <p style={{ fontSize:12, color:"#ccc", margin:0 }}>Cing Hu Tang Kinh Bắc</p>
        <p style={{ fontSize:11, color:"#ddd", margin:"4px 0 0" }}>576 Đường Trần Phú, Từ Sơn, Bắc Ninh</p>
      </div>
    </div>
  );
}
