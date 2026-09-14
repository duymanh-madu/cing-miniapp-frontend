import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import path
  from "node:path";

import test
  from "node:test";

import {
  fileURLToPath,
} from "node:url";

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const root =
  path.resolve(
    __dirname,
    "../../../.."
  );

const api =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/adminWalletPosApi.js"
    ),
    "utf8"
  );

const counter =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/admin-wallet-pos.css"
    ),
    "utf8"
  );


function functionSlice(
  source,
  startName,
  endName = null
) {
  const start =
    source.indexOf(
      startName
    );

  assert.ok(
    start >= 0,
    `${startName} must exist`
  );

  if (!endName) {
    return source.slice(
      start
    );
  }

  const end =
    source.indexOf(
      endName,
      start + startName.length
    );

  assert.ok(
    end > start,
    `${endName} must follow ${startName}`
  );

  return source.slice(
    start,
    end
  );
}


test(
  "alert GET helper owns optional store_id read filter",
  () => {
    const body =
      functionSlice(
        api,
        "fetchWalletPosAlerts",
        "fetchCurrentWalletPosManualSession"
      );

    assert.match(
      body,
      /storeId\s*=\s*null/
    );

    assert.match(
      body,
      /query\.set\([\s\S]*"store_id"[\s\S]*normalizedStoreId/
    );
  }
);


test(
  "resolution POST remains completely store blind",
  () => {
    const body =
      functionSlice(
        api,
        "resolveWalletPosAlert"
      );

    for (
      const forbidden
      of [
        "store_id",
        "storeId",
        "pos_parent",
        "pos_id",
        "customer_user_id",
      ]
    ) {
      assert.equal(
        body.includes(
          forbidden
        ),
        false,
        `${forbidden} must not enter resolution helper`
      );
    }

    assert.match(
      body,
      /request_id/
    );

    assert.match(
      body,
      /resolution_action/
    );

    assert.match(
      body,
      /reason_code/
    );
  }
);


test(
  "Super Admin surface has explicit all-store filter state",
  () => {
    assert.match(
      counter,
      /alertStoreId/
    );

    assert.match(
      counter,
      /alertStoreOptions/
    );

    assert.match(
      counter,
      /Tất cả cửa hàng/
    );

    assert.match(
      counter,
      /setAlertStoreId/
    );
  }
);


test(
  "selected store is sent only through alert GET load",
  () => {
    const body =
      functionSlice(
        counter,
        "const loadAlerts",
        "const loadCurrent"
      );

    assert.match(
      body,
      /fetchWalletPosAlerts/
    );

    assert.match(
      body,
      /storeId:[\s\S]*alertStoreId/
    );
  }
);


test(
  "each alert displays historical store attribution",
  () => {
    assert.match(
      counter,
      /cing-pay-counter__alert-store/
    );

    assert.match(
      counter,
      /store_display_name/
    );

    assert.match(
      counter,
      /store_code/
    );

    assert.match(
      counter,
      /Không xác định/
    );
  }
);


test(
  "filter options derive from alert projection without hardcoded POS",
  () => {
    assert.match(
      counter,
      /setAlertStoreOptions/
    );

    assert.match(
      counter,
      /\.store_id/
    );

    assert.match(
      counter,
      /\.store_display_name/
    );

    assert.doesNotMatch(
      counter,
      /109664/
    );

    assert.doesNotMatch(
      counter,
      /BRAND-DQIR/
    );
  }
);


test(
  "multi-store alert CSS exists once",
  () => {
    assert.equal(
      (
        css.match(
          /\.cing-pay-counter__alert-filter\s*\{/g
        ) || []
      ).length,
      1
    );

    assert.equal(
      (
        css.match(
          /\.cing-pay-counter__alert-store\s*\{/g
        ) || []
      ).length,
      1
    );
  }
);
