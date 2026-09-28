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

const authoritySource =
  fs.readFileSync(
    path.join(
      __dirname,
      "cingGameGiftPurchaseV2Authority.js"
    ),
    "utf8"
  );

const uiSource =
  fs.readFileSync(
    path.join(
      __dirname,
      "CingGameGiftPurchaseV2.jsx"
    ),
    "utf8"
  );

const compiled =
  esbuild.transformSync(
    authoritySource,
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
    exports:
      moduleObject.exports,
    globalThis: {
      crypto: {
        randomUUID: () =>
          "11111111-1111-4111-8111-111111111111",
      },
    },
  }
);

const domain =
  moduleObject.exports;

const A =
  "0912345678";

const B =
  "0987654321";

const ID =
  "11111111-1111-4111-8111-111111111111";

const baseGift = {
  id: "tra_sen",
  name: "Trà sen",
  icon: "🪷",
  price_vnd: "50000",
  points_cost: "50",
  charm_award: "50",
};

test(
  "Gift identity normalizes phone",
  () => {
    assert.equal(
      domain.normalizeGiftPhone(
        "84912345678"
      ),
      A
    );

    assert.equal(
      domain.normalizeGiftPhone(
        "pending"
      ),
      ""
    );
  }
);

test(
  "catalog derives no client price",
  () => {
    const result =
      domain.validateGiftCatalog(
        [baseGift]
      );

    assert.equal(
      result[0].price_vnd,
      "50000"
    );

    assert.equal(
      result[0].points_cost,
      "50"
    );
  }
);

test(
  "fractional loyalty pricing rejected",
  () => {
    assert.throws(
      () =>
        domain.validateGiftCatalog([
          {
            ...baseGift,
            price_vnd:
              "50500",
          },
        ])
    );
  }
);

test(
  "catalog mismatch rejected",
  () => {
    assert.throws(
      () =>
        domain.validateGiftCatalog([
          {
            ...baseGift,
            points_cost:
              "49",
          },
        ])
    );
  }
);

test(
  "duplicate Gift rejected",
  () => {
    assert.throws(
      () =>
        domain.validateGiftCatalog([
          baseGift,
          baseGift,
        ])
    );
  }
);

test(
  "secure request UUID v4",
  () => {
    assert.equal(
      domain.secureGiftRequestId(),
      ID
    );
  }
);

test(
  "stored intent is account scoped",
  () => {
    const intent = {
      sender: A,
      recipient: B,
      giftId:
        "tra_sen",
      funding:
        "wallet",
      requestId: ID,
    };

    assert.equal(
      domain.validateStoredGiftIntent(
        intent,
        A
      ).requestId,
      ID
    );

    assert.equal(
      domain.validateStoredGiftIntent(
        intent,
        B
      ),
      null
    );
  }
);

test(
  "Wallet receipt requires ledger identity",
  () => {
    const expected = {
      sender: A,
      recipient: B,
      giftId:
        "tra_sen",
      funding:
        "wallet",
      requestId: ID,
    };

    const receipt = {
      applied: true,
      request_id: ID,
      sender_user_id: A,
      recipient_user_id: B,
      gift_id:
        "tra_sen",
      funding_source:
        "wallet",
      gift_name:
        "Trà sen",
      gift_icon:
        "🪷",
      price_vnd:
        "50000",
      charm_awarded:
        50,
      wallet_transaction_id:
        "22222222-2222-4222-8222-222222222222",
      points_cost: null,
      ipos_sync_status:
        "not_required",
    };

    assert.equal(
      domain.validateGiftReceipt(
        receipt,
        expected
      ).gift_id,
      "tra_sen"
    );

    assert.throws(
      () =>
        domain.validateGiftReceipt(
          {
            ...receipt,
            wallet_transaction_id:
              null,
          },
          expected
        )
    );
  }
);

test(
  "Points receipt checks conversion",
  () => {
    const expected = {
      sender: A,
      recipient: B,
      giftId:
        "tra_sen",
      funding:
        "points",
      requestId: ID,
    };

    const receipt = {
      applied: true,
      request_id: ID,
      sender_user_id: A,
      recipient_user_id: B,
      gift_id:
        "tra_sen",
      funding_source:
        "points",
      gift_name:
        "Trà sen",
      gift_icon:
        "🪷",
      price_vnd:
        "50000",
      charm_awarded:
        50,
      wallet_transaction_id:
        null,
      points_cost:
        50,
      ipos_sync_status:
        "pending",
    };

    assert.equal(
      domain.validateGiftReceipt(
        receipt,
        expected
      ).points_cost,
      50
    );

    assert.throws(
      () =>
        domain.validateGiftReceipt(
          {
            ...receipt,
            points_cost:
              49,
          },
          expected
        )
    );
  }
);

test(
  "UI only sends backend-owned financial payload",
  () => {
    assert.match(
      uiSource,
      /recipient_user_id:\s*intent\.recipient/
    );

    assert.match(
      uiSource,
      /gift_id:\s*intent\.giftId/
    );

    assert.match(
      uiSource,
      /request_id:\s*intent\.requestId/
    );

    assert.doesNotMatch(
      uiSource,
      /amount:\s*selected/
    );

    assert.doesNotMatch(
      uiSource,
      /charm:\s*selected/
    );
  }
);

test(
  "unknown outcome retains request identity",
  () => {
    assert.match(
      uiSource,
      /savePending\(intent\)/
    );

    assert.match(
      uiSource,
      /const response =\s*await apiClient\.post/
    );

    assert.match(
      uiSource,
      /validateGiftReceipt\(/
    );

    assert.match(
      uiSource,
      /clearPending\(sender\)/
    );

    assert.match(
      uiSource,
      /session\.epoch ===\s*epochRef\.current/
    );
  }
);
