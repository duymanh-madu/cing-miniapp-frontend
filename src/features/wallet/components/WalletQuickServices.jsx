import {
  useNavigate,
} from "react-router-dom";

import WalletGlyph
  from "./WalletGlyph";


function OrderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 4h10l-1 16H8L7 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 8h11M9 3h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}


function QrIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 14h2v2h-2v-2Zm4 0h2v4h-2m-4 0h2v2h-2m4 0h2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.2 5.2v4h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v4.2l2.8 1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}


export default function WalletQuickServices({
  onTopup,
  historyTargetId,
}) {
  const navigate =
    useNavigate();

  const scrollHistory =
    () => {
      document
        .getElementById(
          historyTargetId
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start",
        });
    };

  return (
    <section className="cing-wallet-services">
      <button
        type="button"
        onClick={
          onTopup
        }
      >
        <span>
          <WalletGlyph
            size={22}
          />
        </span>

        <strong>
          Nạp tiền
        </strong>
      </button>

      <button
        type="button"
        onClick={() =>
          navigate(
            "/wallet/pos-pay"
          )
        }
      >
        <span>
          <QrIcon />
        </span>

        <strong>
          Quét QR
        </strong>
      </button>

      <button
        type="button"
        onClick={() =>
          navigate(
            "/menu"
          )
        }
      >
        <span>
          <OrderIcon />
        </span>

        <strong>
          Đặt món
        </strong>
      </button>

      <button
        type="button"
        onClick={
          scrollHistory
        }
      >
        <span>
          <HistoryIcon />
        </span>

        <strong>
          Lịch sử
        </strong>
      </button>
    </section>
  );
}
