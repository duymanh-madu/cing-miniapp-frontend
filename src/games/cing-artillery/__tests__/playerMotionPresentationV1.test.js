import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  MOTION_STATE,
  projectPlayerMotionV1,
} from "../domain/cingArtilleryPlayerMotionProjectionV1.js";

const SCENE =
  "src/games/cing-artillery/scenes/BattleScene.js";

function valid(
  overrides = {}
) {
  return {
    account_id:
      "account-1",

    gameplay_session_id:
      "session-1",

    position_x:
      120,

    position_y:
      310,

    motion_state:
      "stable",

    ...overrides,
  };
}

test(
  "projects exact stable player motion authority",
  () => {
    const projected =
      projectPlayerMotionV1(
        valid()
      );

    assert.deepEqual(
      projected,
      {
        account_id:
          "account-1",

        gameplay_session_id:
          "session-1",

        position_x:
          120,

        position_y:
          310,

        motion_state:
          MOTION_STATE.STABLE,
      }
    );

    assert.ok(
      Object.isFrozen(
        projected
      )
    );
  }
);

test(
  "projects falling state without deriving movement",
  () => {
    const projected =
      projectPlayerMotionV1(
        valid({
          position_x:
            137,

          position_y:
            611,

          motion_state:
            "falling",
        })
      );

    assert.equal(
      projected.position_x,
      137
    );

    assert.equal(
      projected.position_y,
      611
    );

    assert.equal(
      projected.motion_state,
      MOTION_STATE.FALLING
    );
  }
);

test(
  "rejects unsupported motion states",
  () => {
    for (const state of [
      "",
      "grounded",
      "dead",
      "fall",
      "airborne",
    ]) {
      assert.throws(
        () =>
          projectPlayerMotionV1(
            valid({
              motion_state:
                state,
            })
          ),
        /PLAYER_MOTION_INVALID_V1:motion_state/u
      );
    }
  }
);

test(
  "rejects non authoritative integer coordinates",
  () => {
    for (const value of [
      NaN,
      Infinity,
      1.5,
      "1.5",
      null,
      undefined,
      "",
      "01",
      true,
      false,
      {},
      [],
    ]) {
      assert.throws(
        () =>
          projectPlayerMotionV1(
            valid({
              position_y:
                value,
            })
          )
      );
    }
  }
);

test(
  "accepts canonical integer strings without coercing malformed values",
  () => {
    const projected =
      projectPlayerMotionV1(
        valid({
          position_x:
            "-12",

          position_y:
            "611",
        })
      );

    assert.equal(
      projected.position_x,
      -12
    );

    assert.equal(
      projected.position_y,
      611
    );
  }
);

test(
  "BattleScene consumes motion state and authoritative coordinates",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    for (const token of [
      "motion_state",
      "projectPlayerMotionV1",
      "MOTION_STATE.STABLE",
      "projected.position_x",
      "projected.position_y",
    ]) {
      assert.match(
        source,
        new RegExp(
          token.replace(
            ".",
            "\\."
          ),
          "u"
        )
      );
    }
  }
);

test(
  "stable state snaps exactly to authoritative coordinates",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    const start =
      source.indexOf(
        "    applyAuthoritativePlayerMotion("
      );

    const end =
      source.indexOf(
        "    createPlayerMarker(",
        start
      );

    const block =
      source.slice(
        start,
        end
      );

    assert.match(
      block,
      /MOTION_STATE\.STABLE/u
    );

    assert.match(
      block,
      /\.setPosition\(\s*projected\.position_x,\s*projected\.position_y\s*\)/u
    );
  }
);

test(
  "fall tween terminates only at authoritative coordinates",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    const start =
      source.indexOf(
        "    applyAuthoritativePlayerMotion("
      );

    const end =
      source.indexOf(
        "    createPlayerMarker(",
        start
      );

    const block =
      source.slice(
        start,
        end
      );

    assert.match(
      block,
      /x:\s*projected\.position_x/u
    );

    assert.match(
      block,
      /y:\s*projected\.position_y/u
    );

    assert.match(
      block,
      /ease:\s*"Quad\.easeIn"/u
    );
  }
);

test(
  "frontend motion presentation owns no support gravity collision or KO authority",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    const start =
      source.indexOf(
        "    applyAuthoritativePlayerMotion("
      );

    const end =
      source.indexOf(
        "    createPlayerMarker(",
        start
      );

    const block =
      source.slice(
        start,
        end
      );

    for (const forbidden of [
      "support",
      "collision_mask",
      "terrainBit",
      "gravity",
      "velocity",
      "acceleration",
      "winner",
      "loser",
      "hp",
      "damage",
      "fell_out_of_world",
    ]) {
      assert.doesNotMatch(
        block,
        new RegExp(
          forbidden,
          "iu"
        )
      );
    }
  }
);

test(
  "snapshot applies server terrain and player motion independently",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    const start =
      source.lastIndexOf(
        "    applySnapshot("
      );

    const block =
      source.slice(
        start,
        start + 4500
      );

    assert.match(
      block,
      /applyAuthoritativeTerrain\(\s*snapshot\.terrain\s*\)/u
    );

    assert.match(
      block,
      /applyAuthoritativePlayerMotion/u
    );

    assert.doesNotMatch(
      block,
      /support|gravity|collision_mask/u
    );
  }
);
