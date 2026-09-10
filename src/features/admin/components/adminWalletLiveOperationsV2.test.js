import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "./AdminWallet.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Admin reads ledger through backend authority only",
  () => {
    assert.match(
      source,
      /\/admin\/wallet\/transactions/
    );

    assert.match(
      source,
      /\/admin\/wallet\/summary/
    );

    assert.doesNotMatch(
      source,
      /\.from\(\s*["']cing_wallet_/
    );
  }
);

test(
  "Admin live operations poll every five seconds",
  () => {
    assert.match(
      source,
      /WALLET_LEDGER_POLL_MS\s*=\s*5_000/
    );

    assert.match(
      source,
      /window\.setInterval/
    );

    assert.match(
      source,
      /window\.clearInterval/
    );
  }
);

test(
  "business day is pinned to Vietnam timezone",
  () => {
    assert.match(
      source,
      /Asia\/Ho_Chi_Minh/
    );

    assert.match(
      source,
      /T00:00:00\+07:00/
    );
  }
);

test(
  "today Wallet spending is sourced from reporting authority",
  () => {
    assert.match(
      source,
      /Doanh thu Wallet hôm nay/
    );

    assert.match(
      source,
      /todaySummary[\s\S]*wallet_spending/
    );

    assert.match(
      source,
      /real_money_topup/
    );

    assert.match(
      source,
      /promotion_bonus/
    );
  }
);

test(
  "ledger projection verifies balance arithmetic",
  () => {
    assert.match(
      source,
      /balanceAfter\s*!==[\s\S]*balanceBefore \+ amount/
    );

    assert.match(
      source,
      /CING_WALLET_ADMIN_LEDGER_PROJECTION_INVALID/
    );
  }
);

test(
  "stable tier input identity remains intact",
  () => {
    assert.match(
      source,
      /createTierUiId/
    );

    assert.match(
      source,
      /tier\._ui_id/
    );

    assert.doesNotMatch(
      source,
      /`\$\{tier\.min_topup_amount\}-\$\{index\}`/
    );
  }
);
