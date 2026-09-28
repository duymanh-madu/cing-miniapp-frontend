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

const PACKAGES = Object.freeze([
  1, 2, 5, 10,
]);

export default function ReviveCreditStorefrontV2({
  userId,
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
            "Chưa xác minh được số dư Credit."
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
  }, [userId, refreshKey]);

  return (
    <section
      aria-label="Cửa hàng Revive Credit"
      style={{
        margin: "0 16px 20px",
        padding: 18,
        borderRadius: 20,
        background:
          "linear-gradient(145deg,#29150e,#160d17)",
        border:
          "1px solid rgba(255,190,110,.38)",
        boxShadow:
          "0 12px 32px rgba(0,0,0,.22)",
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
        ✨ Kho Revive Credit
      </h2>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: "#e7d0b9",
          margin: "0 0 14px",
        }}
      >
        Chơi miễn phí. Dự trữ Credit để
        hồi sinh khi cần trong Bay cùng
        trân châu và Xếp Tháp Cing.
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
          Credit hiện có
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
            Chọn số Credit muốn mua
          </div>

          <div
            role="group"
            aria-label="Số lượng Revive Credit"
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
