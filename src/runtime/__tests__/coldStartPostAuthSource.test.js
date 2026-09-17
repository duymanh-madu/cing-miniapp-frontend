import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/runtime/runtimeBootstrap.ts"
  ),
  "utf8"
);

test("returning authenticated session is not opened twice", () => {
  assert.match(
    source,
    /authSessionResult\s*===\s*"no_access_token"\s*\|\|\s*authSessionResult\s*===\s*"auth_rejected"[\s\S]*?await openAuthenticatedRuntimeSession\(\)/
  );

  assert.doesNotMatch(
    source,
    /authSessionResult\s*!==\s*"transient_failure"[\s\S]*?await openAuthenticatedRuntimeSession\(\)/
  );
});

test("shell-restored session still opens fresh backend session", () => {
  const restore = source.indexOf(
    "await restoreActivatedMemberFromShellToken();"
  );

  const condition = source.indexOf(
    '"no_access_token"',
    restore
  );

  const open = source.indexOf(
    "await openAuthenticatedRuntimeSession();",
    condition
  );

  assert.ok(restore >= 0);
  assert.ok(condition > restore);
  assert.ok(open > condition);
});

test("profile enrichment cannot block bootstrap", () => {
  const identity = source.indexOf(
    "customerId: session?.profile?.id || storedPhone"
  );

  const background = source.indexOf(
    "void (async () => {",
    identity
  );

  const fetch = source.indexOf(
    'await apiClient.get(`/profile-update/profile/${storedPhone}`)',
    background
  );

  const close = source.indexOf(
    "})();",
    fetch
  );

  assert.ok(identity >= 0);
  assert.ok(background > identity);
  assert.ok(fetch > background);
  assert.ok(close > fetch);
});

test("realtime authority remains present", () => {
  assert.match(
    source,
    /initializeRuntimeSocket\(\);[\s\S]*await initializeRealtimeOrchestrator\(\);[\s\S]*registerMenuRealtime\(\)/
  );
});
