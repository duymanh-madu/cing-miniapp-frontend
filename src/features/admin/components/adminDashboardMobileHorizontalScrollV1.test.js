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

const mobile =
  css.match(
    /@media\s*\(max-width:\s*760px\)\s*\{([\s\S]*?)\n\}/
  )?.[1] || "";

test(
  "all Admin tabs remain inside one canonical workspace",
  () => {
    assert.match(
      dashboard,
      /<main className="admin-dashboard-content">[\s\S]*<div className="admin-dashboard-workspace">/
    );

    const workspaceStart =
      dashboard.indexOf(
        '<div className="admin-dashboard-workspace">'
      );

    const workspaceEnd =
      dashboard.indexOf(
        "</div>",
        dashboard.indexOf(
          'activeTab==="members_admin"'
        )
      );

    assert.ok(workspaceStart >= 0);
    assert.ok(workspaceEnd > workspaceStart);

    const workspace =
      dashboard.slice(
        workspaceStart,
        workspaceEnd
      );

    const mountedTabs =
      workspace.match(
        /activeTab===/g
      ) || [];

    assert.equal(
      mountedTabs.length,
      22
    );
  }
);

test(
  "mobile Admin content is the horizontal scrollport",
  () => {
    assert.match(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*overflow-x:\s*auto/
    );

    assert.match(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*-webkit-overflow-scrolling:\s*touch/
    );

    assert.doesNotMatch(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*overflow-x:\s*hidden/
    );
  }
);

test(
  "mobile workspace creates real horizontal overflow",
  () => {
    assert.match(
      mobile,
      /\.admin-dashboard-workspace\s*\{[\s\S]*width:\s*max-content/
    );

    assert.match(
      mobile,
      /\.admin-dashboard-workspace\s*\{[\s\S]*min-width:\s*900px/
    );
  }
);

test(
  "Admin gesture authority permits native pinch and pan",
  () => {
    assert.match(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*touch-action:\s*auto/
    );

    assert.doesNotMatch(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*touch-action:\s*pan-x\s+pan-y/
    );

    assert.doesNotMatch(
      mobile,
      /\.admin-dashboard-content\s*\{[\s\S]*touch-action:\s*none/
    );
  }
);

test(
  "desktop Admin horizontal behavior remains unchanged",
  () => {
    const desktop =
      css.slice(
        0,
        css.indexOf(
          "@media (max-width: 760px)"
        )
      );

    assert.match(
      desktop,
      /\.admin-dashboard-content\s*\{[\s\S]*overflow-x:\s*hidden/
    );

    assert.doesNotMatch(
      desktop,
      /\.admin-dashboard-workspace\s*\{[\s\S]*min-width:\s*900px/
    );
  }
);

test(
  "workspace change does not alter Admin authority props",
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

test(
  "Admin lifecycle temporarily restores native root pinch authority",
  () => {
    assert.match(
      dashboard,
      /import\s*\{\s*useEffect,\s*useState\s*\}\s*from\s*"react"/
    );

    assert.match(
      dashboard,
      /useEffect\(\(\)\s*=>\s*\{[\s\S]*document\.documentElement/
    );

    assert.match(
      dashboard,
      /const previousTouchAction\s*=\s*root\.style\.touchAction/
    );

    assert.match(
      dashboard,
      /root\.style\.touchAction\s*=\s*"auto"/
    );

    assert.match(
      dashboard,
      /return\s*\(\)\s*=>\s*\{[\s\S]*root\.style\.touchAction\s*=\s*previousTouchAction/
    );
  }
);

test(
  "Admin pinch override does not mutate global Mini App touch policy",
  () => {
    const globalCss =
      fs.readFileSync(
        path.join(
          root,
          "src/index.css"
        ),
        "utf8"
      );

    const touchService =
      fs.readFileSync(
        path.join(
          root,
          "src/services/platform/touchInteractionService.js"
        ),
        "utf8"
      );

    assert.match(
      globalCss,
      /html,\s*[\r\n]+\s*body,\s*[\r\n]+\s*#root\s*\{[\s\S]*touch-action:\s*manipulation/
    );

    assert.match(
      touchService,
      /root\.style\.setProperty\([\s\S]*"touch-action"[\s\S]*"manipulation"/
    );
  }
);
