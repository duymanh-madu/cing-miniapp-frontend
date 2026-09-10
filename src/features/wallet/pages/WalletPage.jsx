import {
  useNavigate,
} from "react-router-dom";

import useWalletController
  from "../hooks/useWalletController";

import WalletGlyph
  from "../components/WalletGlyph";

import WalletQuickServices
  from "../components/WalletQuickServices";

import WalletStatement
  from "../components/WalletStatement";

import WalletTopupPanel
  from "../components/WalletTopupPanel";

import "./wallet-page.css";


const CING_BRAND_LOGO_URL =
  "https://umzcqpkfiscotijohloc.supabase.co/storage/v1/object/public/Logo/4891002C-3A39-435C-8D57-5DEA9B24937E.PNG";


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

      <section className="cing-wallet-hero">
        <div className="cing-wallet-hero__shine" />

        <div className="cing-wallet-hero__top">
          <div className="cing-wallet-hero__brand">
            <span>
              <WalletGlyph
                size={21}
              />
            </span>

            CING WALLET
          </div>

          <div className="cing-wallet-hero__brand-logo">
            <img
              src={CING_BRAND_LOGO_URL}
              alt="Cing Hu Tang Kinh Bắc"
              loading="eager"
              decoding="async"
            />
          </div>
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
