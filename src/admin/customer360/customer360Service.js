import apiClient from "@/infra/api/apiClient";

class Customer360Service {

  async getProfiles() {

    const response =
      await apiClient.get(
        "/admin/customer360/profiles"
      );

    return response.data;

  }

  async getProfileDetails(
    memberId
  ) {

    const response =
      await apiClient.get(

        `/admin/customer360/profiles/${memberId}`

      );

    return response.data;

  }

  async getTimeline(
    memberId
  ) {

    const response =
      await apiClient.get(

        `/admin/customer360/timeline/${memberId}`

      );

    return response.data;

  }

  async getInsights(
    memberId
  ) {

    const response =
      await apiClient.get(

        `/admin/customer360/insights/${memberId}`

      );

    return response.data;

  }

}

const customer360Service =
  new Customer360Service();

export default
  customer360Service;