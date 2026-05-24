import { useState } from "react";
import MenuCategories from "@/features/menu/components/MenuCategories";
import MenuGrid from "@/features/menu/components/MenuGrid";

export default function MenuPage() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh" }}>

      {/* HEADER - sticky */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "white",
        borderBottom: "1px solid #f0f0f0",
      }}>
        <div style={{ padding: "14px 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>Thuc don</h1>
            <span style={{ fontSize: 11, color: "#bbb" }}>Cing Hu Tang</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center",
            background: "#f5f5f5", borderRadius: 12,
            padding: "8px 12px", gap: 8,
          }}>
            <span style={{ fontSize: 14, color: "#bbb" }}>🔍</span>
            <input
              type="text"
              placeholder="Tim mon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, border: "none", outline: "none",
                background: "none", fontSize: 13, color: "#333",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ border: "none", background: "none", color: "#bbb", fontSize: 14, padding: 0, cursor: "pointer" }}>
                ✕
              </button>
            )}
          </div>
        </div>
        <MenuCategories />
      </div>

      {/* CONTENT - natural scroll */}
      <MenuGrid search={search} />
      <div style={{ height: 100 }} />
    </div>
  );
}
