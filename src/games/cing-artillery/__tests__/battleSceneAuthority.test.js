import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

const read =
  (path) =>
    fs.readFileSync(
      path,
      "utf8"
    );

test(
  "battle scene consumes canonical snapshot authority",
  () => {
    const source =
      read(
        "src/games/cing-artillery/scenes/BattleScene.js"
      );

    for (const token of [
      "player_one_x",
      "player_one_y",
      "player_two_x",
      "player_two_y",
      "player_one_current_hp",
      "player_two_current_hp",
      "active_account_id",
      "turn_deadline_at",
      "initial_wind",
    ]) {
      assert.match(
        source,
        new RegExp(
          token,
          "u"
        )
      );
    }

    assert.doesNotMatch(
      source,
      /max_hp|1000\s*HP|shot-command|angleDeg|power/u
    );
  }
);

test(
  "map asset is exact versioned production identity",
  () => {
    const source =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryMapAssets.js"
      );

    assert.match(
      source,
      /4611bd68-07b7-46ec-b9b9-2088642e4be1/u
    );

    assert.match(
      source,
      /phat-tich-mountain/u
    );

    assert.match(
      source,
      /width:\s*960/u
    );

    assert.match(
      source,
      /height:\s*540/u
    );

    assert.match(
      source,
      /\/game-assets\/cing-piu-piu\/maps\/phat-tich-mountain\/v1\/map\.svg/u
    );
  }
);

test(
  "initial wind is presented only as match-start authority",
  () => {
    const source =
      read(
        "src/games/cing-artillery/scenes/BattleScene.js"
      );

    assert.match(
      source,
      /GIÓ ĐẦU TRẬN/u
    );

    assert.match(
      source,
      /initial_wind/u
    );

    /*
     * 5J3B has no authoritative current-turn wind
     * contract. Do not silently promote initial_wind
     * into dynamic turn wind.
     */
    assert.doesNotMatch(
      source,
      /current_wind|turn_wind/u
    );
  }
);

test(
  "realtime client owns battle snapshot read and reconnect rejoin",
  () => {
    const source =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryRealtimeClient.js"
      );

    assert.match(
      source,
      /cing-artillery:match:battle-snapshot/u
    );

    assert.match(
      source,
      /readBattleSnapshot/u
    );

    assert.match(
      source,
      /recoverJoinedMatch/u
    );

    assert.match(
      source,
      /socket\.on\(\s*"connect"/u
    );

    assert.match(
      source,
      /performJoin/u
    );
  }
);

test(
  "React battle bridge cannot emit shot commands",
  () => {
    const game =
      read(
        "src/games/cing-artillery/CingArtilleryGame.jsx"
      );

    const realtime =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryRealtimeClient.js"
      );

    assert.match(
      game,
      /createPremiumArtilleryGame/u
    );

    assert.match(
      game,
      /battleSnapshot/u
    );

    assert.match(
      game,
      /SNAPSHOT_EVENT/u
    );

    assert.doesNotMatch(
      game,
      /shot-command|angleDeg|turnNumber|commandId/u
    );

    /*
     * Realtime transport still contains no public shot API
     * in 5J3B. Shot integration belongs to a later task.
     */
    assert.doesNotMatch(
      realtime,
      /function\s+sendShot|submitShot|fireShot/u
    );
  }
);

test(
  "premium engine boots BattleScene instead of validation scene",
  () => {
    const source =
      read(
        "src/games/cing-artillery/engine/createPremiumArtilleryGame.js"
      );

    assert.match(
      source,
      /BattleScene/u
    );

    assert.doesNotMatch(
      source,
      /EngineValidationScene/u
    );
  }
);
