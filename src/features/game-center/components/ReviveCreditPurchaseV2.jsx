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
            "Chưa đọc được giá Credit từ hệ thống."
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
        `Đã nhận ${receipt.quantity} Revive Credit.`
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
      aria-label="Mua Revive Credit"
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 14,
        background: "rgba(212,83,28,.09)",
        border: "1px solid rgba(212,83,28,.25)",
      }}
    >
      <strong>Mua Revive Credit</strong>

      <p>
        {unresolved
          ? "Có giao dịch mua cũ cần xác minh."
          : purchaseContext === "storefront"
            ? `Gói dự trữ ${quantity} Credit.`
            : `Bạn cần thêm ${quantity} Credit.`}
      </p>

      {!unresolved && price?.enabled && (
        <p>
          Giá mỗi Credit:{" "}
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
          aria-label="Phương thức mua Credit"
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
          >
            Cing Wallet
          </button>

          <button
            type="button"
            disabled={!POINTS_ENABLED || busy}
            aria-pressed={method === "points"}
            onClick={() => setMethod("points")}
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
          {quantity} Credit.
        </p>
      )}

      {!unresolved &&
        !loading &&
        price?.enabled === false && (
        <p>
          Admin chưa mở bán Revive Credit.
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
      >
        {busy
          ? "Đang xác minh..."
          : unresolved
            ? "Xác minh giao dịch mua cũ"
            : "Xác nhận mua Credit"}
      </button>
    </section>
  );
}
