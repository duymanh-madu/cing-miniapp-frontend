import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";


const ROOT =
  process.cwd();


function read(
  relative
) {
  return fs.readFileSync(
    path.join(
      ROOT,
      relative
    ),
    "utf8"
  );
}


const counter =
  read(
    "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
  );

const api =
  read(
    "src/features/admin/wallet-pos/adminWalletPosApi.js"
  );

const runtimeSocket =
  read(
    "src/runtime/socket/runtimeSocketClient.ts"
  );

const walletApi =
  read(
    "src/features/wallet/api/walletOverviewApi.js"
  );

const statement =
  read(
    "src/features/wallet/components/WalletStatement.jsx"
  );


test(
  "Counter QR recovery uses bounded backend read endpoint",
  () => {
    assert.match(
      api,
      /\/sessions\/\$\{encodeURIComponent\([\s\S]*\}\/qr/
    );

    assert.match(
      counter,
      /recoverWalletPosQr/
    );

    assert.match(
      counter,
      /recovered\.qr_content/
    );
  }
);


test(
  "Counter does not recreate payment intent when page reloads",
  () => {
    const recoveryStart =
      counter.indexOf(
        "const recover ="
      );

    const recoveryEnd =
      counter.indexOf(
        "async function renderQr",
        recoveryStart
      );

    assert.ok(
      recoveryStart >= 0,
      "QR recovery effect is missing"
    );

    assert.ok(
      recoveryEnd >
        recoveryStart,
      "QR recovery effect boundary is invalid"
    );

    const recoveryBlock =
      counter.slice(
        recoveryStart,
        recoveryEnd
      );

    assert.match(
      recoveryBlock,
      /recoverWalletPosQr\s*\(/
    );

    assert.doesNotMatch(
      recoveryBlock,
      /createWalletPosManualPayment\s*\(/
    );

    assert.doesNotMatch(
      recoveryBlock,
      /createIposPosPayment\s*\(/
    );
  }
);


test(
  "Counter binds exact shared runtime socket singleton",
  () => {
    assert.match(
      counter,
      /getRuntimeSocket/
    );

    assert.match(
      runtimeSocket,
      /let runtimeSocket:[\s\S]*Socket \| null/
    );

    assert.doesNotMatch(
      counter,
      /from "socket\.io-client"/
    );

    assert.doesNotMatch(
      counter,
      /\bio\s*\(/
    );
  }
);


test(
  "Counter listens to exact Wallet POS realtime transitions",
  () => {
    for (
      const event of [
        "wallet.pos.session.discovered",
        "wallet.pos.qr.ready",
        "wallet.pos.payment.paid",
        "wallet.pos.reconciliation.matched",
        "wallet.pos.reconciliation.alert",
      ]
    ) {
      assert.ok(
        counter.includes(
          `"${event}"`
        ),
        `missing ${event}`
      );
    }
  }
);


test(
  "socket listeners are cleaned up with same handler",
  () => {
    assert.match(
      counter,
      /socket\.on\([\s\S]*handleRealtime/
    );

    assert.match(
      counter,
      /socket\.off\([\s\S]*handleRealtime/
    );
  }
);


test(
  "1.5 second polling remains realtime fallback",
  () => {
    assert.match(
      counter,
      /POLL_INTERVAL_MS\s*=\s*1500/
    );

    assert.match(
      counter,
      /setInterval/
    );
  }
);


test(
  "Wallet transaction normalizer accepts customer-safe POS projection",
  () => {
    assert.match(
      walletApi,
      /pos_payment:/
    );

    assert.match(
      walletApi,
      /store_display_name:/
    );

    assert.match(
      walletApi,
      /row\.pos_payment[\s\S]*\.store_display_name/
    );

    for (
      const forbidden
      of [
        "bill_reference:",
        "pos_parent:",
        "pos_id:",
        "store_id:",
        "store_code:",
        "provider_request_key:",
        "payment_token_id:",
      ]
    ) {
      assert.equal(
        walletApi.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);

test(
  "Wallet statement uses customer-safe in-store payment copy",
  () => {
    assert.match(
      statement,
      /reference_type ===[\s\S]*"pos_payment_intent"/
    );

    assert.match(
      statement,
      /Cing Wallet/
    );

    assert.match(
      statement,
      /store_display_name[\s\S]*Thanh toán đơn hàng tại cửa hàng[\s\S]*storeDisplayName/
    );

    assert.doesNotMatch(
      statement,
      /Bill #\$\{bill\}/
    );
  }
);


test(
  "customer history does not expose payment token or provider request identity",
  () => {
    const combined =
      walletApi +
      "\n" +
      statement;

    assert.doesNotMatch(
      combined,
      /payment_token_id/
    );

    assert.doesNotMatch(
      combined,
      /provider_request_key/
    );
  }
);


test(
  "realtime payload never acts as canonical POS session authority",
  () => {
    const start =
      counter.indexOf(
        "const handleRealtime"
      );

    const end =
      counter.indexOf(
        "const attach",
        start
      );

    assert.ok(
      start >= 0,
      "handleRealtime must exist"
    );

    assert.ok(
      end > start,
      "realtime handler boundary must exist"
    );

    const block =
      counter.slice(
        start,
        end
      );

    assert.doesNotMatch(
      block,
      /payload(?:\?\.|\.)status/
    );

    assert.doesNotMatch(
      block,
      /setCurrent\s*\(/
    );

    assert.match(
      block,
      /loadCurrent\s*\(\s*\{[\s\S]*silent\s*:\s*true/
    );
  }
);
