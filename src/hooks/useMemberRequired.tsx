import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";
import { initializeCustomerIdentityEngine } from "@/runtime/customer/runtimeCustomerIdentityEngine";
import { getMemberDebugLogs, clearMemberDebugLogs } from "@/utils/debug/memberActivationDebug";

export function useMemberRequired() {
  const activationStatus = useRuntimeCustomerIdentityStore(s => s.activationStatus);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const profilePhone = useAuthStore(s => s.profile?.phone);

  const hasPhone = (() => {
    const p = runtimePhone || profilePhone || "";
    if (!p || p === "pending") return false;
    return p.replace(/\D/g, "").length >= 9;
  })();

  const isActivated = activationStatus === "activated" || hasPhone;
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugLogs, setDebugLogs] = useState<any[]>(getMemberDebugLogs());

  useEffect(() => {
    const handler = () => setDebugLogs(getMemberDebugLogs());
    window.addEventListener("member_activation_debug", handler);
    return () => window.removeEventListener("member_activation_debug", handler);
  }, []);

  const requireMember = (callback?: () => void) => {
    if (isActivated) {
      callback?.();
      return true;
    }
    setError("");
    clearMemberDebugLogs();
    setDebugLogs([]);
    setShowPrompt(true);
    return false;
  };

  const refreshDebug = () => setDebugLogs(getMemberDebugLogs());

  const handleActivate = async () => {
    setLoading(true);
    setError("");

    try {
      await initializeCustomerIdentityEngine();
      refreshDebug();

      const state = useRuntimeCustomerIdentityStore.getState();
      const status = state.activationStatus;
      const phone = String(state.identity?.phone || "").replace(/\D/g, "");

      if (status === "activated" || phone.length >= 9) {
        setShowPrompt(false);
        return;
      }

      setError("Chưa kích hoạt được. Xem log debug bên dưới.");
      refreshDebug();
    } catch (e: any) {
      setError(e?.message || "Không thể kích hoạt thành viên. Vui lòng thử lại.");
      refreshDebug();
    } finally {
      setLoading(false);
    }
  };

  const MemberPrompt = showPrompt ? createPortal(
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:9999,
        display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={() => setShowPrompt(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"#1a1a24", borderRadius:"24px 24px 0 0", padding:"32px 24px 48px",
          width:"100%", maxWidth:480, textAlign:"center", border:"1px solid rgba(255,215,0,0.2)" }}
      >
        <div style={{ fontSize:56, marginBottom:12 }}>🎮</div>

        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 10px" }}>
          Kích hoạt thành viên
        </h2>

        <p style={{ color:"rgba(255,255,255,0.68)", fontSize:14, margin:"0 0 18px", lineHeight:1.65 }}>
          Tính năng này cần xác thực số điện thoại và theo dõi OA để lưu điểm, xếp hạng,
          nhận quà và bảo vệ tài khoản khỏi gian lận.
        </p>

        {error && (
          <p style={{ color:"#ff6b6b", fontSize:13, lineHeight:1.5, margin:"0 0 16px" }}>
            {error}
          </p>
        )}


        {debugLogs.length > 0 && (
          <div style={{
            margin:"0 0 16px",
            padding:"10px",
            borderRadius:10,
            background:"rgba(0,0,0,0.35)",
            border:"1px solid rgba(255,255,255,0.12)",
            maxHeight:160,
            overflowY:"auto",
            textAlign:"left"
          }}>
            <p style={{ color:"#FFD700", fontSize:12, fontWeight:800, margin:"0 0 8px" }}>
              Debug kích hoạt
            </p>
            {debugLogs.map((l, i) => (
              <div key={i} style={{ color:"#ddd", fontSize:11, lineHeight:1.45, marginBottom:6 }}>
                <b>{l.time}</b> — {l.message}
                {l.data && <pre style={{ whiteSpace:"pre-wrap", margin:"4px 0 0", color:"#aaa" }}>{l.data}</pre>}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleActivate}
          disabled={loading}
          style={{ width:"100%", padding:"16px", borderRadius:14, border:"none",
            background: loading ? "#333" : "linear-gradient(135deg,#D4531C,#E8622A)",
            color:"white", fontSize:16, fontWeight:800, cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "Đang kích hoạt..." : "📱 Tiếp tục"}
        </button>

        <button
          onClick={() => setShowPrompt(false)}
          style={{ width:"100%", marginTop:12, padding:"12px", borderRadius:14,
            border:"1px solid #333", background:"none", color:"#888", fontSize:14, cursor:"pointer" }}
        >
          Để sau
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return { isActivated, requireMember, MemberPrompt };
}
