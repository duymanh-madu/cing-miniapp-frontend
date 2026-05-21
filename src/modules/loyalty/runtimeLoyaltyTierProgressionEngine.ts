export function resolveNextTier(
  currentTier: string
) {

  const tiers = [

    "Hội viên",

    "Hội viên thân thiết",

    "Hội viên bạc",

    "Hội viên vàng",

    "Hội viên kim cương",

  ];

  const currentIndex =
    tiers.indexOf(
      currentTier
    );

  return tiers[
    currentIndex + 1
  ] || null;

}