import assert from
  "node:assert/strict";

import fs from
  "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../../../features/game-center/pages/GameCenterPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

for (const forbidden of [
  "GamePlaysCard",
  "NoGamePlaysPopup",
  "gamePlays",
  "setGamePlays",
  "gameUsesPlay",
  "consumeGamePlay",
  "/game/use-play",
  "NO_GAME_PLAYS",
  "VITE_CING_OFFLINE_REVIVAL_UI_ENABLED",
  "OFFLINE_REVIVAL_V2_ENABLED",
  "1 LƯỢT / VÁN",
  "Hết lượt chơi rồi",
]) {
  assert.equal(
    source.includes(forbidden),
    false,
    `legacy customer economy remains: ${forbidden}`
  );
}

assert.match(
  source,
  /<ReviveCreditStorefrontV2/
);

assert.match(
  source,
  /REVIVAL_V2_GAMES\.has/
);

assert.match(
  source,
  /FREE_START_GAME_KEYS/
);

assert.match(
  source,
  /♾ MIỄN PHÍ/
);

console.log(
  "PASS: customer Game Center is free-start + Revive Credit only"
);
