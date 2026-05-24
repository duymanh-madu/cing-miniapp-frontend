import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "\u0111";

const TABS = [
  { id:"weekly",  label:"Tu\u1ea7n n\u00e0y" },
  { id:"monthly", label:"Th\u00e1ng n\u00e0y" },
  { id:"yearly",  label:"N\u0103m n\u00e0y" },
  { id:"alltime", label:"All Time" },
];

function RankNotification({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, []);
  const up = msg.includes("th\u0103ng");
  return (
    <div style={{
      position:"fixed", top:24, left:16, right:16, zIndex:999,
      background: up ? "linear-gradient(135deg,#00c853,#69f0ae)" : "linear-gradient(135deg,#d50000,#ff5252)",
      borderRadius:16, padding:"14px 18px",
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      display:"flex", alignItems:"center", gap:12,
      animation:"slideDown 0.4s ease-out",
    }}>
      <span style={{ fontSize:28 }}>{up ? "\u{1F4C8}" : "\u{1F4C9}"}</span>
      <div>
        <p style={{ color:"white", fontSize:13, fontWeight:900, margin:0 }}>{msg}</p>
        <p style={{ color:"rgba(255,255,255,0.75)", fontSize:11, margin:"3px 0 0" }}>
          {up ? "Tuy\u1ec7t v\u1eddi! H\u00e3y ti\u1ebfp t\u1ee5c ph\u00e1t huy!" : "H\u00e3y c\u1ed1 g\u1eafng \u0111\u1ec3 leo h\u1ea1ng!"}
        </p>
      </div>
    </div>
  );
}

function Top1Card({ entry }) {
  return (
    <div style={{
      margin:"0 auto 8px", maxWidth:220,
      display:"flex", flexDirection:"column", alignItems:"center",
    }}>
      {/* Crown glow */}
      <div style={{ fontSize:48, marginBottom:4,
        filter:"drop-shadow(0 0 20px rgba(255,215,0,0.9))",
        animation:"pulse 2s ease-in-out infinite",
      }}>\u{1F451}</div>

      {/* Avatar */}
      <div style={{
        width:90, height:90, borderRadius:45, marginBottom:10,
        background:"linear-gradient(135deg,#FFD700,#FFA500)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:36, fontWeight:900, color:"#1a0a2e",
        boxShadow:"0 0 0 4px rgba(255,215,0,0.3), 0 0 40px rgba(255,215,0,0.6)",
        border:"3px solid #FFD700",
        position:"relative",
      }}>
        {(entry.player_name||entry.name||"?")[0]?.toUpperCase()}
        <div style={{
          position:"absolute", bottom:-4, right:-4,
          background:"#FFD700", borderRadius:12,
          width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, fontWeight:900, color:"#1a0a2e",
          boxShadow:"0 2px 8px rgba(0,0,0,0.5)",
        }}>1</div>
      </div>

      <p style={{ color:"white", fontSize:16, fontWeight:900, margin:"0 0 4px",
        textAlign:"center", textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>
        {entry.player_name || entry.name || entry.user_id || "\u1ea8n danh"}
      </p>
      <div style={{
        background:"linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.1))",
        border:"1px solid rgba(255,215,0,0.4)",
        borderRadius:12, padding:"6px 16px",
      }}>
        <p style={{ color:"#FFD700", fontSize:18, fontWeight:900, margin:0 }}>
          {fmt(entry.total_spent || entry.score || 0)}
        </p>
      </div>
    </div>
  );
}

function Top2Card({ entry, rank }) {
  const colors = {
    2: { bg:"linear-gradient(135deg,#C0C0C0,#E8E8E8)", text:"#1a1a2e", glow:"rgba(192,192,192,0.5)", medal:"\u{1F948}" },
    3: { bg:"linear-gradient(135deg,#CD7F32,#E8A857)", text:"#1a0a00", glow:"rgba(205,127,50,0.5)", medal:"\u{1F949}" },
  };
  const c = colors[rank];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
      <span style={{ fontSize:28, marginBottom:6,
        filter:`drop-shadow(0 0 8px ${c.glow})` }}>{c.medal}</span>
      <div style={{
        width:64, height:64, borderRadius:32,
        background:c.bg,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:24, fontWeight:900, color:c.text,
        boxShadow:`0 0 20px ${c.glow}`,
        marginBottom:8, position:"relative",
      }}>
        {(entry.player_name||entry.name||"?")[0]?.toUpperCase()}
        <div style={{
          position:"absolute", bottom:-4, right:-4,
          background:c.bg, borderRadius:10,
          width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, fontWeight:900, color:c.text,
          boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
        }}>{rank}</div>
      </div>
      <p style={{ color:"rgba(255,255,255,0.9)", fontSize:12, fontWeight:700,
        margin:"0 0 4px", textAlign:"center", maxWidth:80,
        overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
        {entry.player_name || entry.name || "\u1ea8n danh"}
      </p>
      <p style={{ color:"rgba(255,215,0,0.8)", fontSize:11, fontWeight:800, margin:0 }}>
        {fmt(entry.total_spent || entry.score || 0)}
      </p>
    </div>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const profile = useAuthStore(s => s.profile);
  const [tab, setTab] = useState("weekly");
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const prevRankRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/leaderboard/top-spenders?period=${tab}&limit=100`)
      .then(r => {
        const list = r.data?.data || [];
        setData(list);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));

    if (profile?.id) {
      apiClient.get(`/leaderboard/user-rank/${profile.id}?period=${tab}`)
        .then(r => {
          const rankData = r.data?.data;
          if (rankData?.rank && prevRankRef.current !== null) {
            const prev = prevRankRef.current;
            const curr = rankData.rank;
            if (curr < prev) {
              setNotification(`B\u1ea1n v\u1eeba th\u0103ng t\u1eeb h\u1ea1ng #${prev} l\u00ean h\u1ea1ng #${curr}! \u{1F525}`);
            } else if (curr > prev) {
              setNotification(`B\u1ea1n v\u1eeba t\u1ee5t t\u1eeb h\u1ea1ng #${prev} xu\u1ed1ng h\u1ea1ng #${curr}`);
            }
          }
          if (rankData?.rank) prevRankRef.current = rankData.rank;
          setMyRank(rankData);
        })
        .catch(() => {});
    }
  }, [tab]);

  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];
  const rest = data.slice(3);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(180deg,#050310 0%,#0d0820 35%,#080514 70%,#050310 100%)",
      paddingBottom:100,
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes slideDown { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      {notification && (
        <RankNotification msg={notification} onDone={() => setNotification(null)} />
      )}

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(180deg,rgba(255,215,0,0.08) 0%,transparent 100%)",
        padding:"20px 16px 0",
        borderBottom:"1px solid rgba(255,215,0,0.08)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => navigate(-1)} style={{
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
            color:"white", borderRadius:12, width:38, height:38,
            cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
          }}>&#8592;</button>
          <div style={{ flex:1, textAlign:"center" }}>
            <p style={{ color:"rgba(255,215,0,0.6)", fontSize:10, fontWeight:800,
              letterSpacing:4, margin:"0 0 3px", textTransform:"uppercase" }}>Hall of Fame</p>
            <h1 style={{ color:"white", fontSize:22, fontWeight:900, margin:0, letterSpacing:1 }}>
              \u0110\u1ea1i L\u1ed9 Danh V\u1ecd ng
            </h1>
          </div>
          <div style={{ width:38 }}/>
        </div>

        {/* TABS */}
        <div style={{ display:"flex", gap:6, overflowX:"auto",
          scrollbarWidth:"none", paddingBottom:16 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              whiteSpace:"nowrap", padding:"8px 18px", borderRadius:20, flexShrink:0,
              border: tab===t.id ? "none" : "1px solid rgba(255,255,255,0.1)",
              background: tab===t.id
                ? "linear-gradient(135deg,#FFD700,#FFA500)"
                : "rgba(255,255,255,0.04)",
              color: tab===t.id ? "#1a0a2e" : "rgba(255,255,255,0.45)",
              fontSize:12, fontWeight: tab===t.id ? 900 : 500, cursor:"pointer",
              boxShadow: tab===t.id ? "0 4px 15px rgba(255,180,0,0.35)" : "none",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", padding:"80px 24px", color:"rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>\u23F3</div>
          <p style={{ fontSize:14 }}>&#272;ang t\u1ea3i b\u1ea3ng x\u1ebfp h\u1ea1ng...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", padding:"80px 24px", color:"rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>&#128202;</div>
          <p style={{ fontSize:14, fontWeight:600 }}>Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u cho k\u1ef3 n\u00e0y</p>
          <p style={{ fontSize:12, marginTop:4, textAlign:"center", lineHeight:1.6 }}>
            H\u00e3y \u0111\u1eb7t h\u00e0ng \u0111\u1ec3 xu\u1ea5t hi\u1ec7n tr\u00ean b\u1ea3ng x\u1ebfp h\u1ea1ng!
          </p>
        </div>
      ) : (
        <>
          {/* PODIUM */}
          <div style={{ padding:"32px 24px 24px" }}>
            {/* TOP 1 */}
            {top1 && <Top1Card entry={top1} />}

            {/* TOP 2 & 3 */}
            {(top2 || top3) && (
              <div style={{ display:"flex", gap:16, justifyContent:"center",
                marginTop:24, padding:"0 16px" }}>
                {top2 && <Top2Card entry={top2} rank={2} />}
                {top3 && <Top2Card entry={top3} rank={3} />}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div style={{ margin:"0 24px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.2),transparent)" }}/>
            <span style={{ color:"rgba(255,215,0,0.4)", fontSize:11, fontWeight:700, letterSpacing:2 }}>
              TOP 4-100
            </span>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.2),transparent)" }}/>
          </div>

          {/* MY RANK */}
          {myRank?.rank && (
            <div style={{ margin:"0 16px 16px",
              background:"linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.06))",
              border:"1px solid rgba(255,215,0,0.25)",
              borderRadius:16, padding:"14px 18px",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:18,
                  background:"linear-gradient(135deg,#D4531C,#FF6B35)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, fontWeight:900, color:"white" }}>
                  {(profile?.name||"B")[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ color:"rgba(255,255,255,0.5)", fontSize:10, margin:"0 0 2px" }}>
                    H\u1ea1ng c\u1ee7a b\u1ea1n
                  </p>
                  <p style={{ color:"white", fontSize:13, fontWeight:800, margin:0 }}>
                    {profile?.name || "B\u1ea1n"}
                  </p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#FFD700", fontSize:22, fontWeight:900, margin:"0 0 2px" }}>
                  #{myRank.rank}
                </p>
                <p style={{ color:"rgba(255,255,255,0.35)", fontSize:10, margin:0 }}>
                  {fmt(myRank.total_spent || 0)}
                </p>
              </div>
            </div>
          )}

          {/* RANK LIST */}
          <div style={{ margin:"0 16px" }}>
            {rest.map((entry, i) => {
              const rank = i + 4;
              const isMe = entry.user_id === profile?.id;
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 16px",
                  borderRadius:12, marginBottom:4,
                  background: isMe
                    ? "rgba(255,215,0,0.08)"
                    : "rgba(255,255,255,0.02)",
                  border: isMe
                    ? "1px solid rgba(255,215,0,0.2)"
                    : "1px solid rgba(255,255,255,0.03)",
                }}>
                  <span style={{ color:"rgba(255,255,255,0.25)", fontSize:12,
                    fontWeight:700, width:28, textAlign:"center", flexShrink:0 }}>
                    {rank}
                  </span>
                  <div style={{ width:36, height:36, borderRadius:18, flexShrink:0,
                    background: isMe
                      ? "linear-gradient(135deg,#D4531C,#FF6B35)"
                      : "linear-gradient(135deg,#1a0a2e,#2d1254)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:800,
                    color: isMe ? "white" : "rgba(255,255,255,0.4)" }}>
                    {(entry.player_name||entry.name||"?")[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color: isMe ? "#FFD700" : "white",
                      fontSize:13, fontWeight: isMe ? 800 : 600, margin:0,
                      overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                      {entry.player_name || entry.name || entry.user_id || "\u1ea8n danh"}
                      {isMe && " (b\u1ea1n)"}
                    </p>
                  </div>
                  <p style={{ color: isMe ? "#FFD700" : "rgba(255,215,0,0.6)",
                    fontSize:13, fontWeight:800, margin:0, flexShrink:0 }}>
                    {fmt(entry.total_spent || entry.score || 0)}
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
