import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const recovery = fs.readFileSync(
  "src/infra/auth/protectedRouteAuthRecovery.js",
  "utf8"
);

const authority = fs.readFileSync(
  "src/infra/auth/authenticatedRuntimeSession.ts",
  "utf8"
);

const router = fs.readFileSync(
  "src/router/AppRouter.jsx",
  "utf8"
);

test("protected route recovery reuses canonical full-session authority", () => {
  assert.match(
    recovery,
    /openAuthenticatedRuntimeSession\(\)/
  );

  assert.doesNotMatch(
    recovery,
    /recoverBackendAuthSession/
  );

  assert.doesNotMatch(
    recovery,
    /recoverLocalDeviceReauthSession/
  );

  assert.doesNotMatch(
    recovery,
    /createSession/
  );
});

test("full authenticated runtime session is single-flight", () => {
  assert.match(
    authority,
    /authenticatedRuntimeSessionInFlight/
  );

  assert.match(
    authority,
    /if \(authenticatedRuntimeSessionInFlight\)/
  );

  assert.match(
    authority,
    /openAuthenticatedRuntimeSessionAuthority\(\)/
  );

  assert.match(
    authority,
    /operation\.finally/
  );
});

test("protected route retry does not classify auth outcomes itself", () => {
  assert.doesNotMatch(
    recovery,
    /markInitialAuthResolved/
  );

  assert.doesNotMatch(
    recovery,
    /clearSession/
  );

  assert.doesNotMatch(
    recovery,
    /clearStaleBackendAuthSession/
  );

  assert.doesNotMatch(
    recovery,
    /Navigate/
  );
});

test("route intent only retries while auth remains unresolved", () => {
  assert.match(
    router,
    /if \(\s*authenticated\s*\|\|\s*initialAuthResolved\s*\)/
  );

  assert.match(
    router,
    /void recoverProtectedRouteAuth\(\)/
  );

  assert.match(
    router,
    /!authenticated\s*&&\s*!initialAuthResolved/
  );

  assert.match(
    router,
    /<RouteDiagnosticScreen\s*\/>/
  );
});

test("route recovery adds no timer or polling loop", () => {
  assert.doesNotMatch(
    recovery,
    /setTimeout/
  );

  assert.doesNotMatch(
    recovery,
    /setInterval/
  );

  assert.doesNotMatch(
    recovery,
    /while\s*\(/
  );
});
