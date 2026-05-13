/**
 * ============================================
 * MENU DATA
 * ============================================
 */

const menuData = [
  {
    id: "milk-tea",

    label:
      "Trà Sữa",

    products: [
      {
        id: "ts_01",

        name:
          "Sữa Tươi Trân Châu",

        description:
          "Brown sugar fresh milk",

        image: "🧋",

        price: 49000,

        stock: 28,

        badge:
          "BEST SELLER",
      },

      {
        id: "ts_02",

        name:
          "Matcha Kem Mây",

        description:
          "Luxury matcha cream",

        image: "🍵",

        price: 59000,

        stock: 14,

        badge: "HOT",
      },
    ],
  },

  {
    id: "coffee",

    label:
      "Cà Phê",

    products: [
      {
        id: "cf_01",

        name:
          "Cà Phê Kem Trứng",

        description:
          "Premium egg coffee",

        image: "☕",

        price: 52000,

        stock: 18,

        badge: "NEW",
      },
    ],
  },
];

export default menuData;