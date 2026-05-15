import cmsPageRuntime from "./cmsPageRuntime";

class CmsHomepageRuntime {

  async loadHomepage() {

    return cmsPageRuntime
      .loadPage(
        "homepage"
      );

  }

}

const cmsHomepageRuntime =
  new CmsHomepageRuntime();

export default
  cmsHomepageRuntime;