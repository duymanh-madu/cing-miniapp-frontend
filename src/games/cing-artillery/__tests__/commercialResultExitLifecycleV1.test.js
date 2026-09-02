import assert from "node:assert/strict";
import test from "node:test";
import {
  readFile,
} from "node:fs/promises";

const gameSource =
  await readFile(
    new URL(
      "../CingArtilleryGame.jsx",
      import.meta.url
    ),
    "utf8"
  );

const engineSource =
  await readFile(
    new URL(
      "../engine/createPremiumArtilleryGame.js",
      import.meta.url
    ),
    "utf8"
  );

const sceneSource =
  await readFile(
    new URL(
      "../scenes/BattleScene.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "result exit crosses Phaser into React through explicit bridge",
  () => {
    assert.match(
      engineSource,
      /onExitIntent/u
    );

    assert.match(
      sceneSource,
      /onExitIntent/u
    );

    assert.match(
      gameSource,
      /onExitIntent:\s*handleExitIntent/u
    );
  }
);

test(
  "React owns one idempotent exit lifecycle",
  () => {
    assert.match(
      gameSource,
      /exitLifecycleRef\s*=\s*useRef\(null\)/u
    );

    assert.match(
      gameSource,
      /if\s*\(\s*exitLifecycleRef\.current\s*\)[\s\S]*return exitLifecycleRef\.current/u
    );

    assert.match(
      gameSource,
      /await realtime\.destroy\(\)/u
    );

    assert.match(
      gameSource,
      /destroyPremiumArtilleryGame\s*\(\s*battleGame\s*\)/u
    );

    assert.match(
      gameSource,
      /onExit\?\.\(\)/u
    );
  }
);

test(
  "terminal result button delegates exit only",
  () => {
    const start =
      sceneSource.indexOf(
        "const exitButton ="
      );

    const end =
      sceneSource.indexOf(
        "this.terminalResultContainer =",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      sceneSource.slice(
        start,
        end
      );

    assert.match(
      block,
      /"THOÁT"/u
    );

    assert.match(
      block,
      /onExitIntent/u
    );

    for (const forbidden of [
      "restart",
      "rematch",
      "matchmaking",
      "winner_account_id",
      "loser_account_id",
      "current_hp",
      "damage",
      "trajectory",
    ]) {
      assert.equal(
        block
          .toLowerCase()
          .includes(
            forbidden
          ),
        false,
        forbidden
      );
    }
  }
);

test(
  "existing React back controls share the lifecycle owner",
  () => {
    const direct =
      gameSource.match(
        /onClick=\{\s*\(\)\s*=>\s*onExit\?\.\(\)\s*\}/gu
      );

    assert.equal(
      direct,
      null
    );

    const calls =
      gameSource.match(
        /void handleExitIntent\(\)/gu
      ) || [];

    assert.ok(
      calls.length >=
        2
    );
  }
);

test(
  "result exit never owns rematch or local restart",
  () => {
    assert.doesNotMatch(
      sceneSource,
      /scene\.restart\s*\(/u
    );

    assert.doesNotMatch(
      sceneSource,
      /game\.restart\s*\(/u
    );
  }
);
