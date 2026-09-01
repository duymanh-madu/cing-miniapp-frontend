import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

const scene =
  fs.readFileSync(
    "src/games/cing-artillery/scenes/BattleScene.js",
    "utf8"
  );

test(
  "commercial battle HUD V1 is presentation-only",
  () => {
    assert.match(
      scene,
      /COMMERCIAL_HUD_V1/u
    );

    assert.match(
      scene,
      /createCommercialBattleHudV1/u
    );

    assert.match(
      scene,
      /createCommercialAimPresentationV1/u
    );

    assert.match(
      scene,
      /createCommercialPowerPresentationV1/u
    );

    assert.doesNotMatch(
      scene,
      /max_hp/u
    );
  }
);

test(
  "commercial HUD consumes canonical snapshot state",
  () => {
    for (
      const token
      of [
        "player_one",
        "player_two",
        "current_hp",
        "turn_deadline_at",
        "active_account_id",
        "initial_wind",
      ]
    ) {
      assert.match(
        scene,
        new RegExp(
          token,
          "u"
        )
      );
    }
  }
);

test(
  "commercial aim presentation cannot fire or mutate outcome",
  () => {
    const start =
      scene.indexOf(
        "createCommercialAimPresentationV1"
      );

    const end =
      scene.indexOf(
        "createCommercialPowerPresentationV1",
        start
      );

    assert.equal(
      start >= 0 &&
      end > start,
      true
    );

    const block =
      scene.slice(
        start,
        end
      );

    for (
      const forbidden
      of [
        "onFireIntent",
        "damage =",
        "winner =",
        "trajectory =",
        "current_hp =",
        "crater =",
      ]
    ) {
      assert.equal(
        block.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);

test(
  "commercial HUD does not invent dynamic wind authority",
  () => {
    assert.match(
      scene,
      /GIÓ ĐẦU TRẬN/u
    );

    assert.doesNotMatch(
      scene,
      /current_wind|turn_wind/u
    );
  }
);

test(
  "commercial controls retain bounded canonical aim and power",
  () => {
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
      scene,
      /fireShot/u
    );
  }
);
