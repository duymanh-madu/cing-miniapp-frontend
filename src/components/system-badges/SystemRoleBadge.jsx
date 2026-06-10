import React from "react";

const CONFIG = {
  super_admin: {
    label: "SUPER ADMIN",
    icon: "👑",
    bg: "linear-gradient(135deg,#3a2200,#b87800,#ffd700,#fff1a8,#ffd700,#8a5600)",
    color: "#1b0d00",
    border: "#ffe680",
    glow: "0 0 12px rgba(255,215,0,.85), 0 0 28px rgba(255,170,0,.45)",
  },
  admin: {
    label: "ADMIN",
    icon: "🛡️",
    bg: "linear-gradient(135deg,#061428,#0c3d72,#1389d8,#82d8ff,#0c3d72)",
    color: "#eaf8ff",
    border: "#7bdcff",
    glow: "0 0 10px rgba(80,190,255,.75), 0 0 24px rgba(40,120,255,.35)",
  },
};

export default function SystemRoleBadge({ badge }) {
  const cfg = CONFIG[badge];
  if (!cfg) return null;

  return (
    <>
      <style>{`
        @keyframes systemRoleShimmer {
          0% { transform: translateX(-120%); opacity:.15; }
          45% { opacity:.8; }
          100% { transform: translateX(120%); opacity:.15; }
        }
        @keyframes systemRolePulse {
          0%,100% { filter: brightness(1); }
          50% { filter: brightness(1.22); }
        }
      `}</style>
      <span style={{
        position:"relative",
        display:"inline-flex",
        alignItems:"center",
        gap:4,
        padding:"2px 7px",
        borderRadius:999,
        background:cfg.bg,
        border:`1px solid ${cfg.border}`,
        boxShadow:cfg.glow,
        color:cfg.color,
        fontSize:9,
        fontWeight:1000,
        lineHeight:1,
        letterSpacing:.3,
        whiteSpace:"nowrap",
        overflow:"hidden",
        animation:"systemRolePulse 2.4s ease-in-out infinite",
        flexShrink:0,
      }}>
        <span style={{ fontSize:10 }}>{cfg.icon}</span>
        <span>{cfg.label}</span>
        <span style={{
          position:"absolute",
          inset:0,
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent)",
          animation:"systemRoleShimmer 2.8s ease-in-out infinite",
          pointerEvents:"none",
        }}/>
      </span>
    </>
  );
}
