import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import {
  FIRING_FEEL_V1,
  FIRING_PRESENTATION_VERSION_V1,
  clampPowerV1,
  resolveViewerPlayerV1,
} from "../presentation/cingArtilleryFiringPresentationV1.js";

const scene =
  fs.readFileSync(
    "src/games/cing-artillery/scenes/BattleScene.js",
    "utf8"
  );

const firing =
  fs.readFileSync(
    "src/games/cing-artillery/presentation/cingArtilleryFiringPresentationV1.js",
    "utf8"
  );

test(
  "commercial firing presentation version is explicit",
  () => {
    assert.equal(
      FIRING_PRESENTATION_VERSION_V1,
      "cing-artillery-firing-presentation-v1"
    );
  }
);

test(
  "charge power remains bounded to shot command contract",
  () => {
    assert.equal(
      clampPowerV1(-20),
      0
    );

    assert.equal(
      clampPowerV1(50),
      50
    );

    assert.equal(
      clampPowerV1(150),
      100
    );

    assert.equal(
      FIRING_FEEL_V1
        .chargeRatePerSecond >
        0,
      true
    );
  }
);

test(
  "viewer firing identity derives from account identity",
  () => {
    const result =
      resolveViewerPlayerV1({
        viewer: {
          account_id:
            "account-b",
        },

        players: {
          player_one: {
            account_id:
              "account-a",

            position_x:
              760,
          },

          player_two: {
            account_id:
              "account-b",

            position_x:
              220,
          },
        },
      });

    assert.equal(
      result.slot,
      2
    );

    assert.equal(
      result.player.account_id,
      "account-b"
    );

    assert.equal(
      result.opponent.account_id,
      "account-a"
    );

    assert.equal(
      result.facing,
      1
    );
  }
);

test(
  "commercial fire charges on press and submits on release",
  () => {
    const start =
      scene.indexOf(
        "    bindCommercialFireButtonV1() {"
      );

    const end =
      scene.indexOf(
        "    setAimAngle(",
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

    assert.match(
      block,
      /pointerdown/u
    );

    assert.match(
      block,
      /beginCharge/u
    );

    assert.match(
      block,
      /pointerup/u
    );

    assert.match(
      block,
      /releaseCharge/u
    );

    assert.match(
      block,
      /void this\.fireShot\(\)/u
    );
  }
);

test(
  "accepted ACK may trigger firing presentation only",
  () => {
    assert.match(
      scene,
      /ĐÃ NHẬN LỆNH/u
    );

    assert.match(
      scene,
      /presentAcceptedFire/u
    );

    assert.doesNotMatch(
      firing,
      /trajectory_presentation|impact_x|impact_y/u
    );
  }
);

test(
  "recoil never moves authoritative player container",
  () => {
    assert.doesNotMatch(
      firing,
      /container\.setPosition|targets:\s*container/u
    );

    assert.match(
      firing,
      /cameras\.main[\s\S]*?shake/u
    );
  }
);

test(
  "firing presentation owns zero gameplay result authority",
  () => {
    for (
      const forbidden
      of [
        "damage =",
        "winner =",
        "current_hp =",
        "trajectory =",
        "crater =",
        "hitbox =",
        "sendShot",
        "onFireIntent",
      ]
    ) {
      assert.equal(
        firing.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);

test(
  "canonical result still owns projectile playback",
  () => {
    assert.match(
      scene,
      /async\s+presentCanonicalShot/u
    );

    assert.match(
      scene,
      /trajectory_presentation/u
    );

    assert.match(
      scene,
      /CANONICAL_RESULT_EVENT/u
    );
  }
);
