import React, { useId } from "react";
import { PLAZA_TITLES_V10 } from "./plazaTitleCatalogV10.js";
import "./PlazaTitleV10.css";
const PALETTES = {
  pearl: ["#fff9e9", "#bac6c7"],
  jade: ["#e3fff2", "#52bf9c"],
  silver: ["#f4fdff", "#93b7d5"],
  gold: ["#fff6c7", "#e4ad40"],
  rose: ["#ffe6f4", "#dc77ad"],
  diamond: ["#e2f8ff", "#65bdeb"],
  violet: ["#efe2ff", "#ad86f1"],
  royal: ["#ffe7bd", "#df666d"],
};
const STAR =
  "M10 1.2 12.7 6.8 19 7.8 14.4 12.2 15.5 18.5 10 15.5 4.5 18.5 5.6 12.2 1 7.8 7.3 6.8Z";
export default function PlazaTitleV10({ titleKey, size = "overhead" }) {
  const uid = useId().replace(/:/g, ""),
    cfg = PLAZA_TITLES_V10[titleKey];
  if (!cfg) return null;
  const colors = PALETTES[cfg.tone],
    royal = titleKey.startsWith("hof_"),
    charm = ["idol", "ngoi_sao", "minh_tinh"].includes(titleKey);
  return (
    <span
      className={`plaza-title-v10 plaza-title-v10--${size} plaza-title-v10--${cfg.tone}`}
      aria-label={`${cfg.label}, ${cfg.stars} sao`}
    >
      <svg
        className="plaza-title-v10__crest"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={uid + "metal"} x1="0" y1="0" x2=".8" y2="1">
            <stop stopColor={colors[0]} />
            <stop offset=".48" stopColor={colors[1]} />
            <stop offset="1" stopColor={colors[0]} />
          </linearGradient>
        </defs>
        {cfg.stars >= 3.5 && (
          <g fill={"url(#" + uid + "metal)"} opacity=".85">
            <path d="M17 23 2 17 6 24 13 27 4 26 9 32 18 31Z" />
            <path d="M31 23 46 17 42 24 35 27 44 26 39 32 30 31Z" />
          </g>
        )}
        <path
          d="M24 4 38 12 37 30 24 42 11 30 10 12Z"
          fill="#251a32"
          stroke={"url(#" + uid + "metal)"}
          strokeWidth="1.8"
        />
        <path
          d="M24 8 34 14 33 29 24 37 15 29 14 14Z"
          fill={"url(#" + uid + "metal)"}
          opacity=".25"
        />
        {charm ? (
          <path
            d={STAR}
            transform="translate(12 12) scale(1.2)"
            fill={"url(#" + uid + "metal)"}
          />
        ) : royal || titleKey === "champion" ? (
          <path
            d="M16 29 14 18 20 23 24 15 28 23 34 18 32 29Z M17 32H31"
            fill={"url(#" + uid + "metal)"}
            stroke={colors[0]}
            strokeWidth="1.2"
          />
        ) : (
          <path
            d="M24 13 31 23 24 33 17 23Z M17 23H31 M24 13V33"
            fill={"url(#" + uid + "metal)"}
            stroke={colors[0]}
            strokeWidth=".8"
          />
        )}
        <path d="M24 1v5M21.5 3.5h5" stroke={colors[0]} strokeWidth="1.2" />
      </svg>
      <span className="plaza-title-v10__content">
        <span className="plaza-title-v10__text">{cfg.label}</span>
        {cfg.stars > 0 && (
          <span className="plaza-title-v10__stars" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => {
              const fraction = Math.max(0, Math.min(1, cfg.stars - i));
              return (
                <svg key={i} viewBox="0 0 20 20">
                  <defs>
                    <clipPath id={uid + "s" + i}>
                      <rect width={fraction * 20} height="20" />
                    </clipPath>
                  </defs>
                  <path d={STAR} fill="#60586d" opacity=".5" />
                  <path
                    d={STAR}
                    fill={colors[0]}
                    clipPath={"url(#" + uid + "s" + i + ")"}
                  />
                </svg>
              );
            })}
          </span>
        )}
      </span>
    </span>
  );
}
