import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page =
  fs.readFileSync(
    new URL(
      "../pages/GameCenterPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

const storefront =
  fs.readFileSync(
    new URL(
      "../components/ReviveCreditStorefrontV2.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "game entry uses canonical backend session authority",
  () => {
    assert.match(
      page,
      /openAuthenticatedRuntimeSession/
    );

    assert.match(
      page,
      /useAppBootstrapAuthState/
    );

    assert.match(
      page,
      /pendingGameId/
    );

    assert.match(
      page,
      /gameAuthAttemptRef/
    );
  }
);

test(
  "game only mounts after authenticated state",
  () => {
    assert.match(
      page,
      /if \(authenticated\)[\s\S]*setActiveGame\(gameId\)[\s\S]*trackGameStart\(gameId\)/
    );
  }
);

test(
  "cold bootstrap preserves pending intent when access token is not ready",
  () => {
    assert.match(
      page,
      /result === "no_access_token"[\s\S]*!initialAuthResolved/
    );

    assert.match(
      page,
      /Preserve the pending game intent/
    );
  }
);

test(
  "old arbitrary game-entry delay is removed",
  () => {
    const start =
      page.indexOf(
        "const handlePlayGame ="
      );

    const end =
      page.indexOf(
        "const handleRestart",
        start
      );

    assert.ok(start >= 0);
    assert.ok(end > start);

    const block =
      page.slice(start, end);

    assert.doesNotMatch(
      block,
      /setTimeout/
    );

    assert.match(
      block,
      /setPendingGameId/
    );
  }
);

test(
  "successful daily check-in signals backend balance refresh",
  () => {
    assert.match(
      page,
      /setReviveBalanceRefreshSignal\(\s*value => value \+ 1\s*\)/
    );

    assert.match(
      page,
      /<ReviveCreditStorefrontV2[\s\S]*refreshSignal=\{[\s\S]*reviveBalanceRefreshSignal/
    );

    assert.match(
      storefront,
      /refreshSignal = 0/
    );

    assert.match(
      storefront,
      /\[\s*userId,\s*refreshKey,\s*refreshSignal,\s*\]/
    );
  }
);

test(
  "check-in never performs optimistic Revive Credit balance arithmetic",
  () => {
    const start =
      page.indexOf(
        'apiClient.post("/missions/checkin"'
      );

    const end =
      page.indexOf(
        '} catch(e) { showToast("Lỗi điểm danh"); }',
        start
      );

    assert.ok(start >= 0);
    assert.ok(end > start);

    const block =
      page.slice(start, end);

    assert.doesNotMatch(
      block,
      /setBalance|setCreditBalance|creditBalance\s*\+|balance\s*\+\s*Number/i
    );

    assert.match(
      block,
      /setReviveBalanceRefreshSignal/
    );
  }
);
