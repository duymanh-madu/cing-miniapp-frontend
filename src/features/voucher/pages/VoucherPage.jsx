import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

function VoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false);
  const isExpired = new Date(voucher.date_end) < new Date();
  const isUsed = voucher.status === 3;
  const discount = voucher.discount_type === 2
    ? Math.round(voucher.discount_extra * 100) + "%"
    : (voucher.discount_amount || 0).toLocaleString("vi-VN") + "d";
  const copy = () => {
    navigator.clipboard?.writeText(voucher.voucher_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background:"white", borderRadius:16, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", opacity: isExpired || isUsed ? 0.5 : 1 }}>
      <div style={{ background:"linear-gradient(135deg,#D4531C,#ff6b35)", padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ color:"rgba(255,255,255,0.8)", fontSize:11, margin:"0 0 2px", fontWeight:600 }}>GIẢM GIÁ</p>
          <p style={{ color:"white", fontSize:28, fontWeight:900, margin:0 }}>{discount}</p>
        </div>
        <p style={{ color:"rgba(255,255,255,0.9)", fontSize:11, margin:0 }}>{isUsed ? "Đã dùng" : isExpired ? "Hết hạn" : "Còn hiệu lực"}</p>
      </div>
      <div style={{ padding:"14px 18px" }}>
        <p style={{ fontWeight:700, fontSize:13, margin:"0 0 4px" }}>{voucher.voucher_campaign_name}</p>
        <p style={{ fontSize:11, color:"Top 999", margin:"0 0 12px" }}>HSD: {new Date(voucher.date_end).toLocaleDateString("vi-VN")}</p>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flex:1, background:"#f5f5f5", borderRadius:8, padding:"8px 12px", border:"1.5px dashed #ddd" }}>
            <p style={{ fontFamily:"monospace", fontSize:14, fontWeight:800, color:"#D4531C", margin:0, letterSpacing:2 }}>{voucher.voucher_code}</p>
          </div>
          {!isExpired && !isUsed && (
            <button onClick={copy} style={{ background: copied ? "#4CAF50" : "#D4531C", color:"white", border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {copied ? "✓" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VoucherPage() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const phone = (profile?.phone || profile?.phoneNumber || "").replace(/\D/g,"");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [devPhone, setDevPhone] = useState(() => sessionStorage.getItem("dev_membership_phone") || "");
  const [inputPhone, setInputPhone] = useState("");
  const activePhone = phone || devPhone;

  useEffect(() => {
    if (!activePhone) { setLoading(false); return; }
    setLoading(true);
    apiClient.get("/membership/" + activePhone + "/vouchers")
      .then(r => { const raw = r.data?.data?.data || r.data?.data || []; setVouchers(Array.isArray(raw) ? raw : []); })
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, [activePhone]);

  if (!activePhone) return (
    <div style={{ padding:"24px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer" }}>←</button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0 }}>🎟 Voucher của tôi</h1>
      </div>
      <div style={{ background:"white", borderRadius:16, padding:"20px" }}>
        <p style={{ fontSize:13, color:"Top 888", marginBottom:12 }}>Nhập SĐT để xem voucher</p>
        <div style={{ display:"flex", gap:8 }}>
          <input type="tel" placeholder="VD: 0984966336" value={inputPhone} onChange={e => setInputPhone(e.target.value)}
            style={{ flex:1, border:"1.5px solid #e8e0d0", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none" }}/>
          <button onClick={() => { sessionStorage.setItem("dev_membership_phone", inputPhone); setDevPhone(inputPhone); }}
            style={{ background:"#D4531C", color:"white", border:"none", borderRadius:10, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Xem</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh", paddingBottom:80 }}>
      <div style={{ background:"white", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer" }}>←</button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0 }}>🎟 Voucher của tôi</h1>
        <span style={{ marginLeft:"auto", fontSize:12, color:"Top 999" }}>{vouchers.length} voucher</span>
      </div>
      <div style={{ padding:"16px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"40px", color:"#bbb" }}><p style={{ fontSize:32 }}>⏳</p><p>Đang tải...</p></div>
        ) : vouchers.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 24px", color:"#bbb" }}>
            <p style={{ fontSize:48, marginBottom:12 }}>🎟</p>
            <p style={{ fontSize:15, fontWeight:700, color:"Top 666", margin:"0 0 8px" }}>Chưa có voucher nào</p>
            <p style={{ fontSize:13, margin:0 }}>Tích điểm và mua hàng để nhận voucher!</p>
          </div>
        ) : vouchers.map((v, i) => <VoucherCard key={i} voucher={v} />)}
      </div>
    </div>
  );
}
