import React from "react";

export default function LevelUpPopup({ show, rank }: any) {

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>

      <div style={{
        background: "#1a1a22",
        padding: 30,
        borderRadius: 20,
        textAlign: "center",
        color: "#fff",
        animation: "pop 0.4s ease"
      }}>

        <div style={{ fontSize: 28 }}>
          🎉 CHÚC MỪNG!
        </div>

        <div style={{ marginTop: 10, fontSize: 18 }}>
          Bạn đã thăng hạng TOP {rank}
        </div>

        <div style={{
          marginTop: 20,
          fontSize: 14,
          color: "#aaa"
        }}>
          Hãy tiếp tục chinh phục vị trí cao hơn
        </div>

      </div>

    </div>
  );
}
