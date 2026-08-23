import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const client =
  fs.readFileSync(
    new URL(
      "../runtime/blockPuzzleAuthorityClient.js",
      import.meta.url
    ),
    "utf8"
  );

const runtime =
  fs.readFileSync(
    new URL(
      "../runtime/blockPuzzleSessionRuntime.js",
      import.meta.url
    ),
    "utf8"
  );

const recovery =
  fs.readFileSync(
    new URL(
      "../runtime/blockPuzzleTerminalIntentRecovery.js",
      import.meta.url
    ),
    "utf8"
  );

const component =
  fs.readFileSync(
    new URL(
      "../CingBlockPuzzle.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "continue purchase uses dedicated authenticated session endpoint",
  () => {
    assert.match(
      client,
      /\/session\/\$\{normalizedSessionId\}\/continue/
    );

    assert.match(
      client,
      /request_id/
    );

    const purchaseFunction =
      client.slice(
        client.indexOf(
          "export async function\npurchaseAuthorizedBlockPuzzleContinue"
        )
      );

    assert.ok(
      purchaseFunction.length > 0
    );

    assert.doesNotMatch(
      purchaseFunction,
      /\bpoints_cost\b/
    );

    assert.match(
      purchaseFunction,
      /request_id:[\s\S]*normalizedRequestId/
    );

    assert.match(
      purchaseFunction,
      /replay,/
    );
  }
);

test(
  "continue is applied only after authoritative purchase",
  () => {
    assert.match(
      runtime,
      /createReplayContinue/
    );

    assert.match(
      runtime,
      /appendReplayContinue/
    );

    assert.match(
      runtime,
      /applyContinue/
    );

    assert.match(
      runtime,
      /purchase\?\.continue_index !==[\s\S]*expectedIndex/
    );
  }
);

test(
  "pending continue has durable independent idempotency key",
  () => {
    assert.match(
      recovery,
      /continue_pending/
    );

    assert.match(
      recovery,
      /request_id/
    );

    assert.match(
      component,
      /previousIntent\?\.action ===[\s\S]*continue_pending/
    );

    assert.match(
      component,
      /createBlockPuzzleRequestId/
    );
  }
);

test(
  "terminal gameplay offers continue instead of immediate submit",
  () => {
    assert.match(
      component,
      /enterTerminalDecision\([\s\S]*nextRuntime/
    );

    assert.match(
      component,
      /PHASE\.CONTINUE_OFFER/
    );

    assert.match(
      component,
      /Kết thúc ván/
    );

    assert.match(
      component,
      /5, 10, 20/
    );
  }
);

test(
  "successful purchase persists resumed runtime before clearing pending intent",
  () => {
    const persistIndex =
      component.indexOf(
        "persistBlockPuzzleRuntime({"
      );

    const clearIndex =
      component.indexOf(
        "clearBlockPuzzleTerminalIntent();",
        persistIndex
      );

    assert.ok(
      persistIndex >= 0
    );

    assert.ok(
      clearIndex >
        persistIndex
    );
  }
);
