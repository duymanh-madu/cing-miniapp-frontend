import {
  useCustomerUXStore,
} from "../stores/customerUXStore";

export function connectCustomerRealtime({
  socket,
}) {

  socket.on(
    "customer.reward",
    (payload) => {

      useCustomerUXStore
        .getState()
        .pushReward(payload);

    }
  );

  socket.on(
    "customer.order",
    (payload) => {

      useCustomerUXStore
        .getState()
        .pushOrder(payload);

    }
  );

  socket.on(
    "connect_error",
    () => {

      useCustomerUXStore
        .getState()
        .setReconnecting(true);

    }
  );

  socket.on(
    "connect",
    () => {

      useCustomerUXStore
        .getState()
        .setReconnecting(false);

    }
  );

}