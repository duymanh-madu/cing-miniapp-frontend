import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    new URL(
      "../runtime/cingArtilleryRealtimeClient.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "durable catchup no longer advances cursor before presentation",
  () => {
    const start =
      source.indexOf(
        "async function readResultCatchup"
      );

    const end =
      source.indexOf(
        "async function sendShot",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      source.slice(
        start,
        end
      );

    assert.doesNotMatch(
      block,
      /advanceResultCursor\s*\(/u
    );
  }
);

test(
  "live durable result presentation precedes canonical snapshot reconciliation",
  () => {
    const presentation =
      source.indexOf(
        "await presentCanonicalResults("
      );

    const snapshot =
      source.indexOf(
        "await refreshCanonicalBattleSnapshot(",
        presentation
      );

    assert.ok(
      presentation >= 0
    );

    assert.ok(
      snapshot > presentation
    );
  }
);

test(
  "presentation advances cursor only after canonical result callback",
  () => {
    const start =
      source.indexOf(
        "async function presentCanonicalResults"
      );

    const end =
      source.indexOf(
        "async function recoverDurableResults",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      source.slice(
        start,
        end
      );

    const callback =
      block.indexOf(
        "await onCanonicalShotResult("
      );

    const cursor =
      block.indexOf(
        "advanceResultCursor(["
      );

    assert.ok(
      callback >= 0
    );

    assert.ok(
      cursor > callback
    );
  }
);

test(
  "reconnect fast-forwards canonical snapshot without replaying historical presentation",
  () => {
    const start =
      source.indexOf(
        "async function recoverJoinedMatch"
      );

    assert.ok(
      start >= 0
    );

    const block =
      source.slice(
        start,
        start + 2600
      );

    assert.match(
      block,
      /requireResult\s*:\s*false/u
    );

    assert.match(
      block,
      /presentResults\s*:\s*false/u
    );
  }
);

test(
  "result rows cross canonical projection before presentation",
  () => {
    assert.match(
      source,
      /projectCanonicalResultV1/u
    );

    assert.match(
      source,
      /const canonicalResults\s*=\s*projectCanonicalResults\s*\(\s*data\.results\s*\)/u
    );
  }
);
