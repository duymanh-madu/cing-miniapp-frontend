import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(path) {
  return fs.readFileSync(
    path,
    "utf8"
  );
}

const registry =
  read(
    "src/games/registry/gameRegistry.js"
  );

const leaderboard =
  read(
    "src/features/game-center/components/GameLeaderboard.jsx"
  );

const adminLeaderboard =
  read(
    "src/features/admin/components/AdminLeaderboard.jsx"
  );

test(
  "Block Puzzle registry uses production icon asset",
  () => {
    assert.match(
      registry,
      /"cing-block-puzzle"[\s\S]*iconUrl:\s*"\/game-icons\/cing-block-puzzle\.png"/
    );
  }
);

test(
  "Block Puzzle leaderboard uses production icon asset",
  () => {
    assert.match(
      leaderboard,
      /"cing-block-puzzle":\s*"\/game-icons\/cing-block-puzzle\.png"/
    );
  }
);

test(
  "Admin leaderboard uses Block Puzzle image icon",
  () => {
    assert.match(
      adminLeaderboard,
      /key:"cing-block-puzzle"[\s\S]*iconUrl:"\/game-icons\/cing-block-puzzle\.png"/
    );

    assert.match(
      adminLeaderboard,
      /p\.iconUrl/
    );

    assert.match(
      adminLeaderboard,
      /g\.iconUrl/
    );
  }
);

test(
  "legacy Block Puzzle puzzle emoji is removed",
  () => {
    assert.doesNotMatch(
      registry,
      /iconFallback:\s*"🧩"/
    );

    assert.doesNotMatch(
      adminLeaderboard,
      /key:"cing-block-puzzle"[\s\S]{0,200}icon:"🧩"/
    );
  }
);

test(
  "production Block Puzzle icon file exists",
  () => {
    assert.equal(
      fs.existsSync(
        "public/game-icons/cing-block-puzzle.png"
      ),
      true
    );
  }
);

const gameplayUi =
  read(
    "src/games/cing-block-puzzle/CingBlockPuzzle.jsx"
  );

test(
  "Block Puzzle gameplay entry screen uses production icon",
  () => {
    assert.match(
      gameplayUi,
      /src="\/game-icons\/cing-block-puzzle\.png"/
    );

    assert.doesNotMatch(
      gameplayUi,
      />\s*🧩\s*</
    );
  }
);

test(
  "Block Puzzle admin defaults no longer expose legacy puzzle emoji",
  () => {
    const blockPuzzleConfig =
      adminLeaderboard.match(
        /"cing-block-puzzle":\s*\{[\s\S]*?\n\s*\},/
      );

    assert.ok(
      blockPuzzleConfig,
      "Block Puzzle admin config must exist"
    );

    assert.doesNotMatch(
      blockPuzzleConfig[0],
      /icon:\s*"🧩"/
    );
  }
);
