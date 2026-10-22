import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ChefHat,
  Clock3,
  Coffee,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Wifi,
  WifiOff
} from "lucide-react";

import "./CingKdsProPage.css";

const MODES = [
  { id: "preparation", title: "Pha chế", Icon: ChefHat },
  { id: "serving", title: "Trả đồ", Icon: PackageCheck },
  { id: "monitor", title: "Giám sát", Icon: Activity }
];

const STATUS_TEXT = {
  pending: "Chờ pha",
  preparing: "Đang pha",
  prepared: "Pha xong",
  served: "Đã trả khách"
};

const NEXT = {
  pending: { status: "preparing", label: "Bắt đầu pha" },
  preparing: { status: "prepared", label: "Pha xong" },
  prepared: { status: "served", label: "Đã trả khách" }
};

function formatMinutes(value) {
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes < 0) {
    return "—";
  }

  if (minutes < 1) {
    return "< 1 phút";
  }

  return `${Math.floor(minutes)} phút`;
}

function severityClass(value) {
  return ["warning", "critical"].includes(value)
    ? value
    : "normal";
}

function CupCard({ cup, mode, busy, onTransition }) {
  const action = NEXT[cup.status];

  return (
    <article className={`ckds-cup ckds-${severityClass(cup.severity)}`}>
      <div className="ckds-cup-top">
        <span className="ckds-order-number">
          {cup.tran_no || "Chưa có số hóa đơn"}
        </span>
        <span className="ckds-elapsed">
          <Clock3 size={15} aria-hidden="true" />
          {formatMinutes(cup.elapsed_minutes)}
        </span>
      </div>

      <h3>{cup.item_name || "Chưa có tên món"}</h3>
      {(cup.table_name || cup.card_number) && <p>{cup.table_name} {cup.card_number ? `· Thẻ ${cup.card_number}` : ""}</p>}

      <div className="ckds-cup-meta">
        <span>{cup.item_group || "Chưa phân nhóm"}</span>
        <span>{STATUS_TEXT[cup.status] || "Không xác định"}</span>
      </div>

      {cup.severity === "critical" && (
        <p className="ckds-warning">
          <AlertTriangle size={16} aria-hidden="true" />
          Đơn đã vượt ngưỡng SLA nghiêm trọng
        </p>
      )}

      {mode !== "monitor" && action && onTransition && (
        <button
          type="button"
          className="ckds-action"
          disabled={busy || cup.transition_ready !== true}
          onClick={() => onTransition({
            order_id: cup.order_id,
            cup_id: cup.cup_id,
            target_status: action.status,
            expected_version: cup.version
          })}
        >
          {busy ? "Đang xử lý..." : action.label}
          <Check size={18} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

/*
 * Presentation-only KDS surface.
 *
 * The parent must provide authorized API snapshots.
 * `onTransition` must invoke a server-authorized,
 * idempotent PostgreSQL mutation and refresh afterwards.
 *
 * This component never assumes that clicking a button
 * means the operation succeeded.
 *
 * No mock orders and no direct backend connection.
 */
export default function CingKdsProPage({
  branchName = "Chi nhánh chưa xác định",
  branch = null,
  connectionState = "offline",
  loading = false,
  error = "",
  preparation = [],
  serving = [],
  groupCounts = [],
  alerts = [],
  performance = [],
  busyCupIds = [],
  onRefresh = null,
  onTransition = null,
  snapshotReady = false,
  previewMessage = ""
}) {
  const [mode, setMode] = useState("preparation");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");

  const current =
    mode === "preparation"
      ? preparation
      : mode === "serving"
        ? serving
        : [];

  const groups = useMemo(() => {
    const names = new Set(
      current.map(c => c.item_group || "Chưa phân nhóm")
    );
    return [...names].sort((a, b) => a.localeCompare(b, "vi"));
  }, [current]);

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("vi");

    return current.filter(c => {
      const itemGroup = c.item_group || "Chưa phân nhóm";

      if (group !== "all" && itemGroup !== group) {
        return false;
      }

      if (!term) return true;

      return [
        c.tran_no,
        c.item_name,
        c.item_group,
        c.order_id
      ].some(v =>
        String(v || "").toLocaleLowerCase("vi").includes(term)
      );
    });
  }, [current, query, group]);

  const isOnline = connectionState === "online";
  const ready =
    branch?.pos_parent &&
    branch?.pos_id &&
    (!loading || snapshotReady) &&
    !error;

  const canMutate =
    ready &&
    !loading &&
    isOnline &&
    typeof onTransition === "function";

  return (
    <main className="ckds-root">
      <header className="ckds-header">
        <div className="ckds-brand">
          <div className="ckds-brand-icon">
            <Coffee size={23} aria-hidden="true" />
          </div>
          <div>
            <div className="ckds-eyebrow">CING HU TANG</div>
            <h1>KDS <span>PRO</span></h1>
            <p>{branchName}</p>
          </div>
        </div>

        <div className="ckds-header-actions">
          <span className={`ckds-network ${isOnline ? "on" : "off"}`}>
            {isOnline
              ? <Wifi size={16} aria-hidden="true" />
              : <WifiOff size={16} aria-hidden="true" />}
            {isOnline ? "Đã kết nối" : "Chưa đồng bộ"}
          </span>

          <button
            type="button"
            className="ckds-refresh"
            onClick={onRefresh || undefined}
            disabled={!onRefresh || loading}
          >
            <RefreshCw size={17} aria-hidden="true" />
            Làm mới
          </button>
        </div>
      </header>

      <nav className="ckds-nav" aria-label="Chế độ vận hành KDS">
        {MODES.map(({ id, title, Icon }) => (
          <button
            key={id}
            type="button"
            className={mode === id ? "active" : ""}
            aria-current={mode === id ? "page" : undefined}
            onClick={() => {
              setMode(id);
              setQuery("");
              setGroup("all");
            }}
          >
            <Icon size={20} aria-hidden="true" />
            {title}
          </button>
        ))}
      </nav>

      <section className="ckds-summary" aria-label="Tổng quan vận hành">
        <div className="ckds-stat">
          <span>Cốc chờ / đang pha</span>
          <strong>{ready ? preparation.length : "—"}</strong>
        </div>
        <div className="ckds-stat">
          <span>Chờ trả khách</span>
          <strong>{ready ? serving.length : "—"}</strong>
        </div>
        <div className="ckds-stat">
          <span>Cảnh báo SLA</span>
          <strong>{ready ? alerts.length : "—"}</strong>
        </div>
      </section>

      {error && (
        <div className="ckds-banner error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          Không thể đồng bộ dữ liệu KDS. Vui lòng thử lại.
        </div>
      )}

      {!ready && !error && (
        <div className="ckds-banner" role="status">
          <ShieldCheck size={18} aria-hidden="true" />
          {previewMessage
            ? previewMessage
            : loading
              ? "Đang đồng bộ dữ liệu từ máy chủ..."
              : "Chưa có phiên chi nhánh được xác thực."}
        </div>
      )}

      {ready && !isOnline && (
        <div className="ckds-banner" role="status">
          <WifiOff size={18} aria-hidden="true" />
          Chưa có ảnh chụp dữ liệu mới. Tạm khóa thao tác và chờ đồng bộ lại.
        </div>
      )}

      {ready && mode !== "monitor" && (
        <>
          <div className="ckds-toolbar">
            <div className="ckds-search">
              <Search size={19} aria-hidden="true" />
              <input
                aria-label="Tìm món hoặc số hóa đơn"
                placeholder="Tìm số hóa đơn hoặc tên món..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <select
              aria-label="Lọc nhóm đồ uống"
              value={groups.includes(group) ? group : "all"}
              onChange={e => setGroup(e.target.value)}
            >
              <option value="all">Tất cả nhóm</option>
              {groups.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="ckds-section-heading">
            <div>
              <h2>
                {mode === "preparation"
                  ? "Hàng chờ pha chế"
                  : "Sẵn sàng trả khách"}
              </h2>
              <p>Hiển thị theo thứ tự từ máy chủ</p>
            </div>
            <span>{visible.length} cốc</span>
          </div>

          {visible.length ? (
            <div className="ckds-grid">
              {visible.map(cup => (
                <CupCard
                  key={cup.cup_id}
                  cup={cup}
                  mode={mode}
                  busy={
                    !canMutate ||
                    busyCupIds.includes(cup.cup_id)
                  }
                  onTransition={
                    canMutate ? onTransition : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="ckds-empty">
              <PackageCheck size={34} aria-hidden="true" />
              <strong>Không có cốc trong danh sách</strong>
              <p>
                {query || group !== "all"
                  ? "Hãy thay đổi bộ lọc tìm kiếm."
                  : "Chưa có dữ liệu phù hợp từ máy chủ."}
              </p>
            </div>
          )}
        </>
      )}

      {ready && mode === "monitor" && (
        <div className="ckds-monitor">
          <section className="ckds-panel">
            <h2>Đơn cần chú ý</h2>
            {alerts.length === 0 ? (
              <p className="ckds-muted">Không có cảnh báo SLA.</p>
            ) : alerts.map((alert, i) => (
              <div className="ckds-alert" key={alert.alert_key || i}>
                <AlertTriangle size={18} aria-hidden="true" />
                <div>
                  <strong>{alert.severity === "critical"
                    ? "Quá hạn nghiêm trọng"
                    : "Sắp quá hạn"}</strong>
                  <span>
                    {formatMinutes(alert.elapsed_minutes)}
                    {" · "}{alert.remaining_cups} cốc chưa trả
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="ckds-panel">
            <h2>Tồn đọng theo nhóm</h2>
            {groupCounts.length === 0 ? (
              <p className="ckds-muted">Chưa có dữ liệu tồn đọng.</p>
            ) : groupCounts.map((item, i) => (
              <div className="ckds-metric" key={`${item.item_group}-${i}`}>
                <span>{item.item_group}</span>
                <strong>{item.total_unserved}</strong>
              </div>
            ))}
          </section>

          <section className="ckds-panel">
            <h2>Hiệu suất phục vụ</h2>
            {performance.length === 0 ? (
              <p className="ckds-muted">Chưa có báo cáo được xác minh.</p>
            ) : performance.map((item, i) => (
              <div className="ckds-performance" key={i}>
                <div>
                  <span>Đơn hoàn thành</span>
                  <strong>{item.completed_orders}</strong>
                </div>
                <div>
                  <span>Trung bình</span>
                  <strong>{formatMinutes(item.avg_minutes)}</strong>
                </div>
                <div>
                  <span>P90</span>
                  <strong>{formatMinutes(item.p90_minutes)}</strong>
                </div>
                <div>
                  <span>P95</span>
                  <strong>{formatMinutes(item.p95_minutes)}</strong>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}
