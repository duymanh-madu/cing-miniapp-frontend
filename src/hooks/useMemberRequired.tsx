import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";
import { initializeCustomerIdentityEngine } from "@/runtime/customer/runtimeCustomerIdentityEngine";

export function useMemberRequired() {
  const activationStatus = useRuntimeCustomerIdentityStore(s => s.activationStatus);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const profilePhone = useAuthStore(s => s.profile?.phone);

  const pendingCallbackRef = useRef<null | (() => void)>(null);

  const hasPhone = (() => {
    const p = runtimePhone || profilePhone || "";
    if (!p || p === "pending") return false;
    return p.replace(/\D/g, "").length >= 9;
  })();

  const isActivated = activationStatus === "activated" || hasPhone;

  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requireMember = (callback?: () => void) => {
    if (isActivated) {
      callback?.();
      return true;
    }

    pendingCallbackRef.current = callback || null;
    setError("");
    setShowPrompt(true);
    return false;
  };

  const handleActivate = async () => {
    setLoading(true);
    setError("");

    try {
      await initializeCustomerIdentityEngine();

      const state = useRuntimeCustomerIdentityStore.getState();
      const status = state.activationStatus;
      const phone = String(state.identity?.phone || "").replace(/\D/g, "");

      if (status === "activated" || phone.length >= 9) {
        setShowPrompt(false);
        const cb = pendingCallbackRef.current;
        pendingCallbackRef.current = null;
        cb?.();
        return;
      }

      setError("Chưa kích hoạt được thành viên. Vui lòng thử lại sau.");
    } catch (e: any) {
      setError(e?.message || "Không thể kích hoạt thành viên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const MemberPrompt = showPrompt ? createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
      }}
      onClick={() => setShowPrompt(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          padding: "26px 22px 40px",
          borderRadius: "30px 30px 0 0",
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,215,0,0.16), transparent 34%), linear-gradient(180deg,#1d1b2a 0%,#12121c 100%)",
          border: "1px solid rgba(255,215,0,0.22)",
          boxShadow: "0 -18px 70px rgba(0,0,0,0.65)",
          boxSizing: "border-box",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: 46,
            height: 5,
            borderRadius: 99,
            background: "rgba(255,255,255,0.16)",
            margin: "0 auto 20px"
          }}
        />

        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            margin: "0 auto 18px",
            background:
              "linear-gradient(145deg, rgba(255,215,0,0.22), rgba(212,83,28,0.2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 34px rgba(255,120,35,0.18)"
          }}
        >
          <div style={{ fontSize: 48 }}>🎮</div>
        </div>

        <h2
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: 950,
            lineHeight: 1.18,
            margin: "0 0 10px",
            textAlign: "center",
            letterSpacing: "-0.3px"
          }}
        >
          Kích hoạt tài khoản thành viên
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.62)",
            fontSize: 14,
            lineHeight: 1.55,
            margin: "0 auto 18px",
            textAlign: "center",
            maxWidth: 350
          }}
        >
          Để lưu thành tích, nhận thưởng và tham gia cộng đồng “Cing iu” một cách an toàn.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            margin: "0 0 18px"
          }}
        >
          {[
            ["💎", "Lưu điểm thưởng"],
            ["🏆", "Tham gia BXH"],
            ["🎁", "Nhận quà tặng"],
            ["🛡️", "Chống gian lận"]
          ].map(([icon, text]) => (
            <div
              key={text}
              style={{
                borderRadius: 16,
                padding: "12px 10px",
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
              <div
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 12.5,
                  fontWeight: 800,
                  lineHeight: 1.25
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: "13px 14px",
            marginBottom: 18,
            background: "rgba(255,215,0,0.075)",
            border: "1px solid rgba(255,215,0,0.16)"
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.76)",
              fontSize: 13,
              lineHeight: 1.55,
              margin: 0,
              textAlign: "center"
            }}
          >
            Trong quá trình kích hoạt, hệ thống có thể yêu cầu xác thực thông tin tài khoản Zalo theo chính sách nền tảng.
          </p>
        </div>

        {error && (
          <p
            style={{
              color: "#ff8b8b",
              background: "rgba(255,80,80,0.1)",
              border: "1px solid rgba(255,80,80,0.2)",
              borderRadius: 14,
              padding: "10px 12px",
              fontSize: 13,
              lineHeight: 1.45,
              margin: "0 0 14px",
              textAlign: "center"
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleActivate}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 18,
            border: "none",
            background: loading
              ? "rgba(255,255,255,0.14)"
              : "linear-gradient(135deg,#ff7a1a,#d4531c)",
            color: "white",
            fontSize: 17,
            fontWeight: 950,
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : "0 12px 30px rgba(212,83,28,0.34)"
          }}
        >
          {loading ? "Đang kích hoạt..." : "📱 Tiếp tục"}
        </button>

        <button
          onClick={() => setShowPrompt(false)}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "13px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.46)",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          Để sau
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return { isActivated, requireMember, MemberPrompt };
}
