import { useState } from "react";
import AdminStats from "./AdminStats";
import AdminMissions from "./AdminMissions";
import AdminGames from "./AdminGames";
import AdminPlayers from "./AdminPlayers";
import AdminAppConfig from "./AdminAppConfig";
import AdminLogs from "./AdminLogs";
import AdminCDP from "./AdminCDP";
import AdminAlltimeGames from './AdminAlltimeGames';
import AdminDailyChallenge from './AdminDailyChallenge';
import AdminMonitor from './AdminMonitor';
import AdminLeaderboard from "./AdminLeaderboard";
import AdminNotifications from './AdminNotifications';
import AdminManagement from './AdminManagement';
import AdminBadges from './AdminBadges';
import AdminMembers from './AdminMembers';
import AdminAnalytics from './AdminAnalytics';
import AdminOrders from './AdminOrders';
import AdminDelivery from './AdminDelivery';
import AdminPayments from './AdminPayments';
import AdminSystemHealth from './AdminSystemHealth';

const ALL_TABS = [
  { key:"stats",     icon:"📊", label:"Tổng quan" },
  { key:"missions",  icon:"🎯", label:"Nhiệm vụ" },
  { key:"games",     icon:"🎮", label:"Games" },
  { key:"players",   icon:"👥", label:"Người chơi" },
  { key:"appconfig", icon:"⚙️", label:"Cấu hình App" },
  { key:"cdp",       icon:"📡", label:"CDP" },
  { key:"leaderboard_admin", icon:"🏆", label:"BXH & Thưởng" },
  { key:"logs",      icon:"📋", label:"Activity Logs" },
  { key:"notifications", icon:"🔔", label:"Thông báo" },
  { key:"monitor",       icon:"👁",  label:"Monitor" },
  { key:"alltime_games", icon:"🏅", label:"Alltime Games" },
  { key:"daily_challenge", icon:"🎯", label:"Thách thức ngày" },
  { key:"orders_admin",  icon:"📦", label:"Đơn hàng" },
  { key:"delivery_admin", icon:"🚀", label:"Giao hàng" },
  { key:"payments_admin",icon:"💳", label:"Thanh toán" },
  { key:"system_health",icon:"🛡", label:"System Health" },
  { key:"analytics_pro", icon:"📈", label:"Analytics" },
  { key:"management",   icon:"🔐", label:"Quản lý Admin" },
  { key:"badges_admin",  icon:"🏅", label:"Danh hiệu" },
  { key:"members_admin", icon:"👤", label:"Thành viên" },
];

const ROLE_TABS = {
  super_admin: ALL_TABS.map(t => t.key),

  manager: [
    "stats",
    "missions",
    "games",
    "players",
    "leaderboard_admin",
    "logs",
    "notifications",
    "monitor",
    "alltime_games",
    "daily_challenge",
    "orders_admin",
    "delivery_admin",
    "payments_admin",
    "analytics_pro",
    "badges_admin",
    "members_admin",
  ],

  staff: [
    "stats",
    "orders_admin",
    "delivery_admin",
    "members_admin",
  ],

  delivery: [
    "stats",
    "orders_admin",
    "delivery_admin",
  ],

  delivery_admin: [
    "orders_admin",
    "delivery_admin",
  ],

  marketing: [
    "stats",
    "notifications",
    "leaderboard_admin",
    "logs",
    "analytics_pro",
    "badges_admin",
  ],

  viewer: [
    "stats",
    "logs",
    "monitor",
  ],
};

function getAllowedTabs(role) {
  const normalizedRole = String(role || "").toLowerCase();

  // Phase 1 mềm: role lạ / chưa có role thì vẫn full quyền để tránh tự khóa admin hiện tại.
  const allowedKeys = ROLE_TABS[normalizedRole] || ROLE_TABS.super_admin;

  return ALL_TABS.filter(t => allowedKeys.includes(t.key));
}

export default function AdminDashboard({ auth }) {
  const role = auth.admin?.role || "super_admin";
  const TABS = getAllowedTabs(role);
  const [tab, setTab] = useState(TABS[0]?.key || "stats");

  return (
    <div
  style={{
    minHeight:"100vh",
    background:"#0f0f13",
    display:"flex"
  }}
>
      {/* SIDEBAR */}
      <div style={{ width:220, background:"#1a1a24", borderRight:"1px solid #2a2a38",
        display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100dvh", zIndex:10, overflowY:"auto", overflowX:"hidden" }}>
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid #2a2a38" }}>
          <p style={{ color:"#D4531C", fontSize:10, fontWeight:800,
            letterSpacing:3, margin:"0 0 4px" }}>CING HU TANG</p>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>Admin Panel</p>
          <p style={{ color:"#666", fontSize:11, margin:"4px 0 0" }}>
            {auth.admin?.username} — role: {role || "none"}
          </p>
          <p style={{ color:"#D4531C", fontSize:10, fontWeight:800, margin:"6px 0 0", textTransform:"uppercase" }}>{role}</p>
        </div>
        <nav style={{ flex:1, padding:"12px 0 76px", overflowY:"auto", overflowX:"hidden", minHeight:0 }}>
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
        <div style={{
          position:"fixed",
          left:0,
          bottom:0,
          width:220,
          boxSizing:"border-box",
          padding:"12px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)",
          borderTop:"1px solid #2a2a38",
          background:"#1a1a24",
          zIndex:30
        }}>
          <button onClick={auth.logout}
            style={{ width:"100%", background:"rgba(255,80,80,0.1)",
              border:"1px solid rgba(255,80,80,0.2)", borderRadius:8,
              color:"#ff6b6b", padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div
  style={{
    marginLeft:0,
    flex:1,
    padding:"24px",
    minHeight:"100vh",
    overflowY:"auto",
    overflowX:"hidden",
    paddingBottom:"120px"
  }}
>
        {tab==="stats"     && <AdminStats token={auth.token} />}
        {tab==="missions"  && <AdminMissions token={auth.token} />}
        {tab==="notifications" && <AdminNotifications token={auth.token} />}
        {tab==="games"     && <AdminGames token={auth.token} />}
        {tab==="players"   && <AdminPlayers token={auth.token} />}
        {tab==="appconfig" && <AdminAppConfig token={auth.token} />}
        {tab==="cdp"       && <AdminCDP token={auth.token} />}
        {tab==="leaderboard_admin" && <AdminLeaderboard token={auth.token} />}
        {tab==="logs"      && <AdminLogs token={auth.token} />}
        {tab==="monitor"      && <AdminMonitor token={auth.token} />}
        {tab==="alltime_games" && <AdminAlltimeGames token={auth.token} />}
        {tab==="daily_challenge" && <AdminDailyChallenge token={auth.token} />}
        {tab==="orders_admin"  && <AdminOrders token={auth.token} />}
        {tab==="delivery_admin" && <AdminDelivery token={auth.token} />}
        {tab==="payments_admin" && <AdminPayments token={auth.token} />}
        {tab==="system_health" && <AdminSystemHealth token={auth.token} />}
        {tab==="analytics_pro" && <AdminAnalytics token={auth.token} />}
        {tab==="management"    && <AdminManagement token={auth.token} />}
        {tab==="badges_admin"  && <AdminBadges token={auth.token} />}
        {tab==="members_admin" && <AdminMembers token={auth.token} />}
      </div>
    </div>
  );
}
