import test from 'node:test';import assert from 'node:assert/strict';
import {compactKdsLocationV1,splitKdsItemLabelV1} from '../cingKdsCompactLabelsV1.js';
import {adaptKdsOperationsSnapshotV1} from '../cingKdsOperationsSessionV1.js';
test('compact location removes only an exact duplicate POS label and retains unknown/custom tables',()=>{
 assert.equal(compactKdsLocationV1('THẺ RUNG 04 - THẺ RUNG - TẠI CHỖ'),'Thẻ 04 · tại chỗ');
 assert.equal(compactKdsLocationV1('Bàn sân vườn - ghi chú'),'Bàn sân vườn - ghi chú');
});
test('item label keeps notes and total modifier quantity without dividing shared toppings across cups',()=>{
 assert.deepEqual(splitKdsItemLabelV1('TRÀ NHO — ít đá · Topping TOÀN DÒNG (3 phần): Trân châu ×2'),{name:'TRÀ NHO — ít đá',detail:'Topping chung 3 phần: Trân châu ×2'});
 assert.deepEqual(splitKdsItemLabelV1('CACAO KEM TRỨNG TCDD L'),{name:'CACAO KEM TRỨNG TCDD L',detail:''});
});
test('report capability fails closed unless database explicitly grants it',()=>{
 const branch={pos_parent:'BRAND-DQIR',pos_id:'109664'};const data={success:true,branch,sampled_at:'2026-10-23T07:00:00Z',preparation:[],serving:[],history:[],alerts:[],performance:[],capabilities:{}};
 assert.equal(adaptKdsOperationsSnapshotV1(data,branch).canReport,false);data.capabilities.can_report=true;
 assert.equal(adaptKdsOperationsSnapshotV1(data,branch).canReport,true);
});
