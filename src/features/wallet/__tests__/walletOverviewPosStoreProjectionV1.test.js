import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import test
  from "node:test";


const api =
  fs.readFileSync(
    "src/features/wallet/api/walletOverviewApi.js",
    "utf8"
  );

const statement =
  fs.readFileSync(
    "src/features/wallet/components/WalletStatement.jsx",
    "utf8"
  );


function projectorBody() {
  const start =
    api.indexOf(
      "export function projectWalletTransaction"
    );

  const end =
    api.indexOf(
      "\n\nexport function resolveWalletTransactions",
      start
    );

  assert.ok(
    start >= 0 &&
    end > start
  );

  return api.slice(
    start,
    end
  );
}


test(
  "Wallet projector preserves immutable store display name",
  () => {
    const body =
      projectorBody();

    assert.match(
      body,
      /pos_payment:[\s\S]*store_display_name:[\s\S]*row\.pos_payment[\s\S]*\.store_display_name/
    );
  }
);


test(
  "customer POS projection drops stale technical identities",
  () => {
    const body =
      projectorBody();

    for (
      const forbidden
      of [
        "bill_reference",
        "pos_parent",
        "pos_id",
        "store_id",
        "store_code",
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
  "store identity is never manufactured or hardcoded",
  () => {
    const body =
      projectorBody();

    assert.doesNotMatch(
      body,
      /Cing Hu Tang Kinh Bắc/
    );

    assert.doesNotMatch(
      body,
      /cing_wallet_pos_stores/
    );
  }
);


test(
  "Wallet statement consumes projected store display name",
  () => {
    assert.match(
      statement,
      /row\?\.pos_payment[\s\S]*store_display_name/
    );

    assert.match(
      statement,
      /"Thanh toán đơn hàng tại cửa hàng " \+[\s\S]*storeDisplayName/
    );
  }
);
