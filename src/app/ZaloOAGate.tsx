import { useState } from "react";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { followOARuntime } from "@/runtime/customer/runtimeCustomerFollowEngine";
import { initializeCustomerIdentityEngine } from "@/runtime/customer/runtimeCustomerIdentityEngine";

export default function ZaloOAGate() {
  const store      = useRuntimeCustomerIdentityStore();
  const status     = store.activationStatus;
  const oaFollowed = store.oaFollowed;
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Chỉ hiện khi blocked VÀ chưa follow OA
  const shouldShow = status === "blocked" && !oaFollowed;
  if (!shouldShow) return null;

  const handleFollow = async () => {
    setLoading(true);
    setError("");
    try {
      const followed = await followOARuntime();
      if (followed) {
        store.setPermissionState({ oaFollowed: true });
        // Chạy lại engine để activate
        store.setActivationStatus("idle");
        await initializeCustomerIdentityEngine();
      } else {
        setError("Vui lòng follow OA để tiếp tục sử dụng app");
      }
    } catch(e) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:9999,
      display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:"24px 24px 0 0", padding:"32px 24px 48px",
        width:"100%", maxWidth:480, textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🫶</div>
        <h2 style={{ fontSize:20, fontWeight:900, color:"#1a1a1a", margin:"0 0 10px" }}>
          Theo dõi Cing Hu Tang
        </h2>
        <p style={{ fontSize:14, color:"#666", margin:"0 0 28px", lineHeight:1.6 }}>
          Bạn cần theo dõi trang Zalo OA của Cing Hu Tang Kinh Bắc để sử dụng đầy đủ tính năng và nhận ưu đãi độc quyền 🎁
        </p>
        {error && (
          <p style={{ color:"#e53935", fontSize:13, margin:"0 0 16px" }}>{error}</p>
        )}
        <button onClick={handleFollow} disabled={loading}
          style={{ width:"100%", padding:"16px", borderRadius:14, border:"none",
            background: loading ? "#ccc" : "linear-gradient(135deg,#D4531C,#E8622A)",
            color:"white", fontSize:16, fontWeight:800, cursor: loading ? "default" : "pointer" }}>
          {loading ? "Đang xử lý..." : "💬 Theo dõi ngay"}
        </button>
      </div>
    </div>
  );
}
