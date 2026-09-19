import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    "src/runtime/runtimeBootstrap.ts",
    "utf8"
  );

test(
  "shell boot cannot block startup for historical 8 seconds",
  () => {
    assert.match(
      source,
      /SHELL_BOOT_STARTUP_BUDGET_MS\s*=\s*1200/
    );

    assert.match(
      source,
      /setTimeout\([\s\S]*SHELL_BOOT_STARTUP_BUDGET_MS/
    );

    assert.doesNotMatch(
      source,
      /\},\s*8000\s*\)/
    );
  }
);

test(
  "shell boot request remains immediate",
  () => {
    assert.match(
      source,
      /window\.parent\.postMessage\(\{\s*type:\s*"REQUEST_SHELL_BOOT_DATA"\s*\},\s*"\*"\)/
    );
  }
);

test(
  "early shell boot cache remains authoritative",
  () => {
    assert.match(
      source,
      /const cachedShellBootData[\s\S]*__shellBootData/
    );

    assert.match(
      source,
      /cachedShellBootData\?\.type[\s\S]*SHELL_BOOT_DATA[\s\S]*return cachedShellBootData/
    );
  }
);
