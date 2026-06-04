import { useState } from "react";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { initializeCustomerIdentityEngine } from "@/runtime/customer/runtimeCustomerIdentityEngine";
import { createPortal } from "react-dom";

export function useMemberRequired() {
  const activationStatus = useRuntimeCustomerIdentityStore(s => s.activationStatus);
  const isActivated = activationStatus === "activated";
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  const requireMember = (callback) => {
    if (isActivated) { callback?.(); return true; }
    setShowPrompt(true);
    return false;
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      useRuntimeCustomerIdentityStore.getState().setActivationStatus("idle");
      await initializeCustomerIdentityEngine();
      const status = useRuntimeCustomerIdentityStore.getState().activationStatus;
      if (status === "activated") setShowPrompt(false);
    } catch(e) {}
    setLoading(false);
  };

  const MemberPrompt = showPrompt ? createPortal(
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:9999,
      display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={() => setShowPrompt(false)}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:"#1a1a24", borderRadius:"24px 24px 0 0", padding:"32px 24px 48px",
          width:"100%", maxWidth:480, textAlign:"center", border:"1px solid rgba(255,215,0,0.2)" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🎮</div>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 10px" }}>Đăng ký thành viên</h2>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, margin:"0 0 28px", lineHeight:1.6 }}>
          Cho phép truy cập số điện thoại để kích hoạt tài khoản thành viên và tận hưởng đầy đủ tính năng 🎁
        </p>
        <button onClick={handleActivate} disabled={loading}
          style={{ width:"100%", padding:"16px", borderRadius:14, border:"none",
            background: loading ? "#333" : "linear-gradient(135deg,#D4531C,#E8622A)",
            color:"white", fontSize:16, fontWeight:800, cursor: loading ? "default" : "pointer" }}>
          {loading ? "Đang kích hoạt..." : "📱 Kích hoạt ngay"}
        </button>
        <button onClick={() => setShowPrompt(false)}
          style={{ width:"100%", marginTop:12, padding:"12px", borderRadius:14,
            border:"1px solid #333", background:"none", color:"#666", fontSize:14, cursor:"pointer" }}>
          Để sau
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return { isActivated, requireMember, MemberPrompt };
}
