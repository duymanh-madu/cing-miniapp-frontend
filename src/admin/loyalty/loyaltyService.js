import apiClient from "@/services/api/apiClient";

class LoyaltyService {

  async getRewards() {

    const response =
      await apiClient.get(
        "/admin/loyalty/rewards"
      );

    return response.data;

  }

  async getPointRules() {

    const response =
      await apiClient.get(
        "/admin/loyalty/rules"
      );

    return response.data;

  }

  async createReward(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/loyalty/rewards",
        payload
      );

    return response.data;

  }

  async createPointRule(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/loyalty/rules",
        payload
      );

    return response.data;

  }

}

const loyaltyService =
  new LoyaltyService();

export default
  loyaltyService;