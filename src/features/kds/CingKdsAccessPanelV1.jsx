import React,{useEffect,useState} from "react";
import apiClient from "@/infra/api/apiClient";
const rights=[["enabled","Bật quyền"],["can_read","Xem vận hành KDS"],["can_prepare","Đánh dấu pha xong"],["can_serve","Đánh dấu đã trả"],["can_manage_policy","Cấu hình SLA"]];
export default function CingKdsAccessPanelV1({token,branch}){
 const [audits,setAudits]=useState([]);
 const [rows,setRows]=useState([]),[busy,setBusy]=useState(""),[notice,setNotice]=useState("");
 const params={pos_parent:branch.pos_parent,pos_id:branch.pos_id};const headers={Authorization:`Bearer ${token}`};
 const load=async(signal)=>{
  const {data}=await apiClient.get("/admin/kds/access",{params,headers,signal});
  if(!data?.success || !data.data?.can_manage_access || !Array.isArray(data.data.admins))throw Error();
  setAudits(data.data.audit||[]);
  setRows(data.data.admins.map(row=>({...row,draft:{...row.grant}})));
 };
 useEffect(()=>{const controller=new AbortController();setRows([]);setNotice("");load(controller.signal).catch(()=>{if(!controller.signal.aborted)setNotice("Không thể tải quyền. Chỉ Super Admin đang hoạt động được quản lý quyền KDS.");});return()=>controller.abort();},[token,branch.pos_parent,branch.pos_id]);
 async function save(row){if(busy)return;setBusy(row.admin_id);setNotice("");
  try{const {data}=await apiClient.put("/admin/kds/access",{admin_id:row.admin_id,grant:row.draft,expected_grant:row.grant,action_key:crypto.randomUUID()},{params,headers});
   if(!data?.success)throw Error();await load();setNotice("Đã lưu quyền và ghi lịch sử thay đổi.");
  }catch{setNotice("Chưa xác nhận lưu quyền. Hãy tải lại quyền trước khi thử tiếp.");}finally{setBusy("");}
 }
 return <section className="ckds-panel ckds-access-panel"><h2>Phân quyền KDS theo admin</h2>
  <p>Áp dụng cho {branch.pos_parent} · {branch.pos_id}. Chỉ Super Admin được cấp hoặc thu hồi quyền. Báo cáo và xuất file chỉ dành cho Super Admin.</p>
  {notice&&<p role="status" className="ckds-banner">{notice}</p>}
  <button type="button" onClick={()=>load().catch(()=>setNotice("Không thể tải lại quyền."))} disabled={Boolean(busy)}>Tải lại quyền</button>
  <div className="ckds-history-table"><table><thead><tr><th>Admin</th>{rights.map(([key,label])=><th key={key}>{label}</th>)}<th>Lưu</th></tr></thead>
  <tbody>{rows.map(row=><tr key={row.admin_id}><td><strong>{row.username}</strong><br/>{row.role} · {row.active?"Hoạt động":"Đã khóa"}</td>
   {rights.map(([key,label])=><td key={key}><input type="checkbox" aria-label={`${row.username}: ${label}`} checked={row.draft[key]}
    disabled={Boolean(busy)||(key==="can_manage_policy"&&row.role!=="super_admin")||(key==="enabled"&&!row.active&&!row.draft.enabled)}
    onChange={event=>setRows(items=>items.map(item=>item.admin_id!==row.admin_id?item:{...item,draft:key==="can_read"&&!event.target.checked?
     {...item.draft,can_read:false,can_prepare:false,can_serve:false,can_manage_policy:false}:{...item.draft,[key]:event.target.checked,...(["can_prepare","can_serve","can_manage_policy"].includes(key)&&event.target.checked?{can_read:true}:{})}}))}/></td>)}
    <td><button type="button" disabled={Boolean(busy)} onClick={()=>save(row)}>{busy===row.admin_id?"Đang lưu…":"Lưu quyền"}</button></td>
  </tr>)}</tbody></table></div>
 <h3>Lịch sử thay đổi quyền gần nhất</h3>
  {audits.length?<ul>{audits.map((item,index)=><li key={index}>{new Date(item.changed_at).toLocaleString("vi-VN")} · Admin {item.actor_id} thay đổi quyền tài khoản {item.target_admin_id}: {Object.entries(item.new_grant).filter(([,value])=>value).map(([key])=>rights.find(([name])=>name===key)?.[1]||key).join(", ")||"Thu hồi các quyền"}</li>)}</ul>:<p>Chưa có thay đổi quyền qua màn này.</p>}
 </section>;
}
