import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const scene =
  fs.readFileSync(
    new URL(
      "../scenes/BattleScene.js",
      import.meta.url
    ),
    "utf8"
  );

const engine =
  fs.readFileSync(
    new URL(
      "../engine/createPremiumArtilleryGame.js",
      import.meta.url
    ),
    "utf8"
  );

const game =
  fs.readFileSync(
    new URL(
      "../CingArtilleryGame.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "canonical result crosses React into Phaser through explicit presentation bridge",
  () => {
    assert.match(
      game,
      /onCanonicalShotResult\s*:/u
    );

    assert.match(
      game,
      /await\s+presentCanonicalArtilleryResult\s*\(/u
    );

    assert.match(
      engine,
      /CANONICAL_RESULT_EVENT/u
    );

    assert.match(
      engine,
      /game\.events\.emit\s*\(\s*CANONICAL_RESULT_EVENT/u
    );
  }
);

test(
  "React refuses canonical presentation after battle lifecycle is stale",
  () => {
    const start =
      game.indexOf(
        "onCanonicalShotResult:"
      );

    const end =
      game.indexOf(
        "onBattleSnapshot:",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      game.slice(
        start,
        end
      );

    assert.match(
      block,
      /!aliveRef\.current/u
    );

    assert.match(
      block,
      /runId\s*!==\s*runRef\.current/u
    );

    assert.match(
      block,
      /battleGameRef\.current/u
    );
  }
);

test(
  "BattleScene owns canonical presentation listener lifecycle",
  () => {
    assert.match(
      scene,
      /game\.events\.on\s*\(\s*CANONICAL_RESULT_EVENT/u
    );

    assert.match(
      scene,
      /game\.events\.off\s*\(\s*CANONICAL_RESULT_EVENT/u
    );

    assert.match(
      scene,
      /async\s+presentCanonicalShot/u
    );
  }
);

test(
  "projectile consumes canonical start and impact coordinates",
  () => {
    assert.match(
      scene,
      /start_x/u
    );

    assert.match(
      scene,
      /start_y/u
    );

    assert.match(
      scene,
      /impact_x/u
    );

    assert.match(
      scene,
      /impact_y/u
    );

    assert.match(
      scene,
      /projectile\.setPosition\s*\(\s*impactX\s*,\s*impactY/u
    );
  }
);

test(
  "projectile and impact remain inside scaled combat world",
  () => {
    assert.match(
      scene,
      /this\.world\s*=\s*world/u
    );

    assert.match(
      scene,
      /this\.world\.add\s*\(\s*projectile/u
    );

    assert.match(
      scene,
      /this\.world\.add\s*\(\s*impact/u
    );
  }
);

test(
  "presentation owns no gameplay collision damage or target authority",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "applySnapshot(",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      scene.slice(
        start,
        end
      );

    assert.doesNotMatch(
      block,
      /setCurrentHp|terrainRevision|target_account_id\s*=|damage\s*=|physics\.add|overlap|collider/iu
    );
  }
);

test(
  "presentation promise resolves only after canonical impact boundary",
  () => {
    const impact =
      scene.indexOf(
        "this.presentCanonicalImpact("
      );

    const resolve =
      scene.indexOf(
        "resolve();",
        impact
      );

    assert.ok(
      impact >= 0
    );

    assert.ok(
      resolve > impact
    );
  }
);
