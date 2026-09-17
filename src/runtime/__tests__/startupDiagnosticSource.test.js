import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main = fs.readFileSync(
  "src/main.tsx",
  "utf8"
);

const runtime = fs.readFileSync(
  "src/runtime/runtimeBootstrap.ts",
  "utf8"
);

const gate = fs.readFileSync(
  "src/bootstrap/components/AppBootstrapGate.jsx",
  "utf8"
);

const diagnostic = fs.readFileSync(
  "src/runtime/startup/startupDiagnostic.ts",
  "utf8"
);

test("diagnostic is opt-in only", () => {
  assert.match(
    diagnostic,
    /startup_diag/
  );

  assert.match(
    diagnostic,
    /=== "1"/
  );
});

test(
  "main entry owns earliest app mark",
  () => {
    assert.match(
      main,
      /markStartup\("main-entry"\)/
    );
  }
);

test(
  "critical runtime boundaries are marked",
  () => {
    for (const mark of [
      "runtime-start",
      "runtime-session-ready",
      "runtime-stores-ready",
      "realtime-start",
      "realtime-ready",
      "runtime-ready",
    ]) {
      assert.ok(
        runtime.includes(
          `markStartup("${mark}")`
        ),
        `missing ${mark}`
      );
    }

    assert.match(
      runtime,
      /`auth-\$\{authSessionResult\}`/
    );
  }
);

test(
  "gate measures initializeApplication boundary",
  () => {
    assert.match(
      gate,
      /markStartup\("initialize-app-start"\)/
    );

    assert.match(
      gate,
      /markStartup\("initialize-app-ready"\)/
    );
  }
);


test(
  "diagnostic opt-in survives a cold WebView boot",
  () => {
    assert.match(
      diagnostic,
      /cing_startup_diagnostic/
    );

    assert.match(
      diagnostic,
      /localStorage\.setItem/
    );

    assert.match(
      diagnostic,
      /localStorage\.getItem/
    );
  }
);


test(
  "diagnostic can be explicitly disarmed",
  () => {
    assert.match(
      diagnostic,
      /requested === "0"/
    );

    assert.match(
      diagnostic,
      /localStorage\.removeItem/
    );
  }
);
