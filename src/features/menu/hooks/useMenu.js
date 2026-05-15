import {
  useQuery,
} from "@tanstack/react-query";

import queryKeys from "@/services/query/queryKeys";

import {
  fetchProducts,
} from "@/services/product/productService";

/**
 * =========================================================
 * USE MENU
 * =========================================================
 */

function useMenu() {

  return useQuery({

    queryKey:
      queryKeys.menu.list(),

    queryFn:
      fetchProducts,

  });

}

export default
  useMenu;