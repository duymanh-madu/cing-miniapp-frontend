import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const gate = fs.readFileSync(
  "src/bootstrap/components/AppBootstrapGate.jsx",
  "utf8"
);

const orchestrator = fs.readFileSync(
  "src/bootstrap/services/appBootstrapOrchestrator.js",
  "utf8"
);

test(
  "application router is not blocked by runtime bootstrap",
  () => {
    assert.match(
      gate,
      /void initializeApplication\(\)/
    );

    assert.doesNotMatch(
      gate,
      /await initializeApplication\(\)/
    );

    assert.doesNotMatch(
      gate,
      /useState/
    );

    assert.doesNotMatch(
      gate,
      /if\s*\(\s*!ready\s*\)/
    );

    assert.match(
      gate,
      /return children/
    );
  }
);

test(
  "runtime bootstrap authority remains intact",
  () => {
    assert.match(
      orchestrator,
      /bootstrapRuntime\(\)/
    );

    assert.match(
      orchestrator,
      /initialized/
    );
  }
);

test(
  "bootstrap gate does not create second runtime authority",
  () => {
    const executableCalls =
      (
        gate.match(
          /void\s+initializeApplication\(\);/g
        ) || []
      ).length;

    assert.equal(
      executableCalls,
      1
    );
  }
);
