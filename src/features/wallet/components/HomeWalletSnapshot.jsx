import {
  useNavigate,
} from "react-router-dom";

import useWalletOverview
  from "../hooks/useWalletOverview";

import WalletGlyph
  from "./WalletGlyph";

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
        "cing-home-wallet--v9",
        state?.accent
          ? `cing-home-wallet--${state.accent}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="cing-home-wallet-v9__surface"
        onClick={() =>
          navigate(
            "/wallet"
          )
        }
        aria-label="Mở Cing Wallet"
      >
        <div
          className="cing-home-wallet-v9__sunlight"
          aria-hidden="true"
        />


        <svg
          className="cing-home-wallet-v9__heritage"
          viewBox="0 0 280 145"
          aria-hidden="true"
        >
          <circle
            cx="225"
            cy="37"
            r="21"
          />

          <path
            d="M118 100
               C148 86 165 72 182 69
               C200 66 211 77 224 84
               C239 92 253 94 273 91"
          />

          <path
            d="M166 111
               C191 108 218 104 261 94"
          />

          <path
            d="M192 103
               C206 100 220 95 232 86
               C244 78 256 79 270 86"
          />

          <path
            d="M202 110
               L202 126
               M220 106
               L220 126
               M240 101
               L240 126"
          />

          <path
            d="M190 126
               L255 126"
          />

          <path
            d="M144 58
               q6 -6 12 0
               M161 51
               q6 -6 12 0"
          />
        </svg>


        <div className="cing-home-wallet-v9__header">
          <div className="cing-home-wallet-v9__emblem">
            <WalletGlyph
              size={31}
              strokeWidth={1.9}
            />
          </div>

          <div className="cing-home-wallet-v9__eyebrow">
            CING WALLET
          </div>
        </div>


        {loading &&
        resolvedBalance ===
          null ? (
          <div
            className="cing-home-wallet-v9__skeleton"
            aria-label="Đang tải số dư"
          />
        ) : error &&
          resolvedBalance ===
            null ? (
          <div className="cing-home-wallet-v9__balance cing-home-wallet-v9__balance--error">
            — — —
          </div>
        ) : (
          <div className="cing-home-wallet-v9__balance">
            {fmtMoney(
              resolvedBalance
            )}
          </div>
        )}


        <div className="cing-home-wallet-v9__message">
          <strong>
            {state?.label ||
              "Cing Wallet"}
          </strong>

          <span>
            {state?.sub ||
              "Số dư chi tiêu của bạn tại Cing"}
          </span>
        </div>


        <div
          className="cing-home-wallet-v9__chevron"
          aria-hidden="true"
        >
          ›
        </div>
      </button>


      <div className="cing-home-wallet-v9__actions">
        <button
          type="button"
          className="cing-home-wallet-v9__action cing-home-wallet-v9__action--primary"
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
          className="cing-home-wallet-v9__action cing-home-wallet-v9__action--secondary"
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
