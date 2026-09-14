import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import test
  from "node:test";


const source =
  fs.readFileSync(
    "src/features/wallet/components/WalletStatement.jsx",
    "utf8"
  );


function descriptionBody() {
  const start =
    source.indexOf(
      "function resolveDescription"
    );

  const end =
    source.indexOf(
      "\nfunction resolveTime",
      start
    );

  assert.ok(
    start >= 0 &&
    end > start
  );

  return source.slice(
    start,
    end
  );
}


function titleBody() {
  const start =
    source.indexOf(
      "function resolveTitle"
    );

  const end =
    source.indexOf(
      "\nfunction resolveDescription",
      start
    );

  assert.ok(
    start >= 0 &&
    end > start
  );

  return source.slice(
    start,
    end
  );
}


test(
  "POS payment title remains Cing Wallet",
  () => {
    const body =
      titleBody();

    assert.match(
      body,
      /reference_type ===[\s\S]*"pos_payment_intent"[\s\S]*return "Cing Wallet"/
    );
  }
);


test(
  "POS description uses immutable ledger-projected store display name",
  () => {
    const body =
      descriptionBody();

    assert.match(
      body,
      /row\?\.pos_payment[\s\S]*store_display_name/
    );

    assert.match(
      body,
      /"Thanh toán đơn hàng tại cửa hàng " \+[\s\S]*storeDisplayName/
    );
  }
);


test(
  "store name is never hardcoded into POS history",
  () => {
    const body =
      descriptionBody();

    assert.doesNotMatch(
      body,
      /Cing Hu Tang Kinh Bắc/
    );
  }
);


test(
  "legacy POS history without snapshot uses generic description",
  () => {
    const body =
      descriptionBody();

    assert.match(
      body,
      /return "Thanh toán đơn hàng tại cửa hàng";/
    );
  }
);


test(
  "customer display never derives store from technical identities",
  () => {
    const body =
      descriptionBody();

    for (
      const forbidden
      of [
        "pos_parent",
        "pos_id",
        "store_id",
        "store_code",
        "bill_reference",
        "provider_request_key",
        "payment_token_id",
        "sale_tran_id",
        "event11",
        "reconciliation",
      ]
    ) {
      assert.equal(
        body.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);


test(
  "WalletStatement performs no live store lookup",
  () => {
    const body =
      descriptionBody();

    for (
      const forbidden
      of [
        "cing_wallet_pos_stores",
        "fetch(",
        "axios",
        "supabase",
      ]
    ) {
      assert.equal(
        body.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);


test(
  "non POS and admin adjustment behavior remains intact",
  () => {
    const body =
      descriptionBody();

    assert.match(
      body,
      /transaction_type !==[\s\S]*"admin_adjustment"/
    );

    assert.match(
      body,
      /row\.note/
    );
  }
);
