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

      <section className="cing-wallet-hero cing-wallet-hero--heritage cing-wallet-hero--heritage-v6">
          <div
            className="cing-wallet-hero__kinhbac-art"
            aria-hidden="true"
          >
            <svg
              className="cing-wallet-hero__roofline"
              viewBox="0 0 420 110"
              preserveAspectRatio="none"
            >
              <path
                d="M18 84 C82 82 112 64 151 39 C171 26 191 21 210 20 C229 21 249 26 269 39 C308 64 338 82 402 84"
              />
              <path
                d="M70 84 C128 77 157 58 183 40 C193 33 202 29 210 28 C218 29 227 33 237 40 C263 58 292 77 350 84"
              />
              <path
                d="M111 86 L309 86"
              />
            </svg>

            <div className="cing-wallet-hero__quai-thao">
              <span />
            </div>
          </div>

          <div className="cing-wallet-hero__identity">
            <img
              className="cing-wallet-hero__official-logo"
              src={CING_BRAND_LOGO_URL}
              alt="Cing Hu Tang Kinh Bắc"
              loading="eager"
              decoding="async"
            />

            <div className="cing-wallet-hero__identity-copy">
              <strong>
                CING HU TANG
              </strong>
              <span>
                KINH BẮC
              </span>
            </div>

            <div className="cing-wallet-hero__heritage-badge">
              KINH BẮC
            </div>
          </div>

          <div className="cing-wallet-hero__wallet-title">
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
