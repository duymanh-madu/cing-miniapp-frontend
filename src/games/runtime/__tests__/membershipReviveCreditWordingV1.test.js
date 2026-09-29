import assert from
  "node:assert/strict";

import fs from
  "node:fs";

const membership =
  fs.readFileSync(
    new URL(
      "../../../membership/pages/MembershipPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

const benefits =
  fs.readFileSync(
    new URL(
      "../../../features/membership/pages/MembershipBenefitsPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

assert.match(
  membership,
  /title:"Mua Thẻ hồi sinh"/
);

assert.match(
  membership,
  /Dùng điểm tích lũy để mua Thẻ hồi sinh trong Game Center/
);

assert.match(
  membership,
  /1 điểm = 1\.000đ/
);

assert.doesNotMatch(
  membership,
  /Mua lượt chơi game|5 điểm để đổi lấy 1 lượt chơi game/
);

assert.match(
  benefits,
  /mua Thẻ hồi sinh trong Game Center/
);

assert.doesNotMatch(
  benefits,
  /đổi lượt chơi game/
);

console.log(
  "PASS: customer Membership wording uses Thẻ hồi sinh"
);
