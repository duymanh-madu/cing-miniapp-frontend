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

const clientSource =
  await readFile(
    new URL(
      "../runtime/cingArtilleryAuthorityClient.js",
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

function sliceBetween(
  source,
  startToken,
  endToken
) {
  const start =
    source.indexOf(
      startToken
    );

  const end =
    source.indexOf(
      endToken,
      start + startToken.length
    );

  assert.ok(
    start >= 0 &&
    end > start,
    `${startToken} -> ${endToken}`
  );

  return source.slice(
    start,
    end
  );
}

test(
  "rematch HTTP authority accepts source_match_id only",
  () => {
    const block =
      sliceBetween(
        clientSource,
        "requestCingArtilleryRematch",
        "enterCingArtilleryMatchmaking"
      );

    assert.match(
      block,
      /`\$\{BASE\}\/rematch`/u
    );

    assert.match(
      block,
      /source_match_id:\s*matchId/u
    );

    for (const forbidden of [
      "account_id",
      "opponent_id",
      "gameplay_session_id",
      "user_id",
      "player_one",
      "player_two",
    ]) {
      assert.doesNotMatch(
        block,
        new RegExp(
          forbidden,
          "u"
        )
      );
    }
  }
);

test(
  "BattleScene delegates rematch and never restarts gameplay locally",
  () => {
    assert.match(
      engineSource,
      /onRematchIntent/u
    );

    assert.match(
      sceneSource,
      /onRematchIntent/u
    );

    assert.match(
      gameSource,
      /onRematchIntent:\s*handleRematchIntent/u
    );

    assert.match(
      sceneSource,
      /"ĐẤU LẠI"/u
    );

    assert.match(
      sceneSource,
      /"CHỜ ĐỐI THỦ\.\.\."/u
    );

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

test(
  "rematch handler is outside the existing exit-only block",
  () => {
    const rematchHandler =
      sceneSource.indexOf(
        "rematchButton.on("
      );

    const exitButton =
      sceneSource.indexOf(
        "const exitButton ="
      );

    const exitHandler =
      sceneSource.indexOf(
        "exitButton.on("
      );

    assert.ok(
      rematchHandler >= 0
    );

    assert.ok(
      rematchHandler <
      exitButton
    );

    assert.ok(
      exitButton <
      exitHandler
    );
  }
);

test(
  "React rematch is idempotent and fenced by lifecycle generation",
  () => {
    const block =
      sliceBetween(
        gameSource,
        "async function\n  handleRematchIntent",
        "async function\n  enterLandscapeBattleMode"
      );

    assert.match(
      block,
      /rematchLifecycleRef\.current/u
    );

    assert.match(
      block,
      /sourceRunId\s*=\s*runRef\.current/u
    );

    assert.match(
      block,
      /sourceRunId ===\s*runRef\.current/u
    );

    assert.match(
      block,
      /requestCingArtilleryRematch\s*\(\s*sourceId\s*\)/u
    );
  }
);

test(
  "waiting rematch does not destroy source battle",
  () => {
    const block =
      sliceBetween(
        gameSource,
        "async function\n  handleRematchIntent",
        "async function\n  enterLandscapeBattleMode"
      );

    const requestIndex =
      block.indexOf(
        "requestCingArtilleryRematch"
      );

    const matchedIndex =
      block.indexOf(
        'rematchDecision.status ===\n                "matched"'
      );

    const destroyIndex =
      block.indexOf(
        "await previousRealtime.destroy()"
      );

    assert.ok(
      requestIndex >= 0
    );

    assert.ok(
      matchedIndex >
      requestIndex
    );

    assert.ok(
      destroyIndex >
      matchedIndex
    );
  }
);

test(
  "matched rematch destroys old realtime before old Phaser",
  () => {
    const block =
      sliceBetween(
        gameSource,
        "async function\n  handleRematchIntent",
        "async function\n  enterLandscapeBattleMode"
      );

    const realtimeDestroy =
      block.indexOf(
        "await previousRealtime.destroy()"
      );

    const phaserDestroy =
      block.indexOf(
        "destroyPremiumArtilleryGame("
      );

    assert.ok(
      realtimeDestroy >= 0
    );

    assert.ok(
      phaserDestroy >
      realtimeDestroy
    );
  }
);

test(
  "rematch never enters normal matchmaking or creates a client gameplay session",
  () => {
    const block =
      sliceBetween(
        gameSource,
        "async function\n  handleRematchIntent",
        "async function\n  enterLandscapeBattleMode"
      );

    assert.doesNotMatch(
      block,
      /enterCingArtilleryMatchmaking/u
    );

    assert.doesNotMatch(
      block,
      /createCingArtilleryGameplaySession/u
    );
  }
);

test(
  "initial matchmaking and rematch share canonical matched boot",
  () => {
    assert.match(
      gameSource,
      /async function\s+connectCanonicalMatch\s*\(/u
    );

    const matchmaking =
      sliceBetween(
        gameSource,
        "async function\n  startMatchmaking",
        "const status ="
      );

    assert.match(
      matchmaking,
      /await connectCanonicalMatch\s*\(\s*matchDecision,\s*runId\s*\)/u
    );

    const rematch =
      sliceBetween(
        gameSource,
        "async function\n  handleRematchIntent",
        "async function\n  enterLandscapeBattleMode"
      );

    assert.match(
      rematch,
      /await connectCanonicalMatch\s*\(\s*nextDecision,\s*nextRunId\s*\)/u
    );
  }
);

test(
  "fresh canonical boot creates a fresh realtime client",
  () => {
    const block =
      sliceBetween(
        gameSource,
        "async function\n  connectCanonicalMatch",
        "async function\n  startMatchmaking"
      );

    assert.match(
      block,
      /createCingArtilleryRealtimeClient\s*\(/u
    );

    assert.match(
      block,
      /await realtime\.joinMatch\s*\(\s*matchDecision\.match_id\s*\)/u
    );

    assert.match(
      block,
      /\.readBattleSnapshot\s*\(\s*matchDecision\.match_id\s*\)/u
    );
  }
);
