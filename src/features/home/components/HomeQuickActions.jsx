import {
  useNavigate,
} from "react-router-dom";

import WalletGlyph
  from "@/features/wallet/components/WalletGlyph";

import "./home-quick-actions.css";


function OrderGlyph() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path
        className="cing-action-icon__soft"
        d="M9.25 8.5h13.5l-1.15 16H10.4L9.25 8.5Z"
      />
      <path
        className="cing-action-icon__solid"
        d="M11.2 7.25a4.8 4.8 0 0 1 9.6 0h-2.55a2.25 2.25 0 0 0-4.5 0H11.2Zm-1.95 1.3h13.5l-.25 3.25h-13l-.25-3.25Z"
      />
      <path
        className="cing-action-icon__detail"
        d="M13.2 15.2h5.6M13.65 18.4h4.7"
      />
    </svg>
  );
}


function GameGlyph() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path
        className="cing-action-icon__soft"
        d="M10.2 10.25h11.6c3.1 0 5.05 1.8 5.65 4.75l.8 3.95c.7 3.35-3.25 5.45-5.6 3.05l-2.3-2.35h-8.7L9.35 22c-2.35 2.4-6.3.3-5.6-3.05l.8-3.95c.6-2.95 2.55-4.75 5.65-4.75Z"
      />
      <path
        className="cing-action-icon__solid"
        d="M9.35 14.1h2.15v2.15h2.15v2.15H11.5v2.15H9.35V18.4H7.2v-2.15h2.15V14.1Z"
      />
      <circle
        className="cing-action-icon__solid"
        cx="21.15"
        cy="15.45"
        r="1.55"
      />
      <circle
        className="cing-action-icon__solid"
        cx="24.4"
        cy="18.45"
        r="1.55"
      />
    </svg>
  );
}


function BenefitsGlyph() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path
        className="cing-action-icon__soft"
        d="M7.25 12.4h17.5l-1.4 12.35H8.65L7.25 12.4Z"
      />
      <path
        className="cing-action-icon__solid"
        d="m6.05 10.4-1.8-5 5.6 1.65L13 2.8l3 5.3 3-5.3 3.15 4.25 5.6-1.65-1.8 5H6.05Z"
      />
      <path
        className="cing-action-icon__detail"
        d="M11.2 16.2h9.6M12.3 19.45h7.4"
      />
    </svg>
  );
}


const ACTIONS = [
  {
    key: "order",
    label: "Đặt món",
    kicker: "Thưởng thức",
    path: "/menu",
    icon: <OrderGlyph />,
    tone: "orange",
  },
  {
    key: "wallet",
    label: "Cing Wallet",
    kicker: "Thanh toán",
    path: "/wallet",
    icon: (
      <WalletGlyph
        size={29}
        strokeWidth={1.7}
      />
    ),
    tone: "wallet",
  },
  {
    key: "game",
    label: "Game Center",
    kicker: "Giải trí",
    path: "/game-center",
    icon: <GameGlyph />,
    tone: "violet",
  },
  {
    key: "benefits",
    label: "Quyền lợi thành viên",
    kicker: "Đặc quyền",
    path: "/membership-benefits",
    icon: <BenefitsGlyph />,
    tone: "gold",
  },
];


export default function HomeQuickActions() {
  const navigate =
    useNavigate();

  return (
    <nav
      className="cing-home-actions"
      aria-label="Dịch vụ Cing"
    >
      {ACTIONS.map(
        action => (
          <button
            key={action.key}
            type="button"
            className={[
              "cing-home-action",
              `cing-home-action--${action.tone}`,
            ].join(" ")}
            onClick={() =>
              navigate(
                action.path
              )
            }
          >
            <span className="cing-home-action__icon">
              {action.icon}
            </span>

            <span className="cing-home-action__copy">
              <strong>
                {action.label}
              </strong>

              <small>
                {action.kicker}
              </small>
            </span>
          </button>
        )
      )}
    </nav>
  );
}
