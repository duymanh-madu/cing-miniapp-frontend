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
import {buildKdsBillBoardV1} from "./cingKdsBillBoardV1.js";

const MODES = [
  { id: "preparation", title: "Pha chế", Icon: ChefHat },
  { id: "serving", title: "Trả đồ", Icon: PackageCheck },
  { id: "monitor", title: "Giám sát", Icon: Activity }
];

const STATUS_TEXT = {
  pending: "Chưa pha xong",
  preparing: "Chưa pha xong",
  prepared: "Pha xong",
  served: "Đã trả khách"
};

const NEXT = {
  pending: { status: "prepared", label: "Đã pha xong" },
  preparing: { status: "prepared", label: "Đã pha xong" },
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
  const action = mode === "serving" ? (cup.status === "prepared" ? NEXT.prepared : null) : NEXT[cup.status];

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
  bills = [],
  groupCounts = [],
  alerts = [],
  performance = [],
  busyCupIds = [],
  onRefresh = null,
  onTransition = null,
  snapshotReady = false,
  previewMessage = ""
}) {
  const [view,setView] = useState("bills");
  const [mode, setMode] = useState("preparation");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");

  const current =
    mode === "preparation"
      ? preparation
      : mode === "serving"
        ? [...preparation,...serving]
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
        c.order_id, c.table_name, c.card_number
      ].some(v =>
        String(v || "").toLocaleLowerCase("vi").includes(term)
      );
    });
  }, [current, query, group]);

  const billBoard = useMemo(()=>buildKdsBillBoardV1({preparation,serving,bills,mode,query,group}),[preparation,serving,bills,mode,query,group]);
  const outstandingBills = new Set([...preparation,...serving].map(c=>c.order_id)).size;
  const isOnline = connectionState === "online";
  const ready =
    branch?.pos_parent &&
    branch?.pos_id &&
    (!loading || snapshotReady) &&
    !error;

  const canMutate =
    ready &&
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
          <span>Món chưa pha xong</span>
          <strong>{ready ? preparation.length : "—"}</strong>
        </div>
        <div className="ckds-stat">
          <span>Đã pha · chờ trả</span>
          <strong>{ready ? serving.length : "—"}</strong>
        </div>
        <div className="ckds-stat">
          <span>Hóa đơn chưa trả đủ · {alerts.length} cảnh báo SLA</span>
          <strong>{ready ? outstandingBills : "—"}</strong>
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
                placeholder="Tìm hóa đơn, bàn, thẻ hoặc tên món..."
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

          <div className="ckds-view-switch" role="group" aria-label="Cách xem danh sách">
            <button type="button" aria-pressed={view==="bills"} onClick={()=>setView("bills")}>Theo hóa đơn</button>
            <button type="button" aria-pressed={view==="groups"} onClick={()=>setView("groups")}>Theo nhóm món</button>
          </div>
          <div className="ckds-section-heading">
            <div>
              <h2>
                {mode === "preparation"
                  ? "Hàng chờ pha chế"
                  : "Tiến độ pha và trả theo hóa đơn"}
              </h2>
              <p>Ưu tiên hóa đơn chờ lâu nhất · mỗi món thao tác riêng</p>
            </div>
            <span>{billBoard.length} hóa đơn · {visible.length} món</span>
          </div>

          {view === "bills" && billBoard.length > 0 ? <div className="ckds-bill-grid">
            {billBoard.map(bill=><article className="ckds-bill" key={bill.order_id}>
              <header><strong>Hóa đơn {bill.tran_no || bill.order_id}</strong><span>{formatMinutes(bill.elapsed_minutes)}</span></header>
              <p className="ckds-bill-location">{bill.table_name}{bill.card_number?` · Thẻ ${bill.card_number}`:""}</p>
              <div className="ckds-bill-progress"><strong>{bill.progress}</strong>
                <span>Đã pha {bill.completed}/{bill.total} · Đã trả {bill.served}/{bill.total}</span>
                <progress aria-label={`Tiến độ hóa đơn ${bill.tran_no}`} value={bill.completed} max={bill.total}/>
                <span>Còn {bill.unfinished} món chưa pha xong · {bill.ready} món chờ trả</span>
              </div>
              <div className="ckds-bill-items">{bill.visibleCups.map(cup=><CupCard key={cup.cup_id} cup={cup} mode={mode}
                busy={!canMutate || busyCupIds.includes(cup.cup_id)} onTransition={canMutate?onTransition:null}/>)}</div>
            </article>)}
          </div> : view === "groups" && visible.length ? (
            <div className="ckds-grid">
              {[...new Set(visible.map(c=>c.item_group))].map(name=><section className="ckds-group-section" key={name}>
                <h3>{name || "Chưa phân nhóm"} · {visible.filter(c=>c.item_group===name).length} món</h3>
              {visible.filter(c=>c.item_group===name).map(cup => (
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
              ))}</section>)}
            </div>
          ) : (
            <div className="ckds-empty">
              <PackageCheck size={34} aria-hidden="true" />
              <strong>Không có món trong danh sách</strong>
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
                    {" · "}{alert.remaining_cups} món chưa trả
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
