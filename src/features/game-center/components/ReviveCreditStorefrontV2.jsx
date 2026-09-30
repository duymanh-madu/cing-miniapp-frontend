import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getOfflineRevivalCreditBalance,
} from "@/games/runtime/offlineRevivalAuthorityClient";

import ReviveCreditPurchaseV2 from
  "./ReviveCreditPurchaseV2";

import RevivePassIcon from
  "./RevivePassIcon";

const PACKAGES = Object.freeze([
  1, 2, 5, 10,
]);

export default function ReviveCreditStorefrontV2({
  userId,
  refreshSignal = 0,
}) {
  const [balance, setBalance] =
    useState(null);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(value => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setBalance(null);

    getOfflineRevivalCreditBalance()
      .then(data => {
        if (!active) return;

        if (
          !Number.isSafeInteger(data?.balance) ||
          data.balance < 0
        ) {
          throw new Error(
            "REVIVE_CREDIT_BALANCE_INVALID"
          );
        }

        setBalance(data.balance);
      })
      .catch(() => {
        if (active) {
          setError(
            "Chưa xác minh được số dư Thẻ hồi sinh."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    userId,
    refreshKey,
    refreshSignal,
  ]);

  return (
    <section
      aria-label="Cửa hàng Thẻ hồi sinh"
      style={{
        margin: "0 16px 20px",
        padding: 18,
        borderRadius: 20,
        background:
          "radial-gradient(circle at 12% 0%,rgba(240,145,72,.18),transparent 32%), linear-gradient(145deg,#24130e 0%,#160d12 55%,#0d0b10 100%)",
        border:
          "1px solid rgba(255,190,110,.38)",
        boxShadow:
          "0 18px 46px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,239,210,.06)",
        color: "#fff5e6",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
          color: "#ffd49c",
          marginBottom: 7,
        }}
      >
        CING GAME CENTER
      </div>

      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 21,
          fontWeight: 900,
          color: "#fff1d5",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <RevivePassIcon size={38} />
          <span>Thẻ hồi sinh</span>
        </span>
      </h2>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: "#e7d0b9",
          margin: "0 0 14px",
        }}
      >
        Chơi miễn phí. Dự trữ Thẻ hồi sinh để
        tiếp tục ván chơi khi cần trong Bay cùng
        trân châu, Xếp Tháp Cing và các game hỗ trợ.
      </p>

      <div
        style={{
          padding: "12px 14px",
          borderRadius: 13,
          background:
            "rgba(255,210,145,.09)",
          border:
            "1px solid rgba(255,210,145,.16)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#d9bfa3",
            marginBottom: 3,
          }}
        >
          Thẻ hiện có
        </div>

        <strong
          style={{
            fontSize: 27,
            color: "#ffdb9a",
          }}
        >
          {loading
            ? "Đang xác minh..."
            : balance === null
              ? "—"
              : balance}
        </strong>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          {error}

          <button
            type="button"
            onClick={refresh}
            style={{
              marginLeft: 9,
              padding: "5px 9px",
              borderRadius: 8,
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {balance !== null && (
        <>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            Chọn số Thẻ hồi sinh muốn mua
          </div>

          <div
            role="group"
            aria-label="Số lượng Thẻ hồi sinh"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4,minmax(0,1fr))",
              gap: 8,
            }}
          >
            {PACKAGES.map(count => (
              <button
                key={count}
                type="button"
                aria-pressed={
                  quantity === count
                }
                onClick={() =>
                  setQuantity(count)
                }
                style={{
                  padding: "12px 4px",
                  borderRadius: 12,
                  border:
                    quantity === count
                      ? "1px solid #ffca7c"
                      : "1px solid rgba(255,255,255,.2)",
                  background:
                    quantity === count
                      ? "rgba(255,171,76,.24)"
                      : "rgba(255,255,255,.05)",
                  color: "#fff1d5",
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                +{count}
              </button>
            ))}
          </div>

          <ReviveCreditPurchaseV2
            userId={userId}
            requiredQuantity={quantity}
            purchaseContext="storefront"
            onPurchased={receipt => {
              setBalance(
                receipt.credit_balance_after
              );
              refresh();
            }}
          />
        </>
      )}
    </section>
  );
}
