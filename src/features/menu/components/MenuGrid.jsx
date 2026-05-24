import { useMenuProducts } from "../hooks/useMenuProducts";

const HERMES = "linear-gradient(145deg,#C8401A 0%,#D4531C 50%,#B83815 100%)";

function fmt(price) {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("vi-VN").format(price) + "d";
}

function Card({ item }) {
  const available = item.available !== false;
  return (
    <div style={{
      background: "white", borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
      opacity: available ? 1 : 0.8,
    }}>
      {/* IMAGE - tỉ lệ 1:1 cố định */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "#f5f5f5" }}>
        {item.image ? (
          <>
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", display: "block",
              }}
              onError={e => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
              loading="lazy"
            />
            <div style={{
              display: "none", position: "absolute", inset: 0,
              background: HERMES, alignItems: "center", justifyContent: "center",
            }}>
              <img src="/logo-cing.png" alt="" style={{
                width: 48, height: 48, objectFit: "contain",
                filter: "brightness(0) invert(1)", opacity: 0.9,
              }} />
            </div>
          </>
        ) : (
          <div style={{
            width: "100%", height: "100%", background: HERMES,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src="/logo-cing.png" alt="" style={{
              width: 48, height: 48, objectFit: "contain",
              filter: "brightness(0) invert(1)", opacity: 0.9,
            }} />
          </div>
        )}
        {item.featured && (
          <span style={{
            position: "absolute", top: 7, left: 7,
            background: "#D4531C", color: "white",
            fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 10,
          }}>HOT</span>
        )}
        {!available && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              background: "rgba(0,0,0,0.65)", color: "white",
              fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
            }}>Het hang</span>
          </div>
        )}
      </div>

      {/* INFO */}
      <div style={{ padding: "10px 10px 12px" }}>
        <p style={{
          fontSize: 12, fontWeight: 700, color: "#1a1a1a",
          margin: "0 0 6px", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          minHeight: 34,
        }}>{item.name}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#D4531C" }}>
            {fmt(item.price)}
          </span>
          <button
            disabled={!available}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: available ? "#D4531C" : "#ddd",
              color: "white", border: "none", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: available ? "pointer" : "not-allowed", flexShrink: 0,
            }}
          >+</button>
        </div>
      </div>
    </div>
  );
}

function MenuGrid({ search = "" }) {
  const { data = [], isLoading } = useMenuProducts();
  const items = search.trim()
    ? data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase().trim()))
    : data;

  if (isLoading) {
    return (
      <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ borderRadius: 16, background: "#efefef", aspectRatio: "0.8/1" }} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ padding: "60px 16px", textAlign: "center", color: "#bbb" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
          {search ? "Khong co mon nay" : "Chua co mon an"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 14px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {items.map(item => <Card key={item.id} item={item} />)}
    </div>
  );
}

export default MenuGrid;
