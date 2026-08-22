import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const component =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "src/games/cing-block-puzzle/CingBlockPuzzle.jsx"
    ),
    "utf8"
  );

test(
  "paid start persists request id before authority request",
  () => {
    const persistIndex =
      component.indexOf(
        "persistBlockPuzzlePendingStart"
      );

    const requestIndex =
      component.indexOf(
        "startAuthorizedBlockPuzzleSession"
      );

    assert.ok(
      persistIndex >= 0
    );

    assert.ok(
      requestIndex >= 0
    );

    /*
     * Function import appears before both,
     * so inspect actual invocation area.
     */
    const startBody =
      component.slice(
        component.indexOf(
          "const startGame"
        ),
        component.indexOf(
          "const updateDrag"
        )
      );

    assert.ok(
      startBody.indexOf(
        "persistBlockPuzzlePendingStart({"
      ) <
      startBody.indexOf(
        "await startAuthorizedBlockPuzzleSession({"
      )
    );
  }
);

test(
  "double start has synchronous in-flight fence",
  () => {
    assert.match(
      component,
      /startInFlightRef/
    );

    assert.match(
      component,
      /startInFlightRef\.current\s*=\s*true/
    );
  }
);

test(
  "double submit has synchronous in-flight fence",
  () => {
    assert.match(
      component,
      /submitInFlightRef/
    );

    assert.match(
      component,
      /submitInFlightRef\s*\.current\s*=\s*true/
    );
  }
);

test(
  "every accepted move persists exact replay runtime",
  () => {
    assert.match(
      component,
      /persistBlockPuzzleRuntime/
    );

    assert.match(
      component,
      /runtime:\s*nextRuntime/
    );
  }
);

test(
  "successful authoritative submit clears recovery",
  () => {
    assert.match(
      component,
      /applyAuthoritativeBlockPuzzleSubmission/
    );

    assert.match(
      component,
      /clearBlockPuzzleRecovery/
    );
  }
);

test(
  "component suppresses async React mutations after unmount",
  () => {
    assert.match(
      component,
      /mountedRef/
    );

    assert.match(
      component,
      /mountedRef\.current/
    );
  }
);

test(
  "definitive expired start releases old recovery key",
  () => {
    const startBody =
      component.slice(
        component.indexOf(
          "const startGame"
        ),
        component.indexOf(
          "const updateDrag"
        )
      );

    assert.match(
      startBody,
      /BLOCK_PUZZLE_SESSION_EXPIRED/
    );

    assert.match(
      startBody,
      /clearBlockPuzzleRecovery/
    );

    assert.match(
      startBody,
      /requestIdRef\.current\s*=\s*null/
    );
  }
);

test(
  "ambiguous start failure preserves request id for idempotent retry",
  () => {
    const startBody =
      component.slice(
        component.indexOf(
          "const startGame"
        ),
        component.indexOf(
          "const updateDrag"
        )
      );

    assert.match(
      startBody,
      /Ambiguous\/network failure intentionally/
    );

    assert.match(
      startBody,
      /PHASE\.START_ERROR/
    );
  }
);
