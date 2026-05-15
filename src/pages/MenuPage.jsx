import MenuCategoryTabs from "@/features/menu/components/MenuCategoryTabs";

import MenuProductGrid from "@/features/menu/components/MenuProductGrid";

import useMenuRealtime from "@/features/menu/hooks/useMenuRealtime";

function MenuPage() {

  useMenuRealtime();

  return (
    <div
      className="
        px-4
        pt-4
        pb-24
      "
    >
      <div>
        <h1
          className="
            text-3xl
            font-black
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

      <div
        className="
          mt-6
        "
      >
        <MenuCategoryTabs />
      </div>

      <div
        className="
          mt-6
        "
      >
        <MenuProductGrid />
      </div>
    </div>
  );

}

export default
  MenuPage;