import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../runtimeBootstrap.ts", import.meta.url),
  "utf8"
);

function bootstrapSource() {
  const start =
    source.indexOf("export async function bootstrapRuntime()");

  assert.ok(start >= 0, "bootstrapRuntime missing");

  return source.slice(start);
}

test("persisted returning member starts backend validation before shell handshake", () => {
  const boot = bootstrapSource();

  const early =
    boot.indexOf("const earlyAuthSessionPromise");

  const shell =
    boot.indexOf("const shellBootDataPromise");

  const result =
    boot.indexOf("const authSessionResult =");

  assert.ok(early >= 0);
  assert.ok(shell > early);
  assert.ok(result > shell);

  assert.match(
    boot.slice(early, shell),
    /canStartFromPersistedAuth[\s\S]*openAuthenticatedRuntimeSession\(\)/
  );
});

test("shell data still has one reconciliation authority", () => {
  const boot = bootstrapSource();

  assert.match(
    boot,
    /async function reconcileShellBootData\([\s\S]*shellBootData: any[\s\S]*if \(shellBootData\?\.zaloId \|\| shellBootData\?\.phone\)/
  );

  assert.match(
    boot,
    /const shellReconciliationPromise\s*=\s*shellBootDataPromise\.then\(\s*reconcileShellBootData\s*\)/
  );

  assert.doesNotMatch(
    boot,
    /const shellBootData\s*=\s*await requestShellBootData\(\)/
  );
});

test("only backend-authenticated result receives nonblocking shell fast release", () => {
  const boot = bootstrapSource();

  const conditionStart =
    boot.indexOf(
      "if (",
      boot.indexOf("const authSessionResult =")
    );

  assert.ok(conditionStart >= 0);

  const fast =
    boot.indexOf(
      "void shellReconciliationPromise;",
      conditionStart
    );

  const conservative =
    boot.indexOf(
      "await shellReconciliationPromise;",
      fast
    );

  assert.ok(fast > conditionStart);
  assert.ok(conservative > fast);

  const branch =
    boot.slice(conditionStart, conservative);

  assert.match(
    branch,
    /authSessionResult\s*===\s*"authenticated"[\s\S]*void shellReconciliationPromise;[\s\S]*else\s*\{/
  );
});

test("all non-authenticated results enter conservative shell wait", () => {
  const boot = bootstrapSource();

  const fast =
    boot.indexOf("void shellReconciliationPromise;");

  const wait =
    boot.indexOf(
      "await shellReconciliationPromise;",
      fast
    );

  assert.ok(fast >= 0);
  assert.ok(wait > fast);

  const between =
    boot.slice(fast, wait + "await shellReconciliationPromise;".length);

  assert.match(
    between,
    /else\s*\{[\s\S]*await shellReconciliationPromise;/
  );
});

test("no-token and rejected auth restore only after shell reconciliation", () => {
  const boot = bootstrapSource();

  const wait =
    boot.indexOf("await shellReconciliationPromise;");

  const noToken =
    boot.indexOf('"no_access_token"', wait);

  const rejected =
    boot.indexOf('"auth_rejected"', wait);

  const restore =
    boot.indexOf(
      "await restoreActivatedMemberFromShellToken();",
      wait
    );

  assert.ok(wait >= 0);
  assert.ok(noToken > wait);
  assert.ok(rejected > wait);
  assert.ok(restore > noToken);
  assert.ok(restore > rejected);
});

test("transient failure cannot enter authenticated fast-release condition", () => {
  const boot = bootstrapSource();

  const conditionStart =
    boot.indexOf(
      "if (",
      boot.indexOf("const authSessionResult =")
    );

  const fast =
    boot.indexOf(
      "void shellReconciliationPromise;",
      conditionStart
    );

  assert.ok(conditionStart >= 0);
  assert.ok(fast > conditionStart);

  const fastCondition =
    boot.slice(conditionStart, fast);

  assert.match(
    fastCondition,
    /authSessionResult\s*===\s*"authenticated"/
  );

  assert.doesNotMatch(
    fastCondition,
    /transient_failure/
  );
});

test("cached-member app-open remains nonblocking", () => {
  assert.match(
    source,
    /void openCachedMemberRuntimeEntry\(\{/
  );

  assert.doesNotMatch(
    source,
    /await openCachedMemberRuntimeEntry\(\{/
  );
});

test("backend auth and stale-session recovery authorities remain", () => {
  assert.match(
    source,
    /await openSession\(\s*accessToken\s*\)/
  );

  assert.match(
    source,
    /recoverBackendAuthSession\(\)/
  );

  assert.match(
    source,
    /isDefinitiveAuthRecoveryRejection/
  );

  assert.match(
    source,
    /clearStaleBackendAuthSession\(\)/
  );

  assert.match(
    source,
    /await restoreActivatedMemberFromShellToken\(\)/
  );
});

test("runtime stores and realtime authorities remain", () => {
  const boot = bootstrapSource();

  assert.match(
    boot,
    /await initializeRuntimeSession\(\)/
  );

  assert.match(
    boot,
    /initializeRuntimeStores\(\)/
  );

  assert.match(
    boot,
    /initializeRuntimeSocket\(\)/
  );

  assert.match(
    boot,
    /await initializeRealtimeOrchestrator\(\)/
  );

  assert.match(
    boot,
    /registerMenuRealtime\(\)/
  );
});

test("shell recovery timeout uses bounded startup budget", () => {
  const start =
    source.indexOf("async function requestShellBootData");

  const end =
    source.indexOf(
      "export async function bootstrapRuntime",
      start
    );

  assert.ok(start >= 0);
  assert.ok(end > start);

  assert.match(
    source.slice(start, end),
    /SHELL_BOOT_STARTUP_BUDGET_MS/
  );
});


test(
  "refresh-only persisted auth bypasses shell recovery",
  () => {
    assert.match(
      source,
      /if \(!accessToken\)\s*\{[\s\S]*if \(!refreshToken\)[\s\S]*return "no_access_token";[\s\S]*return recoverAndOpen\(\);/
    );

    assert.match(
      source,
      /recoverBackendAuthSession\(\)/
    );
  }
);

test(
  "runtime bootstrap reuses canonical auth recovery instead of direct refresh",
  () => {
    const fnStart =
      source.indexOf(
        "async function openAuthenticatedRuntimeSession"
      );

    const fnEnd =
      source.indexOf(
        "function syncAuthStoreAfterSilentRestore",
        fnStart
      );

    assert.ok(fnStart >= 0);
    assert.ok(fnEnd > fnStart);

    const fn =
      source.slice(
        fnStart,
        fnEnd
      );

    assert.match(
      fn,
      /recoverBackendAuthSession\(\)/
    );

    assert.doesNotMatch(
      fn,
      /apiClient\.post\(\s*"\/auth\/refresh"/
    );
  }
);

test(
  "definitive refresh rejection remains auth rejected while transient failure stays conservative",
  () => {
    const fnStart =
      source.indexOf(
        "async function openAuthenticatedRuntimeSession"
      );

    const fnEnd =
      source.indexOf(
        "function syncAuthStoreAfterSilentRestore",
        fnStart
      );

    const fn =
      source.slice(
        fnStart,
        fnEnd
      );

    assert.match(
      fn,
      /isDefinitiveAuthRecoveryRejection/
    );

    assert.match(
      fn,
      /\? "auth_rejected"\s*:\s*"transient_failure"/
    );
  }
);

test(
  "freshly recovered token must still open backend runtime session",
  () => {
    const fnStart =
      source.indexOf(
        "async function openAuthenticatedRuntimeSession"
      );

    const fnEnd =
      source.indexOf(
        "function syncAuthStoreAfterSilentRestore",
        fnStart
      );

    const fn =
      source.slice(
        fnStart,
        fnEnd
      );

    assert.match(
      fn,
      /await openSession\(\s*recoveredAccessToken\s*\)/
    );
  }
);
