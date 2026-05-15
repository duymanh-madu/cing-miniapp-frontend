import axios from "axios";

const API_BASE_URL =
  import.meta.env
    .VITE_API_BASE_URL;

class CmsPageApi {

  async fetchPage(
    slug
  ) {

    try {

      const response =
        await axios.get(

          `${API_BASE_URL}/cms/pages/${slug}`

        );

      return response.data;

    } catch (error) {

      console.error(
        "fetch page failed",
        error
      );

      return null;

    }

  }

}

const cmsPageApi =
  new CmsPageApi();

export default
  cmsPageApi;