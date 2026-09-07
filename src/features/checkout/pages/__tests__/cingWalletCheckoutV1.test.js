import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";


const source =
  fs.readFileSync(
    path.resolve(
      "src/features/checkout/pages/CheckoutPage.jsx"
    ),
    "utf8"
  );


test(
  "Wallet participates in the shared canonical checkout request",
  () => {

    assert.match(
      source,
      /walletSelected[\s\S]*\?\s*"cing_wallet"[\s\S]*:\s*"momo"/
    );

    assert.match(
      source,
      /apiClient\.post\(\s*"\/checkout\/create"/
    );

  }
);


test(
  "Wallet provider remains explicitly cing_wallet",
  () => {

    assert.match(
      source,
      /selectedPaymentProvider[\s\S]*\?\s*"cing_wallet"[\s\S]*:\s*"zalo_checkout"/
    );

  }
);


test(
  "Wallet can be combined with loyalty points",
  () => {

    assert.doesNotMatch(
      source,
      /Cing Wallet hiện chưa hỗ trợ thanh toán kết hợp điểm/
    );

    assert.doesNotMatch(
      source,
      /setPaymentMethod\("cing_wallet"\)[\s\S]{0,200}setPointsToUse\(0\)/
    );

    assert.doesNotMatch(
      source,
      /availablePoints > 0 && !walletSelected/
    );

    assert.match(
      source,
      /points_requested:\s*pointsToUse/
    );

  }
);


test(
  "Wallet completes only on durable backend settlement proof",
  () => {

    assert.match(
      source,
      /walletSettlement\?\.success !== true/
    );

    assert.match(
      source,
      /walletSettlement\?\.completed !== true/
    );

    assert.match(
      source,
      /!walletSettlement\?\.order_id/
    );

  }
);


test(
  "Wallet does not use legacy order payment or point routes",
  () => {

    assert.doesNotMatch(
      source,
      /\/orders\/create|\/points\/pay-with-points|\/payments\/create-session/
    );

  }
);
