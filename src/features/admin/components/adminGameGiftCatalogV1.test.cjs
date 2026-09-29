"use strict";

const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const fs =
  require("node:fs");

const path =
  require("node:path");

const root =
  path.resolve(
    __dirname,
    "../../../.."
  );

function read(relative) {
  return fs.readFileSync(
    path.join(
      root,
      relative
    ),
    "utf8"
  );
}

const component = read(
  "src/features/admin/components/AdminGameGiftCatalog.jsx"
);

const games = read(
  "src/features/admin/components/AdminGames.jsx"
);

const dashboard = read(
  "src/features/admin/components/AdminDashboard.jsx"
);

const css = read(
  "src/features/admin/components/admin-game-gift-catalog.css"
);

test(
  "Gift Catalog mounted in existing Games tab",
  () => {
    assert.match(
      games,
      /import AdminGameGiftCatalog from "\.\/AdminGameGiftCatalog"/
    );

    assert.match(
      games,
      /<AdminGameGiftCatalog token=\{token\} role=\{role\}/
    );

    assert.match(
      dashboard,
      /<AdminGames\b[^\n]*token=\{auth\.token\} role=\{role\} adminId=/
    );
  }
);

test(
  "Super Admin only",
  () => {
    assert.match(
      component,
      /role === "super_admin"/
    );

    assert.match(
      component,
      /if \(!isSuperAdmin\)/
    );
  }
);

test(
  "frontend feature is default OFF",
  () => {
    assert.match(
      component,
      /VITE_CING_GAME_GIFT_ADMIN_UI_ENABLED === "true"/
    );

    assert.match(
      component,
      /if \(!canUseApi\)/
    );

    assert.match(
      component,
      /!canUseApi \|\|/
    );
  }
);

test(
  "Gift Catalog API matches future backend mount",
  () => {
    assert.match(
      component,
      /"\/admin\/game-economy\/gifts"/
    );

    assert.match(
      component,
      /apiClient\.get/
    );

    assert.match(
      component,
      /apiClient\.put/
    );
  }
);

test(
  "Admin cannot send points or alter customer balance",
  () => {
    assert.match(
      component,
      /price_vnd:/
    );

    assert.match(
      component,
      /charm_award:/
    );

    assert.doesNotMatch(
      component,
      /deductPoints\s*\(/
    );

    assert.doesNotMatch(
      component,
      /updateMemberPoint\s*\(/
    );

    assert.doesNotMatch(
      component,
      /wallet_balance:/
    );
  }
);

test(
  "price conversion is exact bigint arithmetic",
  () => {
    assert.match(
      component,
      /BigInt\(raw\)/
    );

    assert.match(
      component,
      /price % 1000n !== 0n/
    );

    assert.match(
      component,
      /price \/ 1000n/
    );
  }
);

test(
  "ambiguous retry preserves request identity",
  () => {
    assert.match(
      component,
      /pendingRequest \|\|\s*newRequestId\(\)/
    );

    assert.match(
      component,
      /setPendingRequest\(\s*payload\.request_id/
    );
  }
);

test(
  "no legacy catalog seed",
  () => {
    assert.doesNotMatch(
      component,
      /const GIFTS\s*=/
    );

    assert.doesNotMatch(
      component,
      /cafe_nau.*points:\s*5/
    );
  }
);

test(
  "existing Admin game operations remain present",
  () => {
    assert.match(
      games,
      /\/game\/leaderboard\/alltime-games/
    );

    assert.doesNotMatch(
      games,
      /\/admin\/players\/adjust-plays/
    );

    assert.match(
      games,
      /<AdminReviveCreditAdjustmentV2/
    );

    assert.match(
      games,
      /🎮 Quản lý Games/
    );
  }
);

test(
  "mobile layout and bounded controls",
  () => {
    assert.match(
      css,
      /grid-template-columns/
    );

    assert.match(
      css,
      /@media \(max-width: 480px\)/
    );

    assert.match(
      css,
      /min-width: 0/
    );
  }
);

test(
  "no Chess or Profile payment replacement",
  () => {
    assert.doesNotMatch(
      component,
      /\/game\/chess\/tip/
    );

    assert.doesNotMatch(
      component,
      /chess:tip/
    );
  }
);
