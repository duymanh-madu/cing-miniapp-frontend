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
      /this\.world\.add\s*\(\s*(?:missRing|fragment)\s*\)|this\.world\.add\s*\(\s*\[\s*smoke,\s*ring,\s*core,\s*flash,/u
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
      /setCurrentHp|terrainRevision|target_account_id\s*=(?!=)|damage\s*=(?!=)|physics\.add|overlap|collider/iu
    );
  }
);

test(
  "canonical sample playback reaches impact before presentation completes",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "presentCanonicalImpact(",
        start
      );

    assert.ok(
      start >= 0
    );

    assert.ok(
      end > start
    );

    const block =
      scene.slice(
        start,
        end + 600
      );

    assert.match(
      block,
      /result\.trajectory_presentation/u
    );

    assert.match(
      block,
      /next\.elapsed_ms\s*-\s*previous\.elapsed_ms/u
    );

    assert.match(
      block,
      /duration:\s*segmentDurationMs/u
    );

    assert.match(
      block,
      /ease:\s*"Linear"/u
    );

    assert.match(
      block,
      /projectile\.setPosition\s*\(\s*impactX\s*,\s*impactY/u
    );
  }
);

test(
  "frontend owns no synthetic ballistic projectile curve",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "presentCanonicalImpact(",
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

    for (const forbidden of [
      "Math.sin",
      "Math.cos",
      "Math.hypot",
      "arcHeight",
      "pixelsPerSecond",
      "minDurationMs",
      "maxDurationMs",
    ]) {
      assert.doesNotMatch(
        block,
        new RegExp(
          forbidden
            .replace(
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
  "collision endpoint remains canonical impact rather than trajectory extrapolation",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "presentCanonicalImpact(",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /result\.outcome\s*===\s*"player_hit"/u
    );

    assert.match(
      block,
      /result\.outcome\s*===\s*"terrain_hit"/u
    );

    assert.match(
      block,
      /terminalX\s*=\s*impactX/u
    );

    assert.match(
      block,
      /terminalY\s*=\s*impactY/u
    );
  }
);

test(
  "camera follows rendered canonical projectile without moving combat world",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "presentCanonicalImpact(",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /this\.cameras\.main/u
    );

    assert.match(
      block,
      /presentationCamera\.startFollow/u
    );

    assert.match(
      block,
      /cameraTarget\.setPosition/u
    );

    assert.match(
      block,
      /projectile\.x\s*\*\s*worldScale/u
    );

    assert.match(
      block,
      /projectile\.y\s*\*\s*worldScale/u
    );

    assert.doesNotMatch(
      block,
      /this\.world\.setPosition/u
    );
  }
);

test(
  "presentation camera restores canonical viewport before impact",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const impact =
      scene.indexOf(
        "this.presentCanonicalImpact(",
        start
      );

    assert.ok(
      start >= 0 &&
      impact > start
    );

    const block =
      scene.slice(
        start,
        impact
      );

    const stopFollow =
      block.lastIndexOf(
        "presentationCamera.stopFollow"
      );

    const restoreZoom =
      block.lastIndexOf(
        "presentationCamera.setZoom"
      );

    const restoreScroll =
      block.lastIndexOf(
        "presentationCamera.setScroll"
      );

    assert.ok(
      stopFollow >= 0
    );

    assert.ok(
      restoreZoom >
        stopFollow
    );

    assert.ok(
      restoreScroll >
        restoreZoom
    );
  }
);

test(
  "flight trail is presentation-only history of durable samples",
  () => {
    const start =
      scene.indexOf(
        "async presentCanonicalShot"
      );

    const end =
      scene.indexOf(
        "presentCanonicalImpact(",
        start
      );

    const block =
      scene.slice(
        start,
        end
      );

    assert.match(
      block,
      /this\.add\.graphics/u
    );

    assert.match(
      block,
      /previous\.x\s*\*\s*worldScale/u
    );

    assert.match(
      block,
      /previous\.y\s*\*\s*worldScale/u
    );

    assert.match(
      block,
      /next\.x\s*\*\s*worldScale/u
    );

    assert.match(
      block,
      /next\.y\s*\*\s*worldScale/u
    );

    assert.doesNotMatch(
      block,
      /velocity|gravity|wind|Math\.sin|Math\.cos/iu
    );
  }
);

test(
  "camera and trail presentation resources clean up on scene shutdown",
  () => {
    assert.match(
      scene,
      /this\.presentationCameraTarget\s*\?\.\s*destroy/u
    );

    assert.match(
      scene,
      /this\.presentationTrail\s*\?\.\s*destroy/u
    );

    assert.match(
      scene,
      /this\.cameras\.main\s*\?\.\s*stopFollow/u
    );

    assert.match(
      scene,
      /this\.cameras\.main\s*\?\.\s*setZoom\s*\(\s*1/u
    );

    assert.match(
      scene,
      /this\.cameras\.main\s*\?\.\s*setScroll\s*\(\s*0\s*,\s*0/u
    );
  }
);

test(
  "canonical collision outcomes own commercial impact feedback",
  () => {
    const start =
      scene.indexOf(
        "presentCanonicalImpact("
      );

    const methodStart =
      scene.indexOf(
        "presentCanonicalImpact(",
        start + 1
      );

    const end =
      scene.indexOf(
        "applySnapshot(",
        methodStart
      );

    assert.ok(
      methodStart >= 0 &&
      end > methodStart
    );

    const block =
      scene.slice(
        methodStart,
        end
      );

    assert.match(
      block,
      /outcome\s*===\s*"player_hit"/u
    );

    assert.match(
      block,
      /outcome\s*!==\s*"terrain_hit"/u
    );

    assert.match(
      block,
      /outcome\s*===\s*"out_of_bounds"/u
    );

    assert.match(
      block,
      /camera\.shake/u
    );

    assert.match(
      block,
      /const debrisCount/u
    );

    assert.match(
      block,
      /const smoke/u
    );
  }
);

test(
  "out of bounds remains miss feedback and never receives collision shake",
  () => {
    const methodStart =
      scene.indexOf(
        "presentCanonicalImpact(",
        scene.indexOf(
          "presentCanonicalImpact("
        ) + 1
      );

    const end =
      scene.indexOf(
        "applySnapshot(",
        methodStart
      );

    const block =
      scene.slice(
        methodStart,
        end
      );

    const missStart =
      block.indexOf(
        'outcome ===\n        "out_of_bounds"'
      );

    const collisionStart =
      block.indexOf(
        "const isPlayerHit"
      );

    assert.ok(
      missStart >= 0
    );

    assert.ok(
      collisionStart >
        missStart
    );

    const missBlock =
      block.slice(
        missStart,
        collisionStart
      );

    assert.match(
      missBlock,
      /const missRing/u
    );

    assert.match(
      missBlock,
      /\breturn;/u
    );

    assert.doesNotMatch(
      missBlock,
      /camera\.shake/u
    );

    assert.doesNotMatch(
      missBlock,
      /debrisCount/u
    );
  }
);

test(
  "impact VFX derives only from canonical outcome and supplied endpoint",
  () => {
    const methodStart =
      scene.indexOf(
        "presentCanonicalImpact(",
        scene.indexOf(
          "presentCanonicalImpact("
        ) + 1
      );

    const end =
      scene.indexOf(
        "applySnapshot(",
        methodStart
      );

    const block =
      scene.slice(
        methodStart,
        end
      );

    assert.match(
      block,
      /result\?\.outcome/u
    );

    assert.doesNotMatch(
      block,
      /setCurrentHp|terrainRevision|target_account_id\s*=|damage\s*=|physics\.add|collider|overlap/iu
    );
  }
);

test(
  "commercial impact debris is strictly bounded",
  () => {
    const methodStart =
      scene.indexOf(
        "presentCanonicalImpact(",
        scene.indexOf(
          "presentCanonicalImpact("
        ) + 1
      );

    const end =
      scene.indexOf(
        "applySnapshot(",
        methodStart
      );

    const block =
      scene.slice(
        methodStart,
        end
      );

    assert.match(
      block,
      /isPlayerHit\s*\?\s*8\s*:\s*10/u
    );

    assert.doesNotMatch(
      block,
      /particles\.createEmitter|while\s*\(/u
    );
  }
);
