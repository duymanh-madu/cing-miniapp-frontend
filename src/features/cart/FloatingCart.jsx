import { useNavigate, useLocation } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p) + "d";

export default function FloatingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const items    = useCartStore(s => s.items);
  const count    = items.reduce((s,i) => s+i.qty, 0);
  const total    = items.reduce((s,i) => s+(i.price||0)*i.qty, 0);

  const hidden = ["/checkout","/order-success"].some(p => location.pathname.startsWith(p));
  if (!count || hidden) return null;

  return (
    <div onClick={() => navigate("/checkout")} style={{
      position:"fixed", bottom:72, left:16, right:16, zIndex:50,
      background:"#D4531C", borderRadius:16, padding:"12px 16px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      boxShadow:"0 4px 20px rgba(212,83,28,0.4)", cursor:"pointer",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          background:"rgba(255,255,255,0.25)", borderRadius:10,
          width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:900, color:"white",
        }}>{count}</div>
        <span style={{ color:"white", fontSize:13, fontWeight:700 }}>Thanh toán</span>
      </div>
      <span style={{ color:"white", fontSize:14, fontWeight:900 }}>{fmt(total)}</span>
    </div>
  );
}
