import {
  useOperationsStore,
} from "../stores/operationsStore";

export function connectOperationsRealtime({
  socket,
}) {

  socket.on(
    "ops.live_order",
    (payload) => {

      useOperationsStore
        .getState()
        .addLiveOrder(payload);

    }
  );

  socket.on(
    "ops.kitchen_queue",
    (payload) => {

      useOperationsStore
        .getState()
        .updateKitchenQueue(payload);

    }
  );

  socket.on(
    "ops.delivery_queue",
    (payload) => {

      useOperationsStore
        .getState()
        .updateDeliveryQueue(payload);

    }
  );

  socket.on(
    "ops.alert",
    (payload) => {

      useOperationsStore
        .getState()
        .pushAlert(payload);

    }
  );

}