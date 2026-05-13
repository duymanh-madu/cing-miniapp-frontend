/**
 * ============================================
 * MOCK MENU DATA
 * ============================================
 */

const categories = [
  {
    id: "signature",
    name: "Signature",
  },

  {
    id: "milk-tea",
    name: "Milk Tea",
  },

  {
    id: "coffee",
    name: "Coffee",
  },

  {
    id: "fruit-tea",
    name: "Fruit Tea",
  },
];

const products = [
  {
    id: 1,
    category_id: "signature",
    name: "Brown Sugar Milk Tea",
    description:
      "Luxury brown sugar fresh milk tea",

    price: 59000,

    image: "🧋",

    sold_out: false,

    tags: [
      "Best Seller",
      "Signature",
    ],
  },

  {
    id: 2,
    category_id: "signature",
    name: "Cheese Foam Oolong",
    description:
      "Creamy cheese foam with premium oolong",

    price: 65000,

    image: "🥤",

    sold_out: false,

    tags: [
      "Premium",
    ],
  },

  {
    id: 3,
    category_id: "milk-tea",
    name: "Jasmine Milk Tea",
    description:
      "Smooth jasmine tea with fresh milk",

    price: 52000,

    image: "🧋",

    sold_out: false,

    tags: [],
  },

  {
    id: 4,
    category_id: "coffee",
    name: "Salt Coffee",
    description:
      "Vietnamese salt coffee",

    price: 49000,

    image: "☕",

    sold_out: true,

    tags: [
      "Sold Out",
    ],
  },

  {
    id: 5,
    category_id: "fruit-tea",
    name: "Peach Oolong Tea",
    description:
      "Fresh peach oolong refreshment",

    price: 56000,

    image: "🍑",

    sold_out: false,

    tags: [
      "Fresh",
    ],
  },
];

/**
 * ============================================
 * FETCH MENU
 * ============================================
 */

export async function fetchMenuData() {
  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  return {
    success: true,
    categories,
    products,
  };
}