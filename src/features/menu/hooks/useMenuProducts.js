import { useMemo } from "react";
import useMenu from "./useMenu";
import useMenuStore from "@/features/menu/store/menuStore";

export function useMenuProducts() {
  const { data = [], isLoading, error } = useMenu();
  const selectedCategory = useMenuStore(s => s.selectedCategory);

  const products = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return data;

    return data.filter(p => {
      const cat = p.category === "THQ" ? "Special" : p.category;
      return cat === selectedCategory;
    });
  }, [data, selectedCategory]);

  return { data: products, isLoading, error };
}

export default useMenuProducts;
