import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();

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

test(
  "mobile admin shell has explicit off-canvas drawer authority",
  () => {
    assert.match(
      dashboard,
      /mobileNavOpen/
    );

    assert.match(
      dashboard,
      /admin-dashboard-sidebar/
    );

    assert.match(
      dashboard,
      /admin-dashboard-backdrop/
    );

    assert.match(
      dashboard,
      /☰ Menu/
    );

    assert.match(
      css,
      /@media\s*\(max-width:\s*760px\)/
    );

    assert.match(
      css,
      /\.admin-dashboard-sidebar[\s\S]*position:\s*fixed/
    );

    assert.match(
      css,
      /translateX\(-105%\)/
    );

    assert.match(
      css,
      /\.admin-dashboard-sidebar\.is-open[\s\S]*translateX\(0\)/
    );
  }
);

test(
  "mobile content becomes full width",
  () => {
    assert.match(
      dashboard,
      /className="admin-dashboard-content"/
    );

    assert.match(
      css,
      /\.admin-dashboard-content[\s\S]*min-width:\s*0/
    );

    assert.match(
      css,
      /@media\s*\(max-width:\s*760px\)[\s\S]*\.admin-dashboard-content[\s\S]*width:\s*100%/
    );
  }
);

test(
  "selecting a tab closes mobile drawer",
  () => {
    assert.match(
      dashboard,
      /const selectTab[\s\S]*setTab\(nextTab\)[\s\S]*setMobileNavOpen\(false\)/
    );

    assert.match(
      dashboard,
      /onClick=\{\(\) => selectTab\(t\.key\)\}/
    );
  }
);

test(
  "drawer preserves role-based tab authority",
  () => {
    assert.match(
      dashboard,
      /const ROLE_TABS/
    );

    assert.match(
      dashboard,
      /cashier:\s*\[[\s\S]*"stats"[\s\S]*"orders_admin"[\s\S]*"payments_admin"[\s\S]*"wallet_pos"/
    );

    assert.match(
      dashboard,
      /getAllowedTabs\(role\)/
    );

    assert.match(
      dashboard,
      /TABS\.map/
    );
  }
);

test(
  "drawer does not alter Cing Pay financial props",
  () => {
    assert.match(
      dashboard,
      /activeTab==="wallet_pos" && <AdminWalletPosCounter token=\{auth\.token\} role=\{auth\.admin\?\.role\} \/>/
    );

    assert.doesNotMatch(
      dashboard,
      /pos_parent|pos_id|store_id|amount=.*AdminWalletPosCounter/
    );
  }
);
