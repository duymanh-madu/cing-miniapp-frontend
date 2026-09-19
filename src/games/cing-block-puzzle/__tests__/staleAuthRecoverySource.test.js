import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      relativePath
    ),
    "utf8"
  );
}

const bootstrap =
  read(
    "src/runtime/runtimeBootstrap.ts"
  );

const authAuthority =
  read(
    "src/infra/auth/authenticatedRuntimeSession.ts"
  );

const staleRecovery =
  read(
    "src/infra/auth/staleAuthRecovery.js"
  );

test(
  "persisted token presence is not treated as authenticated proof",
  () => {
    assert.match(
      authAuthority,
      /AuthenticatedRuntimeSessionResult/
    );

    assert.match(
      authAuthority,
      /await openSession/
    );

    assert.match(
      bootstrap,
      /openAuthenticatedRuntimeSession/
    );

    assert.match(
      bootstrap,
      /auth_rejected/
    );
  }
);

test(
  "definitively rejected backend auth is cleared before shell restore",
  () => {
    const clearIndex =
      bootstrap.indexOf(
        "clearStaleBackendAuthSession()"
      );

    const restoreIndex =
      bootstrap.lastIndexOf(
        "restoreActivatedMemberFromShellToken()"
      );

    assert.ok(clearIndex >= 0);
    assert.ok(restoreIndex > clearIndex);
  }
);

test(
  "transient backend failures do not clear persisted auth",
  () => {
    assert.match(
      authAuthority,
      /transient_failure/
    );

    assert.match(
      authAuthority,
      /status\s*!==\s*401/
    );

    assert.match(
      bootstrap,
      /authSessionResult ===[\s\S]*?"auth_rejected"[\s\S]*?clearStaleBackendAuthSession\(\)/
    );
  }
);

test(
  "stale auth recovery clears backend auth but not runtime Zalo identity",
  () => {
    assert.match(
      staleRecovery,
      /clearAuthStorage/
    );

    assert.match(
      staleRecovery,
      /sessionHydrator\.clear/
    );

    assert.doesNotMatch(
      staleRecovery,
      /useRuntimeCustomerIdentityStore/
    );

    assert.doesNotMatch(
      staleRecovery,
      /phoneToken/
    );

    assert.doesNotMatch(
      staleRecovery,
      /miniAccessToken/
    );
  }
);

test(
  "cached activated member can rebuild backend auth from canonical phone and Zalo identity",
  () => {
    assert.match(
      bootstrap,
      /const hasCanonicalPhone\s*=\s*!!existingPhone/
    );

    assert.match(
      bootstrap,
      /const hasZaloTokenPair[\s\S]*phoneToken[\s\S]*miniAccessToken/
    );

    assert.match(
      bootstrap,
      /!hasCanonicalPhone[\s\S]*!hasZaloTokenPair/
    );

    assert.match(
      bootstrap,
      /activateMiniAppUser\(\{[\s\S]*phone:\s*existingPhone\s*\|\|\s*""/
    );
  }
);

test(
  "phone-less silent restore still requires Zalo token pair",
  () => {
    assert.match(
      bootstrap,
      /!hasCanonicalPhone[\s\S]*!hasZaloTokenPair/
    );

    assert.match(
      bootstrap,
      /phoneToken,[\s\S]*miniAccessToken/
    );
  }
);
