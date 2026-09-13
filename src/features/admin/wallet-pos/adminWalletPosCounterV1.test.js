import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";


const root =
  process.cwd();

const counter =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
    ),
    "utf8"
  );

const api =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/adminWalletPosApi.js"
    ),
    "utf8"
  );

const dashboard =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/components/AdminDashboard.jsx"
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/admin-wallet-pos.css"
    ),
    "utf8"
  );


test(
  "Cing Pay has dedicated admin tab",
  () => {
    assert.match(
      dashboard,
      /key:"wallet_pos"[\s\S]*label:"Cing Pay"/
    );

    assert.match(
      dashboard,
      /AdminWalletPosCounter/
    );
  }
);


test(
  "Counter reads only backend POS session authority",
  () => {
    assert.match(
      api,
      /\/admin\/wallet\/pos\/sessions/
    );

    assert.doesNotMatch(
      counter,
      /supabase/i
    );
  }
);


test(
  "cashier sends only canonical amount to bounded endpoint",
  () => {
    assert.match(
      api,
      /sessions\/\$\{encodeURIComponent\([\s\S]*\}\/amount/
    );

    assert.match(
      api,
      /\{\s*amount,\s*\}/
    );

    assert.doesNotMatch(
      api,
      /user_id|wallet_balance|customer_id/i
    );
  }
);


test(
  "amount requires explicit cashier confirmation before freeze",
  () => {
    assert.match(
      counter,
      /window\.confirm/
    );

    assert.match(
      counter,
      /Xác nhận thu/
    );

    assert.match(
      counter,
      /submitWalletPosAmount/
    );
  }
);


test(
  "dynamic QR renders backend signed capability only",
  () => {
    assert.match(
      counter,
      /QRCode\.toDataURL/
    );

    assert.match(
      counter,
      /result\.qr_content/
    );

    assert.doesNotMatch(
      counter,
      /CING_WALLET_PAY_V1\.[A-Za-z0-9]/i
    );
  }
);


test(
  "Counter follows paid and reconciliation state without financial mutation",
  () => {
    assert.match(
      counter,
      /reconciliation_pending/
    );

    assert.match(
      counter,
      /reconciled/
    );

    assert.match(
      counter,
      /reconciliation_mismatch/
    );

    assert.doesNotMatch(
      counter,
      /wallet.*balance.*post|adjustment|refund/i
    );
  }
);


test(
  "Super Admin mismatch alerts are read-only",
  () => {
    assert.match(
      api,
      /\/reconciliation-alerts/
    );

    assert.match(
      counter,
      /Cảnh báo đối soát/
    );

    assert.doesNotMatch(
      api,
      /reconciliation-alerts[\s\S]*post|reconciliation-alerts[\s\S]*put|reconciliation-alerts[\s\S]*patch/i
    );
  }
);


test(
  "polling fallback keeps Counter fresh when socket event is missed",
  () => {
    assert.match(
      counter,
      /POLL_INTERVAL_MS\s*=\s*1500/
    );

    assert.match(
      counter,
      /setInterval/
    );

    assert.match(
      counter,
      /fetchWalletPosSessions/
    );
  }
);


test(
  "Counter is responsive for tablet and phone",
  () => {
    assert.match(
      css,
      /@media \(max-width: 900px\)/
    );

    assert.match(
      css,
      /@media \(max-width: 520px\)/
    );
  }
);
