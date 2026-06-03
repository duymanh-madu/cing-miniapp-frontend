import { useEffect, useState } from "react";
import { initializeApplication } from "../services/appBootstrapOrchestrator";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";

// Check có phải mobile không
const isMobile = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
};

function AppBootstrapGate({ children }) {
  const [ready, setReady] = useState(false);
  const activationStatus = useRuntimeCustomerIdentityStore(s => s.activationStatus);
  const phoneGranted     = useRuntimeCustomerIdentityStore(s => s.phoneGranted);
  const oaFollowed       = useRuntimeCustomerIdentityStore(s => s.oaFollowed);

  useEffect(() => {
    async function boot() {
      await initializeApplication();
      setReady(true);
    }
    boot();
  }, []);

  // Loading — đợi cả khi checking
  if (!ready || activationStatus === "checking" || activationStatus === "idle") {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810"}}>
        <div style={{width:32,height:32,border:"3px solid #D4531C",borderTop:"3px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Block trên mobile nếu chưa grant phone hoặc chưa follow OA
  if (isMobile() && activationStatus === "blocked") {
    const needPhone = !phoneGranted;
    const needOA    = phoneGranted && !oaFollowed;
    return (
      <div style={{minHeight:"100vh",background:"#080810",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:20}}>{needPhone ? "📱" : "🫶"}</div>
        <h2 style={{color:"white",fontSize:22,fontWeight:900,margin:"0 0 12px"}}>
          {needPhone ? "Xác minh số điện thoại" : "Theo dõi Cing Hu Tang"}
        </h2>
        <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.7,margin:"0 0 32px",maxWidth:320}}>
          {needPhone
            ? "Bạn cần cho phép truy cập số điện thoại để sử dụng đầy đủ tính năng của app."
            : "Bạn cần theo dõi trang Zalo OA Cing Hu Tang Kinh Bắc để nhận ưu đãi và sử dụng app."}
        </p>
        <button
          onClick={() => { useRuntimeCustomerIdentityStore.getState().setActivationStatus("idle"); window.location.reload(); }}
          style={{padding:"16px 32px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#D4531C,#E8622A)",color:"white",fontSize:16,fontWeight:800,cursor:"pointer"}}>
          {needPhone ? "📱 Cho phép truy cập" : "💬 Theo dõi ngay"}
        </button>
      </div>
    );
  }

  return children;
}

export default AppBootstrapGate;