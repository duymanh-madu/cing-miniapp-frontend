import { useState } from "react";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { followOARuntime } from "@/runtime/customer/runtimeCustomerFollowEngine";
import { initializeCustomerIdentityEngine } from "@/runtime/customer/runtimeCustomerIdentityEngine";

export default function ZaloOAGate() {
  const status     = useRuntimeCustomerIdentityStore(s => s.activationStatus);
  const oaFollowed = useRuntimeCustomerIdentityStore(s => s.oaFollowed);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Chỉ hiện khi blocked VÀ chưa follow OA
  const isAdmin = typeof window !== "undefined" && (
    window.location.hash.includes("/admin") ||
    window.location.pathname.includes("/admin")
  );
  // Debug userAgent
  if (typeof window !== "undefined" && status === "blocked") {
    console.log("[OAGate] UA:", navigator.userAgent, "isZalo:", navigator.userAgent.includes("ZaloApp"));
  }
  const isZalo = typeof navigator !== "undefined" && (
    navigator.userAgent.includes("ZaloApp") ||
    navigator.userAgent.includes("Zalo") ||
    navigator.userAgent.includes("zalo")
  );
  // Chỉ hiện khi user ĐÃ ACTIVATED (có phone, đã chủ động kích hoạt member)
  // và chưa follow OA — không chặn guest hoặc do lỗi kỹ thuật ngẫu nhiên (status=blocked)
  const shouldShow = status === "activated" && !oaFollowed && !isAdmin;
  if (!shouldShow) return null;

  const handleFollow = async () => {
    setLoading(true);
    setError("");
    try {
      await followOARuntime().catch(() => {});
      try { localStorage.setItem("__oa_followed", "1"); } catch(e) {}
      window.location.reload();
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
