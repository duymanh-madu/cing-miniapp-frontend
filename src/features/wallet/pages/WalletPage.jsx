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


const CING_BRAND_LOGO_URL =
  "/logo-cing.png";


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

      <section className="cing-wallet-hero cing-wallet-hero--heritage">
          <div
            className="cing-wallet-hero__heritage-pattern"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>

          <img
            className="cing-wallet-hero__watermark-logo"
            src={CING_BRAND_LOGO_URL}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
          />

          <div className="cing-wallet-hero__top">
            <div className="cing-wallet-hero__brand-lockup">
              <span className="cing-wallet-hero__brand-kicker">
                CING HU TANG
              </span>

              <strong>
                KINH BẮC
              </strong>

              <small>
                BẮC NINH • HERITAGE WALLET
              </small>
            </div>

            <div
              className="cing-wallet-hero__kinhbac-seal"
              aria-label="Cing Hu Tang Kinh Bắc"
            >
              <span>C</span>
              <small>KB</small>
            </div>
          </div>

          <div className="cing-wallet-hero__wallet-signature">
            CING WALLET
          </div>

          <div className="cing-wallet-hero__balance-label">
          Số dư khả dụng
        </div>

        {loading &&
        !hasBalance ? (
          <div className="cing-wallet-hero__skeleton" />
        ) : error &&
          !hasBalance ? (
          <div className="cing-wallet-hero__amount cing-wallet-hero__amount--error">
            Đang đồng bộ
          </div>
        ) : (
          <div className="cing-wallet-hero__amount">
            {fmtMoney(
              balance
            )}
          </div>
        )}

        <p className="cing-wallet-hero__caption">
          Nạp trước một lần, thanh toán nhanh cho những lần ghé Cing tiếp theo.
        </p>

        <div className="cing-wallet-hero__quick">
          <button
            type="button"
            onClick={
              scrollTopup
            }
          >
            Nạp tiền
          </button>

          <button
            type="button"
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
