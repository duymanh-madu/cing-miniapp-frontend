export const TIER_THRESHOLDS = {

  hoi_vien: {
    min: 0,
    max: 1000000,
    next:
      "Hội viên thân thiết",
  },

  hoi_vien_than_thiet: {
    min: 1000000,
    max: 3000000,
    next:
      "Hội viên bạc",
  },

  hoi_vien_bac: {
    min: 3000000,
    max: 5000000,
    next:
      "Hội viên vàng",
  },

  hoi_vien_vang: {
    min: 5000000,
    max: 10000000,
    next:
      "Hội viên kim cương",
  },

  hoi_vien_kim_cuong: {
    min: 10000000,
    max: null,
    next:
      null,
  },

};

export function calculateMembershipTierProgress({

  tier,

  totalSpent,

}: {

  tier: string;

  totalSpent: number;

}) {

  const config =
    TIER_THRESHOLDS[
      tier as keyof typeof TIER_THRESHOLDS
    ];

  if (!config) {

    return {

      progress: 0,

      nextTier:
        null,

      remaining:
        0,

      label:
        "",

    };

  }

  if (
    config.max === null
  ) {

    return {

      progress: 100,

      nextTier:
        null,

      remaining:
        0,

      label:
        "Hạng cao nhất",

    };

  }

  const currentRange =
    config.max -
    config.min;

  const currentValue =
    totalSpent -
    config.min;

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        (currentValue / currentRange) * 100,
      ),
    );

  const remaining =
    Math.max(
      0,
      config.max - totalSpent,
    );

  return {

    progress,

    nextTier:
      config.next,

    remaining,

    label:
      `Còn ${remaining.toLocaleString(
        "vi-VN",
      )}đ để lên ${config.next}`,

  };

}