import apiClient from "@/infra/api/apiClient";

class CmsService {

  async getPages() {

    const response =
      await apiClient.get(
        "/admin/cms/pages"
      );

    return response.data;

  }

  async updatePage({

    pageId,

    payload,

  }) {

    const response =
      await apiClient.put(

        `/admin/c../features/${pageId}`,

        payload

      );

    return response.data;

  }

}

const cmsService =
  new CmsService();

export default
  cmsService;