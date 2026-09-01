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
  "canonical target account owns hit reaction",
  () => {
    assert.match(
      scene,
      /resolveCanonicalHitPresentationTargetV1/u
    );

    assert.match(
      scene,
      /target_account_id/u
    );

    assert.match(
      scene,
      /CHARACTER_STATE_V1\.HIT/u
    );
  }
);

test(
  "canonical damage is presentation text only",
  () => {
    const start =
      scene.indexOf(
        "presentCanonicalPlayerHitFeedbackV1("
      );

    const end =
      scene.indexOf(
        "waitForCanonicalImpactPacingV1(",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /result\.damage/u
    );

    assert.match(
      block,
      /`-\$\{damageText\}`/u
    );

    assert.doesNotMatch(
      block,
      /setCurrentHp|current_hp\s*=(?!=)|\bdamage\s*=(?!=)/u
    );
  }
);

test(
  "impact pacing is bounded presentation delay",
  () => {
    assert.match(
      scene,
      /async\s+presentCanonicalImpact/u
    );

    assert.match(
      scene,
      /await\s+this\.waitForCanonicalImpactPacingV1/u
    );

    assert.match(
      scene,
      /\?\s*58\s*:\s*42/u
    );

    assert.doesNotMatch(
      scene,
      /physics\.pause|scene\.pause|timeScale\s*=/u
    );
  }
);

test(
  "canonical shot waits for impact presentation",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "async presentCanonicalImpact",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /await\s+this\.presentCanonicalImpact/u
    );
  }
);

test(
  "HP pulse compares canonical snapshots only",
  () => {
    const start =
      scene.indexOf(
        "presentCanonicalVitalPulseV1("
      );

    const end =
      scene.indexOf(
        "presentCanonicalTurnHandoffV1(",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /previousSnapshot/u
    );

    assert.match(
      block,
      /nextSnapshot/u
    );

    assert.match(
      block,
      /player_one_current_hp/u
    );

    assert.match(
      block,
      /player_two_current_hp/u
    );

    assert.doesNotMatch(
      block,
      /result\.damage|setCurrentHp/u
    );
  }
);

test(
  "turn feedback follows canonical turn number change",
  () => {
    const start =
      scene.indexOf(
        "presentCanonicalTurnHandoffV1("
      );

    const end =
      scene.indexOf(
        "async presentCanonicalImpact(",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /turn_number/u
    );

    assert.match(
      block,
      /previousTurn\s*===\s*nextTurn/u
    );
  }
);
