import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const badge = fs.readFileSync(
  new URL(
    "../MoitConfirmedBadge.jsx",
    import.meta.url
  ),
  "utf8"
);

const legal = fs.readFileSync(
  new URL(
    "../LegalCenterPage.jsx",
    import.meta.url
  ),
  "utf8"
);

const home = fs.readFileSync(
  new URL(
    "../../home/pages/HomePage.jsx",
    import.meta.url
  ),
  "utf8"
);

test("official record preserved", () => {
  assert.match(
    badge,
    /online\.gov\.vn\/nen-tang\/d7214e45-6cad-4527-b5fa-3edec2fc45e1/
  );
});

test("official image preserved", () => {
  assert.match(
    badge,
    /fileserver\.online\.gov\.vn\/uploads\/Resources\/iconxacnhan\/DaThongBao\.png/
  );
});

test("badge is interactive", () => {
  assert.match(
    badge,
    /onClick=\{\(\) => setOpen\(true\)\}/
  );
});

test("popup is accessible", () => {
  assert.match(
    badge,
    /role="dialog"/
  );

  assert.match(
    badge,
    /aria-modal="true"/
  );
});

test("popup has official record link", () => {
  assert.match(
    badge,
    /href=\{MOIT_RECORD\}/
  );
});

test("both screen placements remain", () => {
  assert.match(
    home,
    /<MoitConfirmedBadge \/>/
  );

  assert.match(
    legal,
    /<MoitConfirmedBadge size="large" \/>/
  );
});



test("official HTML anchor uses standard navigation", () => {
  assert.match(
    badge,
    /href=\{MOIT_RECORD\}/
  );

  assert.match(
    badge,
    /target="_blank"/
  );

  assert.match(
    badge,
    /rel="noopener noreferrer"/
  );

  assert.equal(
    (badge.match(/href=\{MOIT_RECORD\}/g) || []).length,
    1
  );
});

test("official link does not intercept navigation", () => {
  assert.doesNotMatch(
    badge,
    /openWebview|openOutApp|OPEN_OUT_APP/
  );

  assert.doesNotMatch(
    badge,
    /preventDefault|window\.open|location\.href/
  );

  assert.doesNotMatch(
    badge,
    /isInsideZalo|linkError|linkErrorCode/
  );

  assert.doesNotMatch(
    badge,
    /Mở hồ sơ bằng liên kết trực tiếp/
  );
});

test("official customer action remains visible", () => {
  assert.match(
    badge,
    /Xem hồ sơ xác nhận ↗/
  );

  assert.match(
    badge,
    /Trang xác nhận được cung cấp/
  );
});
