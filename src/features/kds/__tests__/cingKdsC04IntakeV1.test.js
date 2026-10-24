import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {adaptKdsOperationsSnapshotV1} from "../cingKdsOperationsSessionV1.js";
import {buildKdsBillBoardV1} from "../cingKdsBillBoardV1.js";
const branch={pos_parent:"BRAND-DQIR",pos_id:"109664"};
function fixture(){return {success:true,branch,sampled_at:"2026-10-24T10:00:00Z",history:[],alerts:[],performance:[],capabilities:{transitions_enabled:true,can_report:false},policy:{},serving:[],preparation:[
 {cup_id:"c",order_id:"o",status:"pending",version:0,item_name:"Drink",elapsed_minutes:1,severity:"normal",payment_verification:"pending_verification"}],
 bills:[{order_id:"o",tran_no:"240151",payment_verification:"pending_verification",cups:[{cup_id:"c",status:"pending",version:0,item_name:"Drink"}]}]};}
test("unpaid bill remains actionable only with server version and transition capability",()=>{
 const s=adaptKdsOperationsSnapshotV1(fixture(),branch);assert.equal(s.preparation[0].payment_verification,"pending_verification");assert.equal(s.preparation[0].transition_ready,true);assert.equal(s.canReport,false);
 const b=buildKdsBillBoardV1({preparation:s.preparation,bills:s.bills});assert.equal(b[0].payment_verification,"pending_verification");
 assert.equal(adaptKdsOperationsSnapshotV1({...fixture(),capabilities:{}},branch).preparation[0].transition_ready,false);
});
test("source cancellation warnings are retained but malformed lists fail before publish",()=>{
 const row={cup_id:"cancelled",item_name:"Drink",prior_status:"prepared",occurred_at:"2026-10-24T09:59:00Z"};
 assert.deepEqual(adaptKdsOperationsSnapshotV1({...fixture(),source_cancellations:[row]},branch).source_cancellations,[row]);
 for(const value of [{},[null],[{...row,prior_status:"invalid"}],Array(51).fill(row)])assert.throws(()=>adaptKdsOperationsSnapshotV1({...fixture(),source_cancellations:value},branch),/CANCELLATIONS_INVALID/);
});
test("UI labels payment separately and warns about cancellation after preparation or serving",()=>{
 const page=fs.readFileSync(new URL('../CingKdsProPage.jsx',import.meta.url),'utf8');
 const container=fs.readFileSync(new URL('../CingKdsOperationsContainerV1.jsx',import.meta.url),'utf8');
 assert.ok(page.includes('Chưa xác nhận thanh toán'));assert.ok(page.includes('Đã thanh toán'));
 assert.ok(container.includes('đã pha trước khi hủy'));assert.ok(container.includes('đã trả trước khi hủy'));
});
