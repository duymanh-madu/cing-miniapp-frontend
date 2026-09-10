export default function WalletGlyph({
  size = 24,
  strokeWidth = 1.8,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.25 9.15V7.8A4.3 4.3 0 0 1 11.55 3.5h10.2a2.75 2.75 0 0 1 2.75 2.75V9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity=".72"
      />

      <rect
        x="4.5"
        y="8.15"
        width="23"
        height="19"
        rx="5.4"
        fill="currentColor"
        opacity=".16"
      />

      <rect
        x="5.25"
        y="8.9"
        width="21.5"
        height="17.5"
        rx="4.65"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <path
        d="M20.4 14.1h6.35v7.15H20.4a3.575 3.575 0 1 1 0-7.15Z"
        fill="currentColor"
        opacity=".22"
      />

      <path
        d="M20.4 14.1h6.35v7.15H20.4a3.575 3.575 0 1 1 0-7.15Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <circle
        cx="20.6"
        cy="17.675"
        r="1.15"
        fill="currentColor"
      />

      <path
        d="M9.4 12.65h8.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  );
}
