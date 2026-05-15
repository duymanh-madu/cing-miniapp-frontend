import {
  useEffect,
  useState,
} from "react";

import cmsHomepageRuntime from "@/cms/runtime/cmsHomepageRuntime";

function useCmsHomepage() {

  const [
    page,
    setPage,
  ] = useState(null);

  useEffect(() => {

    async function load() {

      const response =
        await cmsHomepageRuntime
          .loadHomepage();

      setPage(
        response
      );

    }

    load();

  }, []);

  return page;

}

export default
  useCmsHomepage;