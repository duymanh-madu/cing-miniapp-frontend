import {
  useNavigate,
} from "react-router-dom";

import useWalletOverview
  from "../hooks/useWalletOverview";

import "./home-wallet.css";

const fmtMoney =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Number(value || 0)
    )}đ`;

function resolveState(
  balance
) {
  if (balance === 0) {
    return {
      label:
        "Bắt đầu với Cing Wallet",
      sub:
        "Nạp trước để thanh toán nhanh hơn tại Cing",
      accent:
        "empty",
    };
  }

  if (
    balance <
    100_000
  ) {
    return {
      label:
        "Số dư đang thấp",
      sub:
        "Nạp thêm để sẵn sàng cho đơn hàng tiếp theo",
      accent:
        "low",
    };
  }

  if (
    balance >=
    1_000_000
  ) {
    return {
      label:
        "Sẵn sàng cho mọi đơn hàng",
      sub:
        "Số dư Cing Wallet của bạn đang ở mức rất thoải mái",
      accent:
        "premium",
    };
  }

  return {
    label:
      "Sẵn sàng thanh toán",
    sub:
      "Dùng Wallet cho đơn hàng tiếp theo tại Cing",
    accent:
      "ready",
  };
}

export default function HomeWalletSnapshot() {
  const navigate =
    useNavigate();

  const {
    balance,
    loading,
    error,
  } =
    useWalletOverview();

  const resolvedBalance =
    Number.isSafeInteger(
      Number(balance)
    )
      ? Number(balance)
      : null;

  const state =
    resolvedBalance !==
    null
      ? resolveState(
          resolvedBalance
        )
      : null;

  return (
    <section
      className={[
        "cing-home-wallet",
        "cing-home-wallet--heritage-v2",
        state?.accent
          ? `cing-home-wallet--${state.accent}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="cing-home-wallet__surface"
        onClick={() =>
          navigate(
            "/wallet"
          )
        }
        aria-label="Mở Cing Wallet"
      >
        <div
          className="cing-home-wallet__ambient"
          aria-hidden="true"
        />

        <div
          className="cing-home-wallet__ornament cing-home-wallet__ornament--fan"
          aria-hidden="true"
        />

        <div
          className="cing-home-wallet__ornament cing-home-wallet__ornament--wave"
          aria-hidden="true"
        />

        <div className="cing-home-wallet__content">
          <div className="cing-home-wallet__header">
            <div className="cing-home-wallet__logo-plaque">
              <img
                src="/logo-cing.png"
                alt="Cing Hu Tang Kinh Bắc"
                className="cing-home-wallet__logo"
              />
            </div>

          </div>

          <div className="cing-home-wallet__body">
            <div className="cing-home-wallet__eyebrow">
              CING WALLET
            </div>

            {loading &&
            resolvedBalance ===
              null ? (
              <div
                className="cing-home-wallet__balance-skeleton"
                aria-label="Đang tải số dư"
              />
            ) : error &&
              resolvedBalance ===
                null ? (
              <div className="cing-home-wallet__balance cing-home-wallet__balance--error">
                — — —
              </div>
            ) : (
              <div className="cing-home-wallet__balance">
                {fmtMoney(
                  resolvedBalance
                )}
              </div>
            )}

            <div className="cing-home-wallet__message">
              <strong>
                {state?.label ||
                  "Cing Wallet"}
              </strong>

              <span>
                {state?.sub ||
                  "Số dư chi tiêu của bạn tại Cing"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="cing-home-wallet__chevron"
          aria-hidden="true"
        >
          ›
        </div>
      </button>

      <div className="cing-home-wallet__actions">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/wallet",
              {
                state: {
                  walletAction:
                    "topup",
                },
              }
            )
          }
        >
          Nạp thêm
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/menu"
            )
          }
        >
          Đặt món
        </button>
      </div>
    </section>
  );
}
