import useMenuCategories from "../hooks/useMenuCategories";

const LABEL_MAP = {
  all: "Tat ca",
  YMTCDD: "Tra sua",
  DAK: "Dak",
  TOPPING: "Topping",
  COFFEE: "Ca phe",
  TCGT: "Tra xanh",
  TCDD: "Tra den",
  TOLTV: "To lon",
  HQ: "Han Quoc",
};

function getLabel(cat) {
  if (cat === "all") return "Tat ca";
  const mapped = LABEL_MAP[cat];
  if (mapped) return mapped;
  return cat.length > 10 ? cat.slice(0, 10) + "..." : cat;
}

function MenuCategories() {
  const { categories, selectedCategory, setCategory } = useMenuCategories();
  const safe = Array.isArray(categories) ? categories : [];

  return (
    <div style={{
      display: "flex", gap: 8,
      overflowX: "auto", paddingBottom: 4,
      scrollbarWidth: "none", msOverflowStyle: "none",
      WebkitOverflowScrolling: "touch",
    }}>
      {safe.map(cat => {
        const active = selectedCategory === cat || (!selectedCategory && cat === "all");
        return (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              whiteSpace: "nowrap",
              borderRadius: 20,
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              background: active ? "#E8622A" : "white",
              color: active ? "white" : "#555",
              border: active ? "none" : "1px solid #e0e0e0",
              boxShadow: active ? "0 2px 8px rgba(232,98,42,0.35)" : "0 1px 3px rgba(0,0,0,0.08)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            {getLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}

export default MenuCategories;
