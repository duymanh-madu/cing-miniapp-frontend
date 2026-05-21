import apiClient from "../../../infra/api/apiClient";

class CmsEngine {

  async getPages() {

    const response =
      await apiClient.get(
        "/admin/cms/pages"
      );

    return response.data;

  }

  async updatePage(
    pageId,
    payload
  ) {

    const response =
      await apiClient.put(
        `/admin/cms/pages/${pageId}`,
        payload
      );

    return response.data;

  }

}

const cmsEngine =
  new CmsEngine();

export default
  cmsEngine;