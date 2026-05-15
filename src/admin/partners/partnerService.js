import apiClient
  from "@/services/api/apiClient";

class PartnerService {

  async getPartners() {

    const response =
      await apiClient.get(
        "/admin/partners"
      );

    return response.data;

  }

  async getPartnerMetrics() {

    const response =
      await apiClient.get(
        "/admin/partners/metrics"
      );

    return response.data;

  }

}

const partnerService =
  new PartnerService();

export default
  partnerService;