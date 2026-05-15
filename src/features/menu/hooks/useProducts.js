import { useMemo }
  from "react";

import useMenuStore
  from "@/stores/menuStore";

import {
  selectProducts,
}
from "../selectors/menuSelectors";

function useProducts() {

  const state =
    useMenuStore();

  return useMemo(
    () =>

      selectProducts(
        state
      ),

    [state]
  );

}

export default
  useProducts;