import assert from
  "node:assert/strict";

import {
  test,
} from "node:test";

import {
  readFileSync,
} from "node:fs";

const source =
  readFileSync(
    new URL(
      "../runtime/blockPuzzleAuthorityClient.js",
      import.meta.url
    ),
    "utf8"
  );

function continueFunction() {
  const anchor =
    "export async function\npurchaseAuthorizedBlockPuzzleContinue";

  const index =
    source.indexOf(
      anchor
    );

  assert.ok(
    index >= 0,
    "Continue function must exist"
  );

  return source.slice(
    index
  );
}

test(
  "exact V5 tuple selects Revive Credit receipt",
  () => {
    const body =
      continueFunction();

    assert.match(
      body,
      /replay\.engineVersion === 4/
    );

    assert.match(
      body,
      /replay\.rulesVersion === 4/
    );

    assert.match(
      body,
      /replay\.scoreVersion === 3/
    );

    assert.match(
      body,
      /replay\.replayVersion === 5/
    );

    assert.match(
      body,
      /isV5Revive[\s\S]*normalizeBlockPuzzleV5ReviveResponse/
    );
  }
);

test(
  "legacy response retains points normalizer",
  () => {
    const body =
      continueFunction();

    assert.match(
      body,
      /:\s*normalizeAuthoritativeContinuePurchase/
    );

    assert.match(
      source,
      /raw\.points_cost/
    );

    assert.match(
      source,
      /5,[\s\S]*10,[\s\S]*20,/
    );
  }
);

test(
  "HTTP request shape and auth recovery preserved",
  () => {
    const body =
      continueFunction();

    assert.match(
      body,
      /requestWithAuthRecovery/
    );

    assert.match(
      body,
      /\/session\/\$\{normalizedSessionId\}\/continue/
    );

    assert.match(
      body,
      /request_id:[\s\S]*normalizedRequestId/
    );

    assert.match(
      body,
      /request_id:[\s\S]*replay,/
    );
  }
);

test(
  "client does not substitute credits for points",
  () => {
    const body =
      continueFunction();

    assert.doesNotMatch(
      body,
      /points_cost\s*:\s*.*credit_cost/
    );

    assert.doesNotMatch(
      body,
      /credit_cost\s*:\s*.*points_cost/
    );
  }
);

test(
  "V5 response normalizer is isolated module",
  () => {
    assert.match(
      source,
      /from "\.\/blockPuzzleV5ReviveResponse\.js"/
    );

    assert.match(
      source,
      /normalizeBlockPuzzleV5ReviveResponse/
    );
  }
);
