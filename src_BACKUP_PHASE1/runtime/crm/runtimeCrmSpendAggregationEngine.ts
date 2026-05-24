export function calculateLoyaltyPoints(
  totalSpent: number
) {

  /**
   * ===================================================
   * 10% spending
   * 1 point = 1000 VND
   * ===================================================
   */

  return Math.floor(

    (
      totalSpent * 0.1
    ) / 1000

  );

}