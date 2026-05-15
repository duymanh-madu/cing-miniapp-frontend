import {
  useEffect,
} from "react";

import DynamicRenderer from "../dynamicRenderer";

import registerCmsBlocks from "../registerCmsBlocks";

import cmsBootstrap from "../cmsBootstrap";

import useCmsStore from "../cmsStore";

function CMSPage() {

  const pages =
    useCmsStore(
      (
        state
      ) => state.pages
    );

  useEffect(() => {

    registerCmsBlocks();

    cmsBootstrap.bootstrap();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      {

        pages.map(
          (
            page
          ) => (

            <DynamicRenderer

              key={
                page.id
              }

              blocks={
                page.blocks
              }

            />

          )
        )

      }

    </div>

  );

}

export default
  CMSPage;