import { useId } from "react";

export default function RevivePassIcon({
  size = 42,
  muted = false,
}) {
  const uid = useId().replace(/:/g, "");
  const card = `reviveCard_${uid}`;
  const core = `reviveCore_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{
        display: "block",
        filter: muted
          ? "none"
          : "drop-shadow(0 6px 12px rgba(236,135,59,.24))",
      }}
    >
      <defs>
        <linearGradient
          id={card}
          x1="10"
          y1="8"
          x2="54"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF2D7" />
          <stop offset=".38" stopColor="#F5C078" />
          <stop offset=".72" stopColor="#D56B2A" />
          <stop offset="1" stopColor="#7D3117" />
        </linearGradient>

        <radialGradient
          id={core}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(32 31) rotate(90) scale(17)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF8E9" />
          <stop offset=".34" stopColor="#FFD994" />
          <stop offset=".72" stopColor="#ED7A32" />
          <stop offset="1" stopColor="#A33B18" />
        </radialGradient>
      </defs>

      <path
        d="M17 6.5h30a7.5 7.5 0 0 1 7.5 7.5v36A7.5 7.5 0 0 1 47 57.5H17A7.5 7.5 0 0 1 9.5 50V14A7.5 7.5 0 0 1 17 6.5Z"
        fill={muted ? "#8B817A" : `url(#${card})`}
      />

      <path
        d="M18 10h28a5 5 0 0 1 5 5v34a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5Z"
        fill="#1B1010"
        fillOpacity=".88"
        stroke="#FFE2AF"
        strokeOpacity=".42"
      />

      <circle
        cx="32"
        cy="31"
        r="14.5"
        fill={muted ? "#68605B" : `url(#${core})`}
        stroke="#FFF2D5"
        strokeWidth="1.5"
        strokeOpacity=".72"
      />

      <path
        d="M37.8 23.8a9.6 9.6 0 0 0-12.9 1.5"
        stroke="#4A1D10"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      <path
        d="m23.7 21.8.6 5.7 5.3-1.4"
        stroke="#4A1D10"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M26.2 38.2a9.6 9.6 0 0 0 12.9-1.5"
        stroke="#4A1D10"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      <path
        d="m40.3 40.2-.6-5.7-5.3 1.4"
        stroke="#4A1D10"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M32 25.5c-3.5-3.8-8.3 1-5.3 4.5l5.3 5.5 5.3-5.5c3-3.5-1.8-8.3-5.3-4.5Z"
        fill="#FFF7E8"
        stroke="#7B2B14"
        strokeWidth="1.1"
      />

      <path
        d="M18 14h8M38 50h8"
        stroke="#FFF0CE"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity=".56"
      />
    </svg>
  );
}
