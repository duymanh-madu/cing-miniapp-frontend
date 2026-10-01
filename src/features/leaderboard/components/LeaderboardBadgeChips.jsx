import { TierBadge } from "@/membership/components/TierBadge";
import { injectTierBadgeStyles } from "@/membership/components/TierBadgeStyles";

injectTierBadgeStyles();

/*
 * Membership tier is the ONLY textual badge shown in leaderboard rows.
 *
 * Prefer crm_tier because this is the canonical current membership tier
 * delivered by leaderboard projection. owned_badges is fallback only.
 */
const MEMBERSHIP_ORDER = [
  "loyal_partner",
  "partner",
  "diamond",
  "gold",
  "silver",
  "loyal",
  "member",
];

const MEMBERSHIP_KEYS = new Set(MEMBERSHIP_ORDER);

const LIVE_KEYS = [
  "hof_1",
  "hof_2",
  "hof_3",
  "champion",
];

const CHARM_KEYS = [
  "minh_tinh",
  "ngoi_sao",
  "idol",
];

/*
 * These charm symbols follow the existing profile title language:
 * idol = ✨
 * ngoi_sao = ⭐
 * minh_tinh = 🌟
 *
 * They are icon-only here. No duplicate title text.
 */
const CHARM_ICON = {
  idol: "✨",
  ngoi_sao: "⭐",
  minh_tinh: "🌟",
};

const CHARM_LABEL = {
  idol: "Idol",
  ngoi_sao: "Ngôi sao",
  minh_tinh: "Minh tinh",
};

export function resolveMembershipTier(entry) {
  const crmTier = String(entry?.crm_tier || "").trim();

  if (MEMBERSHIP_KEYS.has(crmTier)) {
    return crmTier;
  }

  const owned = Array.isArray(entry?.owned_badges)
    ? entry.owned_badges
    : [];

  return (
    MEMBERSHIP_ORDER.find(key => owned.includes(key)) ||
    null
  );
}

export function LeaderboardAvatarTitleIcons({ entry }) {
  const owned = Array.isArray(entry?.owned_badges)
    ? entry.owned_badges
    : [];

  const live = LIVE_KEYS.filter(
    key => owned.includes(key)
  );

  const charms = CHARM_KEYS.filter(
    key => owned.includes(key)
  );

  if (!live.length && !charms.length) {
    return null;
  }

  return (
    <span
      className="cing-leaderboard-avatar-title-icons"
      aria-label="Danh hiệu đặc biệt"
    >
      {live.map(key => (
        <span
          className="cing-leaderboard-avatar-title-icon"
          key={key}
          title={
            key === "champion"
              ? "Kiện tướng"
              : key === "hof_1"
                ? "Vương Giả"
                : key === "hof_2"
                  ? "Phú Hào"
                  : "Địa Chủ"
          }
        >
          <TierBadge
            tierKey={
              key === "champion"
                ? "member"
                : key
            }
            isChampion={key === "champion"}
            size="sm"
            showLabel={false}
          />
        </span>
      ))}

      {charms.map(key => (
        <span
          className={`cing-leaderboard-avatar-title-icon cing-leaderboard-avatar-title-icon--${key}`}
          key={key}
          title={CHARM_LABEL[key]}
          aria-label={CHARM_LABEL[key]}
        >
          <span aria-hidden="true">
            {CHARM_ICON[key]}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function LeaderboardBadgeChips({
  entry,
  align = "center",
}) {
  const tierKey = resolveMembershipTier(entry);

  if (!tierKey) {
    return null;
  }

  return (
    <span
      className="cing-leaderboard-membership-tier"
      data-align={align}
      aria-label="Hạng thành viên"
    >
      <span className="cing-leaderboard-membership-tier__scale">
        <TierBadge
          tierKey={tierKey}
          size="sm"
          showLabel={true}
        />
      </span>
    </span>
  );
}
