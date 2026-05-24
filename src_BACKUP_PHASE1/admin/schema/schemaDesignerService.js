import apiClient from "@/infra/api/apiClient";

class SchemaDesignerService {

  async getSchemas() {

    const response =
      await apiClient.get(
        "/admin/schema"
      );

    return response.data;

  }

  async saveSchema(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/schema",
        payload
      );

    return response.data;

  }

}

const schemaDesignerService =
  new SchemaDesignerService();

export default
  schemaDesignerService;