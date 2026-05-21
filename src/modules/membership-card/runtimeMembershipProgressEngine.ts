export function calculateMembershipProgress(
  totalSpent:
    number,
  target:
    number,
) {

  if (
    target <= 0
  ) {

    return 100;

  }

  return Math.min(
    100,
    Math.floor(
      (
        totalSpent /
        target
      ) * 100
    )
  );

}