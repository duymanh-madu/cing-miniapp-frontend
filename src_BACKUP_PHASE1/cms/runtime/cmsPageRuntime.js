import cmsPageApi from "@/cms/services/cmsPageApi";

class CmsPageRuntime {

  pages =
    new Map();

  async loadPage(
    slug
  ) {

    try {

      if (
        this.pages.has(slug)
      ) {

        return this.pages.get(
          slug
        );

      }

      const page =
        await cmsPageApi
          .fetchPage(
            slug
          );

      this.pages.set(
        slug,
        page
      );

      return page;

    } catch (error) {

      console.error(
        "load page failed",
        error
      );

      return null;

    }

  }

}

const cmsPageRuntime =
  new CmsPageRuntime();

export default
  cmsPageRuntime;