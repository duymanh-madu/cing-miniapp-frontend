import {
  useMemo,
} from "react";

import useMenu from "./useMenu";

/**
 * =========================================================
 * USE FEATURED PRODUCTS
 * =========================================================
 */

function useFeaturedProducts() {

  const {
    data = [],
  } = useMenu();

  return useMemo(() => {

    return data.filter(
      (
        product
      ) => product.featured
    );

  }, [data]);

}

export default
  useFeaturedProducts;