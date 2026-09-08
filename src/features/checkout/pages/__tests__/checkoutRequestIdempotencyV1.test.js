import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const source =
  fs.readFileSync(
    "src/features/checkout/pages/CheckoutPage.jsx",
    "utf8"
  );


test(
  "checkout request uses cryptographically valid stable UUID authority",
  () => {
    assert.match(
      source,
      /CHECKOUT_REQUEST_ID_PATTERN/
    );

    assert.match(
      source,
      /globalThis\.crypto[\s\S]*randomUUID/
    );

    const ensureStart =
      source.indexOf(
        "const ensureCheckoutRequestId ="
      );

    const ensureEnd =
      source.indexOf(
        "// Resume sau khi Zalo/MoMo",
        ensureStart
      );

    assert.ok(
      ensureStart >= 0 &&
      ensureEnd > ensureStart
    );

    const ensureBlock =
      source.slice(
        ensureStart,
        ensureEnd
      );

    assert.match(
      ensureBlock,
      /globalThis\.crypto[\s\S]*randomUUID/
    );

    assert.doesNotMatch(
      ensureBlock,
      /Math\.random/
    );
  }
);


test(
  "checkout intent survives same-page and session reload retry",
  () => {
    assert.match(
      source,
      /cing_checkout_request_intent_v1/
    );

    assert.match(
      source,
      /checkoutRequestIdRef/
    );

    assert.match(
      source,
      /checkoutIntentFingerprintRef/
    );

    assert.match(
      source,
      /sessionStorage\.setItem\([\s\S]*checkoutIntentStorageKey/
    );

    assert.match(
      source,
      /sessionStorage\.getItem\([\s\S]*checkoutIntentStorageKey/
    );
  }
);


test(
  "exact same logical intent reuses request id",
  () => {
    assert.match(
      source,
      /checkoutIntentFingerprintRef\.current ===[\s\S]*normalizedFingerprint[\s\S]*return checkoutRequestIdRef\.current/
    );

    assert.match(
      source,
      /ensureCheckoutRequestId\([\s\S]*checkoutIntentFingerprint/
    );
  }
);


test(
  "material cart funding and destination intent participate in lifecycle fingerprint",
  () => {
    const start =
      source.indexOf(
        "const checkoutIntentFingerprint ="
      );

    const end =
      source.indexOf(
        "const checkoutRequestId =",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      source.slice(
        start,
        end
      );

    for(
      const marker of [
        "order_type",
        "customer_name",
        "customer_phone",
        "shipping_address",
        "note",
        "destination_latitude",
        "destination_longitude",
        "candidate_token",
        "items",
        "points_requested",
        "payment_method",
        "payment_provider",
      ]
    ){
      assert.match(
        block,
        new RegExp(marker)
      );
    }
  }
);


test(
  "frontend fingerprint owns zero monetary authority",
  () => {
    const start =
      source.indexOf(
        "const checkoutIntentFingerprint ="
      );

    const end =
      source.indexOf(
        "const checkoutRequestId =",
        start
      );

    const block =
      source.slice(
        start,
        end
      );

    for(
      const forbidden of [
        "subtotal",
        "total_amount",
        "shipping_fee",
        "tier_discount",
        "points_discount",
      ]
    ){
      assert.doesNotMatch(
        block,
        new RegExp(forbidden)
      );
    }
  }
);


test(
  "checkout create submits the stable request identity",
  () => {
    const start =
      source.indexOf(
        'await apiClient.post(',
        source.indexOf(
          '"/checkout/create"'
        ) - 100
      );

    const region =
      source.slice(
        source.indexOf(
          '"/checkout/create"',
          Math.max(0,start)
        ) - 200,
        source.indexOf(
          "const checkoutData",
          Math.max(0,start)
        )
      );

    assert.match(
      region,
      /checkout_request_id:[\s\S]*checkoutRequestId/
    );
  }
);


test(
  "completed checkout clears request intent while ordinary failure preserves it",
  () => {
    assert.match(
      source,
      /clearCheckoutRequestIntent\(\)[\s\S]*clearCart\(\)[\s\S]*navigate\("\/order-success"/
    );

    const catchStart =
      source.lastIndexOf(
        "}catch(e){"
      );

    const catchEnd =
      source.indexOf(
        "}finally{",
        catchStart
      );

    const catchBlock =
      source.slice(
        catchStart,
        catchEnd
      );

    assert.match(
      catchBlock,
      /COMMERCE_CHECKOUT_IDEMPOTENCY_CONFLICT[\s\S]*clearCheckoutRequestIntent/
    );

    assert.doesNotMatch(
      catchBlock.replace(
        /if\([\s\S]*COMMERCE_CHECKOUT_IDEMPOTENCY_CONFLICT[\s\S]*?\}\s*/,
        ""
      ),
      /clearCheckoutRequestIntent/
    );
  }
);
