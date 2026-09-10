import { useNavigate } from "react-router-dom";

import useWalletController from "../hooks/useWalletController";

import WalletQuickServices from "../components/WalletQuickServices";
import WalletStatement from "../components/WalletStatement";
import WalletTopupPanel from "../components/WalletTopupPanel";

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

      <section className="cing-wallet-hero cing-wallet-hero--heritage cing-wallet-hero--heritage-v7">
        <div
          className="cing-wallet-hero__ambient"
          aria-hidden="true"
        />

        <div
          className="cing-wallet-hero__grain"
          aria-hidden="true"
        />

        <div
          className="cing-wallet-hero__logo-halo"
          aria-hidden="true"
        />

        <div
          className="cing-wallet-hero__ornament cing-wallet-hero__ornament--roof"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <div
          className="cing-wallet-hero__ornament cing-wallet-hero__ornament--fan"
          aria-hidden="true"
        />

        <div
          className="cing-wallet-hero__ornament cing-wallet-hero__ornament--wave"
          aria-hidden="true"
        />

        <div className="cing-wallet-hero__top">
          <div className="cing-wallet-hero__identity">
            <div className="cing-wallet-hero__brand-mark">
              <img
                src="/logo-cing.png"
                alt="Cing Hu Tang Kinh Bắc"
                className="cing-wallet-hero__official-logo"
              />
            </div>

            <div className="cing-wallet-hero__brand-copy">
              <span className="cing-wallet-hero__eyebrow">
                CING WALLET
              </span>

              <span className="cing-wallet-hero__balance-label">
                SỐ DƯ KHẢ DỤNG
              </span>
            </div>
          </div>

          <div
            className="cing-wallet-hero__medallion"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>
        </div>

        {loading &&
        !hasBalance ? (
          <div className="cing-wallet-hero__skeleton" />
        ) : error &&
          !hasBalance ? (
          <div className="cing-wallet-hero__amount cing-wallet-hero__amount--error">
            — — —
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
