class LoyaltyEngine {

  calculatePoints(amount: number) {
    return Math.floor(amount * 0.1);
  }

  calculateTier(totalSpend: number) {

    if (totalSpend >= 10000000) return "DIAMOND";
    if (totalSpend >= 5000000) return "GOLD";
    if (totalSpend >= 3000000) return "SILVER";
    if (totalSpend >= 1000000) return "LOYAL";
    return "MEMBER";
  }

}

export const loyaltyEngine = new LoyaltyEngine();
