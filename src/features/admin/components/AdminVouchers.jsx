import { useEffect, useState } from "react";
import apiClient from "@/infra/api/apiClient";

const emptyForm = { title:"", description:"", image:"", discount_type:"percent", discount_value:"", quantity:"" };

export default function AdminVouchers({ token }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const h = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    apiClient.get("/admin/vouchers/list", { headers: h })
      .then(r => setVouchers(r.data?.data || []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showMsg = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000); };

  const create = async () => {
    try {
      await apiClient.post("/admin/vouchers/create", form, { headers: h });
      showMsg("✅ Tạo voucher thành công!");
      setForm(emptyForm);
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.response?.data?.error || e.message)); }
  };

  const toggle = async (id) => {
    try {
      await apiClient.patch(`/admin/vouchers/${id}/toggle`, {}, { headers: h });
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
  };

  const remove = async (id, title) => {
    if (!window.confirm(`Xóa voucher "${title}"? Không thể hoàn tác.`)) return;
    try {
      await apiClient.delete(`/admin/vouchers/${id}`, { headers: h });
      showMsg("✅ Đã xóa voucher");
      load();
    } catch(e) { showMsg("❌ " + (e.response?.data?.message || e.message)); }
  };

  const inputStyle = { background:"#2a2a38", border:"1px solid #333", borderRadius:8,
    padding:"9px 12px", color:"white", fontSize:13, width:"100%" };
  const labelStyle = { color:"#888", fontSize:11, fontWeight:700, margin:"0 0 4px", display:"block" };

  return (
    <div>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 20px" }}>🎟 Quản lý Voucher</h2>

      {/* Create form */}
      <div style={{ background:"#1a1a24", borderRadius:14, padding:"20px",
        marginBottom:20, border:"1px solid #2a2a38" }}>
        <p style={{ color:"white", fontWeight:800, margin:"0 0 4px" }}>➕ Tạo voucher mới</p>
        <p style={{ color:"#666", fontSize:12, margin:"0 0 14px" }}>
          Voucher hiển thị cho khách trong app. Lưu ý: voucher hiện chưa liên kết với hệ thống POS/CRM —
          khi khách dùng tại quán, nhân viên cần kiểm tra mã/voucher trong app và áp dụng giảm giá thủ công trên hệ thống bán hàng.
        </p>
        {msg && <div style={{ color: msg.includes("✅") ? "#4CAF50" : "#ff6b6b",
          fontSize:13, marginBottom:10 }}>{msg}</div>}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <label style={labelStyle}>Tên voucher *</label>
            <input placeholder="VD: Giảm 30K cho đơn từ 99K" value={form.title}
              onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Mô tả</label>
            <input placeholder="VD: Áp dụng cho mọi đơn hàng" value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={inputStyle}/>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <label style={labelStyle}>Loại giảm giá *</label>
            <select value={form.discount_type} onChange={e=>setForm(f=>({...f,discount_type:e.target.value}))} style={inputStyle}>
              <option value="percent">Phần trăm %</option>
              <option value="fixed">Số tiền cố định (đ)</option>
              <option value="free_ship">Miễn phí ship</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              Giá trị giảm * {form.discount_type === "percent" ? "(%)" : form.discount_type === "fixed" ? "(VNĐ)" : ""}
            </label>
            <input type="number" placeholder={form.discount_type === "percent" ? "VD: 50" : "VD: 30000"}
              value={form.discount_value}
              onChange={e=>setForm(f=>({...f,discount_value:e.target.value}))}
              disabled={form.discount_type === "free_ship"} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Số lượng (để trống = không giới hạn)</label>
            <input type="number" placeholder="VD: 100" value={form.quantity}
              onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} style={inputStyle}/>
          </div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Link ảnh (tùy chọn)</label>
          <input placeholder="https://..." value={form.image}
            onChange={e=>setForm(f=>({...f,image:e.target.value}))} style={inputStyle}/>
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
          vouchers.map((v) => {
            const discountLabel = v.discount_type === "percent" ? `${v.discount_value}%`
              : v.discount_type === "fixed" ? `${Number(v.discount_value).toLocaleString('vi-VN')}đ`
              : "Miễn ship";
            return (
              <div key={v.id} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"10px 0", borderBottom:"1px solid #2a2a38" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>{v.title}</p>
                  {v.description && <p style={{ color:"#888", fontSize:11, margin:"2px 0 0" }}>{v.description}</p>}
                </div>
                <span style={{ color:"#FFD700", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>{discountLabel}</span>
                <span style={{ color:"#aaa", fontSize:11, whiteSpace:"nowrap" }}>
                  {v.quantity != null ? `${v.remaining ?? 0}/${v.quantity}` : "Không giới hạn"}
                </span>
                <button onClick={() => toggle(v.id)}
                  style={{ background:"none", border:"1px solid", borderColor: v.active ? "#4CAF50" : "#ff6b6b",
                    color: v.active ? "#4CAF50" : "#ff6b6b", borderRadius:6, padding:"4px 10px",
                    fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {v.active ? "Hoạt động" : "Đã tắt"}
                </button>
                <button onClick={() => remove(v.id, v.title)}
                  style={{ background:"none", border:"1px solid #444", color:"#888",
                    borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>
                  Xóa
                </button>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
