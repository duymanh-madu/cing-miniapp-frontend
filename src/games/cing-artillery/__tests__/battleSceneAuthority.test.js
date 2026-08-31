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
      "position_x",
      "position_y",
      "player_one",
      "player_two",
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
      /max_hp|1000\s*HP/u
    );

    assert.doesNotMatch(
      source,
      /world\.player_one_[xy]|world\.player_two_[xy]/u
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
  "realtime client exposes durable shot and result recovery transport",
  () => {
    const realtime =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryRealtimeClient.js"
      );

    assert.match(
      realtime,
      /cing-artillery:match:shot-command/u
    );

    assert.match(
      realtime,
      /cing-artillery:match:result-catchup/u
    );

    assert.match(
      realtime,
      /cing-artillery:match:result-stream-wake/u
    );

    assert.match(
      realtime,
      /function\s+sendShot/u
    );

    assert.match(
      realtime,
      /function\s+readResultCatchup/u
    );

    assert.match(
      realtime,
      /result_sequence/u
    );

    assert.match(
      realtime,
      /afterSequence/u
    );

    assert.doesNotMatch(
      realtime,
      /Number\([^)]*result_sequence/u
    );
  }
);

test(
  "result wake uses bounded durable recovery before snapshot reconciliation",
  () => {
    const realtime =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryRealtimeClient.js"
      );

    assert.match(
      realtime,
      /RESULT_CATCHUP_RETRY_DELAYS_MS/u
    );

    assert.match(
      realtime,
      /recoverDurableResults/u
    );

    assert.match(
      realtime,
      /requireResult/u
    );

    assert.match(
      realtime,
      /readResultCatchup/u
    );

    assert.match(
      realtime,
      /refreshCanonicalBattleSnapshot/u
    );

    assert.match(
      realtime,
      /onBattleSnapshot/u
    );

    assert.doesNotMatch(
      realtime,
      /setInterval\s*\(/u
    );

    assert.doesNotMatch(
      realtime,
      /while\s*\(\s*true\s*\)/u
    );
  }
);

test(
  "reconnect recovers durable result cursor before canonical snapshot projection",
  () => {
    const realtime =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryRealtimeClient.js"
      );

    assert.match(
      realtime,
      /recoverJoinedMatch/u
    );

    assert.match(
      realtime,
      /recoverDurableResults\(\{[\s\S]*?requireResult:\s*false/u
    );

    assert.match(
      realtime,
      /resultCursor/u
    );

    assert.match(
      realtime,
      /afterSequence/u
    );
  }
);

test(
  "BattleScene emits only bounded fire intent and owns no shot outcome",
  () => {
    const scene =
      read(
        "src/games/cing-artillery/scenes/BattleScene.js"
      );

    const engine =
      read(
        "src/games/cing-artillery/engine/createPremiumArtilleryGame.js"
      );

    const game =
      read(
        "src/games/cing-artillery/CingArtilleryGame.jsx"
      );

    assert.match(
      scene,
      /onFireIntent/u
    );

    assert.match(
      scene,
      /AIM_ANGLE_MIN_DEG\s*=\s*10/u
    );

    assert.match(
      scene,
      /AIM_ANGLE_MAX_DEG\s*=\s*80/u
    );

    assert.match(
      scene,
      /POWER_MIN\s*=\s*0/u
    );

    assert.match(
      scene,
      /POWER_MAX\s*=\s*100/u
    );

    assert.match(
      engine,
      /onFireIntent/u
    );

    assert.match(
      game,
      /handleBattleFireIntent/u
    );

    assert.match(
      game,
      /realtime\.sendShot/u
    );

    assert.match(
      game,
      /createShotCommandId/u
    );

    assert.match(
      game,
      /shotTurnLockRef/u
    );

    assert.doesNotMatch(
      scene,
      /player_one_current_hp\s*=|player_two_current_hp\s*=|damage\s*=|winner\s*=/u
    );
  }
);

test(
  "accepted shot acknowledgement cannot mutate canonical battle state",
  () => {
    const game =
      read(
        "src/games/cing-artillery/CingArtilleryGame.jsx"
      );

    assert.match(
      game,
      /Durable ACK means only that the command was accepted/u
    );

    assert.match(
      game,
      /await realtime\.sendShot/u
    );

    assert.doesNotMatch(
      game,
      /shotCommand[\s\S]{0,300}setBattleSnapshot\s*\(/u
    );

    assert.doesNotMatch(
      game,
      /shotCommand[\s\S]{0,300}setTurnState\s*\(/u
    );
  }
);

test(
  "fire lock is scoped by canonical match and turn identity",
  () => {
    const game =
      read(
        "src/games/cing-artillery/CingArtilleryGame.jsx"
      );

    assert.match(
      game,
      /battleMatchRef/u
    );

    assert.match(
      game,
      /shotLockKey/u
    );

    assert.match(
      game,
      /snapshot\.match_id.*authoritativeTurnNumber/su
    );

    assert.match(
      game,
      /shotTurnLockRef\.current\s*=\s*null/u
    );
  }
);

test(
  "BattleScene surfaces fire transport rejection without inventing gameplay state",
  () => {
    const scene =
      read(
        "src/games/cing-artillery/scenes/BattleScene.js"
      );

    assert.match(
      scene,
      /fireStatusText/u
    );

    assert.match(
      scene,
      /ĐANG GỬI/u
    );

    assert.match(
      scene,
      /ĐÃ NHẬN LỆNH/u
    );

    assert.match(
      scene,
      /KHÔNG THỂ BẮN/u
    );

    assert.match(
      scene,
      /catch\s*\(error\)/u
    );

    assert.doesNotMatch(
      scene,
      /fireStatusText[\s\S]{0,500}(damage|current_hp|winner|loser)\s*=/u
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
