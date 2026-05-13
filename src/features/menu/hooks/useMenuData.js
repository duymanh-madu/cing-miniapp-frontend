import { useEffect, useMemo, useState } from "react";

/**
 * ============================================
 * MOCK MENU DATA
 * ============================================
 *
 * Temporary professional mock layer
 * waiting for realtime iPOS integration
 */

const mockMenu = [
  {
    id: 1,
    name: "Sữa Tươi Nướng Trân Châu",
    price: 49000,
    image:
      "https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=1200&auto=format&fit=crop",

    category: "Best Seller",

    badge: "HOT",
  },

  {
    id: 2,
    name: "Trà Sữa Matcha Kem Mây",
    price: 59000,
    image:
      "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=1200&auto=format&fit=crop",

    category: "Signature",

    badge: "NEW",
  },

  {
    id: 3,
    name: "Trà Oolong Sữa",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1523920290228-4f321a939b4c?q=80&w=1200&auto=format&fit=crop",

    category: "Tea",
  },

  {
    id: 4,
    name: "Cafe Kem Cheese",
    price: 55000,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",

    category: "Coffee",
  },
];

/**
 * ============================================
 * USE MENU DATA
 * ============================================
 */

export function useMenuData() {
  const [loading, setLoading] =
    useState(true);

  const [menu, setMenu] =
    useState([]);

  /**
   * FETCH MENU
   */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setMenu(mockMenu);

        setLoading(false);
      }, 700);

    return () =>
      clearTimeout(timer);
  }, []);

  /**
   * CATEGORIES
   */

  const categories =
    useMemo(() => {
      const unique =
        new Set(
          mockMenu.map(
            (item) => item.category
          )
        );

      return ["All", ...unique];
    }, []);

  return {
    loading,

    menu,

    categories,
  };
}