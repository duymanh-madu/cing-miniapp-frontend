import React from "react";

export default function ToastSystem({ message }: any) {

  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      left: 20,
      right: 20,
      background: "#222",
      color: "#fff",
      padding: 14,
      borderRadius: 14,
      textAlign: "center",
      boxShadow: "0 0 20px rgba(255,255,255,0.1)"
    }}>
      🔔 {message}
    </div>
  );
}
