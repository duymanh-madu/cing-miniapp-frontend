import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerVoucherRuntime {

  issueVoucher(
    voucher
  ) {

    const state =
      realtimeCustomerStore
        .getState();

    state.setVouchers([
      ...state.vouchers,
      voucher,
    ]);

  }

}

const customerVoucherRuntime =
  new CustomerVoucherRuntime();

export default
  customerVoucherRuntime;