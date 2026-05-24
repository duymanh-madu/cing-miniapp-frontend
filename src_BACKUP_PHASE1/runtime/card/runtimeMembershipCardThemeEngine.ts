export const MEMBERSHIP_THEME_MAP = {

  hoi_vien: {

    background:
      "linear-gradient(135deg,#1f2937 0%,#111827 100%)",

    accent:
      "#9ca3af",

    text:
      "#ffffff",

    glow:
      "rgba(255,255,255,0.08)",

    metallic:
      "rgba(255,255,255,0.04)",

  },

  hoi_vien_than_thiet: {

    background:
      "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)",

    accent:
      "#93c5fd",

    text:
      "#ffffff",

    glow:
      "rgba(147,197,253,0.22)",

    metallic:
      "rgba(255,255,255,0.06)",

  },

  hoi_vien_bac: {

    background:
      "linear-gradient(135deg,#5b6575 0%,#cbd5e1 100%)",

    accent:
      "#f8fafc",

    text:
      "#ffffff",

    glow:
      "rgba(255,255,255,0.28)",

    metallic:
      "rgba(255,255,255,0.12)",

  },

  hoi_vien_vang: {

    background:
      "linear-gradient(135deg,#fde047 0%,#f59e0b 100%)",

    accent:
      "#fff7cc",

    text:
      "#ffffff",

    glow:
      "rgba(255,215,0,0.30)",

    metallic:
      "rgba(255,255,255,0.12)",

  },

  hoi_vien_kim_cuong: {

    background:
      "linear-gradient(135deg,#38bdf8 0%,#a855f7 100%)",

    accent:
      "#e0f2fe",

    text:
      "#ffffff",

    glow:
      "rgba(255,255,255,0.22)",

    metallic:
      "rgba(255,255,255,0.16)",

  },

  doi_tac: {

    background:
      "linear-gradient(135deg,#14532d 0%,#15803d 100%)",

    accent:
      "#bbf7d0",

    text:
      "#ffffff",

    glow:
      "rgba(34,197,94,0.22)",

    metallic:
      "rgba(255,255,255,0.08)",

  },

  doi_tac_than_thiet: {

    background:
      "linear-gradient(135deg,#4c1d95 0%,#7e22ce 100%)",

    accent:
      "#f3e8ff",

    text:
      "#ffffff",

    glow:
      "rgba(192,132,252,0.25)",

    metallic:
      "rgba(255,255,255,0.12)",

  },

};

export function resolveMembershipCardTheme(
  tier: string,
) {

  return (
    MEMBERSHIP_THEME_MAP[
      tier as keyof typeof MEMBERSHIP_THEME_MAP
    ] ||
    MEMBERSHIP_THEME_MAP.hoi_vien
  );

}