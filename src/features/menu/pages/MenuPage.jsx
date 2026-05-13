import MenuCategories from "../components/MenuCategories";

import MenuGrid from "../components/MenuGrid";

import useMenuRealtime from "../hooks/useMenuRealtime";

/**
 * ============================================
 * MENU PAGE
 * ============================================
 */

function MenuPage() {
  /**
   * REALTIME
   */

  useMenuRealtime();

  return (
    <div
      className="
        px-4
        pt-4
        pb-10
      "
    >
      {/* HEADER */}

      <div>
        <h1
          className="
            text-[34px]
            font-black
            tracking-tight
            text-[#2b1800]
          "
        >
          Menu
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-gray-500
          "
        >
          Đồng bộ realtime từ iPOS
        </p>
      </div>

      {/* CATEGORIES */}

      <div
        className="
          mt-6
        "
      >
        <MenuCategories />
      </div>

      {/* GRID */}

      <div
        className="
          mt-6
        "
      >
        <MenuGrid />
      </div>
    </div>
  );
}

export default MenuPage;