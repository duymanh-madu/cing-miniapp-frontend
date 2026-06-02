import { useState } from "react";
import AdminStats from "./AdminStats";
import AdminMissions from "./AdminMissions";
import AdminGames from "./AdminGames";
import AdminVouchers from "./AdminVouchers";
import AdminPlayers from "./AdminPlayers";
import AdminAppConfig from "./AdminAppConfig";
import AdminLogs from "./AdminLogs";
import AdminCDP from "./AdminCDP";
import AdminAlltimeGames from './AdminAlltimeGames';
import AdminMonitor from './AdminMonitor';
import AdminLeaderboard from "./AdminLeaderboard";

const TABS = [
  { key:"stats",     icon:"📊", label:"Tổng quan" },
  { key:"missions",  icon:"🎯", label:"Nhiệm vụ" },
  { key:"games",     icon:"🎮", label:"Games" },
  { key:"vouchers",  icon:"🎟", label:"Voucher" },
  { key:"players",   icon:"👥", label:"Người chơi" },
  { key:"appconfig", icon:"⚙️", label:"Cấu hình App" },
  { key:"cdp",       icon:"📡", label:"CDP" },
  { key:"leaderboard_admin", icon:"🏆", label:"BXH & Thưởng" },
  { key:"logs",      icon:"📋", label:"Activity Logs" },
];

export default function AdminDashboard({ auth }) {
  const [tab, setTab] = useState("stats");

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f13", display:"flex" }}>
      {/* SIDEBAR */}
      <div style={{ width:220, background:"#1a1a24", borderRight:"1px solid #2a2a38",
        display:"flex", flexDirection:"column", position:"fixed", height:"100vh", zIndex:10 }}>
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid #2a2a38" }}>
          <p style={{ color:"#D4531C", fontSize:10, fontWeight:800,
            letterSpacing:3, margin:"0 0 4px" }}>CING HU TANG</p>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>Admin Panel</p>
          <p style={{ color:"#666", fontSize:11, margin:"4px 0 0" }}>{auth.admin?.username}</p>
        </div>
        <nav style={{ flex:1, padding:"12px 0" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"11px 20px", border:"none", cursor:"pointer", textAlign:"left",
                background: tab===t.key ? "rgba(212,83,28,0.15)" : "none",
                borderLeft: tab===t.key ? "3px solid #D4531C" : "3px solid transparent",
                color: tab===t.key ? "#D4531C" : "#888",
                fontSize:13, fontWeight: tab===t.key ? 700 : 500,
              }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"16px 20px", borderTop:"1px solid #2a2a38" }}>
          <button onClick={auth.logout}
            style={{ width:"100%", background:"rgba(255,80,80,0.1)",
              border:"1px solid rgba(255,80,80,0.2)", borderRadius:8,
              color:"#ff6b6b", padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ marginLeft:220, flex:1, padding:"24px", minHeight:"100vh" }}>
        {tab==="stats"     && <AdminStats token={auth.token} />}
        {tab==="missions"  && <AdminMissions token={auth.token} />}
        {tab==="notifications" && <AdminNotifications token={auth.token} />}
        {tab==="games"     && <AdminGames token={auth.token} />}
        {tab==="vouchers"  && <AdminVouchers token={auth.token} />}
        {tab==="players"   && <AdminPlayers token={auth.token} />}
        {tab==="appconfig" && <AdminAppConfig token={auth.token} />}
        {tab==="cdp"       && <AdminCDP token={auth.token} />}
        {tab==="leaderboard_admin" && <AdminLeaderboard token={auth.token} />}
        {tab==="logs"      && <AdminLogs token={auth.token} />}
      </div>
    </div>
  );
}
