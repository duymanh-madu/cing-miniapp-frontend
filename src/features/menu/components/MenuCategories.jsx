import useMenuCategories from "../hooks/useMenuCategories";

const LABEL = {
  all:"Tat ca", YMTCDD:"Tra sua", DAK:"Dak",
  TOPPING:"Topping", COFFEE:"Ca phe", TCGT:"Tra xanh",
  TCDD:"Tra den", TOLTV:"To lon", HQ:"Han Quoc",
};

function MenuCategories() {
  const { categories, selectedCategory, setCategory } = useMenuCategories();
  const safe = Array.isArray(categories) ? categories : [];
  return (
    <div style={{
      display: "flex", gap: 7, overflowX: "auto",
      padding: "0 16px 12px",
      scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
    }}>
      {safe.map(cat => {
        const active = selectedCategory === cat || (!selectedCategory && cat === "all");
        return (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            whiteSpace: "nowrap", borderRadius: 20,
            padding: "6px 14px", fontSize: 12,
            fontWeight: active ? 700 : 500,
            background: active ? "#D4531C" : "white",
            color: active ? "white" : "#666",
            border: active ? "none" : "1px solid #e8e8e8",
            boxShadow: active ? "0 2px 6px rgba(212,83,28,0.3)" : "none",
            cursor: "pointer", flexShrink: 0,
          }}>
            {LABEL[cat] || (cat.length > 8 ? cat.slice(0,8)+"..." : cat)}
          </button>
        );
      })}
    </div>
  );
}

export default MenuCategories;
