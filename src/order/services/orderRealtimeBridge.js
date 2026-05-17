import {
  useOrderExperienceStore,
} from "../stores/orderExperienceStore";

export function connectOrderRealtime({
  socket,
}) {

  socket.on(
    "order.active",
    (payload) => {

      useOrderExperienceStore
        .getState()
        .setActiveOrder(
          payload
        );

    }
  );

  socket.on(
    "order.history",
    (payload) => {

      useOrderExperienceStore
        .getState()
        .setOrderHistory(
          payload
        );

    }
  );

  socket.on(
    "order.payment_pending",
    (payload) => {

      useOrderExperienceStore
        .getState()
        .setPaymentPending(
          payload.pending
        );

    }
  );

}