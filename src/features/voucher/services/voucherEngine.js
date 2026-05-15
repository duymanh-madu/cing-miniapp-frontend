import voucherApi from "@/features/voucher/services/voucherApi";

import voucherStore from "@/features/voucher/store/voucherStore";

class VoucherEngine {

  initialized = false;

  async bootstrap(userId) {

    if (
      this.initialized ||
      !userId
    ) {

      return;

    }

    const vouchers =
      await voucherApi.getMemberVouchers(
        userId
      );

    voucherStore
      .getState()
      .setVouchers(
        vouchers
      );

    this.initialized = true;

  }

  async refresh(userId) {

    if (!userId) {

      return;

    }

    const vouchers =
      await voucherApi.getMemberVouchers(
        userId
      );

    voucherStore
      .getState()
      .setVouchers(
        vouchers
      );

  }

}

const voucherEngine =
  new VoucherEngine();

export default
  voucherEngine;