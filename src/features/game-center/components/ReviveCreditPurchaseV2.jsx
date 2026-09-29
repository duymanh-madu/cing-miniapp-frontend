import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createOfflineRevivalRequestId,
} from "@/games/runtime/offlineRevivalAuthorityClient";

import {
  readReviveCreditPurchaseIntent,
  ensureReviveCreditPurchaseIntent,
  clearReviveCreditPurchaseIntent,
} from "@/games/runtime/reviveCreditPurchaseIntent";

import {
  getReviveCreditCustomerPrice,
  buyReviveCredits,
} from "@/games/runtime/reviveCreditPurchaseClient";

import {
  executeReviveCreditPurchase,
} from "@/games/runtime/reviveCreditPurchaseFlow";

import RevivePassIcon from
  "./RevivePassIcon";

/*
 * Points purchase is independently release-gated.
 *
 * Default OFF. This frontend flag does not grant
 * backend HTTP or PostgreSQL financial authority.
 *
 * The backend remains the sole authority for
 * price, point deduction and Credit delivery.
 */
const POINTS_ENABLED =
  import.meta.env
    .VITE_CING_REVIVE_POINTS_PURCHASE_ENABLED ===
  "true";

function money(value) {
  return BigInt(value).toLocaleString("vi-VN");
}

export default function ReviveCreditPurchaseV2({
  userId,
  requiredQuantity,
  onPurchased,
  purchaseContext = "shortfall",
}) {
  const busyRef = useRef(false);

  const [price, setPrice] = useState(null);
  const [intent, setIntent] = useState(null);
  const [method, setMethod] = useState("wallet");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    setIntent(null);
    setPrice(null);
    setMessage("");
    setLoading(true);

    try {
      const old =
        readReviveCreditPurchaseIntent({
          storage: window.localStorage,
          userId,
        });

      if (active) {
        setIntent(old);

        if (old) {
          setMethod(old.funding_source);
        }
      }
    } catch (error) {
      if (active) {
        setMessage(
          error?.message ||
          "Giao dịch cũ chưa được xác minh."
        );
      }
    }

    getReviveCreditCustomerPrice()
      .then(value => {
        if (active) setPrice(value);
      })
      .catch(() => {
        if (active) {
          setMessage(previous =>
            previous ||
            "Chưa đọc được giá Thẻ hồi sinh từ hệ thống."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const purchase = useCallback(async () => {
    if (busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setMessage("");

    try {
      const storage = window.localStorage;

      const receipt =
        await executeReviveCreditPurchase({
          storage,
          userId,
          fundingSource: method,
          requiredQuantity,
          price,
          pointsEnabled: POINTS_ENABLED,
          createRequestId:
            createOfflineRevivalRequestId,
          purchase: buyReviveCredits,
          onIntent: setIntent,
        });

      setIntent(null);

      onPurchased?.(receipt);

      setMessage(
        `Đã nhận ${receipt.quantity} Thẻ hồi sinh.`
      );
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Chưa xác minh được giao dịch. " +
        "Hãy thử lại yêu cầu cũ."
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [
    userId,
    price,
    method,
    requiredQuantity,
    onPurchased,
  ]);

  const unresolved = Boolean(intent);

  const quantity =
    intent?.quantity || requiredQuantity;

  const source =
    intent?.funding_source || method;

  const pointsPriceReady =
    typeof price?.points_cost === "string" &&
    /^[1-9][0-9]*$/.test(price.points_cost) &&
    BigInt(price.points_cost) <= 2147483647n;

  const canSubmit =
    !busy &&
    (
      unresolved
        ? (
          source === "wallet" ||
          (
            source === "points" &&
            POINTS_ENABLED
          )
        )
        : (
          !loading &&
          price?.enabled === true &&
          Number.isSafeInteger(requiredQuantity) &&
          requiredQuantity > 0 &&
          (
            method === "wallet" ||
            (
              method === "points" &&
              POINTS_ENABLED &&
              pointsPriceReady
            )
          )
        )
    );

  return (
    <section
      aria-label="Mua Thẻ hồi sinh"
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 14,
        background:
          "linear-gradient(145deg,rgba(70,36,23,.72),rgba(26,16,19,.82))",
        border:
          "1px solid rgba(245,185,112,.22)",
        boxShadow:
          "inset 0 1px 0 rgba(255,245,225,.05), 0 10px 28px rgba(0,0,0,.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,212,154,.08)",
            border: "1px solid rgba(255,212,154,.14)",
          }}
        >
          <RevivePassIcon size={34} />
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 950,
              color: "#fff4df",
            }}
          >
            Mua Thẻ hồi sinh
          </div>
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color: "rgba(255,239,216,.58)",
            }}
          >
            Tiếp tục ván chơi khi cần
          </div>
        </div>
      </div>

      <p>
        {unresolved
          ? "Có giao dịch mua cũ cần xác minh."
          : purchaseContext === "storefront"
            ? `Gói dự trữ ${quantity} Thẻ hồi sinh.`
            : `Bạn cần thêm ${quantity} Thẻ hồi sinh.`}
      </p>

      {!unresolved && price?.enabled && (
        <p>
          Giá mỗi Thẻ:{" "}
          {money(price.price_vnd)}đ hoặc{" "}
          {money(price.points_cost)} điểm.
        </p>
      )}

      {!unresolved &&
        price?.enabled &&
        Number.isSafeInteger(quantity) &&
        quantity > 0 && (
        <p>
          {method === "points"
            ? "Tổng điểm: "
            : "Tổng tiền: "}
          {method === "points"
            ? money(
                BigInt(price.points_cost) *
                BigInt(quantity)
              )
            : money(
                BigInt(price.price_vnd) *
                BigInt(quantity)
              )}
          {method === "points"
            ? " điểm"
            : "đ"}
        </p>
      )}

      {!unresolved && (
        <div
          role="group"
          aria-label="Phương thức mua Thẻ hồi sinh"
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            disabled={busy}
            aria-pressed={method === "wallet"}
            onClick={() => setMethod("wallet")}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 12,
              border: method === "wallet"
                ? "1px solid #f2b46d"
                : "1px solid rgba(255,255,255,.12)",
              background: method === "wallet"
                ? "linear-gradient(135deg,rgba(218,105,40,.32),rgba(246,174,86,.14))"
                : "rgba(255,255,255,.045)",
              color: method === "wallet" ? "#ffe4b6" : "rgba(255,255,255,.68)",
              fontWeight: 850,
            }}
          >
            Cing Wallet
          </button>

          <button
            type="button"
            disabled={!POINTS_ENABLED || busy}
            aria-pressed={method === "points"}
            onClick={() => setMethod("points")}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 12,
              border: method === "points"
                ? "1px solid #f2b46d"
                : "1px solid rgba(255,255,255,.12)",
              background: method === "points"
                ? "linear-gradient(135deg,rgba(218,105,40,.32),rgba(246,174,86,.14))"
                : "rgba(255,255,255,.045)",
              color: method === "points" ? "#ffe4b6" : "rgba(255,255,255,.68)",
              fontWeight: 850,
            }}
          >
            {POINTS_ENABLED
              ? "Điểm tích lũy"
              : "Điểm tích lũy · Chưa mở"}
          </button>
        </div>
      )}

      {unresolved && (
        <p>
          Giao dịch cũ:{" "}
          {source === "wallet"
            ? "Cing Wallet"
            : "Điểm tích lũy"}
          {" · "}
          {quantity} Thẻ hồi sinh.
        </p>
      )}

      {!unresolved &&
        !loading &&
        price?.enabled === false && (
        <p>
          Thẻ hồi sinh hiện chưa mở bán.
        </p>
      )}

      {message && (
        <p role="alert">{message}</p>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => {
          void purchase();
        }}
        style={{
          width: "100%",
          minHeight: 48,
          border: "none",
          borderRadius: 14,
          background: canSubmit
            ? "linear-gradient(135deg,#d65a22,#f18b3d)"
            : "rgba(255,255,255,.10)",
          color: canSubmit ? "#fff" : "rgba(255,255,255,.40)",
          fontSize: 13,
          fontWeight: 950,
          boxShadow: canSubmit
            ? "0 10px 22px rgba(212,83,28,.25)"
            : "none",
        }}
      >
        {busy
          ? "Đang xác minh..."
          : unresolved
            ? "Xác minh giao dịch mua cũ"
            : "Xác nhận mua Thẻ hồi sinh"}
      </button>
    </section>
  );
}
