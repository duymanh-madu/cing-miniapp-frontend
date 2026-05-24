import { create } from "zustand";

const initialState = {
  selectedCategory:
    "all",

  searchKeyword:
    "",
};

const useMenuStore =
  create((set) => ({
    ...initialState,

    setCategory:
      (category) =>
        set({
          selectedCategory:
            category ||
            "all",
        }),

    setSearchKeyword:
      (keyword) =>
        set({
          searchKeyword:
            keyword || "",
        }),

    resetMenuStore:
      () =>
        set({
          ...initialState,
        }),
  }));

export default
  useMenuStore;