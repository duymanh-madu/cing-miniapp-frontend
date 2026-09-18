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

const startup = fs.readFileSync(
  "src/runtime/startup/startupDiagnostic.ts",
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


test(
  "existing startup marks persist before visual diagnostic gate",
  () => {
    assert.match(
      startup,
      /recordStartupLifecycleEvent/
    );

    assert.match(
      startup,
      /startup:\$\{name\}/
    );

    const persist =
      startup.indexOf(
        "recordStartupLifecycleEvent"
      );

    const visualGate =
      startup.indexOf(
        "if (!current.enabled)"
      );

    assert.ok(persist >= 0);
    assert.ok(visualGate > persist);
  }
);

test(
  "recorder observes silent runtime crash signals",
  () => {
    assert.match(
      lifecycle,
      /window:error/
    );

    assert.match(
      lifecycle,
      /window:unhandledrejection/
    );
  }
);

test(
  "hidden trace retains enough history for warm failure experiment",
  () => {
    assert.match(
      home,
      /trace\.slice\(-70\)/
    );
  }
);
