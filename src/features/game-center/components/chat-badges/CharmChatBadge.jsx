import React from "react";
import "./CharmChatBadge.css";

const CHARM_CHAT_BADGES = {
  idol: {
    label: "Idol",
    shortLabel: "Idol",
    level: 1,
    requirement: 5000,
    className: "charm-chat-badge--idol",
    icon: "✦",
    wing: false,
    crown: false,
    gems: 1,
  },
  ngoi_sao: {
    label: "Ngôi Sao",
    shortLabel: "Ngôi Sao",
    level: 2,
    requirement: 10000,
    className: "charm-chat-badge--ngoi-sao",
    icon: "★",
    wing: true,
    crown: false,
    gems: 3,
  },
  minh_tinh: {
    label: "Minh Tinh",
    shortLabel: "Minh Tinh",
    level: 3,
    requirement: 20000,
    className: "charm-chat-badge--minh-tinh",
    icon: "◆",
    wing: true,
    crown: true,
    gems: 5,
  },
};

export function getHighestCharmBadge(customBadges = []) {
  const badges = Array.isArray(customBadges) ? customBadges : [];

  if (badges.includes("minh_tinh")) return "minh_tinh";
  if (badges.includes("ngoi_sao")) return "ngoi_sao";
  if (badges.includes("idol")) return "idol";

  return null;
}

export default function CharmChatBadge({
  badgeKey,
  compact = true,
  showRequirement = false,
}) {
  const cfg = CHARM_CHAT_BADGES[badgeKey];

  if (!cfg) return null;

  return (
    <span
      className={[
        "charm-chat-badge",
        cfg.className,
        compact ? "charm-chat-badge--compact" : "",
      ].filter(Boolean).join(" ")}
      title={`${cfg.label} · ${cfg.requirement.toLocaleString("vi-VN")} điểm quyến rũ`}
    >
      {cfg.wing && <span className="charm-chat-badge__wing charm-chat-badge__wing--left" />}

      <span className="charm-chat-badge__body">
        {cfg.crown && <span className="charm-chat-badge__crown">♛</span>}

        <span className="charm-chat-badge__orb">
          <span className="charm-chat-badge__orb-core">{cfg.icon}</span>
        </span>

        <span className="charm-chat-badge__text">
          <span className="charm-chat-badge__label">
            {compact ? cfg.shortLabel : cfg.label}
          </span>

          {!compact && (
            <span className="charm-chat-badge__sub">
              {cfg.requirement.toLocaleString("vi-VN")} charm
            </span>
          )}
        </span>

        <span className="charm-chat-badge__shine" />

        {Array.from({ length: cfg.gems }).map((_, i) => (
          <span
            key={i}
            className={`charm-chat-badge__spark charm-chat-badge__spark--${i + 1}`}
          />
        ))}
      </span>

      {cfg.wing && <span className="charm-chat-badge__wing charm-chat-badge__wing--right" />}

      {showRequirement && (
        <span className="charm-chat-badge__requirement">
          {cfg.requirement.toLocaleString("vi-VN")}
        </span>
      )}
    </span>
  );
}
