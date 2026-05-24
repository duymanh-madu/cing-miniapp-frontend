import { useState } from "react";
import useCartStore from "@/features/menu/store/cartStore";

const SUGAR = [
  { id:"100", label:"100% đường" },
  { id:"70",  label:"70% đường" },
  { id:"50",  label:"50% đường" },
  { id:"30",  label:"30% đường" },
  { id:"0",   label:"Không đường" },
];

const ICE = [
  { id:"100", label:"100% đá" },
  { id:"70",  label:"70% đá" },
  { id:"50",  label:"50% đá" },
  { id:"0",   label:"Không đá" },
];

const TOPPINGS = [
  { id:"tran_chau_den",   label:"Trân châu đen",   price:5000 },
  { id:"tran_chau_trang", label:"Trân châu trắng", price:5000 },
  { id:"soi_dua",         label:"Sợi dừa",         price:5000 },
  { id:"thach_cafe",      label:"Thạch cà phê",    price:5000 },
  { id:"kem_cheese",      label:"Kem cheese",      price:8000 },
  { id:"pudding",         label:"Pudding trứng",   price:8000 },
];

const fmt = p => p ? new Intl.NumberFormat("vi-VN").format(p) + "đ" : "";

export default function ProductOptionsModal({ item, onClose }) {
  const addItem = useCartStore(s => s.addItem);
  const [sugar, setSugar] = useState("100");
  const [ice, setIce] = useState("100");
  const [toppings, setToppings] = useState([]);
  const [qty, setQty] = useState(1);

  const toggleTopping = (id) => {
    setToppings(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toppingTotal = toppings.reduce((s, id) => {
    const t = TOPPINGS.find(t => t.id === id);
    return s + (t?.price || 0);
  }, 0);

  const unitPrice = (item.price || 0) + toppingTotal;
  const total = unitPrice * qty;

  const handleAdd = () => {
    const selectedToppings = TOPPINGS.filter(t => toppings.includes(t.id));
    const note = [
      sugar !== "100" ? `${sugar}% đường` : null,
      ice !== "100" ? `${ice}% đá` : null,
      ...selectedToppings.map(t => t.label),
    ].filter(Boolean).join(", ");

    addItem({
      ...item,
      price: unitPrice,
      qty,
      note,
      toppings: selectedToppings,
      options: { sugar, ice },
      displayName: item.name + (note ? ` (${note})` : ""),
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
          zIndex:100,
        }}
      />

      {/* Sheet */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:101,
        background:"white", borderRadius:"20px 20px 0 0",
        maxHeight:"85vh", overflowY:"auto",
        paddingBottom:24,
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 16px 12px",
          borderBottom:"1px solid #f5f5f5",
          position:"sticky", top:0, background:"white", zIndex:1,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {item.image && (
              <img src={item.image} alt={item.name}
                style={{ width:44, height:44, borderRadius:10, objectFit:"cover" }}
                onError={e => e.target.style.display="none"} />
            )}
            <div>
              <p style={{ fontSize:13, fontWeight:800, color:"#1a1a1a", margin:0 }}>{item.name}</p>
              <p style={{ fontSize:13, fontWeight:900, color:"#D4531C", margin:0 }}>{fmt(item.price)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:"50%", background:"#f5f5f5",
            border:"none", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>✕</button>
        </div>

        <div style={{ padding:"0 16px" }}>
          {/* DUONG */}
          <Section title="Lượng đường">
            <OptionRow items={SUGAR} selected={sugar} onSelect={setSugar} />
          </Section>

          {/* DA */}
          <Section title="Lượng đá">
            <OptionRow items={ICE} selected={ice} onSelect={setIce} />
          </Section>

          {/* TOPPING */}
          <Section title="Topping (thêm 5.000đ - 8.000đ)">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {TOPPINGS.map(t => (
                <button key={t.id} onClick={() => toggleTopping(t.id)}
                  style={{
                    padding:"8px 10px", borderRadius:10, cursor:"pointer",
                    border: toppings.includes(t.id) ? "2px solid #D4531C" : "1.5px solid #e8e8e8",
                    background: toppings.includes(t.id) ? "#fff5f2" : "white",
                    textAlign:"left",
                  }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#1a1a1a", margin:"0 0 2px" }}>{t.label}</p>
                  <p style={{ fontSize:11, color:"#D4531C", margin:0, fontWeight:600 }}>+{fmt(t.price)}</p>
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer: qty + add */}
        <div style={{
          position:"sticky", bottom:0, background:"white",
          padding:"12px 16px 0",
          borderTop:"1px solid #f5f5f5",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))}
                style={{ width:32,height:32,borderRadius:"50%",border:"1.5px solid #D4531C",
                  background:"white",color:"#D4531C",fontSize:18,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
              <span style={{ fontSize:16,fontWeight:900,minWidth:20,textAlign:"center" }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)}
                style={{ width:32,height:32,borderRadius:"50%",background:"#D4531C",
                  border:"none",color:"white",fontSize:18,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
            </div>
            <button onClick={handleAdd} style={{
              flex:1, padding:"12px", borderRadius:12,
              background:"#D4531C", color:"white", border:"none",
              fontSize:14, fontWeight:900, cursor:"pointer",
            }}>
              Thêm vào giỏ — {fmt(total)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop:16 }}>
      <p style={{ fontSize:12,fontWeight:800,color:"#999",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:0.5 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function OptionRow({ items, selected, onSelect }) {
  return (
    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
      {items.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.id)}
          style={{
            padding:"6px 12px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600,
            border: selected===opt.id ? "2px solid #D4531C" : "1.5px solid #e8e8e8",
            background: selected===opt.id ? "#D4531C" : "white",
            color: selected===opt.id ? "white" : "#555",
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
