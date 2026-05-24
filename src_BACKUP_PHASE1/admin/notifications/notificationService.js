import apiClient from "@/infra/api/apiClient";

class NotificationService {

  async getNotifications() {

    const response =
      await apiClient.get(
        "/admin/notifications"
      );

    return response.data;

  }

  async getDeliveryMetrics() {

    const response =
      await apiClient.get(
        "/admin/notifications/metrics"
      );

    return response.data;

  }

  async createNotification(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/notifications",
        payload
      );

    return response.data;

  }

  async sendNotification(
    notificationId
  ) {

    const response =
      await apiClient.post(

        `/admin/notifications/${notificationId}/send`

      );

    return response.data;

  }

}

const notificationService =
  new NotificationService();

export default
  notificationService;