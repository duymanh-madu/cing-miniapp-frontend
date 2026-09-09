export default function WalletGlyph({
  size = 24,
  strokeWidth = 1.8,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.75 6.5A2.75 2.75 0 0 1 7.5 3.75h8.25a2 2 0 0 1 2 2V7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      <rect
        x="3.75"
        y="6.75"
        width="16.5"
        height="13.5"
        rx="3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <path
        d="M15 11.25h5.25v4.5H15a2.25 2.25 0 0 1 0-4.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <circle
        cx="15.4"
        cy="13.5"
        r=".7"
        fill="currentColor"
      />
    </svg>
  );
}
