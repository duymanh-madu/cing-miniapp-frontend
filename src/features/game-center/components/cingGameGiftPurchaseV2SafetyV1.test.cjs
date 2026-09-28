"use strict";

const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const fs =
  require("node:fs");

const path =
  require("node:path");

const vm =
  require("node:vm");

const esbuild =
  require("esbuild");

const component =
  fs.readFileSync(
    path.join(
      __dirname,
      "CingGameGiftPurchaseV2.jsx"
    ),
    "utf8"
  );

const authority =
  fs.readFileSync(
    path.join(
      __dirname,
      "cingGameGiftPurchaseV2Authority.js"
    ),
    "utf8"
  );

const UUID =
  "11111111-1111-4111-8111-111111111111";

const A =
  "0912345678";

const B =
  "0987654321";

const compiled =
  esbuild.transformSync(
    authority,
    {
      format: "cjs",
      target: "es2020",
    }
  ).code;

const moduleObject = {
  exports: {},
};

vm.runInNewContext(
  compiled,
  {
    module: moduleObject,
    exports: moduleObject.exports,
  }
);

const domain =
  moduleObject.exports;

test(
  "unmounted Gift JSX compiles independently",
  () => {
    const result =
      esbuild.transformSync(
        component,
        {
          loader: "jsx",
          format: "esm",
          jsx: "automatic",
        }
      );

    assert.match(
      result.code,
      /CingGameGiftPurchaseV2/
    );
  }
);

test(
  "valid unresolved intent retains same request",
  () => {
    const previous = {
      sender: A,
      recipient: B,
      giftId: "tra_sen",
      funding: "wallet",
      requestId: UUID,
    };

    const restored =
      domain.validateStoredGiftIntent(
        previous,
        A
      );

    assert.equal(
      restored.requestId,
      UUID
    );

    assert.equal(
      restored.funding,
      "wallet"
    );
  }
);

test(
  "different account cannot restore intent",
  () => {
    const previous = {
      sender: A,
      recipient: B,
      giftId: "tra_sen",
      funding: "wallet",
      requestId: UUID,
    };

    assert.equal(
      domain.validateStoredGiftIntent(
        previous,
        B
      ),
      null
    );
  }
);

test(
  "invalid stored intent is not treated as empty",
  () => {
    assert.match(
      component,
      /const validated =\s*validateStoredGiftIntent/
    );

    assert.match(
      component,
      /if \(!validated\)\s*\{\s*throw new Error\(\s*"GAME_GIFT_STORED_INTENT_INVALID"/
    );

    assert.match(
      component,
      /setIntentUnavailable\(true\)/
    );
  }
);

test(
  "failed storage validation blocks purchase",
  () => {
    const purchase =
      component.match(
        /async function purchase\(\) \{[\s\S]*?\n  const blocked =/
      )?.[0];

    assert.ok(
      purchase,
      "purchase boundary absent"
    );

    assert.match(
      purchase,
      /intentUnavailable/
    );

    assert.match(
      component,
      /const blocked =\s*Boolean\(\s*intentUnavailable/
    );
  }
);

test(
  "old response cannot unlock newer account",
  () => {
    assert.match(
      component,
      /finally \{\s*if \(current\(session\)\) \{\s*submittingRef\.current =\s*false;/
    );

    assert.match(
      component,
      /epochRef\.current \+= 1;\s*loadingRef\.current \+= 1;\s*submittingRef\.current = false;/
    );
  }
);

test(
  "unknown outcome retains pending request",
  () => {
    assert.match(
      component,
      /savePending\(intent\)/
    );

    assert.match(
      component,
      /setPending\(intent\)/
    );

    assert.match(
      component,
      /validateGiftReceipt\(/
    );

    assert.match(
      component,
      /clearPending\(sender\)/
    );
  }
);

test(
  "purchase payload never contains financial authority",
  () => {
    assert.match(
      component,
      /recipient_user_id:\s*intent\.recipient/
    );

    assert.match(
      component,
      /gift_id:\s*intent\.giftId/
    );

    assert.match(
      component,
      /request_id:\s*intent\.requestId/
    );

    assert.doesNotMatch(
      component,
      /(?:amount|charm|price_vnd):\s*selected/
    );
  }
);
