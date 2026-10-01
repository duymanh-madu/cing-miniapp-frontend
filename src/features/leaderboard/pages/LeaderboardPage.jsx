import { useState, useEffect, useRef } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { useMemberRequired } from "@/hooks/useMemberRequired";
import V8RoyalSpendingHall from "@/features/leaderboard/components/royal/V8RoyalSpendingHall";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

const DEFAULT_TABS = [
  { id:"weekly",  label:"Tuần này" },
  { id:"monthly", label:"Tháng này" },
  { id:"yearly",  label:"Năm này" },
  { id:"alltime", label:"All Time" },
];

function RankNotification({ msg, up, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", top:"calc(env(safe-area-inset-top, 0px) + 56px)", left:16, right:16, zIndex:999,
      background: up ? "linear-gradient(135deg,#00c853,#69f0ae)" : "linear-gradient(135deg,#d50000,#ff5252)",
      borderRadius:16, padding:"14px 18px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:28 }}>{up ? "📈" : "📉"}</span>
      <div>
        <p style={{ color:"white", fontSize:13, fontWeight:900, margin:0 }}>{msg}</p>
        <p style={{ color:"rgba(255,255,255,0.75)", fontSize:11, margin:"3px 0 0" }}>
          {up ? "Tuyệt vời! Hãy tiếp tục phát huy!" : "Hãy cố gắng để leo hạng!"}
        </p>
      </div>
    </div>
  );
}

function Avatar({ name, size=64, bg="linear-gradient(135deg,#1a0a2e,#2d1254)", color="rgba(255,255,255,0.5)", fontSize=24 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size/2, background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize, fontWeight:900, color, flexShrink:0 }}>
      {(name||"?")[0]?.toUpperCase()}
    </div>
  );
}

export default function LeaderboardPage() {
  const { isActivated, requireMember, MemberPrompt } = useMemberRequired();
  const navigate     = useNavigate();
  const goProfile = (userId) => {
    const phone = String(userId).replace(/\D/g,"").replace(/^84/,"0");
    if (phone.length >= 9) navigate(`/profile/${phone}`);
  };
  const profile      = useAuthStore(s => s.profile);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);

  // Phone hợp lệ — reactive
  const validPhone = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g, "").replace(/^84/, "0");
      if (n.length >= 9) return n;
    }
    return "";
  })();

  const [tab,           setTab]           = useState("weekly");
  const [data,          setData]          = useState([]);
  const [myRank,        setMyRank]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [notification,  setNotification]  = useState(null);
  const [resetNotif,    setResetNotif]    = useState(null);
  const [rewardsConfig, setRewardsConfig] = useState({});
  const [customRange,   setCustomRange]   = useState({ from:"", to:"" });
  const [showCustom,    setShowCustom]    = useState(false);
  const [customEnabled, setCustomEnabled] = useState(true);
  const [customTabName, setCustomTabName] = useState("Tùy chỉnh");
  const prevRankRef      = useRef(null);
  const currentTabRef    = useRef(tab);
  const currentRankIdRef = useRef("");
  const canViewLeaderboard = Boolean(isActivated && validPhone);

  currentTabRef.current = tab;
  currentRankIdRef.current = canViewLeaderboard ? validPhone : "";

  const TABS = customEnabled ? [...DEFAULT_TABS, { id:"custom", label: customTabName }] : DEFAULT_TABS;

  // App config — 1 lần duy nhất
  useEffect(() => {
    apiClient.get("/app-config/public").then(r => {
      const cfg   = r.data?.data || {};
      const lbCfg = cfg.leaderboard_config || {};
      setRewardsConfig(lbCfg.spending || {});
      if (cfg.custom_leaderboard_name) setCustomTabName(cfg.custom_leaderboard_name);
      if (cfg.custom_leaderboard_from) setCustomRange({ from: cfg.custom_leaderboard_from, to: cfg.custom_leaderboard_to || "" });
      // Ẩn tab custom nếu admin tắt
      if (lbCfg.spending?.custom?.enabled === false) setCustomEnabled(false);
    }).catch(() => {});
  }, [canViewLeaderboard]);

  // Socket realtime + visibilitychange safety net
  useEffect(() => {
    if (!canViewLeaderboard) return;

    // Lắng nghe socket — retry đến khi connected
    let attempts = 0;

    const handler = (payload) => {
      if (payload?.type === "game") return;

      if (
        payload?.type === "spending" &&
        payload?.period === currentTabRef.current &&
        Array.isArray(payload?.leaderboard)
      ) {
        const rows = payload.leaderboard;
        setData(rows);

        const rankId = currentRankIdRef.current;
        if (rankId) {
          const idx = rows.findIndex(r => String(r.user_id) === String(rankId));

          if (idx >= 0) {
            const nextRank = idx + 1;
            const prevRank = prevRankRef.current;
            const totalSpent = rows[idx]?.total_spent || rows[idx]?.total_spent_all_time || 0;

            if (prevRank !== null && prevRank !== nextRank) {
              if (nextRank < prevRank) {
                setNotification({ msg:`Bạn vừa thăng từ hạng #${prevRank} lên hạng #${nextRank}! 🔥`, up:true });
              } else {
                setNotification({ msg:`Bạn vừa tụt từ hạng #${prevRank} xuống hạng #${nextRank}`, up:false });
              }
            }

            prevRankRef.current = nextRank;
            setMyRank({
              ...rows[idx],
              rank: nextRank,
              total: rows.length,
              total_spent: totalSpent,
            });
          }
        }

        return;
      }

      fetchData(
        currentTabRef.current,
        "",
        "",
        { background:true }
      );
    };

    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.off("leaderboard.updated", handler); // tránh duplicate
        socket.on("leaderboard.updated", handler);
        return;
      }
      if (attempts++ < 30) setTimeout(attach, 1000);
    };
    attach();

    // visibilitychange: fetch lại khi user quay lại app/tab
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchData(
        currentTabRef.current,
        "",
        "",
        { background:true }
      );
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      getRuntimeSocket()?.off("leaderboard.updated", handler);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const fetchData = (period, from="", to="", { background=false } = {}) => {
    if (!canViewLeaderboard) {
      setData([]);
      setMyRank(null);
      setLoading(false);
      return;
    }

    if (!background) {
      setLoading(true);
    }
    let url = `/leaderboard/top-spenders?period=${period}`;
    if (period === "custom" && from && to) url += `&from=${from}&to=${to}`;

    apiClient.get(url)
      .then(r => setData(r.data?.data || []))
      .catch(() => setData([]))
      .finally(() => {
        if (!background) {
          setLoading(false);
        }
      });

    // My rank — dùng phone (players.user_id = phone)
    const rankId = validPhone;
    if (rankId) {
      apiClient.get(`/leaderboard/user-rank/${rankId}?period=${period}`)
        .then(r => {
          const rd = r.data?.data;
          if (rd?.rank && prevRankRef.current !== null) {
            const prev = prevRankRef.current, curr = rd.rank;
            if (curr < prev) setNotification({ msg:`Bạn vừa thăng từ hạng #${prev} lên hạng #${curr}! 🔥`, up:true });
            else if (curr > prev) setNotification({ msg:`Bạn vừa tụt từ hạng #${prev} xuống hạng #${curr}`, up:false });
          }
          if (rd?.rank) prevRankRef.current = rd.rank;
          setMyRank(rd);
        }).catch(() => {});
    }
  };

  // Fetch khi tab thay đổi hoặc phone được resolve
  useEffect(() => {
    if (!canViewLeaderboard) {
      setData([]);
      setMyRank(null);
      setLoading(false);
      return;
    }

    if (tab === "custom") {
      setShowCustom(true);
      if (customRange.from && customRange.to) fetchData("custom", customRange.from, customRange.to);
      return;
    }
    setShowCustom(false);
    fetchData(tab);
  }, [tab, customRange.from, customRange.to, validPhone, canViewLeaderboard]);

  const publicTop10 = data.slice(0, 10);
  const top1 = publicTop10[0], top2 = publicTop10[1], top3 = publicTop10[2];
  const rest = publicTop10.slice(3);

  if (!canViewLeaderboard) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
        {MemberPrompt}
        <div style={{ fontSize:64, marginBottom:16 }}>🏆</div>
        <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 12px" }}>Đại Sảnh Danh Vọng</h2>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, margin:"0 0 28px", lineHeight:1.6 }}>
          Đăng ký thành viên để xem bảng xếp hạng và tranh tài cùng cộng đồng Cing iu 🎯
        </p>
        <button onClick={() => requireMember()}
          style={{ padding:"16px 32px", borderRadius:14, border:"none",
            background:"linear-gradient(135deg,#B66A3C,#E8622A)",
            color:"white", fontSize:16, fontWeight:800, cursor:"pointer" }}>
          📱 Kích hoạt ngay
        </button>
      </div>
    );
  }

  return (
    <V8RoyalSpendingHall
      tabs={TABS}
      tab={tab}
      onTab={setTab}
      navigateBack={() => navigate(-1)}
      showCustom={showCustom}
      customRange={customRange}
      rewardsConfig={rewardsConfig}
      loading={loading}
      data={publicTop10}
      myRank={myRank}
      profile={profile}
      validPhone={validPhone}
      onProfile={goProfile}
      resetNotification={resetNotif}
      notificationNode={
        notification ? (
          <RankNotification
            msg={notification.msg}
            up={notification.up}
            onDone={() => setNotification(null)}
          />
        ) : null
      }
    />
  );
}
