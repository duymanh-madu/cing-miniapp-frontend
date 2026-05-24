import { useMemo } from "react";
import useMenu from "./useMenu";
import useMenuStore from "@/features/menu/store/menuStore";

function useMenuCategories() {
  const { data = [] } = useMenu();
  const setCategory = useMenuStore((s) => s.setCategory);
  const selectedCategory = useMenuStore((s) => s.selectedCategory);

  const categories = useMemo(() => {
    const cats = new Set();
    data.forEach((p) => { if (p.category) cats.add(p.category); });
    return ["all", ...cats];
  }, [data]);

  return { categories, selectedCategory, setCategory };
}

export default useMenuCategories;
