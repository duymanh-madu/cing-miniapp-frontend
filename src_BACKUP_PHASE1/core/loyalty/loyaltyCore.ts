class LoyaltyCore {

  points(amount: number) {
    return Math.floor(amount * 0.1);
  }

  tier(spend: number) {
    if (spend >= 10000000) return "DIAMOND";
    if (spend >= 5000000) return "GOLD";
    if (spend >= 3000000) return "SILVER";
    return "MEMBER";
  }

}

export const loyaltyCore = new LoyaltyCore();
