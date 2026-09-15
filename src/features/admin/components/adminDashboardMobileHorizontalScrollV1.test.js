import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root =
  process.cwd();

const dashboard =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/components/AdminDashboard.jsx"
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/components/admin-dashboard-shell.css"
    ),
    "utf8"
  );

const mobileStart =
  css.indexOf(
    "@media (max-width: 760px)"
  );

const narrowStart =
  css.indexOf(
    "@media (max-width: 440px)"
  );

assert.ok(
  mobileStart >= 0,
  "mobile Admin media query must exist"
);

assert.ok(
  narrowStart > mobileStart,
  "mobile Admin media-query boundary must exist"
);

const mobileCss =
  css.slice(
    mobileStart,
    narrowStart
  );

const contentStart =
  mobileCss.indexOf(
    ".admin-dashboard-content"
  );

assert.ok(
  contentStart >= 0,
  "mobile Admin content rule must exist"
);

const contentBlock =
  mobileCss.slice(
    contentStart,
    mobileCss.indexOf(
      "}",
      contentStart
    ) + 1
  );

test(
  "all Admin tabs share one global content scroll surface",
  () => {
    assert.match(
      dashboard,
      /<main className="admin-dashboard-content">/
    );

    assert.match(
      dashboard,
      /activeTab==="orders_admin"[\s\S]*<AdminOrders/
    );

    assert.match(
      dashboard,
      /activeTab==="payments_admin"[\s\S]*<AdminPayments/
    );

    assert.match(
      dashboard,
      /activeTab==="wallet_admin"[\s\S]*<AdminWallet/
    );

    assert.match(
      dashboard,
      /activeTab==="system_health"[\s\S]*<AdminSystemHealth/
    );
  }
);

test(
  "mobile Admin content permits horizontal touch scrolling",
  () => {
    assert.match(
      contentBlock,
      /overflow-x:\s*auto/
    );

    assert.match(
      contentBlock,
      /-webkit-overflow-scrolling:\s*touch/
    );

    assert.match(
      contentBlock,
      /overscroll-behavior-x:\s*contain/
    );

    assert.match(
      contentBlock,
      /touch-action:\s*pan-x pan-y/
    );

    assert.doesNotMatch(
      contentBlock,
      /overflow-x:\s*hidden/
    );
  }
);

test(
  "mobile Admin scroll surface remains viewport bound",
  () => {
    assert.match(
      contentBlock,
      /width:\s*100%/
    );

    assert.match(
      contentBlock,
      /max-width:\s*100%/
    );

    assert.match(
      contentBlock,
      /min-width:\s*0/
    );
  }
);

test(
  "desktop Admin horizontal behavior is unchanged",
  () => {
    const desktopCss =
      css.slice(
        0,
        mobileStart
      );

    const desktopStart =
      desktopCss.indexOf(
        ".admin-dashboard-content"
      );

    assert.ok(
      desktopStart >= 0
    );

    const desktopBlock =
      desktopCss.slice(
        desktopStart,
        desktopCss.indexOf(
          "}",
          desktopStart
        ) + 1
      );

    assert.match(
      desktopBlock,
      /overflow-x:\s*hidden/
    );

    assert.doesNotMatch(
      desktopBlock,
      /overflow-x:\s*auto/
    );
  }
);

test(
  "global horizontal scroll does not alter Admin authority",
  () => {
    assert.doesNotMatch(
      css,
      /wallet_transaction_id|payment_intent_id|settlement|refund/
    );

    assert.doesNotMatch(
      css,
      /Authorization|Bearer|apiClient/
    );
  }
);
