import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { key:"order",   label:"Đặt món",        icon:"🧋", path:"/menu",        bg:"#fff7ed", border:"#fed7aa", text:"#ea580c" },
  { key:"benefits", label:"Quyền lợi",    icon:"🎁", path:"/membership-benefits", bg:"#f0fdf4", border:"#bbf7d0", text:"#15803d" },
  { key:"game",    label:"Game Center",    icon:"🎮", path:"/game-center", bg:"#f5f3ff", border:"#ddd6fe", text:"#7c3aed" },
  { key:"loyalty", label:"Đại sảnh danh vọng",     icon:"👑", path:"/leaderboard", bg:"#fffbeb", border:"#fde68a", text:"#d97706" },
];

export default function HomeQuickActions() {
  const navigate = useNavigate();
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
      {ACTIONS.map(a => (
        <button key={a.key} onClick={() => navigate(a.path)} style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", gap:6, padding:"14px 4px",
          borderRadius:16, border:`1.5px solid ${a.border}`,
          background:a.bg, cursor:"pointer",
        }}>
          <span style={{ fontSize:24 }}>{a.icon}</span>
          <span style={{ fontSize:10, fontWeight:700, color:a.text, textAlign:"center" }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
