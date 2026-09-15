import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";


const root =
  process.cwd();

const read =
  relative =>
    fs.readFileSync(
      path.join(
        root,
        relative
      ),
      "utf8"
    );

const counter =
  read(
    "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
  );

const api =
  read(
    "src/features/admin/wallet-pos/adminWalletPosApi.js"
  );

const statement =
  read(
    "src/features/wallet/components/WalletStatement.jsx"
  );


test(
  "READY surface is cashier-first with local numeric keypad",
  () => {
    for (
      const key
      of [
        '"1"',
        '"9"',
        '"⌫"',
        '"000"',
      ]
    ) {
      assert.ok(
        counter.includes(
          key
        )
      );
    }

    assert.match(
      counter,
      /appendAmountDigits/
    );

    assert.match(
      counter,
      /TỔNG TIỀN TRÊN iPOS/
    );
  }
);


test(
  "typing amount performs no network request",
  () => {
    const start =
      counter.indexOf(
        "const pressKey"
      );

    const end =
      counter.indexOf(
        "const createQr",
        start
      );

    const body =
      counter.slice(
        start,
        end
      );

    assert.doesNotMatch(
      body,
      /apiClient|createWalletPosManualPayment|fetchCurrentWalletPosManualSession|recoverWalletPosQr/
    );
  }
);


test(
  "manual payment is exactly one frontend create request",
  () => {
    const start =
      counter.indexOf(
        "const createQr"
      );

    const end =
      counter.indexOf(
        "const nextTransaction",
        start
      );

    const body =
      counter.slice(
        start,
        end
      );

    const matches =
      body.match(
        /createWalletPosManualPayment\s*\(/g
      ) || [];

    assert.equal(
      matches.length,
      1
    );

    assert.doesNotMatch(
      body,
      /fetch\(|axios|iPOS|Foodbook/
    );
  }
);


test(
  "request id is reused for retries and reset only when attempt changes",
  () => {
    assert.match(
      counter,
      /requestIdRef\.current\s*\|\|\s*createRequestId\(\)/
    );

    assert.match(
      counter,
      /requestIdRef\.current\s*=\s*requestId/
    );

    assert.match(
      counter,
      /changeAmount[\s\S]*requestIdRef\.current\s*=\s*null/
    );
  }
);


test(
  "duplicate create tap is blocked",
  () => {
    assert.match(
      counter,
      /if\s*\(\s*submitting[\s\S]*\)\s*\{\s*return/
    );

    assert.match(
      counter,
      /disabled=\{[\s\S]*submitting/
    );
  }
);


test(
  "QR is rendered locally from backend capability",
  () => {
    assert.match(
      counter,
      /result\.qr_content/
    );

    assert.match(
      counter,
      /QRCode\.toDataURL/
    );
  }
);


test(
  "realtime preserves active-session authority while paid event accelerates terminal presentation",
  () => {
    const genericStart =
      counter.indexOf(
        "const handleRealtime"
      );

    const paidStart =
      counter.indexOf(
        "const handlePaidRealtime",
        genericStart
      );

    const attachStart =
      counter.indexOf(
        "const attach",
        paidStart
      );

    assert.ok(
      genericStart >= 0
    );

    assert.ok(
      paidStart > genericStart
    );

    assert.ok(
      attachStart > paidStart
    );

    const genericBlock =
      counter.slice(
        genericStart,
        paidStart
      );

    const paidBlock =
      counter.slice(
        paidStart,
        attachStart
      );

    // Non-terminal events remain notification-only.
    assert.doesNotMatch(
      genericBlock,
      /payload(?:\?\.|\.)status/
    );

    assert.doesNotMatch(
      genericBlock,
      /setCurrent\s*\(/
    );

    assert.match(
      genericBlock,
      /loadCurrent\s*\(/
    );

    // Canonical post-settlement PAID may retain receipt presentation.
    assert.match(
      paidBlock,
      /payload(?:\?\.|\.)status/
    );

    assert.match(
      paidBlock,
      /setLastPaidSession\s*\(/
    );

    assert.doesNotMatch(
      paidBlock,
      /setCurrent\s*\(/
    );

    assert.match(
      paidBlock,
      /handleRealtime\s*\(\s*\)/
    );
  }
);

test(
  "cashier does not see session picker or reconciliation state machine",
  () => {
    assert.doesNotMatch(
      counter,
      /selectedId|selectSession/
    );

    assert.doesNotMatch(
      counter,
      /reconciled|reconciliation_mismatch/
    );
  }
);


test(
  "customer POS history hides bill and reconciliation details",
  () => {
    assert.match(
      statement,
      /store_display_name[\s\S]*Thanh toán đơn hàng tại cửa hàng[\s\S]*storeDisplayName/
    );

    assert.doesNotMatch(
      statement,
      /Bill #/
    );

    assert.doesNotMatch(
      statement,
      /reconciliation/i
    );
  }
);


test(
  "manual API accepts only amount and request_id",
  () => {
    const start =
      api.indexOf(
        "createWalletPosManualPayment"
      );

    const body =
      api.slice(
        start
      );

    assert.match(
      body,
      /amount,[\s\S]*request_id:[\s\S]*requestId/
    );

    assert.doesNotMatch(
      body,
      /pos_parent|pos_id|sale_tran_id|bill_reference/
    );
  }
);
