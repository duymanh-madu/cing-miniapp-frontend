import test from 'node:test';
import assert from 'node:assert/strict';
import {collectCoinCsvV17} from './adminCoinCsvV17.js';

const ID1='123e4567-e89b-12d3-a456-426614174001';
const ID2='123e4567-e89b-12d3-a456-426614174002';
const ID3='123e4567-e89b-12d3-a456-426614174003';
const MEMBER='123e4567-e89b-12d3-a456-426614174004';
const COMMAND='123e4567-e89b-12d3-a456-426614174005';
const DATE='2026-10-10T04:00:00Z';
const TO='2026-10-10T05:00:00.000Z';

const totals={
  ledgerCount:3,
  issued:10,
  spent:3,
  convertedVnd:10000
};

function row(id,operation,delta,before,after,price){
  return {
    id,
    member_id:MEMBER,
    command_id:COMMAND,
    created_at:DATE,
    operation,
    coin_delta:delta,
    coin_before:before,
    coin_after:after,
    item_delta:operation==='buy_loudspeaker'?1:
      operation==='use_loudspeaker'?-1:0,
    price_vnd:price,
    wallet_match_status:operation==='convert'
      ?'MATCHED':'NOT_APPLICABLE',
    wallet_transaction_id:operation==='convert'?ID3:null,
    wallet_transaction_type:operation==='convert'?'payment':null,
    wallet_reference_type:operation==='convert'
      ?'cing_plaza_coin_v16':null,
    wallet_reference_id:operation==='convert'?COMMAND:null,
    wallet_amount:operation==='convert'?-price:null
  };
}

const a=row(ID1,'convert',10,0,10,10000);
const b=row(ID2,'buy_loudspeaker',-3,10,7,0);
const c=row(ID3,'use_loudspeaker',0,7,7,0);

const opts={
  to:TO,
  now:()=>Date.parse('2026-10-11T00:00:00Z')
};

test('CSV fetches all pages and reconciles exact totals',async()=>{
  const calls=[];
  const result=await collectCoinCsvV17({
    ...opts,
    getPage:async params=>{
      calls.push(params);
      return calls.length===1
        ?{period:totals,items:[a,b],nextCursor:'page2'}
        :{period:totals,items:[c],nextCursor:null};
    }
  });

  assert.equal(calls.length,2);
  assert.equal(calls[1].cursor,'page2');
  assert.equal(calls[0].limit,'100');
  assert.equal(calls[0].to,TO);
  assert.equal(result.rows,3);
  assert.equal(result.period.issued,10);
  assert.ok(result.csv.startsWith('\ufeff'));
  assert.equal(result.csv.trim().split('\r\n').length,4);
  assert.match(result.csv,/Mã giao dịch Wallet/);
});

test('missing pagination page cannot generate CSV',async()=>{
  await assert.rejects(
    collectCoinCsvV17({
      ...opts,
      getPage:async()=>({
        period:totals,
        items:[a,b],
        nextCursor:null
      })
    }),
    /TOTALS_MISMATCH/
  );
});

test('duplicate transaction is never silently exported',async()=>{
  let index=0;

  await assert.rejects(
    collectCoinCsvV17({
      ...opts,
      getPage:async()=>{
        index++;
        return index===1
          ?{period:totals,items:[a,b],nextCursor:'next'}
          :{period:totals,items:[a],nextCursor:null};
      }
    }),
    /DUPLICATE_TRANSACTION/
  );
});

test('changed period totals invalidate the export',async()=>{
  let index=0;

  await assert.rejects(
    collectCoinCsvV17({
      ...opts,
      getPage:async()=>{
        index++;
        return index===1
          ?{period:totals,items:[a],nextCursor:'next'}
          :{
            period:{...totals,ledgerCount:4},
            items:[b,c],
            nextCursor:null
          };
      }
    }),
    /PERIOD_CHANGED_DURING_EXPORT/
  );
});

test('incorrect sum invalidates export even if count matches',async()=>{
  await assert.rejects(
    collectCoinCsvV17({
      ...opts,
      getPage:async()=>({
        period:{...totals,issued:11},
        items:[a,b,c],
        nextCursor:null
      })
    }),
    /TOTALS_MISMATCH/
  );
});

test('fabricated Wallet MATCHED evidence is rejected',async()=>{
  await assert.rejects(
    collectCoinCsvV17({
      ...opts,
      getPage:async()=>({
        period:{...totals,ledgerCount:1,spent:0},
        items:[{...a,wallet_amount:-9000}],
        nextCursor:null
      })
    }),
    /FABRICATED_WALLET_MATCH/
  );
});

test('repeated cursor is rejected',async()=>{
  let index=0;

  await assert.rejects(
    collectCoinCsvV17({
      ...opts,
      getPage:async()=>{
        index++;
        return {
          period:totals,
          items:index===1?[a]:[b],
          nextCursor:'repeated'
        };
      }
    }),
    /CURSOR_CYCLE/
  );
});

test('export end time is frozen before pagination',async()=>{
  const observed=[];

  await collectCoinCsvV17({
    now:()=>Date.parse(TO),
    getPage:async params=>{
      observed.push(params);
      return {
        period:{ledgerCount:0,issued:0,spent:0,convertedVnd:0},
        items:[],
        nextCursor:null
      };
    }
  });

  assert.equal(observed[0].to,TO);
});

test('invalid range is rejected without querying the API',async()=>{
  let called=false;

  await assert.rejects(
    collectCoinCsvV17({
      from:'2026-10-11T00:00:00Z',
      to:TO,
      now:()=>Date.parse('2026-10-12T00:00:00Z'),
      getPage:async()=>{
        called=true;
        return {};
      }
    }),
    /INVALID_RANGE/
  );

  assert.equal(called,false);
});
