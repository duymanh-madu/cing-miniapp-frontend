class CampaignEngine {

  validate(orderAmount: number, minSpend: number) {
    return orderAmount >= minSpend;
  }

  applyDiscount(amount: number, percent: number) {
    return amount - (amount * percent / 100);
  }

}

export const campaignEngine = new CampaignEngine();
