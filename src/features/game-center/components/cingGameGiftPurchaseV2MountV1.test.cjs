"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.resolve(
  __dirname,
  "../../../.."
);

const profile = fs.readFileSync(
  path.join(
    root,
    "src/features/profile/ProfilePage.jsx"
  ),
  "utf8"
);

const chess = fs.readFileSync(
  path.join(
    root,
    "src/features/game-center/games/chess/ChessGame.jsx"
  ),
  "utf8"
);

const shared = fs.readFileSync(
  path.join(
    __dirname,
    "CingGameGiftPurchaseV2.jsx"
  ),
  "utf8"
);

const flag =
  "VITE_CING_GAME_GIFT_PURCHASE_V2_ENABLED";

for (const [name, source] of [
  ["Profile", profile],
  ["Chess", chess],
]) {
  test(
    `${name}: JSX compiles`,
    () => {
      const result =
        esbuild.transformSync(
          source,
          {
            loader: "jsx",
            format: "esm",
          }
        );

      assert.ok(
        result.code.length > 0
      );
    }
  );

  test(
    `${name}: V2 flag defaults OFF`,
    () => {
      assert.match(
        source,
        /VITE_CING_GAME_GIFT_PURCHASE_V2_ENABLED\s*===\s*"true"/
      );

      assert.equal(
        source.split(flag).length - 1,
        1
      );

      assert.match(
        source,
        /CING_GIFT_PURCHASE_V2_ENABLED\s*&&\s*\(\s*<CingGameGiftPurchaseV2/
      );
    }
  );

  test(
    `${name}: shared component imported`,
    () => {
      assert.match(
        source,
        /import CingGameGiftPurchaseV2 from/
      );

      assert.equal(
        source.split(
          "<CingGameGiftPurchaseV2"
        ).length - 1,
        1
      );
    }
  );
}

test(
  "Profile retains legacy HTTP Gift",
  () => {
    assert.match(
      profile,
      /\{showGift && !CING_GIFT_PURCHASE_V2_ENABLED && \(/
    );

    assert.match(
      profile,
      /apiClient\.post\("\/game\/chess\/tip"/
    );

    assert.match(
      profile,
      /recipientUserId=\{resolvedPhone\}/
    );
  }
);

test(
  "Chess retains legacy Socket Gift",
  () => {
    assert.match(
      chess,
      /\{showTip && !CING_GIFT_PURCHASE_V2_ENABLED && \(/
    );

    assert.match(
      chess,
      /sockRef\.current\?\.emit\("chess:tip"/
    );

    assert.match(
      chess,
      /recipientUserId=\{opponent\?\.userId \|\| opponent\?\.id \|\| ""\}/
    );
  }
);

test(
  "shared Gift V2 is still financially dormant",
  () => {
    assert.match(
      shared,
      /CING_GAME_GIFT_PURCHASE_UI_V1/
    );

    assert.doesNotMatch(
      profile + chess,
      /CING_GAME_GIFT_V2_CUTOVER_ENABLED/
    );
  }
);
