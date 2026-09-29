import assert from
  "node:assert/strict";

import fs from
  "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../../../features/admin/components/AdminGames.jsx",
      import.meta.url
    ),
    "utf8"
  );

assert.match(
  source,
  /<AdminReviveCreditAdjustmentV2/
);

assert.doesNotMatch(
  source,
  /REVIVE_V2_ADMIN_ENABLED/
);

assert.doesNotMatch(
  source,
  /VITE_CING_OFFLINE_REVIVAL_UI_ENABLED/
);

assert.doesNotMatch(
  source,
  /\/admin\/players\/adjust-plays/
);

assert.doesNotMatch(
  source,
  /Điều chỉnh lượt chơi|Cộng lượt|Trừ lượt/
);

assert.doesNotMatch(
  source,
  /adjustPlays|adjustUser|adjustAmount/
);

console.log(
  "PASS: Admin Games exposes Revive adjustment only"
);
