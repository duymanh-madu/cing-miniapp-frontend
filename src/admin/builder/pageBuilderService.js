import apiClient from "@/infra/api/apiClient";

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

        `/admin/build../features/${pageId}/graph`

      );

    return response.data;

  }

  async savePageGraph(
    payload
  ) {

    const response =
      await apiClient.post(
        "/admin/build../features/graph",
        payload
      );

    return response.data;

  }

  async deployPage(
    pageId
  ) {

    const response =
      await apiClient.post(

        `/admin/build../features/${pageId}/deploy`

      );

    return response.data;

  }

}

const pageBuilderService =
  new PageBuilderService();

export default
  pageBuilderService;