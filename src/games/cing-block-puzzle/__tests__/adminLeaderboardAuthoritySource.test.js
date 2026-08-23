import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const adminGames = fs.readFileSync(
  "src/features/admin/components/AdminGames.jsx",
  "utf8"
);

const adminLeaderboard = fs.readFileSync(
  "src/features/admin/components/AdminLeaderboard.jsx",
  "utf8"
);

test(
  "Games admin uses alltime endpoint payload without weekly override",
  () => {
    assert.match(
      adminGames,
      /\/game\/leaderboard\/alltime-games/
    );

    assert.doesNotMatch(
      adminGames,
      /\/leaderboard\/top-games\/\$\{g\.game_key\}/
    );

    assert.match(
      adminGames,
      /Array\.isArray\(game\.data\)/
    );
  }
);

test(
  "Leaderboard and rewards admin uses weekly game leaderboard",
  () => {
    assert.match(
      adminLeaderboard,
      /\/leaderboard\/top-games\/\$\{key\}/
    );

    assert.doesNotMatch(
      adminLeaderboard,
      /\/leaderboard\/top100\/game\/\$\{key\}/
    );
  }
);
