import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();

const read = file =>
  fs.readFileSync(
    path.join(root, file),
    "utf8"
  );

const dashboard = read(
  "src/features/admin/components/AdminDashboard.jsx"
);

const css = read(
  "src/features/admin/components/admin-dashboard-shell.css"
);

const globalCss = read(
  "src/index.css"
);

const touchService = read(
  "src/services/platform/touchInteractionService.js"
);

const tables = [
  "src/features/admin/components/AdminStats.jsx",
  "src/features/admin/components/AdminOrders.jsx",
  "src/features/admin/components/AdminPayments.jsx",
  "src/features/admin/components/AdminSystemHealth.jsx",
].map(file => ({
  file,
  source: read(file),
}));

test(
  "Admin no longer mounts a global fixed-width workspace",
  () => {
    assert.doesNotMatch(
      dashboard,
      /admin-dashboard-workspace/
    );

    assert.doesNotMatch(
      css,
      /\.admin-dashboard-workspace/
    );

    assert.doesNotMatch(
      css,
      /min-width:\s*900px/
    );
  }
);

test(
  "mobile Admin content remains viewport responsive",
  () => {
    const mobile =
      css.match(
        /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?(?=@media\s*\(max-width:\s*440px\))/
      )?.[0] || "";

    assert.match(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*width:\s*100%/
    );

    assert.match(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*max-width:\s*100%/
    );

    assert.match(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*min-width:\s*0/
    );
  }
);

test(
  "Admin keeps scoped native pinch authority",
  () => {
    assert.match(
      dashboard,
      /document\.documentElement/
    );

    assert.match(
      dashboard,
      /previousTouchAction/
    );

    assert.match(
      dashboard,
      /root\.style\.touchAction\s*=\s*"auto"/
    );

    assert.match(
      dashboard,
      /root\.style\.touchAction\s*=\s*previousTouchAction/
    );

    assert.match(
      css,
      /touch-action:\s*auto/
    );
  }
);

test(
  "global customer Mini App gesture policy is untouched",
  () => {
    assert.match(
      globalCss,
      /touch-action:\s*manipulation/
    );

    assert.match(
      touchService,
      /"touch-action",\s*"manipulation"/
    );
  }
);

test(
  "only proven wide tables own local horizontal overflow",
  () => {
    assert.match(
      css,
      /\.admin-data-table-scroll\s*\{[\s\S]*overflow-x:\s*auto/
    );

    assert.doesNotMatch(
      css.match(
        /\.admin-data-table-scroll\s*\{[\s\S]*?\}/
      )?.[0] || "",
      /overflow-y:\s*hidden/
    );

    assert.match(
      css,
      /\.admin-data-table-scroll\s*>\s*table\s*\{[\s\S]*min-width:\s*760px/
    );

    for (const { file, source } of tables) {
      assert.match(
        source,
        /className="admin-data-table-scroll"/,
        `${file} must mount local table scroll authority`
      );
    }
  }
);

test(
  "Cing Pay is not forced into desktop-width canvas",
  () => {
    assert.match(
      dashboard,
      /activeTab==="wallet_pos"[\s\S]*AdminWalletPosCounter/
    );

    assert.doesNotMatch(
      dashboard,
      /admin-dashboard-workspace/
    );

    assert.doesNotMatch(
      css,
      /\.admin-dashboard-workspace/
    );
  }
);

test(
  "local table patch does not alter Admin authority props",
  () => {
    assert.match(
      dashboard,
      /<AdminWalletPosCounter token=\{auth\.token\} role=\{auth\.admin\?\.role\}/
    );

    assert.match(
      dashboard,
      /<AdminWallet token=\{auth\.token\} role=\{role\}/
    );

    assert.match(
      dashboard,
      /<AdminOrders token=\{auth\.token\}/
    );

    assert.match(
      dashboard,
      /<AdminPayments token=\{auth\.token\}/
    );
  }
);
