import { useMemo }
  from "react";

import useMenuStore
  from "@/features/menu/store/menuStore";

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