import apiClient from "../../../services/api/apiClient";

class AdminAuthService {

  async getSession() {

    const response =
      await apiClient.get(
        "/admin/session"
      );

    return response.data;

  }

  async login(payload) {

    const response =
      await apiClient.post(
        "/admin/login",
        payload
      );

    return response.data;

  }

}

const adminAuthService =
  new AdminAuthService();

export default
  adminAuthService;