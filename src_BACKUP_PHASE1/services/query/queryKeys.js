/**
 * =========================================================
 * QUERY KEYS
 * =========================================================
 */

const queryKeys = {
  menu: {
    all: ["menu"],

    list: () => [
      ...queryKeys.menu.all,
      "list",
    ],
  },

  campaign: {
    all: ["campaign"],

    feed: () => [
      ...queryKeys.campaign.all,
      "feed",
    ],
  },

  voucher: {
    all: ["voucher"],

    member: () => [
      ...queryKeys.voucher.all,
      "member",
    ],
  },

  member: {
    all: ["member"],

    profile: () => [
      ...queryKeys.member.all,
      "profile",
    ],
  },
};

export default queryKeys;