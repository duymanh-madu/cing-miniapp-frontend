import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read =
  file =>
    fs.readFileSync(
      file,
      "utf8"
    );

const quick =
  read(
    "src/features/home/components/HomeQuickActions.jsx"
  );

const home =
  read(
    "src/features/home/pages/HomePage.jsx"
  );

const member =
  read(
    "src/features/home/components/HomeMembershipCard.jsx"
  );

const hook =
  read(
    "src/features/wallet/hooks/useWalletOverview.js"
  );

const api =
  read(
    "src/features/wallet/api/walletOverviewApi.js"
  );

const route =
  read(
    "src/app/routeManifest.js"
  );

test(
  "Home quick actions expose exact commercial four",
  () => {
    for (
      const label of [
        "Đặt món",
        "Cing Wallet",
        "Game Center",
        "Quyền lợi thành viên",
      ]
    ) {
      assert.match(
        quick,
        new RegExp(
          label
        )
      );
    }

    assert.doesNotMatch(
      quick,
      /Đại sảnh danh vọng/
    );
  }
);

test(
  "Home mounts premium Wallet snapshot before Membership card",
  () => {
    const wallet =
      home.indexOf(
        "<HomeWalletSnapshot />"
      );

    const memberCard =
      home.indexOf(
        "<HomeMembershipCard />"
      );

    assert.ok(
      wallet >= 0
    );

    assert.ok(
      memberCard >
      wallet
    );
  }
);

test(
  "Membership card displays Cing Wallet without CTA",
  () => {
    assert.match(
      member,
      /Cing Wallet/
    );

    assert.match(
      member,
      /walletBalance/
    );

    assert.doesNotMatch(
      member,
      /Mở ví|Mở Wallet/
    );
  }
);

test(
  "Wallet balance comes from backend authority",
  () => {
    assert.match(
      api,
      /apiClient\.get\([\s\S]*"\/wallet"/
    );

    assert.match(
      api,
      /params:[\s\S]*limit:\s*20/
    );

    assert.doesNotMatch(
      api,
      /localStorage|sessionStorage/
    );
  }
);

test(
  "shared Wallet hook deduplicates in-flight reads",
  () => {
    assert.match(
      hook,
      /let inFlight = null/
    );

    assert.match(
      hook,
      /if \(inFlight\)/
    );
  }
);

test(
  "shared Wallet hook responds to authoritative balance update event",
  () => {
    assert.match(
      hook,
      /cing_wallet_balance_updated/
    );
  }
);

test(
  "/wallet is authenticated lazy route",
  () => {
    assert.match(
      route,
      /key:"wallet"[\s\S]*path:"\/wallet"[\s\S]*requireAuth:true/
    );

    assert.match(
      route,
      /import\("@\/features\/wallet"\)/
    );
  }
);
