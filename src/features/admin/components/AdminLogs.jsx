import { useState, useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";

const TABS = [
  { key:"plaza", label:"Cing Plaza", icon:"💬" },
  { key:"all",            label:"Tất cả",          icon:"📋" },
  { key:"revive_credit",  label:"Revive Credit",   icon:"✨" },
  { key:"gift",           label:"Tặng vật phẩm",    icon:"🎁" },
  { key:"points",         label:"Điểm bonus",       icon:"💎" },
  { key:"games",          label:"Game",             icon:"🎮" },
  { key:"rewards",        label:"Nhận quà BXH",    icon:"🏆" },
  { key:"profile_changes",label:"Thay đổi hồ sơ",   icon:"👤" },
];

const fmt = n => new Intl.NumberFormat("vi-VN").format(n||0);
function fmtDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})
    + " " + d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
}

function getStyle(item) {
  if(item._type==="plaza")return {color:"#C6A46C",bg:"rgba(198,164,108,.12)",icon:"💬"};
  if (item._type==="game")           return { color:"#1565C0", bg:"rgba(21,101,192,0.1)", icon:"🎮" };
  if (item._type==="points")         return { color:"#7B1FA2", bg:"rgba(123,31,162,0.1)", icon: item.amount>0?"⭐":"💸" };
  if (item._type==="revive_credit")  return item.amount >= 0
    ? { color:"#4CAF50", bg:"rgba(76,175,80,0.1)", icon:"✨" }
    : { color:"#FF7043", bg:"rgba(255,112,67,0.1)", icon:"🎮" };
  if (item._type==="gift")
    return { color:"#FF9800", bg:"rgba(255,152,0,0.1)", icon:"🎁" };
  if (item._type==="legacy_plays_bought" || item._type==="legacy_plays_given")
    return { color:"#777", bg:"rgba(255,255,255,0.05)", icon:"🗄️" };
  if (item._type==="reward")         return { color:"#FFD700", bg:"rgba(255,215,0,0.1)",  icon:"🏆" };
  if (item._type==="profile_change") return { color:"#607D8B", bg:"rgba(96,125,139,0.1)",icon:"👤" };
  return { color:"#999", bg:"rgba(0,0,0,0.05)", icon:"📋" };
}

const GAME_LABEL = {
  "black-pearl-rush": "Bay cùng trân châu",
  "cing-stack-tower": "Xếp Tháp Cing",
  "cing-block-puzzle": "Cing Block Puzzle",
};

function reviveSourceLabel(item) {
  const ref =
    String(item.reference_type || "")
      .toLowerCase();

  if (ref.includes("daily_mission")) {
    return "Nhiệm vụ ngày";
  }

  if (
    ref.includes("crm_order") ||
    ref.includes("order_spending") ||
    ref.includes("commerce")
  ) {
    return "Thưởng từ đơn hàng";
  }

  if (
    ref.includes("wallet") &&
    ref.includes("purchase")
  ) {
    return "Mua bằng Cing Wallet";
  }

  if (
    ref.includes("points") &&
    ref.includes("purchase")
  ) {
    return "Mua bằng điểm tích lũy";
  }

  if (ref.includes("admin")) {
    return "Điều chỉnh quản trị";
  }

  if (Number(item.amount) < 0) {
    const game =
      GAME_LABEL[item.game_key] ||
      item.game_key;

    return game
      ? `Hồi sinh · ${game}`
      : "Dùng Revive Credit";
  }

  return (
    item.reason ||
    "Nhận Revive Credit"
  );
}

function typeLabel(item) {
  if(item._type==="plaza")return "Cing Plaza";
  if (item._type === "revive_credit") {
    return "Revive Credit";
  }

  if (item._type === "gift") {
    return "Tặng vật phẩm";
  }

  if (
    item._type === "legacy_plays_bought" ||
    item._type === "legacy_plays_given"
  ) {
    return "Lịch sử V1";
  }

  return item._type;
}

const FIELD_LABEL = {
  "name": "tên hiển thị",
  "avatar": "ảnh đại diện",
  "name+avatar": "tên hiển thị và ảnh đại diện",
};

const PLAZA_EVENTS={plaza_create:'Tạo phòng',plaza_join:'Vào phòng',plaza_leave:'Rời phòng',plaza_member_removed:'Kết thúc phiên trong phòng',plaza_owner_transferred:'Chuyển chủ phòng',plaza_disconnected:'Gián đoạn kết nối',plaza_badge_choose:'Đổi danh hiệu',plaza_profile:'Cập nhật hồ sơ',plaza_convert:'Nạp Cing Coin',plaza_buy_loudspeaker:'Mua loa thế giới',plaza_use_loudspeaker:'Dùng loa thế giới',plaza_pm:'Gửi tin nhắn riêng',plaza_friend_request:'Gửi lời mời kết bạn',plaza_friend_accept:'Chấp nhận kết bạn',plaza_friend_remove:'Xóa bạn',plaza_block:'Chặn người chơi',plaza_unblock:'Bỏ chặn',plaza_chat_send:'Chat khu vực',plaza_table:'Tương tác bàn game'};
function getTitle(item) {
  if(item._type==='plaza'){const d=item.details||{};return `${PLAZA_EVENTS[item.event_name]||item.event_name} · ${item.customer_name||item.room_name||item.member_id||'Cing Plaza'}${d.quantity?' · '+fmt(d.quantity)+(item.event_name==='plaza_buy_loudspeaker'?' loa':item.event_name==='plaza_convert'?' Coin':''):''}${d.coinDelta&&item.event_name!=='plaza_convert'?' · '+fmt(d.coinDelta)+' Coin':''}${d.itemDelta===-1?' · dùng 1 loa':''}${d.priceVnd?' · '+fmt(d.priceVnd)+'đ':''}`;}
  const id = item.customer_phone || item.user_id || "?";
  const name = item.customer_name || item.player_name || id;
  if (item._type==="game")    return `${name} — ${item.game_key} — điểm ${fmt(item.score)}`;
  if (item._type==="points")  return `${id} — ${item.reason||item.event_name} — ${item.amount>0?"+":""}${item.amount} điểm ${item.newTotal!=null?`(còn ${item.new_total} điểm)`:""}`;
  if (item._type==="revive_credit") {
    const amount = Number(item.amount || 0);

    return (
      `${id} — ${reviveSourceLabel(item)} — ` +
      `${amount > 0 ? "+" : ""}${fmt(amount)} Revive Credit ` +
      `(số dư ${fmt(item.balance_before)} → ${fmt(item.balance_after)})`
    );
  }

  if (item._type==="gift") {
    const recipient =
      item.recipient_user_id || "?";

    const gift =
      [
        item.gift_icon,
        item.gift_name,
      ]
        .filter(Boolean)
        .join(" ");

    const payment =
      item.funding_source === "points"
        ? `${fmt(item.points_cost)} điểm`
        : `${fmt(item.price_vnd)}đ`;

    return (
      `${id} → ${recipient} — ` +
      `Tặng ${gift || "vật phẩm"} — ` +
      `${payment} — ` +
      `+${fmt(item.charm_awarded)} Điểm quyến rũ`
    );
  }

  if (item._type==="legacy_plays_bought") {
    return `${id} — Lịch sử V1: mua ${item.amount} lượt`;
  }

  if (item._type==="legacy_plays_given") {
    const origin =
      item.source === "admin"
        ? "điều chỉnh Admin"
        : "thưởng tự động";

    return (
      `${id} — Lịch sử V1: ${origin} ` +
      `${item.amount > 0 ? "+" : ""}${item.amount} lượt`
    );
  }
  if (item._type==="reward") {
    const points = item.points ?? item.amount ?? item.event_data?.points ?? item.event_data?.amount ?? 0;
    const reason = item.reason || item.event_data?.reason || "Nhận thưởng bảng xếp hạng";
    const board  = item.board || item.event_data?.board || item.event_data?.game_key || item.event_data?.period || "";
    const rank   = item.rank || item.event_data?.rank || "";
    const rankText = rank ? `Top ${rank}` : "";
    const meta = [board, rankText].filter(Boolean).join(" · ");
    return `${item.player_name || id} — Nhận ${fmt(points)} điểm — ${reason}${meta ? ` (${meta})` : ""}`;
  }

  if (item._type==="profile_change") {
    const data = item.event_data || {};
    const changes = [];

    if (data.old_name && data.new_name && data.old_name !== data.new_name) {
      changes.push(`Tên: "${data.old_name}" → "${data.new_name}"`);
    }

    if (data.avatar_changed) {
      changes.push("Đổi ảnh đại diện");
    }

    if (changes.length === 0) {
      const fieldLabel = FIELD_LABEL[item.field] || item.field || "hồ sơ";
      changes.push(`Đổi ${fieldLabel}`);
    }

    const pointsNote = item.points_used > 0 ? ` (tốn ${item.points_used} điểm)` : " (miễn phí)";
    return `${id} — ${changes.join(" | ")}${pointsNote}`;
  }
  return JSON.stringify(item).slice(0,80);
}

export default function AdminLogs({ token }) {
  const h = { Authorization: `Bearer ${token}` };
  const [tab, setTab]           = useState("all");
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [hasMore, setHasMore]   = useState(false);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef(null);

  const fetchLogs = async (t = tab, p = page, s = search) => {
    setLoading(true);
    setError("");

    try {
      let url = `/admin/logs?filter=${t}&page=${p}&limit=50`;

      if (s) {
        url += `&search=${encodeURIComponent(s)}`;
      }

      const res =
        await apiClient.get(
          url,
          {
            headers: h,
          }
        );

      setLogs(
        res.data?.data || []
      );

      setHasMore(
        res.data?.has_more === true
      );
    } catch (e) {
      console.error(e);

      setLogs([]);
      setHasMore(false);

      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Không thể tải nhật ký hoạt động."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(tab, 1, search); setPage(1); }, [tab, search]);
  useEffect(() => {
    if (autoRefresh) { timerRef.current = setInterval(()=>fetchLogs(tab,1,search), 10000); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, tab, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div style={{ padding:"0 0 40px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <p style={{ color:"#aaa", fontSize:11, fontWeight:700, letterSpacing:2, margin:0, textTransform:"uppercase" }}>
          📋 Activity Logs
        </p>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>fetchLogs(tab,page,search)}
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, padding:"5px 12px", color:"white", fontSize:11, cursor:"pointer" }}>
            🔄 Làm mới
          </button>
          <button onClick={()=>setAutoRefresh(v=>!v)}
            style={{ background: autoRefresh?"rgba(76,175,80,0.2)":"rgba(255,255,255,0.08)",
              border:`1px solid ${autoRefresh?"#4CAF50":"rgba(255,255,255,0.1)"}`,
              borderRadius:8, padding:"5px 12px", color: autoRefresh?"#4CAF50":"#aaa", fontSize:11, cursor:"pointer" }}>
            {autoRefresh ? "⏸ Auto" : "▶ Auto"}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍 Tìm theo số điện thoại, tên, mã đơn..."
          style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:10, padding:"9px 14px", color:"white", fontSize:13, outline:"none" }}
        />
        <button type="submit"
          style={{ background:"#D4531C", border:"none", borderRadius:10, padding:"9px 16px",
            color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          Tìm
        </button>
        {search && (
          <button type="button" onClick={()=>{ setSearch(""); setSearchInput(""); }}
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:10, padding:"9px 12px", color:"#aaa", fontSize:13, cursor:"pointer" }}>
            ✕
          </button>
        )}
      </form>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:14, paddingBottom:4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ background: tab===t.key ? "#D4531C" : "rgba(255,255,255,0.07)",
              border: "none", borderRadius:20, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap",
              color: tab===t.key ? "white" : "#aaa", fontSize:11, fontWeight:700 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      {loading ? (
        <p style={{ color:"#555", textAlign:"center", padding:40 }}>Đang tải...</p>
      ) : error ? (
        <div style={{
          margin:"18px 0",
          padding:"14px 16px",
          borderRadius:12,
          background:"rgba(244,67,54,0.10)",
          border:"1px solid rgba(244,67,54,0.28)",
          color:"#ff8a80",
          fontSize:12,
          lineHeight:1.55,
          textAlign:"center",
        }}>
          ⚠️ {error}
        </div>
      ) : logs.length === 0 ? (
        <p style={{ color:"#555", textAlign:"center", padding:40 }}>Không có dữ liệu</p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {logs.map((item, i) => {
            const st = getStyle(item);
            return (
              <div key={i} style={{ background:"#1a1a24", borderRadius:12, padding:"10px 14px",
                borderLeft:`3px solid ${st.color}`, display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{st.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontSize:12, fontWeight:600, margin:"0 0 3px",
                    wordBreak:"break-word" }}>{getTitle(item)}</p>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:st.color, background:st.bg,
                      borderRadius:4, padding:"1px 6px", fontWeight:700 }}>{typeLabel(item)}</span>
                    <span style={{ fontSize:10, color:"#555" }}>{fmtDate(item.created_at)}</span>
                    {item.status && <span style={{ fontSize:10, color:"#888" }}>{item.status}</span>}
                    {item._type==="revive_credit" && item.game_key && (
                      <span style={{ fontSize:10, color:"#777" }}>
                        {GAME_LABEL[item.game_key] || item.game_key}
                      </span>
                    )}
                    {item._type==="revive_credit" && item.reference_type && (
                      <span style={{ fontSize:10, color:"#666" }}>
                        {item.reference_type}
                        {item.reference_id ? ` · ${item.reference_id}` : ""}
                      </span>
                    )}
                    {item._type==="gift" && item.reference_id && (
                      <span style={{ fontSize:10, color:"#666" }}>
                        Mã giao dịch · {item.reference_id}
                      </span>
                    )}

                    {item._type==="gift" && item.sender_message && (
                      <span style={{ fontSize:10, color:"#777" }}>
                        💌 {item.sender_message}
                      </span>
                    )}

                    {item.source && item._type!=="revive_credit" && (
                      <span style={{ fontSize:10, color:"#666" }}>
                        via {item.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16 }}>
        <button onClick={()=>{ const p=Math.max(1,page-1); setPage(p); fetchLogs(tab,p,search); }}
          disabled={page<=1}
          style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
            padding:"6px 16px", color: page<=1?"#444":"white", cursor: page<=1?"not-allowed":"pointer", fontSize:12 }}>
          ← Trước
        </button>
        <span style={{ color:"#666", fontSize:12, padding:"6px 0" }}>Trang {page}</span>
        <button onClick={()=>{ const p=page+1; setPage(p); fetchLogs(tab,p,search); }}
          disabled={!hasMore}
          style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
            padding:"6px 16px", color: !hasMore?"#444":"white", cursor: !hasMore?"not-allowed":"pointer", fontSize:12 }}>
          Sau →
        </button>
      </div>
    </div>
  );
}
