import { useMemo } from "react";
import useMenu from "./useMenu";
import useMenuStore from "@/features/menu/store/menuStore";

function useMenuCategories() {
  const { data = [] } = useMenu();
  const setCategory = useMenuStore(s => s.setCategory);
  const selectedCategory = useMenuStore(s => s.selectedCategory);

  const categories = useMemo(() => {
    const cats = new Set();
    data.forEach(p => {
      if (p.category) {
        /* Chuyen THQ/Special -> Trà hoa quả, giữ DUK là Special */
        const cat = (p.category === "THQ" || p.category === "Special") ? "Trà hoa quả" : p.category;
        cats.add(cat);
      }
    });
    return ["all", ...cats];
  }, [data]);

  return { categories, selectedCategory, setCategory };
}

export default useMenuCategories;
