import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      relativePath
    ),
    "utf8"
  );
}

const registry =
  read(
    "src/games/registry/gameRegistry.js"
  );

const authority =
  read(
    "src/games/registry/gameRuntimeAuthority.js"
  );

const gameCenter =
  read(
    "src/features/game-center/pages/GameCenterPage.jsx"
  );

const loader =
  read(
    "src/game-system/loaders/GameLoader.jsx"
  );

test(
  "Block Puzzle is registered as live self-managed game",
  () => {
    assert.match(
      registry,
      /"cing-block-puzzle"/
    );

    assert.match(
      registry,
      /component:\s*CingBlockPuzzle/
    );

    assert.match(
      registry,
      /SELF_MANAGED/
    );

    assert.match(
      registry,
      /status:\s*"LIVE"/
    );
  }
);

test(
  "legacy offline games retain generic callback authority",
  () => {
    assert.match(
      registry,
      /BlackPearlRush[\s\S]*?LEGACY_GENERIC/
    );

    assert.match(
      registry,
      /CingStackTower[\s\S]*?LEGACY_GENERIC/
    );
  }
);

test(
  "runtime authority contract is explicit and versioned",
  () => {
    assert.match(
      authority,
      /legacy-generic-v1/
    );

    assert.match(
      authority,
      /self-managed-v1/
    );

    assert.match(
      authority,
      /isSupportedGameRuntimeAuthority/
    );
  }
);

test(
  "Game Center passes generic callbacks only through legacy runtime props",
  () => {
    const activeBlock =
      gameCenter.slice(
        gameCenter.indexOf(
          "if (activeGame)"
        ),
        gameCenter.indexOf(
          "return (",
          gameCenter.indexOf(
            "if (activeGame)"
          ) + 1
        ) +
          4000
      );

    assert.match(
      activeBlock,
      /const isSelfManaged/
    );

    assert.match(
      activeBlock,
      /const genericRuntimeProps/
    );

    assert.match(
      activeBlock,
      /isSelfManaged\s*\?\s*\{\}/
    );

    assert.match(
      activeBlock,
      /onGameOver:\s*handleGameOver/
    );

    assert.match(
      activeBlock,
      /onGameStart:/
    );

    assert.match(
      activeBlock,
      /\{\.\.\.genericRuntimeProps\}/
    );
  }
);

test(
  "Game Center no longer falls back to another game component",
  () => {
    assert.doesNotMatch(
      gameCenter,
      /game\?\.component\s*\|\|\s*BlackPearlRush/
    );

    assert.match(
      gameCenter,
      /isSupportedGameRuntimeAuthority/
    );
  }
);

test(
  "GameLoader lazy-loads Block Puzzle without generic game-over callback",
  () => {
    assert.match(
      loader,
      /"cing-block-puzzle"/
    );

    assert.match(
      loader,
      /SELF_MANAGED/
    );

    assert.match(
      loader,
      /if\s*\([\s\S]*?SELF_MANAGED[\s\S]*?\)\s*\{[\s\S]*?<Component\s*\/>/
    );

    assert.match(
      loader,
      /LEGACY_GENERIC/
    );

    assert.match(
      loader,
      /onGameOver=/
    );
  }
);

test(
  "Block Puzzle remains free of generic play and score endpoints",
  () => {
    const component =
      read(
        "src/games/cing-block-puzzle/CingBlockPuzzle.jsx"
      );

    assert.doesNotMatch(
      component,
      /\/game\/use-play/
    );

    assert.doesNotMatch(
      component,
      /\/game\/score/
    );
  }
);
