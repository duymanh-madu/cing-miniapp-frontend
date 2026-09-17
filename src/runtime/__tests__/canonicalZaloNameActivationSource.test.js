import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL(
    "../customer/runtimeCustomerIdentityEngine.ts",
    import.meta.url
  ),
  "utf8"
);

function activationRegion() {
  const start = source.indexOf(
    "export async function initializeCustomerIdentityEngine()"
  );

  assert.ok(start >= 0);

  return source.slice(start);
}

test("Cing iu is rejected as canonical runtime identity", () => {
  const start = source.indexOf(
    "const GENERIC_RUNTIME_NAMES"
  );

  const end = source.indexOf(
    "function cleanRuntimeName",
    start
  );

  assert.ok(start >= 0);
  assert.ok(end > start);

  const region = source.slice(start, end);

  assert.match(
    region,
    /["']cing iu["']/
  );
});

test("activation attempts canonical Zalo SDK identity", () => {
  const region = activationRegion();

  assert.match(
    region,
    /await getZaloUserInfo\(\)\.catch\(\(\) => null\)/
  );

  assert.match(
    region,
    /const fullName\s*=\s*pickRuntimeName\(\s*zaloUserInfo\?\.name\s*,\s*currentIdentity\?\.fullName\s*\)/
  );
});

test("activation forwards resolved name to backend", () => {
  const region = activationRegion();

  assert.match(
    region,
    /activateMiniAppUser\(\{[\s\S]*?name:\s*fullName/
  );
});

test("activation result never manufactures Cing iu", () => {
  const region = activationRegion();

  const start = region.indexOf(
    "const resolvedFullName"
  );

  const end = region.indexOf(
    "store.setIdentity",
    start
  );

  assert.ok(start >= 0);
  assert.ok(end > start);

  const resolved = region.slice(start, end);

  assert.match(
    resolved,
    /pickRuntimeName\(\s*result\?\.fullName\s*,\s*fullName\s*,\s*currentIdentity\?\.fullName\s*\)/
  );

  assert.doesNotMatch(
    resolved,
    /["']Cing iu["']/
  );

  assert.doesNotMatch(
    resolved,
    /\|\|\s*["'][^"']+["']/
  );
});

test("activation identity still becomes activated after backend success", () => {
  const region = activationRegion();

  assert.match(
    region,
    /store\.setIdentity\(\{[\s\S]*?fullName:\s*resolvedFullName[\s\S]*?memberActivated:\s*true/
  );

  assert.match(
    region,
    /store\.setActivationStatus\(["']activated["']\)/
  );
});
