import { useState } from "react";
import MenuCategories from "@/features/menu/components/MenuCategories";
import MenuGrid from "@/features/menu/components/MenuGrid";

export default function MenuPage() {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* STICKY HEADER */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "white",
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}>
        {/* Title + Search */}
        <div style={{ padding: "14px 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
              Thuc don
            </h1>
            <span style={{ fontSize: 12, color: "#999" }}>Cing Hu Tang</span>
          </div>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center",
            background: "#f5f5f5", borderRadius: 14,
            padding: "9px 14px", gap: 8,
          }}>
            <span style={{ fontSize: 16, color: "#aaa" }}>🔍</span>
            <input
              type="text"
              placeholder="Tim mon, vi du: Tra sua, Oolong..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 13, color: "#333",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "#aaa", fontSize: 16, cursor: "pointer" }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div style={{ paddingBottom: 10 }}>
          <MenuCategories />
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <MenuGrid search={search} />
      <div style={{ height: 80 }} />
    </>
  );
}
