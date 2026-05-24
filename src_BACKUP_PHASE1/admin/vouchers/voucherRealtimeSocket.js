import {
  registerSocketListener,
} from "@/runtime/socket/runtimeSocketClient";


import useVoucherStore from "./voucherStore";

class VoucherRealtimeSocket {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    const socket =

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    registerSocketListener(

      "admin:voucher:update",

      (
        payload
      ) => {

        useVoucherStore
          .getState()
          .setVoucherMetrics(
            payload
          );

      }

    );

    this.initialized =
      true;

  }

}

const voucherRealtimeSocket =
  new VoucherRealtimeSocket();

export default
  voucherRealtimeSocket;