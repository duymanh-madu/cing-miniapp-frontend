import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const ROOT =
  process.cwd();

const page =
  fs.readFileSync(
    path.join(
      ROOT,
      "src/features/wallet-pos-payment/pages/WalletPosPaymentPage.jsx"
    ),
    "utf8"
  );

test(
  "customer preview renders backend-authoritative store display name",
  () => {
    assert.match(
      page,
      /payment[\s\S]*store_display_name/
    );

    assert.match(
      page,
      /storeDisplayName/
    );

    assert.match(
      page,
      /Thanh toán tại/
    );

    assert.match(
      page,
      /\{storeDisplayName\}/
    );
  }
);

test(
  "merchant display has no hardcoded store or POS identity",
  () => {
    assert.doesNotMatch(
      page,
      /Cing Hu Tang Kinh Bắc/
    );

    assert.doesNotMatch(
      page,
      /BRAND-DQIR/
    );

    assert.doesNotMatch(
      page,
      /109664/
    );
  }
);
