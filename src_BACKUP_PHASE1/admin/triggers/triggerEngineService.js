import apiClient from "@/infra/api/apiClient";

class TriggerEngineService {

  async triggerVoucher(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/triggers/voucher",
        payload
      );

    return response.data;

  }

  async triggerNotification(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/triggers/notification",
        payload
      );

    return response.data;

  }

  async triggerLoyalty(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/triggers/loyalty",
        payload
      );

    return response.data;

  }

}

const triggerEngineService =
  new TriggerEngineService();

export default
  triggerEngineService;