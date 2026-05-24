import apiClient from "@/infra/api/apiClient";

class TenantService {

  async getTenants() {

    const response =
      await apiClient.get(
        "/admin/tenants"
      );

    return response.data;

  }

  async getRoleHierarchy() {

    const response =
      await apiClient.get(
        "/admin/tenants/roles"
      );

    return response.data;

  }

  async getDistributedConfig() {

    const response =
      await apiClient.get(
        "/admin/tenants/config"
      );

    return response.data;

  }

}

const tenantService =
  new TenantService();

export default
  tenantService;