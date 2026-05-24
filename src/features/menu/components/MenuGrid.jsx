import { useMenuProducts } from "../hooks/useMenuProducts";
import useMenuStore from "../store/menuStore";

const HERMES = "linear-gradient(145deg, #C8401A 0%, #D4531C 40%, #B83815 100%)";

function formatPrice(price) {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("vi-VN").format(price) + "d";
}

function ProductRow({ item, onAdd }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: "white", borderRadius: 16,
      overflow: "hidden", marginBottom: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      minHeight: 90,
    }}>
      {/* IMAGE - square left */}
      <div style={{
        width: 88, height: 88, flexShrink: 0,
        position: "relative", overflow: "hidden",
        borderRadius: "16px 0 0 16px",
      }}>
        {item.image ? (
          <>
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
              <img src="/logo-cing.png" alt=""
                style={{ width: 40, height: 40, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
            </div>
          </>
        ) : (
          <div style={{
            width: "100%", height: "100%", background: HERMES,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src="/logo-cing.png" alt=""
              style={{ width: 40, height: 40, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.85 }} />
          </div>
        )}
        {item.featured && (
          <div style={{
            position: "absolute", top: 5, left: 5,
            background: "#E8622A", color: "white",
            fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 10,
          }}>HOT</div>
        )}
      </div>

      {/* INFO - right */}
      <div style={{
        flex: 1, padding: "10px 12px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        minHeight: 88,
      }}>
        <div>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "#1a1a1a",
            lineHeight: 1.35, margin: "0 0 3px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {item.name}
          </p>
          {item.description && (
            <p style={{
              fontSize: 11, color: "#999", margin: 0,
              overflow: "hidden", whiteSpace: "nowrap",
              textOverflow: "ellipsis", maxWidth: 180,
            }}>
              {item.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#D4531C" }}>
              {formatPrice(item.price)}
            </span>
            {!item.available && (
              <span style={{
                marginLeft: 8, fontSize: 10, color: "#999",
                background: "#f0f0f0", padding: "2px 6px", borderRadius: 8,
              }}>Het hang</span>
            )}
          </div>
          <button
            disabled={!item.available}
            onClick={e => { e.stopPropagation(); onAdd && onAdd(item); }}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: item.available ? "#D4531C" : "#ddd",
              color: "white", border: "none",
              fontSize: 22, fontWeight: 400, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: item.available ? "pointer" : "not-allowed",
              flexShrink: 0,
            }}
          >+</button>
        </div>
      </div>
    </div>
  );
}

function MenuGrid({ search = "" }) {
  const { data = [], isLoading } = useMenuProducts();

  const filtered = search.trim()
    ? data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase().trim()))
    : data;

  if (isLoading) {
    return (
      <div style={{ padding: "12px 16px" }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            height: 90, borderRadius: 16, background: "#f0f0f0",
            marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite",
          }} />
        ))}
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div style={{ padding: "48px 16px", textAlign: "center", color: "#aaa" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
          {search ? "Khong tim thay mon nay" : "Dang tai menu..."}
        </p>
        {search && (
          <p style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>
            Thu tu khoa khac nhe
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px 0" }}>
      {search && (
        <p style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
          Tim thay {filtered.length} mon
        </p>
      )}
      {filtered.map(item => (
        <ProductRow key={item.id} item={item} />
      ))}
    </div>
  );
}

export default MenuGrid;
