import useMenuCategories from "../hooks/useMenuCategories";

/* Thu tu hien thi theo yeu cau */
const CATEGORY_ORDER = [
  "all",
  "YMTCDD",
  "DAK",
  "TOPPING",
  "TOLTV",
  "TCGT",
  "ITEM_TYPE-7L25",
  "TCDD",
  "COFFEE",
  "ITEM_TYPE-IY08",
  "DAV",
  "ITEM_TYPE-N622",
  "HQ",
  "DUK",
  "Trà hoa quả",
];

const LABEL_MAP = {
  "all":           "Tất cả",
  "YMTCDD":        "Yến mạch TCDD",
  "DAK":           "Đồ ăn khô",
  "TOPPING":       "Topping",
  "TOLTV":         "Trà ô long đậm vị",
  "TCGT":          "Trà chanh giã tay",
  "ITEM_TYPE-7L25":"Trái cây ép",
  "TCDD":          "Trân châu đường đen",
  "COFFEE":        "Cà phê",
  "ITEM_TYPE-IY08":"Đồ đá xay",
  "DAV":           "Đồ ăn vặt",
  "ITEM_TYPE-N622":"Bánh ngọt",
  "HQ":            "Hoa quả tươi",
  "DUK":           "Special",
  "Special":       "Trà hoa quả",
  "Trà hoa quả":   "Trà hoa quả",
  "THQ":           null,  // an di - chuyen sang Tra hoa qua
};

function MenuCategories() {
  const { categories, selectedCategory, setCategory } = useMenuCategories();
  const safe = Array.isArray(categories) ? categories : [];

  /* Map THQ/Special -> Trà hoa quả, giữ DUK là Special */
  const mapped = safe
    .map(cat => (cat === "THQ" || cat === "Special") ? "Trà hoa quả" : cat)
    .filter(cat => LABEL_MAP[cat] !== null && LABEL_MAP[cat] !== undefined);

  /* Sap xep theo thu tu yeu cau */
  const ordered = [
    ...CATEGORY_ORDER.filter(c => mapped.includes(c)),
    ...mapped.filter(c => !CATEGORY_ORDER.includes(c)),
  ];

  /* Loai trung */
  const unique = [...new Set(ordered)];

  return (
    <div style={{
      display:"flex", gap:7, overflowX:"auto",
      padding:"0 16px 12px",
      scrollbarWidth:"none", WebkitOverflowScrolling:"touch",
    }}>
      {unique.map(cat => {
        const active = selectedCategory === cat || (!selectedCategory && cat === "all");
        const label = LABEL_MAP[cat] || cat;
        return (
          <button key={cat}
            onClick={() => setCategory(cat)}
            style={{
              whiteSpace:"nowrap", borderRadius:20,
              padding:"6px 14px", fontSize:12,
              fontWeight: active ? 700 : 500,
              background: active ? "#D4531C" : "white",
              color: active ? "white" : "#666",
              border: active ? "none" : "1px solid #e8e8e8",
              boxShadow: active ? "0 2px 6px rgba(212,83,28,0.3)" : "none",
              cursor:"pointer", flexShrink:0,
            }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default MenuCategories;
