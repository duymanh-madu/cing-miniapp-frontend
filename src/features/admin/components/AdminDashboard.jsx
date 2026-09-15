import { useEffect, useState } from "react";
import "./admin-dashboard-shell.css";
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
import AdminWallet from "./AdminWallet";
import AdminWalletPosCounter from "../wallet-pos/AdminWalletPosCounter";
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
  { key:"wallet_admin", icon:"💰", label:"Cing Wallet" },
  { key:"wallet_pos", icon:"▦", label:"Cing Pay" },
  { key:"system_health",icon:"🛡", label:"System Health" },
  { key:"analytics_pro", icon:"📈", label:"Analytics" },
  { key:"management",   icon:"🔐", label:"Quản lý Admin" },
  { key:"badges_admin",  icon:"🏅", label:"Danh hiệu" },
  { key:"members_admin", icon:"👤", label:"Thành viên" },
];

const ROLE_TABS = {
  super_admin: ALL_TABS.map(t => t.key),

  cashier: [
    "stats",
    "orders_admin",
    "payments_admin",
    "wallet_pos",
  ],

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

  const allowedKeys = ROLE_TABS[normalizedRole] || [];

  return ALL_TABS.filter(
    t =>
      allowedKeys.includes(t.key) &&
      (
        t.key !== "wallet_admin" ||
        normalizedRole === "super_admin"
      )
  );
}

export default function AdminDashboard({ auth }) {
  useEffect(() => {
    /*
     * The Mini App globally optimizes touch input with
     * touch-action: manipulation. Super Admin is different:
     * its dense operational workspace intentionally supports
     * native browser pinch zoom as well as horizontal/vertical pan.
     *
     * Scope the override to the Admin lifecycle and restore the
     * exact previous inline authority when leaving Admin.
     */
    const root =
      document.documentElement;

    const previousTouchAction =
      root.style.touchAction;

    root.style.touchAction =
      "auto";

    return () => {
      root.style.touchAction =
        previousTouchAction;
    };
  }, []);

  const role = auth.admin?.role || "";
  const TABS = getAllowedTabs(role);
  const [tab, setTab] = useState(TABS[0]?.key || "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selectTab = nextTab => {
    setTab(nextTab);
    setMobileNavOpen(false);
  };

  const activeTab =
    TABS.some(t => t.key === tab)
      ? tab
      : "";

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-mobilebar">
        <button
          type="button"
          className="admin-dashboard-mobilebar__menu"
          aria-expanded={mobileNavOpen}
          aria-controls="admin-dashboard-sidebar"
          onClick={() => setMobileNavOpen(true)}
        >
          ☰ Menu
        </button>

        <span className="admin-dashboard-mobilebar__title">
          {TABS.find(item => item.key === activeTab)?.label || "Admin Panel"}
        </span>

        <span className="admin-dashboard-mobilebar__role">
          {role}
        </span>
      </div>

      <button
        type="button"
        className={`admin-dashboard-backdrop${mobileNavOpen ? " is-open" : ""}`}
        aria-label="Đóng menu quản trị"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* SIDEBAR */}
      <aside
        id="admin-dashboard-sidebar"
        className={`admin-dashboard-sidebar${mobileNavOpen ? " is-open" : ""}`}
      >
        <div className="admin-dashboard-sidebar__identity">
          <button
            type="button"
            className="admin-dashboard-sidebar__close"
            aria-label="Đóng menu"
            onClick={() => setMobileNavOpen(false)}
          >
            ×
          </button>
          <p style={{ color:"#D4531C", fontSize:10, fontWeight:800,
            letterSpacing:3, margin:"0 0 4px" }}>CING HU TANG</p>
          <p style={{ color:"white", fontSize:14, fontWeight:900, margin:0 }}>Admin Panel</p>
          <p style={{ color:"#666", fontSize:11, margin:"4px 0 0" }}>
            {auth.admin?.username} — role: {role || "none"}
          </p>
          <p style={{ color:"#D4531C", fontSize:10, fontWeight:800, margin:"6px 0 0", textTransform:"uppercase" }}>{role}</p>
        </div>
        <nav className="admin-dashboard-sidebar__nav">
          {TABS.map(t => (
            <button key={t.key} onClick={() => selectTab(t.key)}
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
        <div className="admin-dashboard-sidebar__footer">
          <button onClick={auth.logout}
            style={{ width:"100%", background:"rgba(255,80,80,0.1)",
              border:"1px solid rgba(255,80,80,0.2)", borderRadius:8,
              color:"#ff6b6b", padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="admin-dashboard-content">
        {activeTab==="stats"     && <AdminStats token={auth.token} />}
        {activeTab==="missions"  && <AdminMissions token={auth.token} />}
        {activeTab==="notifications" && <AdminNotifications token={auth.token} />}
        {activeTab==="games"     && <AdminGames token={auth.token} />}
        {activeTab==="players"   && <AdminPlayers token={auth.token} />}
        {activeTab==="appconfig" && <AdminAppConfig token={auth.token} />}
        {activeTab==="cdp"       && <AdminCDP token={auth.token} />}
        {activeTab==="leaderboard_admin" && <AdminLeaderboard token={auth.token} />}
        {activeTab==="logs"      && <AdminLogs token={auth.token} />}
        {activeTab==="monitor"      && <AdminMonitor token={auth.token} />}
        {activeTab==="alltime_games" && <AdminAlltimeGames token={auth.token} />}
        {activeTab==="daily_challenge" && <AdminDailyChallenge token={auth.token} />}
        {activeTab==="orders_admin"  && <AdminOrders token={auth.token} />}
        {activeTab==="delivery_admin" && <AdminDelivery token={auth.token} />}
        {activeTab==="payments_admin" && <AdminPayments token={auth.token} />}
        {activeTab==="wallet_admin" && <AdminWallet token={auth.token} role={role} />}
        {activeTab==="wallet_pos" && <AdminWalletPosCounter token={auth.token} role={auth.admin?.role} />}
        {activeTab==="system_health" && <AdminSystemHealth token={auth.token} />}
        {activeTab==="analytics_pro" && <AdminAnalytics token={auth.token} />}
        {activeTab==="management"    && <AdminManagement token={auth.token} />}
        {activeTab==="badges_admin"  && <AdminBadges token={auth.token} />}
        {activeTab==="members_admin" && <AdminMembers token={auth.token} />}
      </main>
    </div>
  );
}
