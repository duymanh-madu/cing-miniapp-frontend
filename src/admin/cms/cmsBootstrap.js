import cmsService from "./cmsService";

import useCmsStore from "./cmsStore";

class CmsBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useCmsStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const pages =
        await cmsService
          .getPages();

      store.setPages(
        pages
      );

    } finally {

      store.setLoading(
        false
      );

      this.initialized =
        true;

    }

  }

}

const cmsBootstrap =
  new CmsBootstrap();

export default
  cmsBootstrap;