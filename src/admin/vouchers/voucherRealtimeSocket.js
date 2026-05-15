import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

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
      adminRealtimeClient.connect({

        token:
          localStorage.getItem(
            "admin_access_token"
          ),

      });

    socket.on(

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