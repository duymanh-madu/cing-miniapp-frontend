const HERMES = "linear-gradient(145deg,#C8401A 0%,#D4531C 50%,#B83815 100%)";
const fmt = p => p ? new Intl.NumberFormat("vi-VN").format(p) + "d" : "";

function ProductCard({ product, onAdd }) {
  if (!product) return null;
  const available = product.available !== false;

  return (
    <article style={{
      display:"flex", flexDirection:"row", alignItems:"center",
      overflow:"hidden", borderRadius:14,
      background:"white", boxShadow:"0 1px 5px rgba(0,0,0,0.08)",
      height:80,
    }}>
      {/* IMAGE */}
      <div style={{ width:80, height:80, flexShrink:0, position:"relative",
        overflow:"hidden", background:"#f5f5f5" }}>
        {product.image ? (
          <>
            <img src={product.image} alt={product.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
              loading="lazy" />
            <div style={{ display:"none", position:"absolute", inset:0,
              background:HERMES, alignItems:"center", justifyContent:"center" }}>
              <img src="/logo-cing.png" alt="" style={{ width:36, height:36,
                objectFit:"contain", filter:"brightness(0) invert(1)", opacity:0.85 }} />
            </div>
          </>
        ) : (
          <div style={{ width:"100%", height:"100%", background:HERMES,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src="/logo-cing.png" alt="" style={{ width:36, height:36,
              objectFit:"contain", filter:"brightness(0) invert(1)", opacity:0.85 }} />
          </div>
        )}
      </div>

      {/* INFO */}
      <div style={{ flex:1, padding:"8px 10px", display:"flex",
        flexDirection:"column", justifyContent:"space-between",
        minWidth:0, height:80 }}>
        <p style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", margin:0,
          lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {product.name}
        </p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{ fontSize:13, fontWeight:900, color:"#D4531C", margin:0 }}>
            {fmt(product.price)}
          </p>
          <button
            disabled={!available}
            onClick={e => { e.stopPropagation(); if (available && onAdd) onAdd(product); }}
            style={{ width:26, height:26, borderRadius:"50%",
              background: available ? "#D4531C" : "#ddd",
              color:"white", border:"none", fontSize:18,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor: available ? "pointer" : "not-allowed", flexShrink:0 }}>+
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
