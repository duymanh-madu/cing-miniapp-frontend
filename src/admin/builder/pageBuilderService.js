import apiClient from "@/services/api/apiClient";

class PageBuilderService {

  async getPages() {

    const response =
      await apiClient.get(
        "/admin/builder/pages"
      );

    return response.data;

  }

  async getPageGraph(
    pageId
  ) {

    const response =
      await apiClient.get(

        `/admin/builder/pages/${pageId}/graph`

      );

    return response.data;

  }

  async savePageGraph(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/builder/pages/graph",
        payload
      );

    return response.data;

  }

  async deployPage(
    pageId
  ) {

    const response =
      await apiClient.post(

        `/admin/builder/pages/${pageId}/deploy`

      );

    return response.data;

  }

}

const pageBuilderService =
  new PageBuilderService();

export default
  pageBuilderService;