import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const adjustmentSource =
  fs.readFileSync(
    new URL(
      "./AdminWalletAdjustmentPanel.jsx",
      import.meta.url
    ),
    "utf8"
  );

const walletSource =
  fs.readFileSync(
    new URL(
      "./AdminWallet.jsx",
      import.meta.url
    ),
    "utf8"
  );

const dashboardSource =
  fs.readFileSync(
    new URL(
      "./AdminDashboard.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Wallet adjustment UI is explicitly Super Admin only",
  () => {
    assert.match(
      adjustmentSource,
      /role[\s\S]*super_admin/
    );

    assert.match(
      dashboardSource,
      /AdminWallet[\s\S]*role=\{role\}/
    );
  }
);

test(
  "customer identity and canonical balance come only from backend Wallet authority",
  () => {
    assert.match(
      adjustmentSource,
      /\/admin\/wallet\/customers/
    );

    assert.match(
      adjustmentSource,
      /wallet_balance/
    );

    assert.match(
      adjustmentSource,
      /wallet_account_exists/
    );

    assert.doesNotMatch(
      adjustmentSource,
      /\.from\s*\(/
    );
  }
);

test(
  "financial write uses only bounded adjustment endpoint",
  () => {
    assert.match(
      adjustmentSource,
      /\/admin\/wallet\/adjustments/
    );

    assert.doesNotMatch(
      adjustmentSource,
      /cing_wallet_accounts/
    );

    assert.doesNotMatch(
      adjustmentSource,
      /cing_wallet_transactions/
    );
  }
);

test(
  "adjustment intent uses secure UUID and stable retry identity",
  () => {
    assert.match(
      adjustmentSource,
      /globalThis\.crypto/
    );

    assert.match(
      adjustmentSource,
      /randomUUID/
    );

    assert.match(
      adjustmentSource,
      /request_id/
    );

    assert.match(
      adjustmentSource,
      /Keep confirmation \+ request_id intact/
    );
  }
);

test(
  "material intent edits invalidate prior request identity",
  () => {
    assert.match(
      adjustmentSource,
      /invalidateIntent/
    );

    assert.match(
      adjustmentSource,
      /setRequestId\(null\)/
    );

    assert.match(
      adjustmentSource,
      /setConfirmation\(null\)/
    );
  }
);

test(
  "financial action requires explicit second confirmation",
  () => {
    assert.match(
      adjustmentSource,
      /openConfirmation/
    );

    assert.match(
      adjustmentSource,
      /submitAdjustment/
    );

    assert.match(
      adjustmentSource,
      /XÁC NHẬN GIAO DỊCH TÀI CHÍNH/
    );
  }
);

test(
  "debit preview fails closed above current canonical balance",
  () => {
    assert.match(
      adjustmentSource,
      /selectedCustomer[\s\S]*wallet_balance/
    );

    assert.match(
      adjustmentSource,
      /Số tiền trừ đang lớn hơn số dư Wallet hiện tại/
    );
  }
);

test(
  "reference fields must be a complete pair",
  () => {
    assert.match(
      adjustmentSource,
      /hasReferenceType[\s\S]*hasReferenceId/
    );

    assert.match(
      adjustmentSource,
      /Reference Type và Reference ID phải được nhập cùng nhau/
    );
  }
);

test(
  "successful adjustment refreshes customer authority and live ledger",
  () => {
    assert.match(
      adjustmentSource,
      /refreshSelectedCustomer/
    );

    assert.match(
      adjustmentSource,
      /onAdjusted/
    );

    assert.match(
      walletSource,
      /ledgerRefreshNonce/
    );

    assert.match(
      walletSource,
      /setLedgerRefreshNonce/
    );
  }
);

test(
  "existing five second ledger polling remains intact",
  () => {
    assert.match(
      walletSource,
      /WALLET_LEDGER_POLL_MS\s*=\s*5_000/
    );

    assert.match(
      walletSource,
      /window\.setInterval/
    );
  }
);
