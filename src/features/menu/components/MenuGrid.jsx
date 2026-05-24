import { useMenuProducts } from "../hooks/useMenuProducts";

const HERMES = "linear-gradient(145deg,#C8401A 0%,#D4531C 50%,#B83815 100%)";
const fmt = p => p ? new Intl.NumberFormat("vi-VN").format(p) + "d" : "";

function Card({ item }) {
  const ok = item.available !== false;
  return (
    <div style={{
      background:"white", borderRadius:14,
      overflow:"hidden", display:"flex",
      flexDirection:"column",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
      height:"100%",
    }}>
      <div style={{ width:"100%", height:120, position:"relative", flexShrink:0, overflow:"hidden", background:"#f0f0f0" }}>
        {item.image
          ? <img src={item.image} alt={item.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={e=>{ e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
              loading="lazy" />
          : null}
        <div style={{
          display: item.image ? "none" : "flex",
          position:"absolute", inset:0,
          background:HERMES, alignItems:"center", justifyContent:"center",
        }}>
          <img src="/logo-cing.png" alt="" style={{ width:40,height:40,objectFit:"contain",filter:"brightness(0) invert(1)",opacity:.9 }} />
        </div>
        {item.featured && <span style={{ position:"absolute",top:6,left:6,background:"#D4531C",color:"white",fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:8,zIndex:1 }}>HOT</span>}
        {!ok && (
          <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1 }}>
            <span style={{ background:"rgba(0,0,0,0.7)",color:"white",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10 }}>Het hang</span>
          </div>
        )}
      </div>
      <div style={{ padding:"8px 10px 10px", flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", margin:"0 0 4px", lineHeight:1.35,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", minHeight:28 }}>
          {item.name}
        </p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ fontSize:13, fontWeight:900, color:"#D4531C" }}>{fmt(item.price)}</span>
          <button disabled={!ok} style={{
            width:26,height:26,borderRadius:"50%",
            background: ok ? "#D4531C" : "#ddd",
            color:"white",border:"none",fontSize:18,
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor: ok ? "pointer" : "not-allowed", flexShrink:0,
          }}>+</button>
        </div>
      </div>
    </div>
  );
}

export default function MenuGrid({ search="" }) {
  const { data=[], isLoading } = useMenuProducts();
  const items = search.trim()
    ? data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : data;

  if (isLoading) return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:"12px 14px" }}>
      {[1,2,3,4,5,6].map(i => <div key={i} style={{ height:200, borderRadius:14, background:"#efefef" }} />)}
    </div>
  );

  if (!items.length) return (
    <div style={{ padding:"60px 16px", textAlign:"center", color:"#bbb" }}>
      <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
      <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{search?"Khong co mon nay":"Chua co mon an"}</p>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:"12px 14px 0", alignItems:"start" }}>
      {items.map(item => <Card key={item.id} item={item} />)}
    </div>
  );
}
