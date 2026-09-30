import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    new URL(
      "../../../components/home/HomeHero.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Home subscribes to runtime member display name",
  () => {
    assert.match(
      source,
      /useRuntimeCustomerIdentityStore/
    );

    assert.match(
      source,
      /s => s\.identity\?\.fullName \|\| ""/
    );
  }
);

test(
  "runtime name is only a Home presentation fallback",
  () => {
    assert.match(
      source,
      /const runtimeProfile[\s\S]*\{ name: runtimeName \}/
    );

    assert.match(
      source,
      /resolveProfileName\([\s\S]*authProfile[\s\S]*customerProfile[\s\S]*runtimeProfile/
    );
  }
);

test(
  "Home presentation fallback creates no auth authority",
  () => {
    assert.doesNotMatch(
      source,
      /createSession|openAuthenticatedRuntimeSession|setSession|setAuthenticated/
    );
  }
);
