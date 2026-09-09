import {
  useNavigate,
} from "react-router-dom";

import useWalletOverview
  from "../hooks/useWalletOverview";

import WalletGlyph
  from "./WalletGlyph";

import "./wallet-membership-gateway.css";


const money =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Number(value || 0)
    )}đ`;


function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function WalletMembershipGateway() {
  const navigate =
    useNavigate();

  const {
    balance,
    loading,
    error,
  } =
    useWalletOverview();

  const hasBalance =
    Number.isSafeInteger(
      Number(balance)
    );

  return (
    <section className="wallet-membership-gateway">
      <button
        type="button"
        className="wallet-membership-gateway__surface"
        onClick={() =>
          navigate(
            "/wallet"
          )
        }
        aria-label="Mở Cing Wallet"
      >
        <div className="wallet-membership-gateway__icon">
          <WalletGlyph
            size={23}
          />
        </div>

        <div className="wallet-membership-gateway__body">
          <span className="wallet-membership-gateway__eyebrow">
            CING WALLET
          </span>

          <strong>
            Ví thanh toán của bạn
          </strong>

          <p>
            Nạp tiền, thanh toán tại quầy và xem lịch sử Wallet trong một nơi.
          </p>
        </div>

        <div className="wallet-membership-gateway__aside">
          <span>
            {loading &&
            !hasBalance
              ? "Đang tải"
              : error &&
                !hasBalance
                ? "—"
                : money(
                    balance
                  )}
          </span>

          <ArrowIcon />
        </div>
      </button>
    </section>
  );
}
