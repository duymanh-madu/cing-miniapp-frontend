import {
  useNavigate,
} from "react-router-dom";

import WalletGlyph
  from "@/features/wallet/components/WalletGlyph";

function OrderGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="25"
      height="25"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3.75h10l-1.1 16.5H8.1L7 3.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6.3 7.25h11.4M9 2.75h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14.6 8.25c.7 2.1-.2 4.6-2.2 5.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GameGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.8 7.25h8.4c2.2 0 3.7 1.3 4.15 3.35l.85 3.85c.55 2.5-2.45 4.1-4.2 2.35l-1.6-1.6H8.6L7 16.85c-1.7 1.7-4.75.15-4.2-2.35l.85-3.9C4.1 8.55 5.6 7.25 7.8 7.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.2v3.1M5.95 11.75h3.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="16.2"
        cy="10.8"
        r=".8"
        fill="currentColor"
      />
      <circle
        cx="18.05"
        cy="12.65"
        r=".8"
        fill="currentColor"
      />
    </svg>
  );
}

function BenefitsGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.2 9.6 3.8 6.3l4.15 1.1L10.15 3l1.85 4.4L13.85 3l2.2 4.4 4.15-1.1-1.4 3.3"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 9.6h13.5l-1.05 9.65H6.3L5.25 9.6Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M8 13.25h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ACTIONS = [
  {
    key:
      "order",
    label:
      "Đặt món",
    path:
      "/menu",
    icon:
      <OrderGlyph />,
    bg:
      "#fff5ed",
    border:
      "#fed7c2",
    text:
      "#cf4c17",
  },
  {
    key:
      "wallet",
    label:
      "Cing Wallet",
    path:
      "/wallet",
    icon:
      <WalletGlyph
        size={26}
      />,
    bg:
      "#f7f1e6",
    border:
      "#e8d5ad",
    text:
      "#7c5726",
  },
  {
    key:
      "game",
    label:
      "Game Center",
    path:
      "/game-center",
    icon:
      <GameGlyph />,
    bg:
      "#f5f3ff",
    border:
      "#ddd6fe",
    text:
      "#6d4bd8",
  },
  {
    key:
      "benefits",
    label:
      "Quyền lợi thành viên",
    path:
      "/membership-benefits",
    icon:
      <BenefitsGlyph />,
    bg:
      "#fff9e8",
    border:
      "#f4dfa2",
    text:
      "#a66d15",
  },
];

export default function HomeQuickActions() {
  const navigate =
    useNavigate();

  return (
    <div
      style={{
        display:
          "grid",
        gridTemplateColumns:
          "repeat(4,1fr)",
        gap:
          10,
      }}
    >
      {ACTIONS.map(
        action => (
          <button
            key={action.key}
            type="button"
            onClick={() =>
              navigate(
                action.path
              )
            }
            style={{
              minWidth:
                0,
              display:
                "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap:
                7,
              minHeight:
                78,
              padding:
                "13px 3px 11px",
              borderRadius:
                17,
              border:
                `1.25px solid ${action.border}`,
              background:
                action.bg,
              color:
                action.text,
              cursor:
                "pointer",
              WebkitTapHighlightColor:
                "transparent",
              boxShadow:
                "0 5px 14px rgba(35,25,12,.035)",
            }}
          >
            <span
              style={{
                width:
                  32,
                height:
                  32,
                display:
                  "grid",
                placeItems:
                  "center",
              }}
            >
              {action.icon}
            </span>

            <span
              style={{
                maxWidth:
                  "100%",
                minHeight:
                  24,
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  9.7,
                fontWeight:
                  800,
                lineHeight:
                  1.18,
                color:
                  action.text,
                textAlign:
                  "center",
                letterSpacing:
                  "-.08px",
              }}
            >
              {action.label}
            </span>
          </button>
        )
      )}
    </div>
  );
}
