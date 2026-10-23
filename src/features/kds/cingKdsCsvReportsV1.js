const cell=value=>{
  if(value==null)return '""';
  let text=String(value);
  // Excel formula prevention; text fields remain text even if a POS name begins with =.
  if(typeof value!=="number" && /^[\s]*[=+@-]/.test(text))text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
};
const csv=rows=>"\ufeff"+rows.map(row=>row.map(cell).join(",")).join("\r\n");
const date=value=>value?new Date(value).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",hour12:false}):"";
export function buildKdsCsvReportV1(snapshot,kind="completed"){
 if(!snapshot?.branch || !Array.isArray(snapshot.history) || !snapshot.history_range)throw Error("KDS_REPORT_NOT_READY");
 const metadata=[["Chi nhánh",snapshot.branch.pos_parent,snapshot.branch.pos_id],
  ["Khoảng ngày hoàn thành (giờ Việt Nam)",date(snapshot.history_range.from),date(snapshot.history_range.to)],
  ["Bộ lọc phút phục vụ",snapshot.duration_filter?.minimum??"Không giới hạn",snapshot.duration_filter?.maximum??"Không giới hạn"],
  ["Dữ liệu lúc (giờ Việt Nam)",date(snapshot.sampled_at)]];
 if(kind==="completed")return csv([...metadata,["Hóa đơn","ID đơn","Bắt đầu","Trả xong","Phút phục vụ","Số phần/món","SLA"],
  ...snapshot.history.map(x=>[x.tran_no,x.order_id,date(x.started_at),date(x.completed_at),x.duration_minutes,x.cup_count,x.sla_severity])]);
 if(kind==="active")return csv([["Đang phục vụ tại thời điểm xuất",date(snapshot.sampled_at)],metadata[0],
  ["Hóa đơn","ID đơn","Bàn/thẻ","Tổng phần/món","Chưa pha xong","Đã pha chờ trả","Đã trả"],
  ...(snapshot.bills||[]).map(b=>[b.tran_no,b.order_id,[b.table_name,b.card_number].filter(Boolean).join(" · "),b.cups.length,
   b.cups.filter(c=>["pending","preparing"].includes(c.status)).length,b.cups.filter(c=>c.status==="prepared").length,b.cups.filter(c=>c.status==="served").length])]);
 if(kind!=="summary")throw Error("KDS_REPORT_KIND_INVALID");
 const rows=snapshot.history;const durations=rows.map(x=>x.duration_minutes).sort((a,b)=>a-b);
 const percentile=p=>durations.length?durations[Math.max(0,Math.ceil(durations.length*p)-1)]:"";
 return csv([...metadata,["Chỉ tiêu","Giá trị"],["Hóa đơn hoàn thành (sau bộ lọc thời gian phục vụ)",rows.length],
  ["Tổng phần/món",rows.reduce((sum,x)=>sum+x.cup_count,0)],["Trung bình phút",durations.length?durations.reduce((a,b)=>a+b,0)/durations.length:""],
  ["P90 phút",percentile(.9)],["P95 phút",percentile(.95)],["Đơn vượt SLA",rows.filter(x=>x.sla_severity!=="normal").length],
  ["Ngưỡng cảnh báo phút",snapshot.policy?.warning_minutes],["Ngưỡng nghiêm trọng phút",snapshot.policy?.critical_minutes]]);
}
export function downloadKdsCsvV1(snapshot,kind){
 const blob=new Blob([buildKdsCsvReportV1(snapshot,kind)],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=`cing-kds-${snapshot.branch.pos_id}-${kind}-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
