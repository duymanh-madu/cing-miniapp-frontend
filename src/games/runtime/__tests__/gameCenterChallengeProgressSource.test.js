import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(
  fileURLToPath(import.meta.url)
);

const source = fs.readFileSync(
  path.resolve(
    here,
    "../../../features/game-center/pages/GameCenterPage.jsx"
  ),
  "utf8"
);

test(
  "challenge progress is separated from score submission",
  () => {
    const begin = source.indexOf(
      "const handleChallengeProgress ="
    );

    const end = source.indexOf(
      "const showNoPlays =",
      begin
    );

    assert.ok(begin >= 0);
    assert.ok(end > begin);

    const challenge = source.slice(begin, end);

    assert.match(
      challenge,
      /\/game\/daily-challenge\/claim/
    );

    assert.doesNotMatch(
      challenge,
      /\/game\/score/
    );

    assert.match(
      source,
      /onChallengeProgress:\s*handleChallengeProgress/
    );

    assert.match(
      source,
      /handleChallengeProgress\(\{ bestCombo, gameKey \}\)/
    );
  }
);
