import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const runtimeSource = fs.readFileSync(
  "src/runtime/runtimeBootstrap.ts",
  "utf8"
);
import path from "node:path";

const bootstrapSource = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/runtime/runtimeBootstrap.ts"
  ),
  "utf8"
);

const mainSource = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/main.tsx"
  ),
  "utf8"
);

function requestShellSource() {
  const start = bootstrapSource.indexOf(
    "async function requestShellBootData"
  );

  const end = bootstrapSource.indexOf(
    "export async function bootstrapRuntime",
    start
  );

  assert.ok(start >= 0);
  assert.ok(end > start);

  return bootstrapSource.slice(start, end);
}

test(
  "main entry caches shell boot data before React mount",
  () => {
    assert.match(
      mainSource,
      /__shellBootData\s*=\s*e\.data/
    );

    const listener =
      mainSource.indexOf(
        'window.addEventListener("message"'
      );

    const render =
      mainSource.indexOf(
        "ReactDOM.createRoot"
      );

    assert.ok(listener >= 0);
    assert.ok(render > listener);
  }
);

test(
  "requestShellBootData consumes early cached message before installing recovery wait",
  () => {
    const source = requestShellSource();

    const cacheRead =
      source.indexOf(
        "(window as any).__shellBootData"
      );

    const cacheReturn =
      source.indexOf(
        "return cachedShellBootData"
      );

    const promise =
      source.indexOf(
        "return new Promise"
      );

    assert.ok(cacheRead >= 0);
    assert.ok(cacheReturn > cacheRead);
    assert.ok(promise > cacheReturn);

    assert.match(
      source,
      /cachedShellBootData\?\.type\s*===\s*"SHELL_BOOT_DATA"/
    );
  }
);

test(
  "shell listener request and bounded startup recovery remain intact",
  () => {
    const source = requestShellSource();

    assert.match(
      source,
      /window\.addEventListener\("message", handler\)/
    );

    assert.match(
      source,
      /REQUEST_SHELL_BOOT_DATA/
    );

    assert.match(
      source,
      /SHELL_BOOT_STARTUP_BUDGET_MS/
    );

    assert.match(
      runtimeSource,
      /const SHELL_BOOT_STARTUP_BUDGET_MS = 1200;/
    );
  }
);
