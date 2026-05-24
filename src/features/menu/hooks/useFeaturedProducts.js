import { useMemo } from "react";
import useMenu from "./useMenu";

function useFeaturedProducts() {
  const { data = [], isLoading } = useMenu();
  return useMemo(() => {
    if (!data.length) return [];
    const featured = data.filter(p => p.featured);
    // Neu iPOS khong tra featured flag, lay 4 san pham dau co gia cao nhat
    return featured.length > 0 ? featured.slice(0,4) : [...data].sort((a,b) => (b.price||0)-(a.price||0)).slice(0,4);
  }, [data]);
}

export default useFeaturedProducts;
