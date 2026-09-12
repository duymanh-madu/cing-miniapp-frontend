import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import {
  extractReconciliationPaymentIdentity,
  normalizeWalletPromotion,
  transactionMatchesPendingTopup,
  walletSnapshotConfirmsTopup,
} from "../domain/walletTopupDomain.js";


const overviewSource =
  fs.readFileSync(
    new URL(
      "../api/walletOverviewApi.js",
      import.meta.url
    ),
    "utf8"
  );

const offersSource =
  fs.readFileSync(
    new URL(
      "../components/WalletTopupOffers.jsx",
      import.meta.url
    ),
    "utf8"
  );

const statementSource =
  fs.readFileSync(
    new URL(
      "../components/WalletStatement.jsx",
      import.meta.url
    ),
    "utf8"
  );

const topupHookSource =
  fs.readFileSync(
    new URL(
      "../hooks/useWalletTopup.js",
      import.meta.url
    ),
    "utf8"
  );

const domainSource =
  fs.readFileSync(
    new URL(
      "../domain/walletTopupDomain.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "top-up success requires exact canonical payment ledger identity",
  () => {
    const pending = {
      amount:
        1_000_000,

      transactionCode:
        "PAY-ABC",

      paymentTransactionId:
        "299",
    };

    assert.equal(
      transactionMatchesPendingTopup(
        {
          transaction_type:
            "topup",

          amount:
            1_000_000,

          reference_type:
            "payment_transaction",

          reference_id:
            "299",

          note:
            "anything",
        },
        pending
      ),
      true
    );

    assert.equal(
      transactionMatchesPendingTopup(
        {
          transaction_type:
            "topup",

          amount:
            1_000_000,

          reference_type:
            "payment_transaction",

          reference_id:
            "300",

          note:
            "PAY-ABC",
        },
        pending
      ),
      false
    );
  }
);


test(
  "balance movement can never confirm Wallet top-up",
  () => {
    assert.equal(
      walletSnapshotConfirmsTopup(
        {
          balance:
            99_000_000,

          transactions:
            [],
        },
        {
          amount:
            1_000_000,

          transactionCode:
            "PAY-ABC",

          paymentTransactionId:
            null,
        }
      ),
      false
    );

    assert.doesNotMatch(
      domainSource,
      /baselineBalance|baseline\s*\+\s*amount/
    );
  }
);


test(
  "transaction code substring can never confirm Wallet settlement",
  () => {
    assert.doesNotMatch(
      domainSource,
      /JSON\.stringify\(\s*transaction\s*\)/
    );
  }
);


test(
  "reconciliation contributes payment identity but not success",
  () => {
    assert.equal(
      extractReconciliationPaymentIdentity(
        {
          payment_status:
            "paid",

          reconciliation: {
            payment_transaction_id:
              299,

            status:
              "pending",
          },
        }
      ),
      "299"
    );

    assert.doesNotMatch(
      topupHookSource,
      /payment_status\s*===\s*["']paid["'][\s\S]*releasePendingAsSuccess/
    );
  }
);


test(
  "promotion projection consumes exact customer-safe backend contract",
  () => {
    assert.deepEqual(
      normalizeWalletPromotion(
        {
          active:
            true,

          name:
            "Premium",

          tiers: [
            {
              min_topup_amount:
                1_000_000,

              bonus_amount:
                200_000,
            },
          ],
        }
      )?.tiers,
      [
        {
          minTopupAmount:
            1_000_000,

          bonusAmount:
            200_000,

          receiveAmount:
            1_200_000,
          isFeatured:
            false,
        },
      ]
    );

    assert.doesNotMatch(
      offersSource,
      /wallet_credit|total_credit|receive_amount|promotion_tiers|bonus_amount|min_topup_amount/
    );
  }
);


test(
  "Wallet overview consumes canonical account and transactions only",
  () => {
    assert.match(
      overviewSource,
      /data\.account\.balance/
    );

    assert.match(
      overviewSource,
      /data\?\.transactions/
    );

    assert.doesNotMatch(
      overviewSource,
      /effective_balance|wallet_balance|recent_transactions|recentTransactions|statement|data\?\.history/
    );
  }
);


test(
  "statement presentation does not guess historical backend aliases",
  () => {
    assert.doesNotMatch(
      statementSource,
      /wallet_amount|balance_change|row\?\.delta|row\?\.createdAt|row\?\.timestamp|transaction\?\.createdAt|transaction\?\.timestamp/
    );

    assert.match(
      statementSource,
      /transaction\.amount/
    );

    assert.match(
      statementSource,
      /transaction\.created_at/
    );
  }
);


test(
  "top-up controller exposes no dead manual refresh API",
  () => {
    assert.doesNotMatch(
      topupHookSource,
      /refreshPending/
    );
  }
);


test(
  "admin adjustment statement hides internal reason and renders customer note separately",
  () => {
    assert.match(
      statementSource,
      /case ["']admin_adjustment["'][\s\S]*Điều chỉnh số dư Cing Wallet/
    );

    assert.match(
      statementSource,
      /function resolveDescription/
    );

    assert.match(
      statementSource,
      /row\.transaction_type !==[\s\S]*admin_adjustment/
    );

    assert.match(
      statementSource,
      /row\.note/
    );

    assert.match(
      statementSource,
      /cing-wallet-statement__note/
    );

    const adminCase =
      statementSource.match(
        /case ["']admin_adjustment["']:[\s\S]*?(?=default:)/
      )?.[0] || "";

    assert.notEqual(
      adminCase,
      ""
    );

    assert.doesNotMatch(
      adminCase,
      /row\.reason/
    );
  }
);
