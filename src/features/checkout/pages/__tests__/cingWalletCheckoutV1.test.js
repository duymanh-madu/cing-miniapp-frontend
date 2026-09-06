import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.resolve(
    "src/features/checkout/pages/CheckoutPage.jsx"
  ),
  "utf8"
);

test(
  "Wallet uses authoritative checkout endpoint before legacy order creation",
  () => {
    const wallet =
      source.indexOf("if(walletSelected){");

    const legacy =
      source.indexOf(
        'apiClient.post("/orders/create"'
      );

    assert.ok(wallet >= 0);
    assert.ok(legacy > wallet);

    const region =
      source.slice(wallet, legacy);

    assert.match(
      region,
      /apiClient\.post\("\/checkout\/create"/
    );

    assert.doesNotMatch(
      region,
      /\/orders\/create|\/payments\/create-session|\/points\/pay-with-points|requestZaloCheckoutFromShell/
    );
  }
);

test(
  "Wallet sends exact payment method and provider",
  () => {
    const start =
      source.indexOf("if(walletSelected){");

    const end =
      source.indexOf(
        "// 1. Tao don hang",
        start
      );

    const region =
      source.slice(start, end);

    assert.match(
      region,
      /payment_method:"cing_wallet"/
    );

    assert.match(
      region,
      /payment_provider:"cing_wallet"/
    );
  }
);

test(
  "Wallet sends checkout consistency values but no trusted discount fields",
  () => {
    const start =
      source.indexOf("if(walletSelected){");

    const end =
      source.indexOf(
        "// 1. Tao don hang",
        start
      );

    const region =
      source.slice(start, end);

    assert.match(
      region,
      /submitted_shipping_fee:shipFee/
    );

    assert.match(
      region,
      /submitted_total_amount:total/
    );

    assert.doesNotMatch(
      region,
      /tier_discount\s*:|points_discount\s*:|tier_key\s*:/
    );
  }
);

test(
  "Wallet V1 refuses mixed loyalty points",
  () => {
    assert.match(
      source,
      /if\(walletSelected\)\{[\s\S]*if\(pointsToUse!==0\)/
    );

    assert.match(
      source,
      /setPaymentMethod\("cing_wallet"\);[\s\S]*setPointsToUse\(0\)/
    );

    assert.match(
      source,
      /availablePoints > 0 && !walletSelected/
    );
  }
);

test(
  "cart clears only after durable Wallet settlement completion",
  () => {
    const start =
      source.indexOf("if(walletSelected){");

    const end =
      source.indexOf(
        "// 1. Tao don hang",
        start
      );

    const region =
      source.slice(start, end);

    const completion =
      region.indexOf(
        "wallet_settlement?.completed!==true"
      );

    const orderId =
      region.indexOf(
        "wallet_settlement?.order_id"
      );

    const clear =
      region.indexOf("clearCart();");

    assert.ok(completion >= 0);
    assert.ok(orderId > completion);
    assert.ok(clear > orderId);
  }
);

test(
  "existing MoMo legacy path remains available",
  () => {
    assert.match(
      source,
      /apiClient\.post\("\/orders\/create"/
    );

    assert.match(
      source,
      /apiClient\.post\("\/payments\/create-session"/
    );

    assert.match(
      source,
      /requestZaloCheckoutFromShell/
    );
  }
);
