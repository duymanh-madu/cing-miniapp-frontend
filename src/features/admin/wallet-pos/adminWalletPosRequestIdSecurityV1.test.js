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


function uuidBody() {
  const start =
    source.indexOf(
      "function createRequestId"
    );

  const end =
    source.indexOf(
      "\nfunction appendAmountDigits",
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


function createQrBody() {
  const start =
    source.indexOf(
      "const createQr ="
    );

  const end =
    source.indexOf(
      "\n  const nextTransaction",
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
  "request id prefers native cryptographic randomUUID",
  () => {
    const body =
      uuidBody();

    assert.match(
      body,
      /typeof cryptoApi\.randomUUID ===[\s\S]*"function"/
    );

    assert.match(
      body,
      /cryptoApi[\s\S]*\.randomUUID\(\)/
    );
  }
);


test(
  "UUID fallback requires cryptographic getRandomValues",
  () => {
    const body =
      uuidBody();

    assert.match(
      body,
      /typeof cryptoApi\.getRandomValues !==[\s\S]*"function"[\s\S]*throw new Error/
    );

    assert.match(
      body,
      /cryptoApi\.getRandomValues\([\s\S]*bytes/
    );

    assert.doesNotMatch(
      body,
      /getRandomValues\?\./
    );

    assert.doesNotMatch(
      body,
      /Math\.random/
    );
  }
);


test(
  "missing crypto fails closed instead of emitting zero-entropy UUID",
  () => {
    const body =
      uuidBody();

    assert.match(
      body,
      /if \([\s\S]*!cryptoApi[\s\S]*\)[\s\S]*throw new Error/
    );

    assert.doesNotMatch(
      body,
      /00000000-0000-4000-8000-000000000000/
    );
  }
);


test(
  "request id generation occurs inside guarded create attempt",
  () => {
    const body =
      createQrBody();

    const tryAt =
      body.indexOf(
        "try {"
      );

    const requestAt =
      body.indexOf(
        "createRequestId()"
      );

    const requestSaveAt =
      body.indexOf(
        "requestIdRef.current ="
      );

    const networkAt =
      body.indexOf(
        "createWalletPosManualPayment("
      );

    assert.ok(
      tryAt >= 0
    );

    assert.ok(
      requestAt > tryAt
    );

    assert.ok(
      requestSaveAt > requestAt
    );

    assert.ok(
      networkAt > requestSaveAt
    );
  }
);


test(
  "request id remains sticky across retry of the same attempt",
  () => {
    const body =
      createQrBody();

    assert.match(
      body,
      /requestIdRef\.current \|\|[\s\S]*createRequestId\(\)/
    );

    assert.match(
      body,
      /requestIdRef\.current =[\s\S]*requestId/
    );
  }
);
