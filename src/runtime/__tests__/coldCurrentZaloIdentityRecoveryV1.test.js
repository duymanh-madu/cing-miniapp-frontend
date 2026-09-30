import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const permission = fs.readFileSync(
  "src/runtime/customer/runtimeCustomerPermissionEngine.ts",
  "utf8"
);

const bootstrap = fs.readFileSync(
  "src/runtime/runtimeBootstrap.ts",
  "utf8"
);

const logout = fs.readFileSync(
  "src/infra/auth/logout.js",
  "utf8"
);

function restoreRegion() {
  const start = bootstrap.indexOf(
    "async function restoreActivatedMemberFromShellToken"
  );

  const end = bootstrap.indexOf(
    "\n/**",
    start
  );

  assert.ok(start >= 0);
  assert.ok(end > start);

  return bootstrap.slice(start, end);
}

test(
  "normal Zalo user-info lookup still reuses memory cache",
  () => {
    assert.match(
      permission,
      /!options\.forceRefresh && _cachedUserInfo\?\.id/
    );

    assert.match(
      permission,
      /return _cachedUserInfo/
    );
  }
);

test(
  "forced Zalo identity lookup bypasses memory cache",
  () => {
    assert.match(
      permission,
      /options:\s*\{[\s\S]*?forceRefresh\?: boolean;[\s\S]*?timeoutMs\?: number;[\s\S]*?\}\s*=\s*\{\}/
    );

    assert.match(
      permission,
      /REQUEST_ZALO_USER_INFO/
    );
  }
);

test(
  "logout clears module-memory Zalo identity cache",
  () => {
    assert.match(
      permission,
      /export function clearCachedZaloUserInfo\(\)[\s\S]*?_cachedUserInfo = null/
    );

    assert.match(
      logout,
      /clearCachedZaloUserInfo\(\)/
    );
  }
);

test(
  "cold restore asks for current account only when runtime Zalo ID is missing",
  () => {
    const restore = restoreRegion();

    assert.match(
      restore,
      /if \(\s*!zaloUserId[\s\S]*?getZaloUserInfo\(\{\s*forceRefresh:\s*true/
    );

    const missingCheck =
      restore.indexOf("!zaloUserId");

    const forcedLookup =
      restore.indexOf(
        "await getZaloUserInfo({"
      );

    assert.ok(missingCheck >= 0);
    assert.ok(forcedLookup > missingCheck);
  }
);

test(
  "normal shell Zalo ID path does not force another lookup before the missing-id guard",
  () => {
    const restore = restoreRegion();

    const initialId =
      restore.indexOf(
        "identity.zaloUserId"
      );

    const missingGuard =
      restore.indexOf(
        "if (\n      !zaloUserId"
      );

    const forcedLookup =
      restore.indexOf(
        "await getZaloUserInfo({"
      );

    assert.ok(initialId >= 0);
    assert.ok(missingGuard > initialId);
    assert.ok(forcedLookup > missingGuard);
  }
);

test(
  "cold restore never reads persisted Zalo UID as authentication authority",
  () => {
    const restore = restoreRegion();

    assert.doesNotMatch(
      restore,
      /localStorage\.getItem\(\s*["']__zalo_uid["']/
    );

    assert.doesNotMatch(
      restore,
      /getStored.*Zalo/i
    );
  }
);

test(
  "forced current account ID is resolved before auth admission gate",
  () => {
    const restore = restoreRegion();

    const lookup =
      restore.indexOf(
        "await getZaloUserInfo({"
      );

    const admission =
      restore.indexOf(
        "!zaloUserId ||",
        lookup
      );

    const activation =
      restore.indexOf(
        "await activateMiniAppUser({"
      );

    assert.ok(lookup >= 0);
    assert.ok(admission > lookup);
    assert.ok(activation > admission);
  }
);

test(
  "backend remains final cached phone and Zalo binding authority",
  () => {
    const restore = restoreRegion();

    assert.match(
      restore,
      /await activateMiniAppUser\(\{[\s\S]*?zaloUserId,[\s\S]*?phone:\s*existingPhone/
    );

    assert.doesNotMatch(
      restore,
      /createSession\(\{/
    );
  }
);

test(
  "recovery introduces no arbitrary timing delay",
  () => {
    const restore = restoreRegion();

    assert.doesNotMatch(
      restore,
      /setTimeout|setInterval/
    );
  }
);

test(
  "cold current-account lookup reuses bounded shell startup budget",
  () => {
    const restore = restoreRegion();

    assert.match(
      bootstrap,
      /const SHELL_BOOT_STARTUP_BUDGET_MS\s*=\s*1200/
    );

    assert.match(
      restore,
      /getZaloUserInfo\(\{[\s\S]*?forceRefresh:\s*true,[\s\S]*?timeoutMs:\s*SHELL_BOOT_STARTUP_BUDGET_MS/
    );
  }
);

test(
  "ordinary user-info lookup preserves existing 15 second compatibility timeout",
  () => {
    assert.match(
      permission,
      /Number\.isFinite\(options\.timeoutMs\)[\s\S]*?:\s*15000/
    );

    assert.match(
      permission,
      /setTimeout\([\s\S]*?timeoutMs\s*\)/
    );
  }
);
