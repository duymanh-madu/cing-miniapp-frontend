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


test("Zalo uses official in-app WebView", () => {
  assert.match(
    badge,
    /import \{ openWebview \} from "zmp-sdk"/
  );

  assert.match(
    badge,
    /openWebview\(\{\s*url: MOIT_RECORD/
  );

  assert.match(
    badge,
    /style: "normal"/
  );
});

test("ordinary browsers retain HTTPS navigation", () => {
  assert.match(
    badge,
    /if \(!isInsideZalo\(\)\) \{\s*return;/
  );

  assert.match(
    badge,
    /href=\{MOIT_RECORD\}/
  );

  assert.match(
    badge,
    /target="_blank"/
  );
});

test("failed Zalo WebView is visible to customer", () => {
  assert.match(
    badge,
    /\.catch\(\(\) => \{\s*setLinkError/
  );

  assert.match(
    badge,
    /role="alert"/
  );
});
