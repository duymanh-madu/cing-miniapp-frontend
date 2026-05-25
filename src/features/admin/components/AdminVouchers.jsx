import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

export default function AdminVouchers({ token }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code:"", discount:0, type:"percent", min_order:0,
    max_uses:100, expires_at:"", description:"" });
  const [msg, setMsg] = useState("");
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/vouchers/admin/list", { headers: h })
      .then(r => setVouchers(r.data?.data || []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    try {
      await apiClient.post("/vouchers/admin/create", form, { headers: h });
      setMsg("✅ Tạo voucher thành công!");
      setForm({ code:"", discount:0, type:"percent", min_order:0, max_uses:100, expires_at:"", description:"" });
    } catch(e) { setMsg("❌ " + (e.response?.data?.message || e.message)); }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>🎟 Quản lý Voucher</h2>
      
      {/* Create form */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
        marginBottom:20, border:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontWeight:800, margin:"0 0 14px" }}>➕ Tạo voucher mới</p>
        {msg && <div style={{ color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b",
          fontSize:13, marginBottom:10 }}>{msg}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[
            ["code","Mã voucher","text"],["discount","Giảm giá","number"],
            ["min_order","Đơn tối thiểu","number"],["max_uses","Số lượt dùng","number"],
          ].map(([k,ph,t]) => (
            <input key={k} type={t} placeholder={ph} value={form[k]}
              onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
              style={{ background:"#2a2a38", border:"1px solid #333", borderRadius:8,
                padding:"9px 12px", color:"white", fontSize:13 }}/>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
            style={{ background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"9px 12px", color:"white", fontSize:13 }}>
            <option value="percent">Phần trăm %</option>
            <option value="fixed">Số tiền cố định</option>
            <option value="free_ship">Miễn ship</option>
          </select>
          <input type="datetime-local" value={form.expires_at}
            onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}
            style={{ background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"9px 12px", color:"white", fontSize:13 }}/>
          <input placeholder="Mô tả" value={form.description}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            style={{ background:"#2a2a38", border:"1px solid #333", borderRadius:8,
              padding:"9px 12px", color:"white", fontSize:13 }}/>
        </div>
        <button onClick={create}
          style={{ background:"#D4531C", border:"none", color:"white",
            borderRadius:8, padding:"10px 24px", fontWeight:700, cursor:"pointer" }}>
          Tạo Voucher
        </button>
      </div>

      {/* List */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px", border:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontWeight:800, margin:"0 0 14px" }}>Danh sách voucher</p>
        {loading ? <p style={{ color:"#666" }}>Đang tải...</p> :
          vouchers.length === 0 ? <p style={{ color:"#666", fontSize:13 }}>Chưa có voucher nào</p> :
          vouchers.map((v,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
              padding:"10px 0", borderBottom:"1px solid #2a2a38" }}>
              <span style={{ background:"rgba(212,83,28,0.2)", color:"#D4531C",
                borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700 }}>{v.code}</span>
              <span style={{ color:"white", flex:1, fontSize:13 }}>{v.description}</span>
              <span style={{ color:"#FFD700", fontSize:12 }}>{v.discount}{v.type==="percent"?"%":""}</span>
              <span style={{ color: v.active ? "#4CAF50" : "#ff6b6b", fontSize:11 }}>
                {v.active ? "Hoạt động" : "Tắt"}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
