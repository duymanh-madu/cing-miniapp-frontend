import componentRegistry from "./componentRegistry";

import HeroBannerBlock from "./blocks/HeroBannerBlock";

function registerCmsBlocks() {

  componentRegistry.register({

    key:
      "hero-banner",

    component:
      HeroBannerBlock,

  });

}

export default
  registerCmsBlocks;