import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const resolveMemberName = (m) =>
  m?.display_name ||
  m?.zalo_name ||
  m?.user_id ||
  "—";

const resolveMemberAvatar = (m) =>
  m?.avatar ||
  m?.zalo_avatar ||
  "";

const normalizeMemberTierKey = (value) => {
  const raw = String(value || "").trim();
  const lower = raw.toLowerCase();

  if (!lower) return "";

  if (
    lower === "loyal_partner" ||
    lower === "loyal-partner" ||
    lower === "loyal partner" ||
    lower.includes("đối tác thân thiết") ||
    lower.includes("doi tac than thiet") ||
    lower.includes("partner thân thiết") ||
    lower.includes("partner than thiet")
  ) {
    return "loyal_partner";
  }

  if (
    lower === "partner" ||
    lower.includes("đối tác") ||
    lower.includes("doi tac")
  ) {
    return "partner";
  }

  if (lower === "diamond" || lower.includes("kim cương") || lower.includes("kim cuong")) return "diamond";
  if (lower === "gold" || lower.includes("vàng") || lower.includes("vang")) return "gold";
  if (lower === "silver" || lower.includes("bạc") || lower.includes("bac")) return "silver";
  if (lower === "loyal" || lower.includes("thân thiết") || lower.includes("than thiet")) return "loyal";
  if (lower === "member" || lower.includes("hội viên") || lower.includes("hoi vien")) return "member";

  return lower;
};

const resolveMemberBadgeTierKey = (m) => {
  const badges = Array.isArray(m?.custom_badges)
    ? m.custom_badges
    : Array.isArray(m?.badges)
      ? m.badges
      : [];

  const normalizedBadges = badges.map(normalizeMemberTierKey);

  if (normalizedBadges.includes("loyal_partner")) return "loyal_partner";
  if (normalizedBadges.includes("partner")) return "partner";

  return "";
};

const resolveMemberPrimaryTierKey = (m) =>
  normalizeMemberTierKey(
    m?.display_tier ||
    m?.displayTier ||
    m?.crm_tier ||
    m?.tierKey ||
    m?.tier_key ||
    m?.tier ||
    m?.member_tier ||
    m?.membership_tier ||
    m?.membership_type_key ||
    m?.membership_type ||
    m?.crm_tier_name ||
    m?.tierName ||
    m?.tier_name
  );

const resolveMemberTierKey = (m) =>
  resolveMemberPrimaryTierKey(m) ||
  resolveMemberBadgeTierKey(m);

const MEMBER_TIER_LABELS = {
  member: "🌱 Hội viên",
  loyal: "💚 Hội viên thân thiết",
  silver: "🥈 Hội viên bạc",
  gold: "🥇 Hội viên vàng",
  diamond: "💎 Hội viên kim cương",
  partner: "🤝 Đối tác",
  loyal_partner: "👑 Đối tác thân thiết",
};

const resolveMemberTierLabel = (m) =>
  MEMBER_TIER_LABELS[resolveMemberTierKey(m)] || "🌱 Hội viên";


export default function AdminMembers({ token }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [duration, setDuration] = useState("7d");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [activatedOnly, setActivatedOnly] = useState(true);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/admin/monitor/members-list?activated_only=${activatedOnly}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setMembers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activatedOnly, token]);

  const filtered = members.filter((p) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;

    return (
      String(p.user_id || "").includes(search) ||
      String(p.display_name || "").toLowerCase().includes(keyword) ||
      String(p.zalo_name || "").toLowerCase().includes(keyword)
    );
  });

  const parseDuration = (d) =>
    ({
      "1d": 86400000,
      "3d": 259200000,
      "7d": 604800000,
      "30d": 2592000000,
      forever: 999 * 86400000,
    }[d] || 604800000);

  const handleAction = async () => {
    if (!selected || !action) return;
    setSaving(true);
    try {
      await apiClient.post(
        "/admin/monitor/member-action",
        { user_id: selected.user_id, action, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const until =
        duration === "forever"
          ? null
          : new Date(Date.now() + parseDuration(duration)).toISOString();

      setMembers((ms) =>
        ms.map((m) =>
          m.user_id === selected.user_id
            ? {
                ...m,
                is_blocked: action === "block" ? true : m.is_blocked,
                chat_locked_until:
                  action === "chat_lock" ? until : m.chat_locked_until,
              }
            : m
        )
      );

      setMsg(
        `Đã ${action === "block" ? "khoá tài khoản" : "khoá chat"} ${resolveMemberName(selected)}`
      );
      setAction(null);
      setSelected(null);
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Lỗi: " + e.message);
    }
    setSaving(false);
  };

  const handleUnblock = async (m) => {
    setSaving(true);
    try {
      await apiClient.post(
        "/admin/monitor/member-action",
        { user_id: m.user_id, action: "unblock" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMembers((ms) =>
        ms.map((p) =>
          p.user_id === m.user_id
            ? { ...p, is_blocked: false, chat_locked_until: null }
            : p
        )
      );

      setMsg("Đã mở khoá " + resolveMemberName(m));
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Lỗi: " + e.message);
    }
    setSaving(false);
  };

  const handleAddMember = async () => {
    if (!newPhone) return;
    setSaving(true);
    try {
      await apiClient.post(
        "/admin/monitor/add-member",
        { phone: newPhone, name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("Đã thêm thành viên " + newPhone);
      setShowAdd(false);
      setNewPhone("");
      setNewName("");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("Lỗi: " + e.message);
    }
    setSaving(false);
  };

  const DURATIONS = [
    { key: "1d", label: "1 ngày" },
    { key: "3d", label: "3 ngày" },
    { key: "7d", label: "7 ngày" },
    { key: "30d", label: "30 ngày" },
    { key: "forever", label: "Vĩnh viễn" },
  ];

  return (
    <div style={{ padding: 24, color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 4px" }}>👤 Quản lý thành viên</h2>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Thêm, khoá tài khoản hoặc khoá chat</p>
        </div>
        <button
          onClick={() => setShowAdd((p) => !p)}
          style={{ background: "#D4531C", border: "none", borderRadius: 8, padding: "8px 16px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          + Thêm thành viên
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "#1a1a24", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #333" }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Thêm thành viên mới</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Số điện thoại *" style={{ flex: 1, background: "#0f0f13", border: "1px solid #333", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13 }} />
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tên (tuỳ chọn)" style={{ flex: 1, background: "#0f0f13", border: "1px solid #333", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13 }} />
          </div>
          <button onClick={handleAddMember} disabled={saving} style={{ background: "#D4531C", border: "none", borderRadius: 8, padding: "8px 20px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Thêm
          </button>
        </div>
      )}

      {msg && (
        <div style={{ background: "rgba(212,83,28,.2)", border: "1px solid #D4531C", borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: 13 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc số điện thoại..." style={{ flex: 1, background: "#1a1a24", border: "1px solid #333", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 13, boxSizing: "border-box" }} />
        <button
          onClick={() => setActivatedOnly(!activatedOnly)}
          style={{
            background: activatedOnly ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.15)",
            border: `1px solid ${activatedOnly ? "#4CAF50" : "#ff9800"}`,
            color: activatedOnly ? "#4CAF50" : "#ff9800",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {activatedOnly ? "✅ Đã kích hoạt" : "👥 Tất cả"}
        </button>
      </div>

      {action && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a24", borderRadius: 16, padding: 24, width: 360, border: "1px solid #333" }}>
            <p style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>{action === "block" ? "🔒 Khoá tài khoản" : "🔇 Khoá chat"}</p>
            <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 16px" }}>
              Thành viên: <strong style={{ color: "white" }}>{resolveMemberName(selected)}</strong>
            </p>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px" }}>Thời gian:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {DURATIONS.map((d) => (
                <button key={d.key} onClick={() => setDuration(d.key)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${duration === d.key ? "#D4531C" : "#333"}`, background: duration === d.key ? "rgba(212,83,28,.2)" : "transparent", color: duration === d.key ? "#D4531C" : "#888", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {d.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAction} disabled={saving} style={{ flex: 1, background: "#D4531C", border: "none", borderRadius: 8, padding: "10px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Xác nhận
              </button>
              <button onClick={() => { setAction(null); setSelected(null); }} style={{ flex: 1, background: "#2a2a38", border: "none", borderRadius: 8, padding: "10px", color: "white", fontSize: 13, cursor: "pointer" }}>
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#666" }}>Đang tải...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 100px", gap: 8, padding: "8px 16px", background: "#0f0f13", borderRadius: 8, fontSize: 11, color: "#666", fontWeight: 700 }}>
            <span>THÀNH VIÊN</span><span>ĐIỆN THOẠI</span><span>TRẠNG THÁI</span><span>CHAT</span><span>HÀNH ĐỘNG</span>
          </div>

          {filtered.slice(0, 100).map((m) => {
            const isBlocked = m.is_blocked;
            const chatLocked = m.chat_locked_until && new Date(m.chat_locked_until) > new Date();
            const memberName = resolveMemberName(m);
            const memberAvatar = resolveMemberAvatar(m);

            return (
              <div key={m.user_id} style={{ background: "#1a1a24", borderRadius: 10, border: "1px solid #2a2a38", padding: "12px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 100px", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2a2a38", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, overflow: "hidden", border: "2px solid #333" }}>
                      {memberAvatar ? <img src={memberAvatar} alt="" style={{ width: 36, height: 36, objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "white", margin: 0 }}>{memberName}</p>
                      <p style={{ fontSize: 10, color: "#FFD700", margin: 0, fontWeight: 700 }}>
                        {resolveMemberTierLabel(m)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px" }}>{m.user_id}</p>
                    <p style={{ fontSize: 10, color: "#4CAF50", margin: 0, fontWeight: 700 }}>💰 {(m.crm_spend_alltime || 0).toLocaleString("vi-VN")}đ alltime</p>
                    <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>📅 {(m.crm_spend_monthly || 0).toLocaleString("vi-VN")}đ tháng này</p>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, color: isBlocked ? "#f44336" : "#4CAF50" }}>{isBlocked ? "🔒 Khoá" : "✓ OK"}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: chatLocked ? "#ff9800" : "#4CAF50" }}>{chatLocked ? "🔇 Khoá" : "✓ OK"}</span>

                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {isBlocked || chatLocked ? (
                      <button onClick={() => handleUnblock(m)} disabled={saving} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #4CAF50", background: "transparent", color: "#4CAF50", fontSize: 10, cursor: "pointer" }}>
                        Mở khoá
                      </button>
                    ) : (
                      <>
                        <button onClick={() => { setSelected(m); setAction("block"); }} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #f44336", background: "transparent", color: "#f44336", fontSize: 10, cursor: "pointer" }}>
                          Khoá TK
                        </button>
                        <button onClick={() => { setSelected(m); setAction("chat_lock"); }} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #ff9800", background: "transparent", color: "#ff9800", fontSize: 10, cursor: "pointer" }}>
                          Khoá chat
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {m.charm_points > 0 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(255,128,176,0.15)", color: "#ff80b0", border: "1px solid rgba(255,128,176,0.3)", fontWeight: 700 }}>✨ {(m.charm_points || 0).toLocaleString()} charm</span>}
                  {m.total_points > 0 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", fontWeight: 700 }}>⭐ {(m.total_points || 0).toLocaleString()} điểm</span>}
                  {m.game_plays > 0 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(33,150,243,0.1)", color: "#64b5f6", border: "1px solid rgba(33,150,243,0.3)", fontWeight: 700 }}>🎮 {m.game_plays} lượt</span>}
                  {m.member_activated && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)", fontWeight: 700 }}>✅ Đã kích hoạt</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
