import MenuCategories from "@/features/menu/components/MenuCategories";
import MenuGrid from "@/features/menu/components/MenuGrid";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-black text-gray-900 mb-3">Thuc don</h1>
        <MenuCategories />
      </div>
      <MenuGrid />
    </div>
  );
}
