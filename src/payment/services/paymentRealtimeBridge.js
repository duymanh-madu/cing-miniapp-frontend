import {
  usePaymentStore,
} from "../store/paymentStore";

export function connectPaymentRealtime({
  socket,
}) {

  socket.on(
    "payment.updated",
    (payload) => {

      usePaymentStore
        .getState()
        .setPaymentStatus(
          payload.status
        );

    }
  );

}