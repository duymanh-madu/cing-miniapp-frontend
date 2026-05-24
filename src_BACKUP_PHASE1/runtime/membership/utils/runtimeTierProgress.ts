export function runtimeTierProgress(
  totalSpent: number,
  nextTarget: number
) {

  if (
    nextTarget <= 0
  ) {

    return 100;

  }

  const percent =
    (
      totalSpent /
      nextTarget
    ) * 100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        percent
      )
    )
  );

}