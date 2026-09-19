import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const hook =
  fs.readFileSync(
    new URL(
      "../hooks/useWalletOverview.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "wallet overview subscribes to canonical auth authorities",
  () => {
    assert.match(
      hook,
      /useAuthStore/
    );

    assert.match(
      hook,
      /useAppBootstrapAuthState/
    );

    assert.match(
      hook,
      /initialAuthResolved/
    );

    assert.match(
      hook,
      /authenticated/
    );
  }
);

test(
  "wallet request authority requires enabled resolved authenticated state",
  () => {
    assert.match(
      hook,
      /walletReady\s*=\s*enabled\s*&&\s*initialAuthResolved\s*&&\s*authenticated/
    );

    assert.match(
      hook,
      /if\s*\(\s*!walletReady\s*\)\s*\{\s*return null;\s*\}/
    );
  }
);

test(
  "initial wallet loading is governed by wallet request readiness",
  () => {
    assert.match(
      hook,
      /loading:\s*walletReady\s*&&\s*!cachedSnapshot/
    );
  }
);

test(
  "wallet lifecycle events cannot fetch before auth readiness",
  () => {
    assert.match(
      hook,
      /const onWalletUpdated\s*=\s*\(\)\s*=>\s*\{\s*if\s*\(\s*!walletReady\s*\)\s*\{\s*return;\s*\}/
    );
  }
);

test(
  "wallet auth fix does not introduce polling or startup mutation",
  () => {
    assert.doesNotMatch(
      hook,
      /setInterval|setTimeout/
    );

    assert.doesNotMatch(
      hook,
      /initializeApplication|openAuthenticatedRuntimeSession|markInitialAuthResolved/
    );
  }
);
