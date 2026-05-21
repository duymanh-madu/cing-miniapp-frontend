export function calculateTierProgress(
  totalSpent: number
) {

  /**
   * ===================================================
   * TODO:
   * Replace by admin-configurable
   * tier governance config
   * ===================================================
   */

  if (totalSpent >= 10000000) {

    return 100;

  }

  return Math.floor(
    (
      totalSpent /
      10000000
    ) * 100
  );

}