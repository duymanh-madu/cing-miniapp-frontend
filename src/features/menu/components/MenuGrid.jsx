import { useMenuProducts } from "../hooks/useMenuProducts";

/* Hermes orange chinh xac: #D4531C */
const HERMES = "linear-gradient(145deg, #D4531C 0%, #E8622A 50%, #C04418 100%)";

function formatPrice(price) {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("vi-VN").format(price) + "d";
}

function ProductCard({ item }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      {/* IMAGE */}
      <div style={{ height: 150, position: "relative", overflow: "hidden" }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            loading="lazy"
          />
        ) : null}
        {/* Placeholder: Hermes orange + logo */}
        <div style={{
          display: item.image ? "none" : "flex",
          position: item.image ? "absolute" : "relative",
          inset: 0,
          width: "100%",
          height: "100%",
          background: HERMES,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <img
            src="/logo-cing.png"
            alt=""
            style={{
              width: 56, height: 56,
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
              opacity: 0.85,
            }}
          />
        </div>
        {item.featured && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "#E8622A", color: "white",
            fontSize: 10, fontWeight: 800,
            padding: "2px 8px", borderRadius: 20,
          }}>
            Hot
          </span>
        )}
      </div>

      {/* INFO */}
      <div style={{ padding: "10px 12px" }}>
        <p style={{
          fontSize: 12, fontWeight: 700,
          color: "#1a1a1a", lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 34, margin: 0,
        }}>
          {item.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 900, color: "#E8622A", margin: 0 }}>
            {formatPrice(item.price)}
          </p>
          <button
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#E8622A", color: "white",
              border: "none", fontSize: 20, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", lineHeight: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuGrid() {
  const { data = [], isLoading } = useMenuProducts();

  if (isLoading) {
    return (
      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ height: 220, borderRadius: 20, background: "#f0f0f0" }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "#999" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🧋</div>
        <p>Dang tai menu...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {data.map(item => <ProductCard key={item.id} item={item} />)}
    </div>
  );
}

export default MenuGrid;
