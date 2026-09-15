import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import test
  from "node:test";


const source =
  fs.readFileSync(
    "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx",
    "utf8"
  );


function nextTransactionBody() {
  const start =
    source.indexOf(
      "const nextTransaction"
    );

  const end =
    source.indexOf(
      "\n\n\n  if (initialLoading)",
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
  "next transaction clears terminal paid state",
  () => {
    const body =
      nextTransactionBody();

    assert.match(
      body,
      /paidLatchRef\.current\s*=\s*false/
    );

    assert.match(
      body,
      /previousPaidRef\.current\s*=\s*false/
    );

    assert.match(
      body,
      /setCurrent\(\s*null\s*\)/
    );

    assert.match(
      body,
      /setAmountDigits\(\s*""\s*\)/
    );

    assert.match(
      body,
      /setQrContent\(\s*""\s*\)/
    );

    assert.match(
      body,
      /setQrDataUrl\(\s*""\s*\)/
    );
  }
);


test(
  "next transaction clears prior command identities",
  () => {
    const body =
      nextTransactionBody();

    for (
      const ref
      of [
        "requestIdRef",
        "cancelRequestIdRef",
        "cancelSessionIdRef",
      ]
    ) {
      assert.match(
        body,
        new RegExp(
          ref +
          "\\.current\\s*=\\s*null"
        )
      );
    }
  }
);


test(
  "next transaction never rediscovers terminal paid session",
  () => {
    const body =
      nextTransactionBody();

    for (
      const forbidden
      of [
        "loadCurrent",
        "fetchCurrentWalletPosManualSession",
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
  "next transaction owns no network or financial authority",
  () => {
    const body =
      nextTransactionBody();

    for (
      const forbidden
      of [
        "fetch(",
        "axios",
        "supabase",
        ".rpc(",
        "createWalletPos",
        "cancelWalletPos",
        "confirm",
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
