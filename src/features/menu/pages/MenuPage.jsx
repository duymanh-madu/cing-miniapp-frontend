import { PageContainer } from "@/components/ui";
import MenuCategories from "@/features/menu/components/MenuCategories";
import MenuGrid from "@/features/menu/components/MenuGrid";

/**
 * MENU PAGE
 * Entry point cho /menu route
 */
export default function MenuPage() {
  return (
    <PageContainer className="pb-24">
      <MenuCategories />
      <MenuGrid />
    </PageContainer>
  );
}
