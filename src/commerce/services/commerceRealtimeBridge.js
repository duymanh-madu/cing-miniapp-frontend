import {
  useCommerceUXStore,
} from "../stores/commerceUXStore";

export function connectCommerceRealtime({
  socket,
}) {

  socket.on(
    "commerce.timeline",
    (payload) => {

      useCommerceUXStore
        .getState()
        .updateTimeline(payload);

    }
  );

  socket.on(
    "commerce.loyalty",
    (payload) => {

      useCommerceUXStore
        .getState()
        .updateLoyalty(
          payload.progress
        );

    }
  );

  socket.on(
    "commerce.vouchers",
    (payload) => {

      useCommerceUXStore
        .getState()
        .updateVouchers(
          payload
        );

    }
  );

}