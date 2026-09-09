import {
  readFileSync,
} from "node:fs";

import test
  from "node:test";

import assert
  from "node:assert/strict";


const read =
  file =>
    readFileSync(
      new URL(
        file,
        import.meta.url
      ),
      "utf8"
    );


const topupHook =
  read(
    "../../../features/wallet/hooks/useWalletTopup.js"
  );

const topupDomain =
  read(
    "../../../features/wallet/domain/walletTopupDomain.js"
  );

const topupApi =
  read(
    "../../../features/wallet/api/walletTopupApi.js"
  );

const overviewApi =
  read(
    "../../../features/wallet/api/walletOverviewApi.js"
  );

const checkoutBridgeSource =
  read(
    "../../../infra/payment/zaloCheckoutBridge.js"
  );

const membershipSource =
  read(
    "../../pages/MembershipPage.jsx"
  );

const gatewaySource =
  read(
    "../../../features/wallet/components/WalletMembershipGateway.jsx"
  );


test(
  "wallet top-up posts amount only to authenticated authority",
  () => {
    assert.match(
      topupApi,
      /apiClient\.post\([\s\S]*"\/wallet\/topup\/session"[\s\S]*\{[\s\S]*amount/
    );

    assert.doesNotMatch(
      topupApi,
      /user_id|phone|payment_provider\s*:|payment_method\s*:|bonus\s*:/
    );

    assert.doesNotMatch(
      topupHook,
      /apiClient\./
    );
  }
);


test(
  "frontend never mutates Wallet balance from payment response",
  () => {
    assert.doesNotMatch(
      topupHook,
      /setBalance\s*\(/
    );

    assert.doesNotMatch(
      topupHook,
      /balance\s*\+\s*amount/
    );

    assert.match(
      overviewApi,
      /apiClient\.get\([\s\S]*"\/wallet"/
    );
  }
);


test(
  "pending top-up fences duplicate session creation before financial call",
  () => {
    const guardIndex =
      topupHook.indexOf(
        "submitting ||"
      );

    const createIndex =
      topupHook.indexOf(
        "await createWalletTopupSession("
      );

    assert.ok(
      guardIndex >= 0
    );

    assert.ok(
      createIndex >
        guardIndex
    );

    const guardRegion =
      topupHook.slice(
        guardIndex,
        createIndex
      );

    assert.match(
      guardRegion,
      /pendingTopup/
    );

    assert.match(
      guardRegion,
      /return;/
    );
  }
);


test(
  "pending top-up uses authoritative five-second recovery",
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
      /refreshOverview/
    );

    assert.match(
      topupHook,
      /reconcileWalletTopup/
    );
  }
);


test(
  "top-up validates backend Zalo Checkout authority before provider handoff",
  () => {
    assert.match(
      topupDomain,
      /paymentSession\?\.payment/
    );

    assert.match(
      topupDomain,
      /paymentSession\.zaloOrder/
    );

    assert.match(
      topupDomain,
      /paymentRecord\.transaction_code/
    );

    assert.match(
      topupDomain,
      /paymentRecord\.payment_purpose\s*!==[\s\S]*"wallet_topup"/
    );

    assert.match(
      topupDomain,
      /paymentRecord\.payment_provider\s*!==[\s\S]*"zalo_checkout"/
    );

    assert.match(
      topupDomain,
      /paymentRecord\.payment_method\s*!==[\s\S]*"zalo_checkout"/
    );

    assert.match(
      topupDomain,
      /zaloOrder\.orderId\.trim\(\)\s*!==[\s\S]*transactionCode/
    );

    assert.match(
      topupHook,
      /await requestZaloCheckoutFromShell/
    );
  }
);


test(
  "Wallet and commerce share native Zalo Checkout bridge",
  () => {
    assert.match(
      topupHook,
      /requestZaloCheckoutFromShell/
    );

    assert.match(
      checkoutBridgeSource,
      /CheckoutSDK\.createOrder/
    );

    assert.match(
      checkoutBridgeSource,
      /ZALO_CHECKOUT_CREATE_ORDER/
    );

    assert.match(
      checkoutBridgeSource,
      /ZALO_CHECKOUT_RESULT/
    );
  }
);


test(
  "pending identity contains canonical recovery identity and no reusable provider handoff",
  () => {
    assert.match(
      topupDomain,
      /pending:\s*\{[\s\S]*amount,[\s\S]*transactionCode,[\s\S]*paymentTransactionId:[\s\S]*null,[\s\S]*expiredAt:[\s\S]*createdAt:/
    );

    assert.doesNotMatch(
      topupDomain,
      /baselineBalance/
    );

    const pendingRegionStart =
      topupDomain.indexOf(
        "pending: {"
      );

    assert.ok(
      pendingRegionStart >= 0
    );

    const pendingRegion =
      topupDomain.slice(
        pendingRegionStart,
        pendingRegionStart + 900
      );

    assert.doesNotMatch(
      pendingRegion,
      /deeplinkMiniApp|paymentUrl|zaloOrder|mac:|extradata:|method:/
    );
  }
);


test(
  "backend terminal reconciliation alone releases failed pending transaction",
  () => {
    assert.match(
      topupDomain,
      /payment_status ===[\s\S]*"failed"/
    );

    assert.match(
      topupDomain,
      /terminal_failed/
    );

    assert.match(
      topupHook,
      /releasePendingAsFailed/
    );
  }
);


test(
  "frontend reconciliation transport failure stays fail-closed",
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
      /releasePendingAsSuccess|releasePendingAsFailed|clearPendingWalletTopup|setBalance/
    );
  }
);


test(
  "Membership delegates Wallet to premium product route",
  () => {
    assert.match(
      membershipSource,
      /import WalletMembershipGateway/
    );

    assert.match(
      membershipSource,
      /<WalletMembershipGateway \/>/
    );

    assert.doesNotMatch(
      membershipSource,
      /wallet\/topup\/session|payments\/reconcile|requestZaloCheckoutFromShell|cing_wallet_pending_topup/
    );

    assert.match(
      gatewaySource,
      /navigate\([\s\S]*"\/wallet"/
    );

    assert.match(
      gatewaySource,
      /useWalletOverview/
    );
  }
);


test(
  "Membership owns no Wallet top-up financial workflow",
  () => {
    assert.doesNotMatch(
      membershipSource,
      /wallet\/topup\/session|payments\/reconcile|requestZaloCheckoutFromShell|cing_wallet_pending_topup/
    );
  }
);
