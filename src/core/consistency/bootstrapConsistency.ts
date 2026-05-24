import { eventBus } from "../event-bus/eventBus";
import { consistencyLayer } from "./consistencyLayer";

export function bootstrapConsistencyLayer() {

  eventBus.on("ORDER_PAID", async (payload) => {
    await consistencyLayer.onOrderPaid(payload);
  });

}
