import { useNavigate } from "react-router-dom";
export default function OrderSuccessPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      minHeight:"80vh", padding:"0 24px", textAlign:"center" }}>
      <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
      <h1 style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", margin:"0 0 8px" }}>Đặt hàng thành công!</h1>
      <p style={{ fontSize:14, color:"Top 666", margin:"0 0 32px", lineHeight:1.6 }}>
        Đơn hàng của bạn đang được xử lý.<br/>Chúng tôi sẽ thông báo khi có cập nhật.
      </p>
      <button onClick={() => navigate("/")}
        style={{ width:"100%", maxWidth:300, padding:"14px", borderRadius:14,
          background:"#D4531C", color:"white", border:"none",
          fontSize:15, fontWeight:900, cursor:"pointer", marginBottom:12 }}>
        Về trang chủ
      </button>
      <button onClick={() => navigate("/menu")}
        style={{ width:"100%", maxWidth:300, padding:"14px", borderRadius:14,
          background:"white", color:"#D4531C", border:"1.5px solid #D4531C",
          fontSize:15, fontWeight:700, cursor:"pointer" }}>
        Tiếp tục mua
      </button>
    </div>
  );
}
