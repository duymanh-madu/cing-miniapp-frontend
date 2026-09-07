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
  "commerce submit uses checkout create exactly once",
  () => {

    assert.equal(
      (
        source.match(
          /apiClient\.post\(\s*"\/checkout\/create"/g
        ) || []
      ).length,
      1
    );

  }
);


test(
  "legacy commerce financial entrypoints are absent",
  () => {

    for(
      const endpoint of [
        "/orders/create",
        "/points/pay-with-points",
        "/payments/create-session",
      ]
    ){

      assert.equal(
        source.includes(endpoint),
        false,
        endpoint
      );

    }

  }
);


test(
  "client sends point request not point financial result",
  () => {

    const submitStart =
      source.indexOf(
        "const checkoutRes ="
      );

    const submitEnd =
      source.indexOf(
        "const checkoutData =",
        submitStart
      );

    assert.ok(
      submitStart >= 0
    );

    assert.ok(
      submitEnd > submitStart
    );


    const region =
      source.slice(
        submitStart,
        submitEnd
      );


    assert.match(
      region,
      /points_requested:\s*pointsToUse/
    );

    assert.doesNotMatch(
      region,
      /points_used:|points_discount:|tier_discount:|subtotal:|total_amount:|submitted_total_amount:|submitted_shipping_fee:/
    );

  }
);


test(
  "external rail is momo tender over Zalo Checkout provider",
  () => {

    assert.match(
      source,
      /selectedPaymentMethod[\s\S]*\?\s*"cing_wallet"[\s\S]*:\s*"momo"/
    );

    assert.match(
      source,
      /selectedPaymentProvider[\s\S]*\?\s*"cing_wallet"[\s\S]*:\s*"zalo_checkout"/
    );

  }
);


test(
  "points-only completion never invokes external handoff",
  () => {

    const points =
      source.indexOf(
        "const pointsSettlement ="
      );

    const external =
      source.indexOf(
        "const zaloOrder =",
        points
      );

    assert.ok(points >= 0);
    assert.ok(external > points);


    const region =
      source.slice(
        points,
        external
      );


    assert.match(
      region,
      /pointsSettlement\?\.completed !== true/
    );

    assert.match(
      region,
      /clearCart\(\)[\s\S]*navigate\("\/order-success"\)[\s\S]*return/
    );

    assert.doesNotMatch(
      region,
      /requestZaloCheckoutFromShell/
    );

  }
);


test(
  "Wallet completion never invokes external handoff",
  () => {

    const wallet =
      source.indexOf(
        "const walletSettlement ="
      );

    const external =
      source.indexOf(
        "const zaloOrder =",
        wallet
      );

    assert.ok(wallet >= 0);
    assert.ok(external > wallet);


    const region =
      source.slice(
        wallet,
        external
      );


    assert.match(
      region,
      /walletSettlement\?\.completed !== true/
    );

    assert.match(
      region,
      /clearCart\(\)[\s\S]*navigate\("\/order-success"\)[\s\S]*return/
    );

    assert.doesNotMatch(
      region,
      /requestZaloCheckoutFromShell/
    );

  }
);


test(
  "external Zalo handoff consumes backend-created zaloOrder",
  () => {

    assert.match(
      source,
      /const paymentResult =[\s\S]*checkoutData\?\.payment/
    );

    assert.match(
      source,
      /const zaloOrder =[\s\S]*paymentResult\?\.zaloOrder/
    );

    assert.match(
      source,
      /await requestZaloCheckoutFromShell\(\{[\s\S]*zaloOrder\.amount[\s\S]*zaloOrder\.mac/
    );

  }
);


test(
  "Wallet selection preserves loyalty-point request",
  () => {

    const walletClick =
      source.indexOf(
        'setPaymentMethod("cing_wallet")'
      );

    assert.ok(walletClick >= 0);

    const region =
      source.slice(
        walletClick,
        walletClick + 220
      );

    assert.doesNotMatch(
      region,
      /setPointsToUse\(0\)/
    );


    assert.match(
      source,
      /availablePoints > 0/
    );

    assert.doesNotMatch(
      source,
      /availablePoints > 0 && !walletSelected/
    );

  }
);


test(
  "cart financial prices are not submitted as checkout authority",
  () => {

    const mapStart =
      source.indexOf(
        "const checkoutItems ="
      );

    const mapEnd =
      source.indexOf(
        "const selectedPaymentMethod",
        mapStart
      );

    assert.ok(mapStart >= 0);
    assert.ok(mapEnd > mapStart);

    const region =
      source.slice(
        mapStart,
        mapEnd
      );

    assert.match(
      region,
      /item_id:/
    );

    assert.match(
      region,
      /quantity:/
    );

    assert.match(
      region,
      /customization_option_ids:/
    );

    assert.doesNotMatch(
      region,
      /\bprice:/
    );

  }
);
