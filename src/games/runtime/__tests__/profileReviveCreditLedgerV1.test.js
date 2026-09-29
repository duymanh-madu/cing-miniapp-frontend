import assert from
  "node:assert/strict";

import fs from
  "node:fs";

const page =
  fs.readFileSync(
    new URL(
      "../../../features/game-plays/GamePlaysHistoryPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

const account =
  fs.readFileSync(
    new URL(
      "../../../features/account/pages/AccountPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

assert.match(
  page,
  /\/profile-update\/revive-credits-history\//
);

assert.match(
  page,
  /total_earned/
);

assert.match(
  page,
  /total_used/
);

assert.match(
  page,
  /balance_after/
);

assert.match(
  page,
  /Lịch sử Thẻ hồi sinh/
);

assert.doesNotMatch(
  page,
  /\/profile-update\/plays-history\//
);

assert.doesNotMatch(
  page,
  /\/game\/plays\//
);

assert.doesNotMatch(
  page,
  /Lượt chơi game/
);

assert.match(
  account,
  /label:"Thẻ hồi sinh"/
);

assert.match(
  account,
  /Số dư và lịch sử Thẻ hồi sinh/
);

assert.doesNotMatch(
  account,
  /label:"Lượt chơi game"/
);

console.log(
  "PASS: customer Profile surface uses Thẻ hồi sinh"
);
