import { useEffect }
  from "react";

import useMenuStore
  from "@/stores/menuStore";

function useMenuBootstrap() {

  const initialized =
    useMenuStore(
      (state) =>
        state.initialized
    );

  const loading =
    useMenuStore(
      (state) =>
        state.loading
    );

  const loadProducts =
    useMenuStore(
      (state) =>
        state.loadProducts
    );

  useEffect(() => {

    if (
      initialized ||
      loading
    ) {

      return;

    }

    loadProducts();

  }, [

    initialized,
    loading,
    loadProducts,

  ]);

}

export default
  useMenuBootstrap;