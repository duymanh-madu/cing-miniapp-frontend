import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  "src/router/AppRouter.jsx",
  "utf8"
);

const start = source.indexOf(
  "function AuthRequired({ children })"
);

const end = source.indexOf(
  "export default function AppRouter()",
  start
);

assert.ok(start >= 0);
assert.ok(end > start);

const authRequired = source.slice(start, end);

test("auth rejection terminates route waiting without Home redirect", () => {
  assert.match(
    authRequired,
    /routeAuthResult === "auth_rejected"/
  );

  assert.match(
    authRequired,
    /!routeRecoveryRejected/
  );

  assert.match(
    authRequired,
    /Cần đăng nhập/
  );

  assert.equal(
    authRequired.includes('<Navigate to="/" replace />'),
    false
  );
});

test("transient failure terminates waiting without redirect", () => {
  assert.match(
    authRequired,
    /routeAuthResult\.startsWith\("transient_failure"\)/
  );

  assert.match(
    authRequired,
    /!routeRecoveryFailed/
  );

  const failureStart = authRequired.indexOf(
    "    routeRecoveryFailed\n  ) {"
  );

  const redirectStart = authRequired.indexOf(
    "if (!authenticated) {",
    failureStart
  );

  assert.ok(failureStart >= 0);
  assert.ok(redirectStart > failureStart);

  const failureBranch = authRequired.slice(
    failureStart,
    redirectStart
  );

  assert.match(
    failureBranch,
    /Tạm thời chưa thể kết nối/
  );

  assert.doesNotMatch(
    failureBranch,
    /Navigate|clearSession|logout/
  );
});

test("definitive bootstrap auth takes precedence over transient UX", () => {
  assert.match(
    authRequired,
    /!authenticated\s*&&\s*!initialAuthResolved\s*&&\s*routeRecoveryFailed/
  );
});

test("backend-auth authority remains unchanged", () => {
  assert.match(
    authRequired,
    /recoverProtectedRouteAuth\(\)/
  );

  assert.match(
    authRequired,
    /return children;/
  );

  assert.doesNotMatch(
    authRequired,
    /setSession|setAuthenticated|setInitialAuthResolved/
  );
});

test("no timing or logout work introduced", () => {
  assert.doesNotMatch(
    authRequired,
    /setTimeout|setInterval|requestAnimationFrame/
  );

  assert.doesNotMatch(
    authRequired,
    /clearSession|logout/
  );
});

test("rejected auth remains blocked without forced Home navigation", () => {
  assert.match(authRequired, /Cần đăng nhập/);

  assert.equal(
    authRequired.includes('<Navigate to="/" replace />'),
    false
  );

  assert.equal(
    source.split('<Navigate to="/" replace />').length - 1,
    1
  );
});

test("customer route loading hides technical diagnostics", () => {
  assert.match(source, /Cing đang chuẩn bị cho bạn/);

  assert.equal(
    source.includes('phase={`AUTH_WAIT'),
    false
  );

  assert.equal(
    source.includes('phase="LAZY_WAIT"'),
    false
  );
});
