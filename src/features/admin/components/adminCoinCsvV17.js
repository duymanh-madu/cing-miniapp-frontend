const OPERATIONS=new Set([
  'convert','buy_loudspeaker','use_loudspeaker'
]);

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(message){
  throw new Error(`PLAZA_COIN_CSV_${message}`);
}

function integer(value){
  if(
    value===null||value===undefined||value===''||
    (typeof value!=='number'&&
      (typeof value!=='string'||!/^-?(0|[1-9]\d*)$/.test(value)))
  )fail('INVALID_NUMBER');

  const n=Number(value);
  if(!Number.isSafeInteger(n))fail('UNSAFE_NUMBER');
  return n;
}

function totals(value){
  if(!value||typeof value!=='object')fail('INVALID_TOTALS');

  return {
    ledgerCount:integer(value.ledgerCount),
    issued:integer(value.issued),
    spent:integer(value.spent),
    convertedVnd:integer(value.convertedVnd)
  };
}

function csvCell(value){
  let text=String(value??'');

  // Prevent spreadsheet-formula execution for text-origin fields.
  if(/^\s*[=+@]/.test(text)||
     (/^\s*-/.test(text)&&!/^-\d+$/.test(text))){
    text="'"+text;
  }

  return `"${text.replaceAll('"','""')}"`;
}

const COLUMNS=[
  ['created_at','Thời điểm'],
  ['id','Mã giao dịch Coin'],
  ['member_id','Mã thành viên'],
  ['command_id','Mã lệnh'],
  ['operation','Nghiệp vụ'],
  ['coin_delta','Biến động Coin'],
  ['coin_before','Coin trước'],
  ['coin_after','Coin sau'],
  ['item_delta','Biến động vật phẩm'],
  ['price_vnd','Giá trị quy đổi VND'],
  ['wallet_transaction_id','Mã giao dịch Wallet'],
  ['wallet_transaction_type','Loại giao dịch Wallet'],
  ['wallet_reference_type','Nguồn Wallet'],
  ['wallet_reference_id','Mã tham chiếu Wallet'],
  ['wallet_amount','Biến động Wallet VND'],
  ['wallet_match_status','Trạng thái đối soát']
];

function validateRow(row){
  if(!row||!UUID.test(String(row.id||''))||
     !UUID.test(String(row.member_id||''))||
     !UUID.test(String(row.command_id||''))||
     !Number.isFinite(Date.parse(row.created_at))||
     !OPERATIONS.has(row.operation)){
    fail('INVALID_ROW');
  }

  const delta=integer(row.coin_delta);
  const before=integer(row.coin_before);
  const after=integer(row.coin_after);
  const price=integer(row.price_vnd);

  integer(row.item_delta);

  if(before<0||after<0||price<0||before+delta!==after){
    fail('INVALID_LEDGER_ARITHMETIC');
  }

  if(row.operation==='convert'){
    if(delta<=0||price!==delta*1000){
      fail('INVALID_CONVERSION');
    }

    if(![
      'MATCHED','MISSING_WALLET','MISMATCH'
    ].includes(row.wallet_match_status)){
      fail('INVALID_WALLET_EVIDENCE');
    }

    if(row.wallet_match_status==='MATCHED'){
      if(
        !UUID.test(String(row.wallet_transaction_id||''))||
        row.wallet_transaction_type!=='payment'||
        row.wallet_reference_type!=='cing_plaza_coin_v16'||
        row.wallet_reference_id!==row.command_id||
        integer(row.wallet_amount)!==-price
      ){
        fail('FABRICATED_WALLET_MATCH');
      }
    }
  }else{
    if(price!==0||
       (row.operation==='buy_loudspeaker'&&delta>=0)||
       (row.operation==='use_loudspeaker'&&delta!==0)){
      fail('INVALID_OPERATION_AMOUNT');
    }

    if(row.wallet_match_status!=='NOT_APPLICABLE'){
      fail('INVALID_WALLET_EVIDENCE');
    }
  }

  return {delta,price};
}

export async function collectCoinCsvV17({
  getPage,
  from='',
  to='',
  now=()=>Date.now(),
  onProgress=()=>{}
}){
  if(typeof getPage!=='function')fail('FETCH_REQUIRED');

  const start=from?Date.parse(from):null;
  const requestedEnd=to?Date.parse(to):null;
  const current=now();

  if(
    (from&&!Number.isFinite(start))||
    (to&&!Number.isFinite(requestedEnd))||
    !Number.isFinite(current)
  )fail('INVALID_RANGE');

  // Freeze the export range before the first page.
  // Later payments must not alter the export's expected totals.
  const effectiveEnd=new Date(
    requestedEnd===null
      ?current
      :Math.min(requestedEnd,current)
  ).toISOString();

  if(start!==null&&start>=Date.parse(effectiveEnd)){
    fail('INVALID_RANGE');
  }

  const params={
    limit:'100',
    to:effectiveEnd,
    ...(start!==null?{from:new Date(start).toISOString()}:{})
  };

  let cursor=null;
  let expected=null;
  let count=0;
  let issued=0;
  let spent=0;
  let convertedVnd=0;

  const seenIds=new Set();
  const seenCursors=new Set();
  const lines=[
    COLUMNS.map(([,label])=>csvCell(label)).join(',')
  ];

  do{
    const page=await getPage({
      ...params,
      ...(cursor?{cursor}:{})
    });

    if(!page||!Array.isArray(page.items)){
      fail('INVALID_PAGE');
    }

    const currentTotals=totals(page.period);

    if(currentTotals.ledgerCount<0||
       currentTotals.issued<0||
       currentTotals.spent<0||
       currentTotals.convertedVnd<0){
      fail('INVALID_TOTALS');
    }

    if(expected===null){
      expected=currentTotals;
    }else if(
      Object.keys(expected).some(
        key=>expected[key]!==currentTotals[key]
      )
    ){
      fail('PERIOD_CHANGED_DURING_EXPORT');
    }

    if(page.items.length>100){
      fail('OVERSIZED_PAGE');
    }

    if(page.items.length===0&&page.nextCursor){
      fail('EMPTY_PAGE_WITH_CURSOR');
    }

    for(const row of page.items){
      if(seenIds.has(row.id))fail('DUPLICATE_TRANSACTION');

      const {delta,price}=validateRow(row);

      seenIds.add(row.id);

      if(row.operation==='convert'){
        issued+=delta;
        convertedVnd+=price;
      }else if(row.operation==='buy_loudspeaker'){
        spent-=delta;
      }

      if(![
        issued,spent,convertedVnd
      ].every(Number.isSafeInteger)){
        fail('UNSAFE_TOTAL');
      }

      lines.push(
        COLUMNS.map(([key])=>csvCell(row[key])).join(',')
      );

      count++;

      if(count>expected.ledgerCount){
        fail('EXCESS_TRANSACTIONS');
      }
    }

    onProgress({
      loaded:count,
      expected:expected.ledgerCount
    });

    const next=page.nextCursor;

    if(next!==null&&next!==undefined){
      if(typeof next!=='string'||!next||
         seenCursors.has(next)){
        fail('CURSOR_CYCLE');
      }

      seenCursors.add(next);
      cursor=next;
    }else{
      cursor=null;
    }

    // At least one transaction must advance every continued page.
    // Prevent endless loops caused by malformed pagination.
    if(seenCursors.size>expected.ledgerCount+1){
      fail('PAGINATION_NOT_TERMINATING');
    }

  }while(cursor);

  if(
    count!==expected.ledgerCount||
    issued!==expected.issued||
    spent!==expected.spent||
    convertedVnd!==expected.convertedVnd
  ){
    fail('TOTALS_MISMATCH');
  }

  return {
    csv:'\ufeff'+lines.join('\r\n')+'\r\n',
    rows:count,
    period:expected,
    snapshotTo:effectiveEnd
  };
}
