import { BusinessEventPayload } from "../contracts/businessEvents";

class OrderCoreService {

  private orders = new Map<string, any>();

  createOrder(payload: BusinessEventPayload) {

    const order = payload.data;

    if (this.orders.has(order.id)) {
      return this.orders.get(order.id);
    }

    const newOrder = {
      ...order,
      status: "CREATED",
      createdAt: Date.now(),
    };

    this.orders.set(order.id, newOrder);

    return newOrder;
  }

  markPaid(orderId: string) {
    const order = this.orders.get(orderId);

    if (!order) return null;

    order.status = "PAID";
    order.paidAt = Date.now();

    this.orders.set(orderId, order);

    return order;
  }

}

export const orderCoreService = new OrderCoreService();
