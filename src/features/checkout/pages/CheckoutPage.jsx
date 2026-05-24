import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";
import useAuthStore from "@/stores/auth/authStore";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p) + "d";

const PAYMENT_METHODS = [
  { id:"momo", label:"MoMo", icon:"💜", desc:"Vi dien tu MoMo" },
];

const ORDER_TYPES = [
  { id:"dine_in",  label:"An tai quan", icon:"🪑" },
  { id:"takeaway", label:"Mang ve",     icon:"🛍" },
  { id:"delivery", label:"Giao hang",   icon:"🛵" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore(s => s.items);
  const increment = useCartStore(s => s.increment);
  const decrement = useCartStore(s => s.decrement);
  const clearCart = useCartStore(s => s.clearCart);
  const profile = useAuthStore(s => s.profile);

  const total = items.reduce((s,i) => s+(i.price||0)*i.qty, 0);
  const count = items.reduce((s,i) => s+i.qty, 0);

  const payMethod = "momo";
  const [orderType, setOrderType] = useState("dine_in");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!items.length) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        minHeight:"60vh", color:"#bbb", gap:12 }}>
        <div style={{ fontSize:48 }}>🛒</div>
        <p style={{ fontSize:14, fontWeight:600, margin:0 }}>Gio hang trong</p>
        <button onClick={() => navigate("/menu")}
          style={{ marginTop:8, padding:"10px 24px", background:"#D4531C", color:"white",
            border:"none", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          Xem thuc don
        </button>
      </div>
    );
  }

  async function handleOrder() {
    setLoading(true); setError("");
    try {
      const payload = {
        customer_id: profile?.id || profile?.userId || null,
        customer_name: profile?.name || "Khach",
        order_type: orderType,
        payment_method: payMethod,
        note,
        items: items.map(i => ({
          item_id: i.id,
          item_code: i.code,
          name: i.name,
          price: i.price,
          quantity: i.qty,
        })),
        total_amount: total,
      };
      await apiClient.post("/orders", payload);
      clearCart();
      navigate("/order-success");
    } catch(e) {
      setError("Dat hang that bai. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh", paddingBottom:120 }}>

      {/* HEADER */}
      <div style={{ background:"white", padding:"14px 16px", display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)}
          style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", padding:0, color:"#333" }}>
          ←
        </button>
        <h1 style={{ fontSize:18, fontWeight:900, margin:0, color:"#1a1a1a" }}>Gio hang ({count} mon)</h1>
      </div>

      {/* CART ITEMS */}
      <div style={{ background:"white", margin:"12px 12px 0", borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px 4px", fontSize:12, fontWeight:700, color:"#999" }}>MON DA CHON</div>
        {items.map((item, idx) => (
          <div key={item.cartId} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 16px",
            borderTop: idx > 0 ? "1px solid #f5f5f5" : "none",
          }}>
            <div style={{ width:52, height:52, borderRadius:10, overflow:"hidden", flexShrink:0, background:"#f0f0f0" }}>
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
                : <div style={{ width:"100%", height:"100%", background:"linear-gradient(145deg,#C8401A,#D4531C)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <img src="/logo-cing.png" alt="" style={{ width:28, height:28, filter:"brightness(0) invert(1)", opacity:.8 }} />
                  </div>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#1a1a1a", margin:"0 0 3px",
                overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{item.name}</p>
              <p style={{ fontSize:12, fontWeight:900, color:"#D4531C", margin:0 }}>{fmt(item.price)}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <button onClick={() => decrement(item.id)}
                style={{ width:26, height:26, borderRadius:"50%", border:"1.5px solid #D4531C",
                  background:"white", color:"#D4531C", fontSize:16, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>−</button>
              <span style={{ fontSize:14, fontWeight:900, color:"#1a1a1a", minWidth:16, textAlign:"center" }}>{item.qty}</span>
              <button onClick={() => increment(item.id)}
                style={{ width:26, height:26, borderRadius:"50%", background:"#D4531C",
                  border:"none", color:"white", fontSize:16, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* ORDER TYPE */}
      <div style={{ background:"white", margin:"10px 12px 0", borderRadius:16, padding:"12px 16px" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"#999", margin:"0 0 10px" }}>HINH THUC</p>
        <div style={{ display:"flex", gap:8 }}>
          {ORDER_TYPES.map(t => (
            <button key={t.id} onClick={() => setOrderType(t.id)}
              style={{
                flex:1, padding:"8px 4px", borderRadius:12, cursor:"pointer",
                border: orderType===t.id ? "2px solid #D4531C" : "1.5px solid #e8e8e8",
                background: orderType===t.id ? "#fff5f2" : "white",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontSize:10, fontWeight:700, color: orderType===t.id ? "#D4531C" : "#666" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PAYMENT */}
      <div style={{ background:"white", margin:"10px 12px 0", borderRadius:16, padding:"12px 16px" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"#999", margin:"0 0 10px" }}>THANH TOAN</p>
        {PAYMENT_METHODS.map((m, idx) => (
          <div key={m.id} onClick={() => setPayMethod(m.id)}
            style={{
              display:"flex", alignItems:"center", gap:12, padding:"10px 0",
              borderTop: idx>0 ? "1px solid #f5f5f5" : "none", cursor:"pointer",
            }}>
            <span style={{ fontSize:22 }}>{m.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", margin:"0 0 1px" }}>{m.label}</p>
              <p style={{ fontSize:11, color:"#999", margin:0 }}>{m.desc}</p>
            </div>
            <div style={{
              width:20, height:20, borderRadius:"50%",
              border: payMethod===m.id ? "none" : "2px solid #ddd",
              background: payMethod===m.id ? "#D4531C" : "white",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>
              {payMethod===m.id && <div style={{ width:8, height:8, borderRadius:"50%", background:"white" }} />}
            </div>
          </div>
        ))}
      </div>

      {/* NOTE */}
      <div style={{ background:"white", margin:"10px 12px 0", borderRadius:16, padding:"12px 16px" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"#999", margin:"0 0 8px" }}>GHI CHU</p>
        <textarea
          placeholder="Vi du: it da, nhieu toan, khong duong..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          style={{
            width:"100%", border:"1.5px solid #f0f0f0", borderRadius:10,
            padding:"8px 10px", fontSize:12, color:"#333",
            resize:"none", outline:"none", boxSizing:"border-box",
          }}
        />
      </div>

      {/* TOTAL + ORDER */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"white", borderTop:"1px solid #f0f0f0",
        padding:"12px 16px 28px",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:13, color:"#666" }}>Tong cong ({count} mon)</span>
          <span style={{ fontSize:18, fontWeight:900, color:"#D4531C" }}>{fmt(total)}</span>
        </div>
        {error && <p style={{ fontSize:12, color:"red", margin:"0 0 8px", textAlign:"center" }}>{error}</p>}
        <button
          onClick={handleOrder}
          disabled={loading}
          style={{
            width:"100%", padding:"14px", borderRadius:14,
            background: loading ? "#ddd" : "#D4531C",
            color:"white", border:"none",
            fontSize:15, fontWeight:900,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Dang dat hang..." : "Dat hang ngay"}
        </button>
      </div>
    </div>
  );
}
