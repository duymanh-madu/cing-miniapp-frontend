import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import apiClient from
  "@/infra/api/apiClient";

import {
  useRuntimeCustomerIdentityStore,
} from
  "@/runtime/customer/runtimeCustomerIdentityStore";

import useAuthStore from
  "@/stores/auth/authStore";

import RevivePassIcon from
  "@/features/game-center/components/RevivePassIcon";

const fmtDate = value =>
  new Date(value).toLocaleString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

const fmtNumber = value =>
  new Intl.NumberFormat(
    "vi-VN"
  ).format(Number(value || 0));

const GAME_LABELS = {
  "black-pearl-rush":
    "Bay cùng trân châu",

  "cing-stack-tower":
    "Xếp Tháp Cing",

  "cing-block-puzzle":
    "Cing Block Puzzle",

  chess:
    "Kỳ thủ cờ vua",
};

function transactionPresentation(item) {
  const ref =
    String(
      item?.reference_type || ""
    ).toLowerCase();

  const reason =
    String(
      item?.reason || ""
    ).trim();

  const game =
    GAME_LABELS[item?.game_key] ||
    item?.game_key ||
    "";

  if (
    ref.includes("daily_mission")
  ) {
    return {
      icon: "✅",
      label: "Nhiệm vụ ngày",
    };
  }

  if (
    ref.includes("crm_order") ||
    ref.includes("commerce") ||
    ref.includes("order_spending")
  ) {
    return {
      icon: "🧋",
      label: "Thưởng từ đơn hàng",
    };
  }

  if (
    ref.includes("wallet") &&
    ref.includes("purchase")
  ) {
    return {
      icon: "👛",
      label:
        "Mua bằng Cing Wallet",
    };
  }

  if (
    ref.includes("points") &&
    ref.includes("purchase")
  ) {
    return {
      icon: "⭐",
      label:
        "Mua bằng điểm tích lũy",
    };
  }

  if (
    ref.includes("admin")
  ) {
    return {
      icon: "🛠️",
      label:
        "Điều chỉnh từ quản trị",
    };
  }

  if (
    item?.amount < 0
  ) {
    return {
      icon: "🎮",
      label:
        game
          ? `Hồi sinh · ${game}`
          : "Dùng Thẻ hồi sinh",
    };
  }

  return {
    icon: "revive-pass",
    label:
      reason ||
      "Nhận Thẻ hồi sinh",
  };
}

export default function GamePlaysHistoryPage() {
  const navigate =
    useNavigate();

  const runtimePhone =
    useRuntimeCustomerIdentityStore(
      state =>
        state.identity?.phone
    );

  const profilePhone =
    useAuthStore(
      state =>
        state.profile?.phone
    );

  const phone = (() => {
    const source =
      runtimePhone ||
      profilePhone ||
      "";

    if (
      !source ||
      source === "pending"
    ) {
      return "";
    }

    return source
      .replace(/\D/g, "")
      .replace(/^84/, "0");
  })();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    if (!phone) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    apiClient
      .get(
        `/profile-update/revive-credits-history/${phone}`
      )
      .then(response => {
        if (!active) return;

        const next =
          response?.data?.data;

        if (
          !next ||
          !Number.isSafeInteger(
            Number(next.balance)
          ) ||
          !Number.isSafeInteger(
            Number(next.total_earned)
          ) ||
          !Number.isSafeInteger(
            Number(next.total_used)
          ) ||
          !Array.isArray(
            next.transactions
          )
        ) {
          throw new Error(
            "REVIVE_PROFILE_RESPONSE_INVALID"
          );
        }

        setData({
          balance:
            Number(next.balance),

          total_earned:
            Number(
              next.total_earned
            ),

          total_used:
            Number(
              next.total_used
            ),

          transactions:
            next.transactions,
        });
      })
      .catch(() => {
        if (active) {
          setError(
            "Chưa tải được thông tin Thẻ hồi sinh."
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
  }, [phone]);

  const transactions =
    data?.transactions || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#120b0a 0%,#09090e 42%,#09090e 100%)",
        paddingBottom: 80,
        color: "white",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background:
            "rgba(12,9,10,.94)",
          backdropFilter:
            "blur(12px)",
          borderBottom:
            "1px solid rgba(255,205,135,.12)",
        }}
      >
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() =>
            navigate(-1)
          }
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border:
              "1px solid rgba(255,255,255,.10)",
            background:
              "rgba(255,255,255,.05)",
            color: "white",
            fontSize: 21,
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.8,
              color: "#d7a86e",
            }}
          >
            CING GAME CENTER
          </div>

          <h1
            style={{
              margin: "2px 0 0",
              fontSize: 19,
              fontWeight: 950,
            }}
          >
            <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}><RevivePassIcon size={30} /><span>Thẻ hồi sinh</span></span>
          </h1>
        </div>
      </header>

      <main
        style={{
          padding: 16,
          maxWidth: 620,
          margin: "0 auto",
        }}
      >
        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: "12px 14px",
              borderRadius: 14,
              background:
                "rgba(244,67,54,.10)",
              border:
                "1px solid rgba(244,67,54,.22)",
              color: "#ffc6c1",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <section
          aria-label="Số dư Thẻ hồi sinh"
          style={{
            padding: "24px 20px",
            marginBottom: 14,
            borderRadius: 24,
            textAlign: "center",
            background:
              "linear-gradient(145deg,#382014,#1c1011)",
            border:
              "1px solid rgba(255,194,111,.28)",
            boxShadow:
              "0 16px 42px rgba(0,0,0,.32)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              fontWeight: 850,
              textTransform:
                "uppercase",
              letterSpacing: 1.8,
              color: "#d5af83",
            }}
          >
            Thẻ hiện có
          </p>

          <div
            style={{
              fontSize: 58,
              lineHeight: 1,
              fontWeight: 950,
              color: "#ffd391",
            }}
          >
            {loading
              ? "—"
              : fmtNumber(
                  data?.balance
                )}
          </div>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: 12,
              color:
                "rgba(255,255,255,.52)",
            }}
          >
            Dùng để hồi sinh trong
            các game hỗ trợ
          </p>
        </section>

        <section
          aria-label="Thống kê Thẻ hồi sinh"
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background:
                "rgba(76,175,80,.09)",
              border:
                "1px solid rgba(76,175,80,.18)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color:
                  "rgba(255,255,255,.52)",
                marginBottom: 5,
              }}
            >
              Tổng đã nhận
            </div>

            <strong
              style={{
                fontSize: 24,
                color: "#7de18b",
              }}
            >
              +
              {loading
                ? "—"
                : fmtNumber(
                    data?.total_earned
                  )}
            </strong>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background:
                "rgba(255,103,92,.08)",
              border:
                "1px solid rgba(255,103,92,.17)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color:
                  "rgba(255,255,255,.52)",
                marginBottom: 5,
              }}
            >
              Tổng đã dùng
            </div>

            <strong
              style={{
                fontSize: 24,
                color: "#ff9489",
              }}
            >
              −
              {loading
                ? "—"
                : fmtNumber(
                    data?.total_used
                  )}
            </strong>
          </div>
        </section>

        <section
          aria-label="Lịch sử Thẻ hồi sinh"
          style={{
            padding: 18,
            borderRadius: 22,
            background:
              "rgba(255,255,255,.035)",
            border:
              "1px solid rgba(255,255,255,.075)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              Lịch sử Thẻ hồi sinh
            </h2>

            <span
              style={{
                fontSize: 10,
                color:
                  "rgba(255,255,255,.38)",
              }}
            >
              100 giao dịch gần nhất
            </span>
          </div>

          {loading ? (
            <p
              style={{
                padding: "24px 0",
                textAlign: "center",
                color:
                  "rgba(255,255,255,.38)",
              }}
            >
              Đang tải...
            </p>
          ) : transactions.length === 0 ? (
            <p
              style={{
                padding: "24px 0",
                textAlign: "center",
                color:
                  "rgba(255,255,255,.38)",
                fontSize: 13,
              }}
            >
              Chưa có giao dịch
              Thẻ hồi sinh
            </p>
          ) : (
            transactions.map(
              item => {
                const amount =
                  Number(item.amount);

                const isAdd =
                  amount > 0;

                const presentation =
                  transactionPresentation(
                    item
                  );

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems:
                        "center",
                      padding:
                        "13px 0",
                      borderBottom:
                        "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        borderRadius: 13,
                        fontSize: 20,
                        background:
                          isAdd
                            ? "rgba(76,175,80,.11)"
                            : "rgba(244,67,54,.10)",
                      }}
                    >
                      {presentation.icon === "revive-pass" ? (
                        <RevivePassIcon size={30} />
                      ) : (
                        presentation.icon
                      )}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "white",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          presentation.label
                        }
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 7,
                          flexWrap:
                            "wrap",
                          marginTop: 4,
                          fontSize: 10,
                          color:
                            "rgba(255,255,255,.38)",
                        }}
                      >
                        <span>
                          {fmtDate(
                            item.created_at
                          )}
                        </span>

                        <span>
                          · Còn{" "}
                          <strong
                            style={{
                              color:
                                "#d9b77e",
                            }}
                          >
                            {fmtNumber(
                              item.balance_after
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        textAlign:
                          "right",
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "block",
                          fontSize: 18,
                          color:
                            isAdd
                              ? "#75dc87"
                              : "#ff8278",
                        }}
                      >
                        {isAdd
                          ? "+"
                          : "−"}
                        {fmtNumber(
                          Math.abs(
                            amount
                          )
                        )}
                      </strong>

                      <span
                        style={{
                          fontSize: 9,
                          color:
                            "rgba(255,255,255,.32)",
                        }}
                      >
                        Credit
                      </span>
                    </div>
                  </div>
                );
              }
            )
          )}
        </section>
      </main>
    </div>
  );
}
