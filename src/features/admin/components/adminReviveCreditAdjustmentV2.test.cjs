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

const read = file =>
  fs.readFileSync(
    path.join(
      root,
      file
    ),
    "utf8"
  );

const games = read(
  "src/features/admin/components/AdminGames.jsx"
);

const adjustment = read(
  "src/features/admin/components/AdminReviveCreditAdjustmentV2.jsx"
);

test(
  "V2 adjustment uses exact feature gate",
  () => {
    assert.match(
      games,
      /VITE_CING_OFFLINE_REVIVAL_UI_ENABLED/
    );

    assert.match(
      games,
      /REVIVE_V2_ADMIN_ENABLED/
    );
  }
);

test(
  "V2 mounts dedicated component",
  () => {
    assert.match(
      games,
      /<AdminReviveCreditAdjustmentV2/
    );
  }
);

test(
  "V1 remains available when V2 OFF",
  () => {
    assert.match(
      games,
      /\/admin\/players\/adjust-plays/
    );

    assert.match(
      games,
      /Điều chỉnh lượt chơi/
    );

    assert.match(
      games,
      /REVIVE_V2_ADMIN_ENABLED\s*\?/
    );
  }
);

test(
  "Admin adjustment calls exact backend authority",
  () => {
    assert.match(
      adjustment,
      /\/admin\/revive-credits\/adjust/
    );

    assert.match(
      adjustment,
      /Bearer \$\{token\}/
    );
  }
);

test(
  "only Super Admin sees adjustment",
  () => {
    assert.match(
      adjustment,
      /role !== "super_admin"/
    );
  }
);

test(
  "request identity precedes mutation HTTP",
  () => {
    const persist =
      adjustment.indexOf(
        "pendingRef.current ="
      );

    const request =
      adjustment.indexOf(
        'await apiClient.post('
      );

    assert.ok(
      persist >= 0 &&
      request > persist
    );

    assert.match(
      adjustment,
      /busyRef\.current/
    );
  }
);

test(
  "retry reuses exact pending payload",
  () => {
    assert.match(
      adjustment,
      /let payload =\s*pendingRef\.current/
    );

    assert.match(
      adjustment,
      /Thử lại cùng mã giao dịch/
    );
  }
);

test(
  "payload validates amount and audit note",
  () => {
    assert.match(
      adjustment,
      /Number\.isSafeInteger/
    );

    assert.match(
      adjustment,
      /REASON_CODE\.test/
    );

    assert.match(
      adjustment,
      /normalizedNote\.length > 500/
    );
  }
);

test(
  "frontend cannot modify balance directly",
  () => {
    assert.doesNotMatch(
      adjustment,
      /\.from\(["'](?:players|cing_revive_credit_balances)["']\)/
    );

    assert.doesNotMatch(
      adjustment,
      /\/admin\/players\/adjust-plays/
    );
  }
);
