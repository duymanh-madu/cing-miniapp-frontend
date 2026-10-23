export function buildKdsBillBoardV1({preparation=[],serving=[],bills=[],mode="preparation",query="",group="all"}) {
  const active=new Map([...preparation,...serving].map(c=>[c.cup_id,c]));
  const rows=new Map();
  for(const bill of bills){
    if(rows.has(bill.order_id))throw new Error("KDS_DUPLICATE_BILL");
    rows.set(bill.order_id,{...bill,cups:bill.cups.map(c=>({...c,...(active.get(c.cup_id)||{}),order_id:bill.order_id,
      tran_no:bill.tran_no,table_name:bill.table_name,card_number:bill.card_number}))});
  }
  // Backward-compatible display during backend-first rollout.
  for(const cup of active.values())if(!rows.has(cup.order_id))rows.set(cup.order_id,{order_id:cup.order_id,
    tran_no:cup.tran_no,table_name:cup.table_name,card_number:cup.card_number,cups:[]});
  for(const cup of active.values()){const bill=rows.get(cup.order_id);if(!bill.cups.some(c=>c.cup_id===cup.cup_id))bill.cups.push(cup);}
  const term=query.trim().toLocaleLowerCase("vi");
  return [...rows.values()].map(bill=>{
    const unfinished=bill.cups.filter(c=>["pending","preparing"].includes(c.status));
    const prepared=bill.cups.filter(c=>c.status==="prepared");
    const served=bill.cups.filter(c=>c.status==="served");
    return {...bill,total:bill.cups.length,unfinished:unfinished.length,ready:prepared.length,served:served.length,
      completed:prepared.length+served.length,progress:unfinished.length===bill.cups.length?"Chờ pha":unfinished.length?"Đã pha một phần":"Đã pha đủ",
      elapsed_minutes:Math.max(0,...bill.cups.map(c=>c.elapsed_minutes||0)),
      visibleCups:bill.cups.filter(c=>(mode!=="preparation"||["pending","preparing"].includes(c.status)) &&
        (group==="all"||c.item_group===group))};
  }).filter(bill=>bill.unfinished+bill.ready>0 && (mode!=="preparation"||bill.unfinished>0) && bill.visibleCups.length &&
    (!term||[bill.tran_no,bill.table_name,bill.card_number,...bill.cups.map(c=>c.item_name)].some(v=>String(v||"").toLocaleLowerCase("vi").includes(term))))
    .sort((a,b)=>b.elapsed_minutes-a.elapsed_minutes || a.order_id.localeCompare(b.order_id));
}
