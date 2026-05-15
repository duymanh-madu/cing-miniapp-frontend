import { useMemo } from "react";

import { useShallow } from "zustand/react/shallow";

import useMenuStore from "@/stores/menuStore";

function useMenuFilters() {
  const state =
    useMenuStore(
      useShallow(
        (store) => ({
          selectedCategory:
            store.selectedCategory,

          searchKeyword:
            store.searchKeyword,

          sortBy:
            store.sortBy,

          viewMode:
            store.viewMode,

          setSelectedCategory:
            store.setSelectedCategory,

          setSearchKeyword:
            store.setSearchKeyword,

          setSortBy:
            store.setSortBy,

          setViewMode:
            store.setViewMode,

          resetFilters:
            store.resetFilters,
        })
      )
    );

  return useMemo(
    () => state,
    [state]
  );
}

export default useMenuFilters;