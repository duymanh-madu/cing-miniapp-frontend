import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const state = fs.readFileSync(
  "src/bootstrap/state/appBootstrapAuthState.js",
  "utf8"
);

const bootstrap = fs.readFileSync(
  "src/runtime/runtimeBootstrap.ts",
  "utf8"
);

const router = fs.readFileSync(
  "src/router/AppRouter.jsx",
  "utf8"
);

const gate = fs.readFileSync(
  "src/bootstrap/components/AppBootstrapGate.jsx",
  "utf8"
);

test("boot auth resolution begins unresolved", () => {
  assert.match(
    state,
    /initialAuthResolved:\s*false/
  );

  assert.match(
    state,
    /markInitialAuthResolved/
  );
});

test("protected route waits only while cold auth is unresolved", () => {
  assert.match(
    router,
    /!authenticated\s*&&\s*!initialAuthResolved/
  );

  assert.match(
    router,
    /return <AppLoadingScreen \/>/
  );
});

test("unauth redirect occurs after unresolved guard", () => {
  const waiting =
    router.indexOf(
      "!authenticated && !initialAuthResolved"
    );

  const redirect =
    router.indexOf(
      "if (!authenticated) {"
    );

  assert.ok(waiting >= 0);
  assert.ok(redirect > waiting);
});

test("post-shell retry becomes final auth authority", () => {
  assert.match(
    bootstrap,
    /let finalAuthSessionResult\s*=\s*authSessionResult/
  );

  assert.match(
    bootstrap,
    /finalAuthSessionResult\s*=\s*await openAuthenticatedRuntimeSession\(\)/
  );
});

test("route guard releases only for definitive auth outcomes", () => {
  assert.match(
    bootstrap,
    /finalAuthSessionResult === "authenticated"/
  );

  assert.match(
    bootstrap,
    /finalAuthSessionResult === "no_access_token"/
  );

  assert.match(
    bootstrap,
    /finalAuthSessionResult === "auth_rejected"/
  );

  assert.match(
    bootstrap,
    /markInitialAuthResolved\(\)/
  );
});

test("transient failure cannot release auth guard", () => {
  const start =
    bootstrap.indexOf(
      'if (\n    finalAuthSessionResult === "authenticated"'
    );

  const end =
    bootstrap.indexOf(
      "await initializeRuntimeStores()",
      start
    );

  assert.ok(start >= 0);
  assert.ok(end > start);

  const block =
    bootstrap.slice(start, end);

  assert.doesNotMatch(
    block,
    /transient_failure/
  );
});

test("global Home render remains non-blocking", () => {
  assert.match(
    gate,
    /void initializeApplication\(\)/
  );

  assert.doesNotMatch(
    gate,
    /await initializeApplication/
  );

  assert.match(
    gate,
    /return children/
  );
});
