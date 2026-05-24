import pageBuilderService from "./pageBuilderService";

import usePageBuilderStore from "./pageBuilderStore";

class PageBuilderBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      usePageBuilderStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const pages =
        await pageBuilderService
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

const pageBuilderBootstrap =
  new PageBuilderBootstrap();

export default
  pageBuilderBootstrap;