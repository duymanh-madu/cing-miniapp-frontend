import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";


const read =
  file =>
    fs.readFileSync(
      file,
      "utf8"
    );


const page =
  read(
    "src/features/wallet/pages/WalletPage.jsx"
  );

const controller =
  read(
    "src/features/wallet/hooks/useWalletController.js"
  );

const topupHook =
  read(
    "src/features/wallet/hooks/useWalletTopup.js"
  );

const topupDomain =
  read(
    "src/features/wallet/domain/walletTopupDomain.js"
  );

const topupApi =
  read(
    "src/features/wallet/api/walletTopupApi.js"
  );

const overviewApi =
  read(
    "src/features/wallet/api/walletOverviewApi.js"
  );

const services =
  read(
    "src/features/wallet/components/WalletQuickServices.jsx"
  );


test(
  "/wallet mounts only canonical premium Wallet composition",
  () => {
    assert.match(
      page,
      /useWalletController/
    );

    assert.doesNotMatch(
      page,
      /@\/membership\/components\//
    );

    assert.match(
      page,
      /WalletTopupPanel/
    );

    assert.match(
      page,
      /WalletStatement/
    );
  }
);


test(
  "Wallet page has one authoritative overview owner",
  () => {
    assert.match(
      controller,
      /useWalletOverview/
    );

    assert.match(
      controller,
      /useWalletTopup/
    );

    assert.match(
      controller,
      /refreshOverview:[\s\S]*overview\.refresh/
    );

    assert.doesNotMatch(
      topupHook,
      /setBalance/
    );
  }
);


test(
  "top-up submits amount only through canonical API",
  () => {
    assert.match(
      topupApi,
      /apiClient\.post\([\s\S]*"\/wallet\/topup\/session"[\s\S]*\{[\s\S]*amount/
    );

    assert.doesNotMatch(
      topupHook,
      /apiClient\./
    );

    assert.doesNotMatch(
      topupApi,
      /user_id|phone|bonus\s*:|payment_provider\s*:|payment_method\s*:/
    );
  }
);


test(
  "pending payment identity is persisted before provider handoff",
  () => {
    assert.match(
      topupDomain,
      /pending:\s*\{[\s\S]*amount,[\s\S]*transactionCode,[\s\S]*paymentTransactionId:[\s\S]*null,[\s\S]*expiredAt:[\s\S]*createdAt:/
    );

    assert.doesNotMatch(
      topupDomain,
      /baselineBalance/
    );

    const persistIndex =
      topupHook.indexOf(
        "writePendingWalletTopup("
      );

    const providerIndex =
      topupHook.indexOf(
        "await requestZaloCheckoutFromShell("
      );

    assert.ok(
      persistIndex >= 0
    );

    assert.ok(
      providerIndex >
        persistIndex
    );
  }
);


test(
  "frontend validates backend top-up financial identity before handoff",
  () => {
    for (
      const contract of [
        '"wallet_topup"',
        '"zalo_checkout"',
        "paymentRecord.amount",
        "paymentRecord.transaction_code",
        "zaloOrder.orderId",
        "zaloOrder.amount",
        "zaloOrder.mac",
        "zaloOrder.extradata",
      ]
    ) {
      assert.match(
        topupDomain,
        new RegExp(
          contract.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )
        )
      );
    }
  }
);


test(
  "provider result never credits Wallet locally",
  () => {
    assert.doesNotMatch(
      topupHook,
      /setBalance|balance\s*\+\s*amount|wallet_balance\s*=/
    );

    assert.match(
      topupHook,
      /refreshOverview/
    );

    assert.match(
      topupHook,
      /reconcileWalletTopup/
    );
  }
);


test(
  "reconciliation remains fail closed",
  () => {
    const reconcileIndex =
      topupHook.indexOf(
        "await reconcileWalletTopup("
      );

    assert.ok(
      reconcileIndex >= 0
    );

    const catchIndex =
      topupHook.indexOf(
        "} catch {",
        reconcileIndex
      );

    assert.ok(
      catchIndex >
        reconcileIndex
    );

    const postCatchIndex =
      topupHook.indexOf(
        "if (mounted.current)",
        catchIndex
      );

    assert.ok(
      postCatchIndex >
        catchIndex
    );

    const catchRegion =
      topupHook.slice(
        catchIndex,
        postCatchIndex
      );

    assert.match(
      catchRegion,
      /Transport\/reconciliation failure is fail closed/
    );

    assert.doesNotMatch(
      catchRegion,
      /releasePendingAsSuccess|releasePendingAsFailed|clearPendingWalletTopup/
    );

    assert.match(
      topupHook,
      /reconciliationIsTerminalFailure[\s\S]*releasePendingAsFailed/
    );
  }
);


test(
  "pending top-up has durable five-second authoritative recovery",
  () => {
    assert.match(
      topupHook,
      /RECONCILE_INTERVAL_MS\s*=\s*5_000/
    );

    assert.match(
      topupHook,
      /window\.setInterval/
    );

    assert.match(
      topupHook,
      /refreshAndReconcile/
    );
  }
);


test(
  "Wallet POS QR remains first-class premium service",
  () => {
    assert.match(
      page,
      /\/wallet\/pos-pay/
    );

    assert.match(
      services,
      /\/wallet\/pos-pay/
    );

    assert.match(
      services,
      /Quét QR/
    );
  }
);


test(
  "authoritative Wallet overview consumes canonical production ledger shape",
  () => {
    assert.match(
      overviewApi,
      /data\.account\.balance/
    );

    assert.match(
      overviewApi,
      /data\?\.transactions/
    );

    assert.match(
      overviewApi,
      /row\.transaction_type/
    );

    assert.match(
      overviewApi,
      /row\.reference_type/
    );

    assert.match(
      overviewApi,
      /row\.reference_id/
    );

    assert.match(
      overviewApi,
      /row\.created_at/
    );

    assert.doesNotMatch(
      overviewApi,
      /recent_transactions|recentTransactions|effective_balance|wallet_balance/
    );
  }
);