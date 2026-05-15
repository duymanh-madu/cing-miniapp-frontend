import apiClient from "@/services/api/apiClient";

class VoucherService {

  async getVouchers() {

    const response =
      await apiClient.get(
        "/admin/vouchers"
      );

    return response.data;

  }

  async createVoucher(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/vouchers",
        payload
      );

    return response.data;

  }

}

const voucherService =
  new VoucherService();

export default
  voucherService;