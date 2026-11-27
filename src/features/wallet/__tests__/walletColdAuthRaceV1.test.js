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
      /loading:\s*walletReady\s*&&\s*!\(cachedOwner\s*===\s*owner\s*&&\s*cachedSnapshot\)/
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

test("Home can start the wallet read while the member lookup is pending", () => {
  const card = fs.readFileSync(
    new URL("../../home/components/HomeMembershipCard.jsx", import.meta.url),
    "utf8"
  );
  assert.match(card, /useWalletOverview\(\{\s*enabled: customer\.ready\s*,?\s*\}\)/);
});

async function walletRetryFixture({ switchOwner = false } = {}) {
  const { runInNewContext } = await import("node:vm");
  const api = fs.readFileSync(new URL("../api/walletOverviewApi.js", import.meta.url), "utf8");
  let epoch = 1;
  let auth = { authenticated: true, accessToken: "old-fixture", profile: { id: "A", phone: "0900000000" } };
  let refreshes = 0;
  const headers = [];
  const fetchOverview = runInNewContext(
    api.replace(/^import .*;$/gm, "").replace(/^export /gm, "") + "\nfetchWalletOverview;",
    {
      useAuthStore: { getState: () => auth },
      currentCustomerIdentityV42: auth => ({ ready: auth.authenticated, ...auth.profile }),
      authSessionEpochV42: () => epoch,
      requireAuthSessionEpochV42: expected => { assert.equal(expected, epoch); },
      recoverBackendAuthSession: async () => {
        refreshes++;
        auth = { ...auth, accessToken: "new-fixture", profile: { ...auth.profile, id: switchOwner ? "B" : "A" } };
        epoch++;
        return { accessToken: auth.accessToken };
      },
      apiClient: { get: async (_url, config) => {
        headers.push(config.headers.Authorization);
        if (headers.length === 1) throw Object.assign(new Error("expired"), { response: { status: 401 } });
        return { data: { data: { account: { balance: 120 }, transactions: [] } } };
      } },
    }
  );
  return { fetchOverview, headers, refreshes: () => refreshes };
}

test("Wallet retries an expired access token once using the recovered session", async () => {
  const fixture = await walletRetryFixture();
  assert.equal((await fixture.fetchOverview()).balance, 120);
  assert.deepEqual(fixture.headers, ["Bearer old-fixture", "Bearer new-fixture"]);
  assert.equal(fixture.refreshes(), 1);
});

test("Wallet does not retry for a different owner after session recovery", async () => {
  const fixture = await walletRetryFixture({ switchOwner: true });
  await assert.rejects(fixture.fetchOverview(), /PROJECTION_INVALID: session/);
  assert.deepEqual(fixture.headers, ["Bearer old-fixture"]);
});
