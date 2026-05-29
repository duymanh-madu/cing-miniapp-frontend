import { useState, useEffect, useRef } from "react";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";

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
    <div style={{ position:"fixed", top:24, left:16, right:16, zIndex:999,
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

function Top1Card({ entry }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:8 }}>
      <div style={{ fontSize:52, marginBottom:6, filter:"drop-shadow(0 0 24px rgba(255,215,0,0.9))" }}>👑</div>
      <div style={{ position:"relative", marginBottom:10 }}>
        {entry.avatar
          ? <img src={entry.avatar} alt="" style={{ width:96,height:96,borderRadius:48,objectFit:"cover",border:"3px solid #FFD700" }}/>
          : <Avatar name={entry.player_name||entry.name} size={96} bg="linear-gradient(135deg,#FFD700,#FFA500)" color="#1a0a2e" fontSize={38} />}
        <div style={{ position:"absolute", bottom:-4, right:-4, background:"#FFD700",
          borderRadius:14, width:28, height:28, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:14, fontWeight:900, color:"#1a0a2e",
          boxShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>1</div>
      </div>
      <p style={{ color:"white", fontSize:17, fontWeight:900, margin:"0 0 6px", textAlign:"center", textShadow:"0 0 20px rgba(255,215,0,0.4)" }}>
        {entry.player_name || entry.name || "Ẩn danh"}
      </p>
      <div style={{ background:"linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.1))", border:"1px solid rgba(255,215,0,0.4)", borderRadius:14, padding:"7px 20px" }}>
        <p style={{ color:"#FFD700", fontSize:20, fontWeight:900, margin:0 }}>
          {fmt(entry.total_spent || entry.total_spent_all_time || 0)}
        </p>
      </div>
    </div>
  );
}

function Top23Card({ entry, rank }) {
  const c = rank===2
    ? { bg:"linear-gradient(135deg,#C0C0C0,#E8E8E8)", text:"#1a1a2e", glow:"rgba(192,192,192,0.4)", medal:"🥈" }
    : { bg:"linear-gradient(135deg,#CD7F32,#E8A857)", text:"#1a0a00", glow:"rgba(205,127,50,0.4)", medal:"🥉" };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
      <span style={{ fontSize:28, marginBottom:6, filter:`drop-shadow(0 0 8px ${c.glow})` }}>{c.medal}</span>
      <div style={{ position:"relative", marginBottom:8 }}>
        {entry.avatar
          ? <img src={entry.avatar} alt="" style={{width:64,height:64,borderRadius:32,objectFit:"cover",border:`3px solid ${c.bg}`}}/>
          : <Avatar name={entry.player_name||entry.name} size={64} bg={c.bg} color={c.text} fontSize={24} />}
        <div style={{ position:"absolute", bottom:-4, right:-4, background:c.bg,
          borderRadius:10, width:20, height:20, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:10, fontWeight:900, color:c.text,
          boxShadow:"0 2px 6px rgba(0,0,0,0.4)" }}>{rank}</div>
      </div>
      <p style={{ color:"rgba(255,255,255,0.9)", fontSize:12, fontWeight:700, margin:"0 0 3px",
        textAlign:"center", maxWidth:90, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
        {entry.player_name || entry.name || "Ẩn danh"}
      </p>
      <p style={{ color:"rgba(255,215,0,0.75)", fontSize:11, fontWeight:800, margin:0 }}>
        {fmt(entry.total_spent || entry.total_spent_all_time || 0)}
      </p>
    </div>
  );
}

export default function LeaderboardPage() {
  const navigate     = useNavigate();
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
  const [customTabName, setCustomTabName] = useState("Tùy chỉnh");
  const prevRankRef    = useRef(null);
  const currentTabRef  = useRef(tab);
  currentTabRef.current = tab;

  const TABS = [...DEFAULT_TABS, { id:"custom", label: customTabName }];

  // App config — 1 lần duy nhất
  useEffect(() => {
    apiClient.get("/app-config/public").then(r => {
      const cfg   = r.data?.data || {};
      const lbCfg = cfg.leaderboard_config || {};
      setRewardsConfig(lbCfg.spending || {});
      if (cfg.custom_leaderboard_name) setCustomTabName(cfg.custom_leaderboard_name);
      if (cfg.custom_leaderboard_from) setCustomRange({ from: cfg.custom_leaderboard_from, to: cfg.custom_leaderboard_to || "" });
    }).catch(() => {});
  }, []);

  // Socket realtime
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) { socket.on("leaderboard.updated", () => fetchData(currentTabRef.current)); return; }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();
    return () => { getRuntimeSocket()?.off("leaderboard.updated"); };
  }, []);

  const fetchData = (period, from="", to="") => {
    setLoading(true);
    let url = `/leaderboard/top-spenders?period=${period}&limit=100`;
    if (period === "custom" && from && to) url += `&from=${from}&to=${to}`;

    apiClient.get(url)
      .then(r => setData(r.data?.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));

    // My rank — dùng phone (players.user_id = phone)
    const rankId = validPhone || profile?.id;
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
    if (tab === "custom") {
      setShowCustom(true);
      if (customRange.from && customRange.to) fetchData("custom", customRange.from, customRange.to);
      return;
    }
    setShowCustom(false);
    fetchData(tab);
  }, [tab, customRange.from, validPhone]);

  const top1 = data[0], top2 = data[1], top3 = data[2], rest = data.slice(3);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#050310 0%,#0d0820 35%,#080514 70%,#050310 100%)", paddingBottom:100 }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:"var(--app-safe-top, 0px)", background:"#050310", zIndex:99 }} />

      {resetNotif && (
        <div style={{ position:"fixed", top:24, left:16, right:16, zIndex:999, background:"linear-gradient(135deg,#D4531C,#ff6b35)", borderRadius:16, padding:"14px 18px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
          <p style={{color:"white",fontSize:13,fontWeight:900,margin:"0 0 4px"}}>🔄 BXH tuần mới!</p>
          <p style={{color:"rgba(255,255,255,0.85)",fontSize:11,margin:0,whiteSpace:"pre-line"}}>{resetNotif}</p>
        </div>
      )}

      {notification && <RankNotification msg={notification.msg} up={notification.up} onDone={() => setNotification(null)} />}

      {/* HEADER */}
      <div style={{ background:"linear-gradient(180deg,rgba(255,215,0,0.07),transparent)", padding:"20px 16px 0", borderBottom:"1px solid rgba(255,215,0,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingTop:"var(--app-safe-top, 0px)" }}>
          <button onClick={() => navigate(-1)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"white", borderRadius:12, width:38, height:38, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1, textAlign:"center" }}>
            <p style={{ color:"rgba(255,215,0,0.6)", fontSize:10, fontWeight:800, letterSpacing:4, margin:"0 0 4px", textTransform:"uppercase" }}>Hall of Fame</p>
            <h1 style={{ color:"white", fontSize:22, fontWeight:900, margin:0, letterSpacing:1 }}>Đại sảnh danh vọng</h1>
            <p style={{ color:"rgba(255,215,0,0.55)", fontSize:13, fontWeight:500, margin:"6px 0 0" }}>Nơi vinh danh những Cing iu chịu chi nhất</p>
          </div>
          <div style={{ width:38 }}/>
        </div>

        <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:16 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              whiteSpace:"nowrap", padding:"8px 16px", borderRadius:20, flexShrink:0,
              border: tab===t.id ? "none" : "1px solid rgba(255,255,255,0.1)",
              background: tab===t.id ? "linear-gradient(135deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.04)",
              color: tab===t.id ? "#1a0a2e" : "rgba(255,255,255,0.45)",
              fontSize:12, fontWeight: tab===t.id ? 900 : 500, cursor:"pointer",
              boxShadow: tab===t.id ? "0 4px 15px rgba(255,180,0,0.35)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {showCustom && customRange.from && (
          <div style={{ padding:"10px 14px", display:"flex", gap:8, alignItems:"center", background:"rgba(255,215,0,0.08)", borderRadius:12, marginBottom:8 }}>
            <span style={{ fontSize:16 }}>📅</span>
            <div>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:10, margin:"0 0 2px" }}>Thời gian bình chọn</p>
              <p style={{ color:"#FFD700", fontSize:13, fontWeight:700, margin:0 }}>
                {new Date(customRange.from).toLocaleDateString("vi-VN")} — {customRange.to ? new Date(customRange.to).toLocaleDateString("vi-VN") : "nay"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* REWARDS */}
      {rewardsConfig[tab]?.enabled && rewardsConfig[tab]?.rewards?.length > 0 && (
        <div style={{ margin:"12px 16px 0", padding:"12px 14px", background:"linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.05))", border:"1px solid rgba(255,215,0,0.2)", borderRadius:14 }}>
          <p style={{ color:"#FFD700", fontSize:10, fontWeight:800, margin:"0 0 8px", letterSpacing:2 }}>🎁 PHẦN THƯỞNG KỲ NÀY</p>
          <div style={{ display:"flex", gap:8 }}>
            {rewardsConfig[tab].rewards.map((r,i) => (
              <div key={i} style={{ flex:1, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"8px 6px", textAlign:"center", border:"1px solid rgba(255,215,0,0.1)" }}>
                <p style={{ fontSize:18, margin:"0 0 2px" }}>{i===0?"🥇":i===1?"🥈":"🥉"}</p>
                <p style={{ color:"#FFD700", fontSize:13, fontWeight:900, margin:"0 0 1px" }}>{(r.points||0).toLocaleString()} điểm</p>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:9, margin:0 }}>{r.label||"Phần thưởng"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px", color:"rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⏳</div>
          <p>Đang tải bảng xếp hạng...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px", color:"rgba(255,255,255,0.3)", textAlign:"center" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📊</div>
          <p style={{ fontSize:14, fontWeight:600 }}>Chưa có dữ liệu cho kỳ này</p>
          <p style={{ fontSize:12, marginTop:6, lineHeight:1.7 }}>Hãy đặt hàng để xuất hiện<br/>trên bảng xếp hạng!</p>
        </div>
      ) : (
        <>
          {/* PODIUM */}
          <div style={{ padding:"32px 24px 20px" }}>
            {top1 && <Top1Card entry={top1} />}
            {(top2 || top3) && (
              <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:28, padding:"0 8px" }}>
                {top2 && <Top23Card entry={top2} rank={2} />}
                {top3 && <Top23Card entry={top3} rank={3} />}
              </div>
            )}
          </div>

          <div style={{ margin:"0 24px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.2),transparent)" }}/>
            <span style={{ color:"rgba(255,215,0,0.4)", fontSize:11, fontWeight:700, letterSpacing:2 }}>TOP 4–100</span>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.2),transparent)" }}/>
          </div>

          {/* MY RANK */}
          {myRank?.rank && (
            <div style={{ margin:"0 16px 14px", background:"linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.06))", border:"1px solid rgba(255,215,0,0.25)", borderRadius:16, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {(myRank?.avatar || profile?.avatar)
                  ? <img src={myRank?.avatar || profile?.avatar} alt="" style={{width:36,height:36,borderRadius:18,objectFit:"cover",flexShrink:0}}/>
                  : <Avatar name={profile?.name} size={36} bg="linear-gradient(135deg,#D4531C,#FF6B35)" color="white" fontSize={14} />}
                <div>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, margin:"0 0 2px" }}>Hạng của bạn</p>
                  <p style={{ color:"white", fontSize:13, fontWeight:800, margin:0 }}>{profile?.name || "Bạn"}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#FFD700", fontSize:22, fontWeight:900, margin:0 }}>#{myRank.rank}</p>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, margin:"2px 0 0" }}>
                  {fmt(myRank.total_spent || myRank.total_spent_all_time || 0)}
                </p>
              </div>
            </div>
          )}

          {/* REST */}
          <div style={{ margin:"0 16px" }}>
            {rest.map((entry, i) => {
              const rank = i + 4;
              const isMe = validPhone ? String(entry.user_id) === validPhone : String(entry.user_id) === String(profile?.id);
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, marginBottom:4, background: isMe ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.02)", border: isMe ? "1px solid rgba(255,215,0,0.2)" : "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12, fontWeight:700, width:26, textAlign:"center", flexShrink:0 }}>{rank}</span>
                  {entry.avatar
                    ? <img src={entry.avatar} alt="" style={{width:36,height:36,borderRadius:18,objectFit:"cover",flexShrink:0}}/>
                    : <Avatar name={entry.player_name||entry.name} size={36} bg={isMe?"linear-gradient(135deg,#D4531C,#FF6B35)":"linear-gradient(135deg,#1a0a2e,#2d1254)"} color={isMe?"white":"rgba(255,255,255,0.35)"} fontSize={13} />}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color: isMe ? "#FFD700" : "white", fontSize:13, fontWeight: isMe ? 800 : 600, margin:0, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                      {entry.player_name || entry.name || "Ẩn danh"}{isMe && " (bạn)"}
                    </p>
                  </div>
                  <p style={{ color: isMe ? "#FFD700" : "rgba(255,215,0,0.55)", fontSize:13, fontWeight:800, margin:0, flexShrink:0 }}>
                    {fmt(entry.total_spent || entry.total_spent_all_time || 0)}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
