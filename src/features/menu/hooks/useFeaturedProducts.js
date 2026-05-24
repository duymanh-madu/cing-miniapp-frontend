import { useMemo } from "react";
import useMenu from "./useMenu";

const BEST_SELLERS = [
  "sua tuoi nuong tcdd m",
  "tra chanh vang gia tay",
  "hong thanh",
  "kem trung nuong tcdd m",
];

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .trim();
}

function matchProduct(product, target) {
  const name = normalize(product.name);
  const t = normalize(target);
  // Phai match chinh xac - tranh nham "yen mach kem trung" vs "kem trung"
  if (t === "kem trung nuong tcdd m") {
    return name.includes("kem trung nuong") && 
           name.includes("tcdd m") && 
           !name.includes("yen mach");
  }
  return name.includes(t);
}

function useFeaturedProducts() {
  const { data = [] } = useMenu();
  return useMemo(() => {
    if (!data.length) return [];
    const result = [];
    for (const target of BEST_SELLERS) {
      const found = data.find(p => matchProduct(p, target));
      if (found) result.push(found);
    }
    return result.length > 0 ? result : [...data].sort((a,b)=>(b.price||0)-(a.price||0)).slice(0,4);
  }, [data]);
}

export default useFeaturedProducts;
