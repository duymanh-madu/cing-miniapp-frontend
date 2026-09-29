import assert from
  "node:assert/strict";

import fs from
  "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../../../features/admin/components/AdminLogs.jsx",
      import.meta.url
    ),
    "utf8"
  );

assert.match(
  source,
  /key:"revive_credit"/
);

assert.match(
  source,
  /label:"Revive Credit"/
);

assert.match(
  source,
  /item\._type==="revive_credit"/
);

assert.match(
  source,
  /balance_before/
);

assert.match(
  source,
  /balance_after/
);

assert.match(
  source,
  /reference_type/
);

assert.match(
  source,
  /reference_id/
);

assert.match(
  source,
  /reviveSourceLabel/
);

assert.match(
  source,
  /typeLabel/
);

assert.match(
  source,
  /legacy_plays_bought/
);

assert.match(
  source,
  /legacy_plays_given/
);

assert.match(
  source,
  /Lịch sử V1/
);

assert.doesNotMatch(
  source,
  /key:"plays_bought"/
);

assert.doesNotMatch(
  source,
  /key:"plays_given"/
);

assert.doesNotMatch(
  source,
  /label:"Mua lượt chơi"/
);

assert.doesNotMatch(
  source,
  /label:"Tặng lượt chơi"/
);

console.log(
  "PASS: Admin Logs frontend uses Revive Credit; V1 is audit-only"
);
