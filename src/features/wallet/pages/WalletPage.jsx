import {
  useNavigate,
} from "react-router-dom";

import useWalletController
  from "../hooks/useWalletController";

import WalletQuickServices
  from "../components/WalletQuickServices";

import WalletStatement
  from "../components/WalletStatement";

import WalletTopupPanel
  from "../components/WalletTopupPanel";

import "./wallet-page.css";


const fmtMoney =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Number(value || 0)
    )}đ`;


export default function WalletPage() {
  const navigate =
    useNavigate();

  const {
    balance,
    transactions,

    loading,
    refreshing,
    error,

    topup,
  } =
    useWalletController();

  const hasBalance =
    Number.isSafeInteger(
      Number(balance)
    );

  const scrollTopup =
    () => {
      document
        .getElementById(
          "cing-wallet-topup"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start",
        });
    };


  return (
    <main className="cing-wallet-page">
      <header className="cing-wallet-page__header">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          aria-label="Quay lại"
        >
          ←
        </button>

        <div>
          <p>
            CING HU TANG KINH BẮC
          </p>

          <h1>
            Cing Wallet
          </h1>
        </div>

        {refreshing && (
          <span className="cing-wallet-page__refreshing">
            Đang đồng bộ
          </span>
        )}
      </header>


      <section className="cing-wallet-hero cing-wallet-hero--heritage-v9">

        <div
          className="cing-wallet-v9__sunlight"
          aria-hidden="true"
        />

        <div
          className="cing-wallet-v9__surface-light"
          aria-hidden="true"
        />


        <svg
          className="cing-wallet-v9__heritage-scene"
          viewBox="0 0 360 180"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <circle
            cx="286"
            cy="44"
            r="25"
            className="cing-wallet-v9__heritage-sun"
          />

          <path
            d="M168 118
               C196 105 214 95 232 81
               C250 67 266 64 279 72
               C290 79 302 88 316 94
               C327 99 342 101 354 100"
          />

          <path
            d="M205 122
               C235 119 269 116 337 105"
          />

          <path
            d="M238 111
               C256 109 275 103 291 93
               C308 82 325 83 344 91"
          />

          <path
            d="M254 124
               L254 145
               M276 119
               L276 145
               M300 114
               L300 145"
          />

          <path
            d="M239 145
               L319 145"
          />

          <path
            d="M229 151
               C259 148 292 149 329 151"
          />

          <path
            d="M176 139
               C194 131 211 131 228 138"
          />

          <path
            d="M195 62
               q7 -7 14 0
               M215 52
               q7 -7 14 0"
            className="cing-wallet-v9__heritage-birds"
          />
        </svg>


        <div className="cing-wallet-v9__top">
          <div className="cing-wallet-v9__logo-wrap">
            <img
              src="/logo-cing.png"
              alt="Cing Hu Tang Kinh Bắc"
              className="cing-wallet-v9__logo"
            />
          </div>

          <div className="cing-wallet-v9__title">
            CING WALLET
          </div>
        </div>


        <div className="cing-wallet-v9__balance-area">
          <div className="cing-wallet-v9__balance-label">
            SỐ DƯ KHẢ DỤNG
          </div>

          {loading &&
          !hasBalance ? (
            <div
              className="cing-wallet-v9__skeleton"
              aria-label="Đang tải số dư"
            />
          ) : error &&
            !hasBalance ? (
            <div className="cing-wallet-v9__amount cing-wallet-v9__amount--error">
              — — —
            </div>
          ) : (
            <div className="cing-wallet-v9__amount">
              {fmtMoney(
                balance
              )}
            </div>
          )}
        </div>


        <p className="cing-wallet-v9__caption">
          Nạp trước một lần, thanh toán nhanh cho những lần ghé Cing tiếp theo.
        </p>


        <div className="cing-wallet-v9__actions">
          <button
            type="button"
            className="cing-wallet-v9__action cing-wallet-v9__action--primary"
            onClick={
              scrollTopup
            }
          >
            Nạp tiền
          </button>

          <button
            type="button"
            className="cing-wallet-v9__action cing-wallet-v9__action--secondary"
            onClick={() =>
              navigate(
                "/wallet/pos-pay"
              )
            }
          >
            Quét QR tại quầy
          </button>
        </div>
      </section>


      <WalletQuickServices
        onTopup={
          scrollTopup
        }
        historyTargetId="cing-wallet-history"
      />


      <WalletTopupPanel
        promotion={
          topup.promotion
        }

        promotionLoading={
          topup.promotionLoading
        }

        amountInput={
          topup.amountInput
        }

        onAmountChange={
          topup.setAmountInput
        }

        submitting={
          topup.submitting
        }

        pendingTopup={
          topup.pendingTopup
        }

        error={
          topup.error
        }

        notice={
          topup.notice
        }

        onSubmit={
          topup.submitTopup
        }
      />


      <WalletStatement
        transactions={
          transactions
        }
      />
    </main>
  );
}
