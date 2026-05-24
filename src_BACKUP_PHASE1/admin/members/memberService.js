import apiClient from "@/infra/api/apiClient";

class MemberService {

  async getMembers() {

    const response =
      await apiClient.get(
        "/admin/members"
      );

    return response.data;

  }

  async getMemberMetrics() {

    const response =
      await apiClient.get(
        "/admin/members/metrics"
      );

    return response.data;

  }

}

const memberService =
  new MemberService();

export default
  memberService;