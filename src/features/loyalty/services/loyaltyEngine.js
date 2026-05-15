import loyaltyStore from "@/features/loyalty/store/loyaltyStore";

class LoyaltyEngine {

  update(points) {

    loyaltyStore
      .getState()
      .setPoints(points);

  }

  addPoints(value) {

    const current =
      loyaltyStore
        .getState()
        .points;

    loyaltyStore
      .getState()
      .setPoints(
        current + value
      );

  }

}

const loyaltyEngine =
  new LoyaltyEngine();

export default
  loyaltyEngine;