import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";

export default function VoucherPage() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);

  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", paddingBottom:100 }}>
      <div style={{ background:"white", padding:"14px 16px",
        display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:"none", border:"none",
          fontSize:22, cursor:"pointer", padding:0, color:"#333" }}>←</button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0 }}>Voucher của tôi</h1>
      </div>

      <div style={{ padding:"24px 16px", textAlign:"center", color:"#bbb" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🎟</div>
        <p style={{ fontSize:15, fontWeight:700, color:"#333", margin:"0 0 8px" }}>
          Chưa có voucher nào
        </p>
        <p style={{ fontSize:13, color:"#999", lineHeight:1.6, margin:"0 0 24px" }}>
          Đặt hàng và tích điểm để nhận voucher<br/>ưu đãi hấp dẫn từ Cing Hu Tang
        </p>
        <button onClick={() => navigate("/menu")} style={{
          padding:"12px 32px", background:"#D4531C", color:"white",
          border:"none", borderRadius:14, fontSize:14, fontWeight:700, cursor:"pointer",
        }}>Đặt món ngay</button>
      </div>
    </div>
  );
}
