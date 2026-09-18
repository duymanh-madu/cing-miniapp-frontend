import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const main = fs.readFileSync(
  "src/main.tsx",
  "utf8"
);

const lifecycle = fs.readFileSync(
  "src/runtime/startup/startupLifecycleDiagnostic.ts",
  "utf8"
);

const home = fs.readFileSync(
  "src/features/home/pages/HomePage.jsx",
  "utf8"
);

test(
  "lifecycle recorder installs before React mount",
  () => {
    const install =
      main.indexOf(
        "installStartupLifecycleDiagnostic();"
      );

    const render =
      main.indexOf(
        "ReactDOM.createRoot"
      );

    assert.ok(install >= 0);
    assert.ok(render > install);
  }
);

test(
  "lifecycle recorder persists a bounded trace",
  () => {
    assert.match(
      lifecycle,
      /cing_startup_lifecycle_trace_v1/
    );

    assert.match(
      lifecycle,
      /MAX_EVENTS\s*=\s*80/
    );

    assert.match(
      lifecycle,
      /\.slice\(-MAX_EVENTS\)/
    );

    assert.match(
      lifecycle,
      /localStorage\.setItem/
    );
  }
);

test(
  "lifecycle recorder observes warm re-entry signals",
  () => {
    for (const event of [
      "visibilitychange",
      "focus",
      "blur",
      "pageshow",
      "pagehide",
    ]) {
      assert.ok(
        lifecycle.includes(event),
        `missing ${event}`
      );
    }
  }
);

test(
  "lifecycle recorder is automatic before React mount",
  () => {
    assert.doesNotMatch(
      lifecycle,
      /getStartupDiagnostic/
    );

    assert.doesNotMatch(
      lifecycle,
      /if \(!enabled\(\)\)/
    );
  }
);

test(
  "Home keeps lifecycle trace hidden behind explicit reveal gesture",
  () => {
    assert.match(
      home,
      /getStartupLifecycleTrace/
    );

    assert.match(
      home,
      /WARM RE-ENTRY TRACE/
    );

    assert.match(
      home,
      /showTrace/
    );

    assert.match(
      home,
      /tapCountRef\.current >= 7/
    );

    assert.doesNotMatch(
      home,
      /armStartupDiagnostic/
    );

    assert.doesNotMatch(
      home,
      /LIFECYCLE DIAGNOSTIC ARMED/
    );
  }
);
