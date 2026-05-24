import { useState } from "react";
import { useMenuProducts } from "../hooks/useMenuProducts";
import useCartStore from "../store/cartStore";
import ProductOptionsModal from "@/features/cart/ProductOptionsModal";

const HERMES = "linear-gradient(145deg,#C8401A 0%,#D4531C 50%,#B83815 100%)";
const fmt = p => p ? new Intl.NumberFormat("vi-VN").format(p) + "d" : "";

function Card({ item, onAdd }) {
  const ok = item.available !== false;
  return (
    <div style={{
      background:"white", borderRadius:12, overflow:"hidden",
      boxShadow:"0 1px 5px rgba(0,0,0,0.08)",
      display:"flex", flexDirection:"row", alignItems:"stretch", height:80,
    }}>
      <div style={{ width:80, height:80, flexShrink:0, position:"relative", overflow:"hidden", background:"#f0f0f0" }}>
        {item.image ? (
          <>
            <img src={item.image} alt={item.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={e=>{ e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
              loading="lazy" />
            <div style={{ display:"none", position:"absolute", inset:0, background:HERMES, alignItems:"center", justifyContent:"center" }}>
              <img src="/logo-cing.png" alt="" style={{ width:32, height:32, objectFit:"contain", filter:"brightness(0) invert(1)", opacity:.9 }} />
            </div>
          </>
        ) : (
          <div style={{ width:"100%", height:"100%", background:HERMES, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src="/logo-cing.png" alt="" style={{ width:32, height:32, objectFit:"contain", filter:"brightness(0) invert(1)", opacity:.9 }} />
          </div>
        )}
        {!ok && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontSize:8, fontWeight:700 }}>Het</span>
          </div>
        )}
        {item.featured && (
          <span style={{ position:"absolute", top:4, left:4, background:"#D4531C", color:"white", fontSize:7, fontWeight:800, padding:"1px 5px", borderRadius:6 }}>HOT</span>
        )}
      </div>
      <div style={{ flex:1, padding:"8px 10px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <p style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", margin:0, lineHeight:1.35,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {item.name}
        </p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, fontWeight:900, color:"#D4531C" }}>{fmt(item.price)}</span>
          <button
            disabled={!ok}
            onClick={e => { e.stopPropagation(); if (ok && onAdd) onAdd(item); }}
            style={{
              width:24, height:24, borderRadius:"50%",
              background: ok ? "#D4531C" : "#ddd",
              color:"white", border:"none", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor: ok ? "pointer" : "not-allowed", flexShrink:0, padding:0,
            }}>+</button>
        </div>
      </div>
    </div>
  );
}

export default function MenuGrid({ search="" }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const { data=[], isLoading } = useMenuProducts();

  const items = search.trim()
    ? data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : data;

  if (isLoading) return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"12px 12px" }}>
      {[1,2,3,4,5,6].map(i => <div key={i} style={{ height:80, borderRadius:12, background:"#efefef" }} />)}
    </div>
  );

  if (!items.length) return (
    <div style={{ padding:"60px 16px", textAlign:"center", color:"#bbb" }}>
      <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
      <p style={{ fontSize:13, fontWeight:600, margin:0 }}>
        {search ? "Khong co mon nay" : "Chua co mon an"}
      </p>
    </div>
  );

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"12px 12px 0" }}>
        {items.map(item => (
          <Card key={item.id} item={item} onAdd={setSelectedItem} />
        ))}
      </div>
      {selectedItem && (
        <ProductOptionsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
