import {
  readFileSync,
} from "node:fs";

import test from "node:test";

import assert from "node:assert/strict";

const walletSource =
  readFileSync(
    new URL(
      "../CustomerWalletList.jsx",
      import.meta.url
    ),
    "utf8"
  );

const checkoutBridgeSource =
  readFileSync(
    new URL(
      "../../../infra/payment/zaloCheckoutBridge.js",
      import.meta.url
    ),
    "utf8"
  );

const membershipSource =
  readFileSync(
    new URL(
      "../../pages/MembershipPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "wallet topup posts amount only to authenticated authority",
  () => {
    assert.match(
      walletSource,
      /apiClient\.post\(\s*"\/wallet\/topup\/session"\s*,\s*\{\s*amount\s*,?\s*\}/
    );

    const topupStart =
      walletSource.indexOf(
        'apiClient.post(\n          "/wallet/topup/session"'
      );

    assert.ok(
      topupStart >= 0
    );

    const topupSlice =
      walletSource.slice(
        topupStart,
        topupStart + 500
      );

    assert.doesNotMatch(
      topupSlice,
      /user_id|phone|payment_provider|payment_method|bonus/
    );
  }
);

test(
  "frontend never mutates wallet balance from payment response",
  () => {
    assert.doesNotMatch(
      walletSource,
      /setBalance\(\s*balance\s*\+\s*/
    );

    assert.doesNotMatch(
      walletSource,
      /setBalance\(\s*amount/
    );

    assert.match(
      walletSource,
      /apiClient\.get\(\s*"\/wallet"/
    );
  }
);

test(
  "pending topup blocks duplicate session creation",
  () => {
    assert.match(
      walletSource,
      /submitting\s*\|\|\s*pendingTopup/
    );

    assert.match(
      walletSource,
      /Boolean\(\s*pendingTopup\s*\)/
    );

    assert.match(
      walletSource,
      /không cần tạo thêm giao/
    );
  }
);

test(
  "wallet refreshes authoritative state after returning from provider",
  () => {
    assert.match(
      walletSource,
      /visibilitychange/
    );

    assert.match(
      walletSource,
      /window\.addEventListener\(\s*"focus"/
    );

    assert.match(
      walletSource,
      /window\.setInterval/
    );

    assert.match(
      walletSource,
      /refreshWallet/
    );
  }
);

test(
  "topup consumes backend Zalo Checkout authority contract",
  () => {
    assert.match(
      walletSource,
      /paymentSession\?\.payment/
    );

    assert.match(
      walletSource,
      /paymentSession\.zaloOrder/
    );

    assert.match(
      walletSource,
      /paymentRecord\.transaction_code/
    );

    assert.match(
      walletSource,
      /paymentRecord\.payment_purpose\s*!==\s*"wallet_topup"/
    );

    assert.match(
      walletSource,
      /paymentRecord\.payment_provider\s*!==\s*"zalo_checkout"/
    );

    assert.match(
      walletSource,
      /paymentRecord\.payment_method\s*!==\s*"zalo_checkout"/
    );

    assert.match(
      walletSource,
      /zaloOrder\.orderId\.trim\(\)\s*!==\s*transactionCode/
    );

    assert.match(
      walletSource,
      /Number\(\s*zaloOrder\.amount\s*\)\s*!==\s*amount/
    );

    assert.match(
      walletSource,
      /await requestZaloCheckoutFromShell\(\{[\s\S]*zaloOrder\.amount[\s\S]*zaloOrder\.item[\s\S]*zaloOrder\.desc[\s\S]*zaloOrder\.mac[\s\S]*zaloOrder\.extradata[\s\S]*zaloOrder\.method/
    );

    assert.doesNotMatch(
      walletSource,
      /openOutApp|openMomoPayment|deeplinkMiniApp|paymentUrl|Mở lại MoMo/
    );
  }
);


test(
  "Wallet and commerce share one Zalo Checkout native bridge",
  () => {
    assert.match(
      walletSource,
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

    assert.match(
      checkoutBridgeSource,
      /90000/
    );
  }
);


test(
  "pending topup stores canonical identity but no reusable provider handoff",
  () => {
    assert.match(
      walletSource,
      /const pending = \{[\s\S]*amount,[\s\S]*baselineBalance:[\s\S]*transactionCode,[\s\S]*expiredAt:[\s\S]*createdAt:/
    );

    assert.doesNotMatch(
      walletSource,
      /pending\.(?:deeplinkMiniApp|paymentUrl|zaloOrder)/
    );

    assert.doesNotMatch(
      walletSource,
      /Mở lại/
    );
  }
);


test(
  "backend terminal reconciliation releases failed pending topup",
  () => {
    assert.match(
      walletSource,
      /apiClient\.post\(\s*`\/payments\/reconcile\/\$\{encodeURIComponent\([\s\S]*pending\.transactionCode/
    );

    assert.match(
      walletSource,
      /payment_status ===[\s\S]*"failed"/
    );

    assert.match(
      walletSource,
      /reconciliation[\s\S]*\?\.status ===[\s\S]*"terminal_failed"/
    );

    assert.match(
      walletSource,
      /if \(terminalFailed\)[\s\S]*clearPendingTopup\(\)[\s\S]*setPendingTopup\(\s*null\s*\)/
    );
  }
);


test(
  "frontend reconciliation failure is fail-closed",
  () => {
    const start =
      walletSource.indexOf(
        "let terminalFailed ="
      );

    const end =
      walletSource.indexOf(
        "if (terminalFailed)",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const region =
      walletSource.slice(
        start,
        end
      );

    assert.match(
      region,
      /catch \{/
    );

    assert.doesNotMatch(
      region,
      /clearPendingTopup\(\)|setPendingTopup\(\s*null\s*\)|setBalance\(/
    );
  }
);


test(
  "wallet surface is mounted on membership page",
  () => {
    assert.match(
      membershipSource,
      /import CustomerWalletList/
    );

    assert.match(
      membershipSource,
      /<CustomerWalletList \/>/
    );
  }
);

test(
  "wallet reads overview and promotion from backend authority",
  () => {
    assert.match(
      walletSource,
      /apiClient\.get\(\s*"\/wallet"/
    );

    assert.match(
      walletSource,
      /apiClient\.get\(\s*"\/wallet\/topup\/promotion"/
    );
  }
);
