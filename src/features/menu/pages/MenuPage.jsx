import MenuCategories from "@/features/menu/components/MenuCategories";
import MenuGrid from "@/features/menu/components/MenuGrid";

export default function MenuPage() {
  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{
        background: "white",
        padding: "16px 16px 12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", margin: "0 0 12px" }}>
          Thuc don
        </h1>
        <MenuCategories />
      </div>
      <MenuGrid />
    </div>
  );
}
