import useCartStore from "@/features/menu/store/cartStore";

const HERMES = "linear-gradient(145deg,#C8401A 0%,#D4531C 50%,#B83815 100%)";
const fmt = p => p ? new Intl.NumberFormat("vi-VN").format(p) + "d" : "";

function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem);
  if (!product) return null;

  return (
    <article style={{
      overflow:"hidden", borderRadius:20,
      background:"white", boxShadow:"0 2px 8px rgba(0,0,0,0.07)",
    }}>
      <div style={{ position:"relative", width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#f5f5f5" }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
            loading="lazy" />
        ) : null}
        <div style={{
          display: product.image ? "none" : "flex",
          position: product.image ? "absolute" : "relative",
          inset:0, width:"100%", height:"100%",
          background:HERMES, alignItems:"center", justifyContent:"center",
        }}>
          <img src="/logo-cing.png" alt=""
            style={{ width:48, height:48, objectFit:"contain", filter:"brightness(0) invert(1)", opacity:0.85 }} />
        </div>
        {product.featured && (
          <span style={{ position:"absolute", top:8, left:8,
            background:"#D4531C", color:"white", fontSize:9, fontWeight:800,
            padding:"2px 8px", borderRadius:20 }}>HOT</span>
        )}
      </div>
      <div style={{ padding:"10px 12px 12px" }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:"#1a1a1a",
          margin:"0 0 6px", lineHeight:1.4,
          display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:34 }}>
          {product.name}
        </h3>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{ fontSize:14, fontWeight:900, color:"#D4531C", margin:0 }}>
            {fmt(product.price)}
          </p>
          <button
            onClick={e => { e.stopPropagation(); addItem(product); }}
            style={{ width:28, height:28, borderRadius:"50%",
              background:"#D4531C", color:"white", border:"none",
              fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer" }}>+</button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
