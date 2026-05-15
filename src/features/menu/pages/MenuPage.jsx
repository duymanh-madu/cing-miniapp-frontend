import {
  PageContainer,
  PageHeading,
} from "@/components/ui";

import MenuCategories from "../components/MenuCategories";

import MenuGrid from "../components/MenuGrid";

/**
 * =========================================================
 * MENU PAGE
 * =========================================================
 */

function MenuPage() {

  return (

    <PageContainer>

      <PageHeading
        title="Menu"
        subtitle="Đồng bộ realtime từ iPOS"
      />

      <div
        className="
          mt-6
        "
      >

        <MenuCategories />

      </div>

      <MenuGrid />

    </PageContainer>

  );

}

export default
  MenuPage;