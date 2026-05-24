import voucherService from "./voucherService";

import useVoucherStore from "./voucherStore";

class VoucherBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useVoucherStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const vouchers =
        await voucherService
          .getVouchers();

      store.setVouchers(
        vouchers
      );

    } finally {

      store.setLoading(
        false
      );

      this.initialized =
        true;

    }

  }

}

const voucherBootstrap =
  new VoucherBootstrap();

export default
  voucherBootstrap;