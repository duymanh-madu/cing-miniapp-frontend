import { useState } from "react";
import apiClient from "@/infra/api/apiClient";

// Danh sách biến ZBS Zalo hỗ trợ
const ZBS_VARS = [
  "voucher_code","campaign_name","voucher_name","start_date","expire_date",
  "content","customer_name","customer_phone","age","membership_type",
  "membership_point","membership_point_amount","membership_payment_amount",
  "birthday","birth_month","first_visit","last_visit","visit_times",
  "store_name","tran_id","tran_date","total_amount","bill_point",
  "order_note","address",
];

export default function ZbsTemplateManager({ token, templates, onSaved }) {
  const [list, setList]     = useState(templates || []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/admin/cdp/zbs-templates", { templates: list }, { headers: h });
      onSaved(list);
    } catch(e) { alert("Lỗi: " + e.message); }
    setSaving(false);
  };

  const addTemplate = () => {
    const newTpl = { id: "", name: "", description: "", vars: [] };
    setList(p => [...p, newTpl]);
    setEditing(list.length);
  };

  const update = (idx, field, val) => {
    setList(p => p.map((t,i) => i===idx ? {...t, [field]:val} : t));
  };

  const toggleVar = (idx, v) => {
    setList(p => p.map((t,i) => i===idx ? {
      ...t, vars: t.vars.includes(v) ? t.vars.filter(x=>x!==v) : [...t.vars, v]
    } : t));
  };

  return (
    <div style={{ background:"#0d0d14", borderRadius:10, padding:"12px", marginBottom:10 }}>
      <p style={{ color:"#a78bfa", fontSize:11, fontWeight:800, margin:"0 0 10px", letterSpacing:1 }}>
        QUẢN LÝ MẪU TIN ZBS
      </p>

      {list.map((t, idx) => (
        <div key={idx} style={{ background:"#1a1a24", borderRadius:8, padding:"10px", marginBottom:8,
          border:"1px solid #2a2a38" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <p style={{ color:"white", fontSize:11, fontWeight:700, margin:0 }}>Mẫu {idx+1}</p>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setEditing(editing===idx?null:idx)}
                style={{ background:"none", border:"1px solid #333", color:"#888",
                  borderRadius:4, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>
                {editing===idx?"Thu gọn":"Sửa"}
              </button>
              <button onClick={() => setList(p=>p.filter((_,i)=>i!==idx))}
                style={{ background:"none", border:"1px solid #f44336", color:"#f44336",
                  borderRadius:4, padding:"2px 8px", fontSize:10, cursor:"pointer" }}>Xóa</button>
            </div>
          </div>

          {editing===idx ? (
            <>
              <div style={{ marginBottom:6 }}>
                <p style={{ color:"#666", fontSize:10, margin:"0 0 3px" }}>Template ID (từ Zalo OA Manager)</p>
                <input value={t.id} onChange={e=>update(idx,"id",e.target.value)}
                  placeholder="VD: 123456"
                  style={{ width:"100%", background:"#2a2a38", border:"1px solid #7c3aed",
                    borderRadius:6, padding:"6px 8px", color:"white", fontSize:12, boxSizing:"border-box" }}/>
              </div>
              <div style={{ marginBottom:6 }}>
                <p style={{ color:"#666", fontSize:10, margin:"0 0 3px" }}>Tên mẫu</p>
                <input value={t.name} onChange={e=>update(idx,"name",e.target.value)}
                  placeholder="VD: Gửi voucher sinh nhật"
                  style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                    borderRadius:6, padding:"6px 8px", color:"white", fontSize:12, boxSizing:"border-box" }}/>
              </div>
              <div style={{ marginBottom:8 }}>
                <p style={{ color:"#666", fontSize:10, margin:"0 0 3px" }}>Mô tả</p>
                <input value={t.description||""} onChange={e=>update(idx,"description",e.target.value)}
                  placeholder="Mô tả ngắn về mẫu tin này"
                  style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
                    borderRadius:6, padding:"6px 8px", color:"white", fontSize:12, boxSizing:"border-box" }}/>
              </div>
              <div>
                <p style={{ color:"#666", fontSize:10, margin:"0 0 6px" }}>
                  Biến cần điền thêm (biến tự động: customer_name, membership_type, visit_times, ...)
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {ZBS_VARS.map(v => {
                    const auto = ['customer_name','customer_phone','membership_type','membership_point',
                      'membership_point_amount','membership_payment_amount','visit_times','store_name',
                      'first_visit','last_visit','birthday','birth_month'].includes(v);
                    if (auto) return null;
                    const active = t.vars.includes(v);
                    return (
                      <button key={v} onClick={() => toggleVar(idx,v)} style={{
                        background: active ? "rgba(124,58,237,0.3)" : "#2a2a38",
                        border: `1px solid ${active?"#7c3aed":"#333"}`,
                        color: active ? "#a78bfa" : "#555",
                        borderRadius:4, padding:"3px 7px", fontSize:9,
                        cursor:"pointer", fontWeight: active?700:400
                      }}>{v}</button>
                    );
                  })}
                </div>
                <p style={{ color:"#444", fontSize:9, margin:"6px 0 0" }}>
                  Các biến tự động: customer_name, membership_type, membership_point, visit_times, store_name, ...
                </p>
              </div>
            </>
          ) : (
            <div>
              <p style={{ color:"#a78bfa", fontSize:11, fontWeight:700, margin:"0 0 2px" }}>{t.name||"Chưa đặt tên"}</p>
              <p style={{ color:"#555", fontSize:10, margin:0 }}>ID: {t.id||"?"} · Biến thêm: {t.vars?.join(", ")||"không có"}</p>
            </div>
          )}
        </div>
      ))}

      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        <button onClick={addTemplate} style={{ flex:1, background:"rgba(124,58,237,0.15)",
          border:"1px dashed #7c3aed", color:"#a78bfa", borderRadius:8,
          padding:"8px", fontSize:12, cursor:"pointer" }}>
          + Thêm mẫu
        </button>
        <button onClick={save} disabled={saving} style={{ flex:1, background:"#7c3aed",
          border:"none", color:"white", borderRadius:8, padding:"8px",
          fontSize:12, fontWeight:700, cursor:"pointer" }}>
          {saving ? "Đang lưu..." : "💾 Lưu"}
        </button>
      </div>
    </div>
  );
}
