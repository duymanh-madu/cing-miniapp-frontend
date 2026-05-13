import {
  Toaster,
} from "react-hot-toast";

/**
 * ============================================
 * APP TOAST
 * ============================================
 */

function AppToast() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 24,
      }}
      toastOptions={{
        duration: 2800,

        style: {
          background:
            "rgba(255,255,255,0.92)",

          color: "#111827",

          borderRadius: "22px",

          padding:
            "16px 18px",

          fontSize: "14px",

          fontWeight: "600",

          backdropFilter:
            "blur(18px)",

          boxShadow:
            "0 20px 50px rgba(0,0,0,0.12)",

          border:
            "1px solid rgba(255,255,255,0.6)",
        },

        success: {
          iconTheme: {
            primary:
              "#22c55e",

            secondary:
              "#ffffff",
          },
        },

        error: {
          iconTheme: {
            primary:
              "#ef4444",

            secondary:
              "#ffffff",
          },
        },
      }}
    />
  );
}

export default AppToast;