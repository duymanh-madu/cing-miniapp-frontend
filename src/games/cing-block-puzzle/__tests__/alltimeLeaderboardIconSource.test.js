import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  "src/features/game-center/components/AlltimeLeaderboard.jsx",
  "utf8"
);

test(
  "Alltime leaderboard resolves registered games through canonical registry",
  () => {
    assert.match(
      source,
      /getGame\(game\?\.game_key\)/
    );

    assert.match(
      source,
      /registeredGame\?\.iconUrl/
    );

    assert.match(
      source,
      /src=\{registeredGame\.iconUrl\}/
    );
  }
);

test(
  "Alltime leaderboard preserves fallback icon for non-registered games",
  () => {
    assert.match(
      source,
      /\{game\?\.icon \|\| "🎮"\}/
    );
  }
);

test(
  "Alltime game tabs no longer render raw config icon directly",
  () => {
    assert.doesNotMatch(
      source,
      /\}\>\{g\.icon\}\s+\{g\.display_name\}/
    );
  }
);
