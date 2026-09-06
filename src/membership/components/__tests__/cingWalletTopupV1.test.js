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
  "topup consumes exact backend payment session contract",
  () => {
    assert.match(
      walletSource,
      /paymentSession\?\.payment/
    );

    assert.match(
      walletSource,
      /paymentSession\.paymentUrl/
    );

    assert.match(
      walletSource,
      /paymentSession\.deeplinkMiniApp/
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
      /paymentRecord\.payment_provider\s*!==\s*"momo"/
    );

    assert.match(
      walletSource,
      /paymentRecord\.payment_method\s*!==\s*"momo"/
    );

    assert.match(
      walletSource,
      /openOutApp\(\{\s*url:\s*nativeUrl\s*,?\s*\}\)/
    );

    assert.match(
      walletSource,
      /window\.location\.assign\(\s*fallbackUrl\s*\)/
    );

    assert.match(
      walletSource,
      /await openMomoPayment\(\{\s*deeplinkMiniApp\s*,\s*paymentUrl\s*,?\s*\}\)/
    );

    assert.doesNotMatch(
      walletSource,
      /resolvePaymentUrl/
    );

    assert.doesNotMatch(
      walletSource,
      /resolveTransactionCode/
    );

    assert.doesNotMatch(
      walletSource,
      /CheckoutSDK/
    );
  }
);

test(
  "pending topup preserves native Mini App handoff for reopen",
  () => {
    assert.match(
      walletSource,
      /deeplinkMiniApp/
    );

    assert.match(
      walletSource,
      /pending\.deeplinkMiniApp/
    );

    assert.match(
      walletSource,
      /reopenDeeplinkMiniApp/
    );

    assert.match(
      walletSource,
      /Mở lại MoMo/
    );

    assert.doesNotMatch(
      walletSource,
      /href=\{\s*reopenUrl\s*\}/
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
