import apiClient from "@/services/api/apiClient";

class OrderService {

  async getRealtimeOrders() {

    const response =
      await apiClient.get(
        "/admin/orders/realtime"
      );

    return response.data;

  }

  async getOrderMetrics() {

    const response =
      await apiClient.get(
        "/admin/orders/metrics"
      );

    return response.data;

  }

  async getOrderDetails(
    orderId
  ) {

    const response =
      await apiClient.get(

        `/admin/orders/${orderId}`

      );

    return response.data;

  }

  async updateOrderStatus({

    orderId,

    status,

  }) {

    const response =
      await apiClient.patch(

        `/admin/orders/${orderId}/status`,

        {
          status,
        }

      );

    return response.data;

  }

}

const orderService =
  new OrderService();

export default
  orderService;