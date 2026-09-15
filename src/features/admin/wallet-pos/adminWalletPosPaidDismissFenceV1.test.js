import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";


const counter =
  fs.readFileSync(
    new URL(
      "./AdminWalletPosCounter.jsx",
      import.meta.url
    ),
    "utf8"
  );


function functionSlice(
  source,
  startMarker,
  endMarker
) {
  const start =
    source.indexOf(
      startMarker
    );

  assert.notEqual(
    start,
    -1,
    startMarker
  );

  const end =
    source.indexOf(
      endMarker,
      start +
        startMarker.length
    );

  assert.notEqual(
    end,
    -1,
    endMarker
  );

  return source.slice(
    start,
    end
  );
}


test(
  "cashier owns exact dismissed paid session identity",
  () => {
    assert.match(
      counter,
      /const dismissedPaidSessionIdRef\s*=\s*useRef\(null\)/
    );
  }
);


test(
  "next transaction dismisses only exact paid receipt",
  () => {
    const body =
      functionSlice(
        counter,
        "const nextTransaction",
        "if (initialLoading)"
      );

    assert.match(
      body,
      /paidSession\?\.id/
    );

    assert.match(
      body,
      /dismissedPaidSessionIdRef[\s\S]*\.current\s*=[\s\S]*paidSession\.id/
    );

    assert.doesNotMatch(
      body,
      /PAID_STATUSES\.has\([\s\S]*current\.status/
    );

    assert.doesNotMatch(
      body,
      /loadCurrent\s*\(/
    );
  }
);

test(
  "polling ignores exact dismissed paid session",
  () => {
    const body =
      functionSlice(
        counter,
        "const loadCurrent",
        "const canCancelCurrent"
      );

    assert.match(
      body,
      /next\.id\s*===\s*dismissedPaidSessionId/
    );

    assert.match(
      body,
      /PAID_STATUSES\.has\([\s\S]*next\.status/
    );

    assert.match(
      body,
      /nextIsDismissedPaidSession[\s\S]*setCurrent\([\s\S]*null/
    );

    assert.match(
      body,
      /nextIsDismissedPaidSession[\s\S]*return;/
    );
  }
);


test(
  "different canonical session releases dismiss fence",
  () => {
    const body =
      functionSlice(
        counter,
        "const loadCurrent",
        "const canCancelCurrent"
      );

    assert.match(
      body,
      /next\.id\s*!==\s*dismissedPaidSessionId/
    );

    assert.match(
      body,
      /dismissedPaidSessionIdRef[\s\S]*\.current\s*=[\s\S]*null/
    );

    assert.match(
      body,
      /setCurrent\([\s\S]*previous[\s\S]*next/
    );
  }
);


test(
  "dismiss fence owns no backend or financial mutation",
  () => {
    const body =
      functionSlice(
        counter,
        "const nextTransaction",
        "if (initialLoading)"
      );

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
