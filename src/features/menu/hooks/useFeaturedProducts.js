import { useMemo } from "react";
import useMenu from "./useMenu";

// 4 san pham Best Seller chinh xac theo ten
const BEST_SELLER_NAMES = [
  "sua tuoi nuong tcdd l",
  "tra chanh vang gia tay",
  "hong thanh",
  "kem trung nuong tcdd l",
];

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/d/g,"d")
    .trim();
}

function useFeaturedProducts() {
  const { data = [] } = useMenu();
  return useMemo(() => {
    if (!data.length) return [];

    // Tim san pham theo ten normalize
    const result = [];
    for (const targetName of BEST_SELLER_NAMES) {
      const normalTarget = normalize(targetName);
      const found = data.find(p => normalize(p.name).includes(normalTarget));
      if (found) result.push(found);
    }

    // Neu tim duoc it nhat 1 san pham, tra ve ket qua
    if (result.length > 0) return result;

    // Fallback: lay 4 san pham dau co gia cao nhat
    return [...data].sort((a,b) => (b.price||0)-(a.price||0)).slice(0,4);
  }, [data]);
}

export default useFeaturedProducts;
