import apiClient from "@/services/api/apiClient";

class CampaignSchedulerService {

  async getSchedules() {

    const response =
      await apiClient.get(
        "/admin/campaign-schedules"
      );

    return response.data;

  }

  async createSchedule(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/campaign-schedules",
        payload
      );

    return response.data;

  }

}

const campaignSchedulerService =
  new CampaignSchedulerService();

export default
  campaignSchedulerService;