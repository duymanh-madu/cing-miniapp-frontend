import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

/*
 * __tests__ -> runtime -> games
 *
 * Both game directories live inside
 * src/games, not directly inside src.
 */
const gamesRoot = path.resolve(
  path.dirname(
    fileURLToPath(import.meta.url)
  ),
  "../.."
);

const entries = [
  {
    name: "Stack Tower",
    file: path.join(
      gamesRoot,
      "cing-stack-tower/CingStackTower.jsx"
    ),
    authorizedCall:
      "startRound(performance.now());",
    startArgs: "now",
    nextFunction: "tap",
    frame: "rafRef",
  },
  {
    name: "Black Pearl",
    file: path.join(
      gamesRoot,
      "black-pearl-rush/BlackPearlRush.jsx"
    ),
    authorizedCall:
      "startRound();",
    startArgs: "",
    nextFunction: "jump",
    frame: "animationRef",
  },
];

for (const entry of entries) {
  test(
    `${entry.name}: authorization precedes gameplay`,
    () => {
      const source = fs.readFileSync(
        entry.file,
        "utf8"
      );

      const start =
        source.indexOf(
          "async function authorizeStartedRound("
        );

      const end =
        source.indexOf(
          "\n    function startRound(",
          start
        );

      assert.ok(
        start >= 0 &&
        end > start
      );

      const block =
        source.slice(start, end);

      const awaitIndex =
        block.indexOf(
          "await onGameStart()"
        );

      const gameplayIndex =
        block.indexOf(
          entry.authorizedCall
        );

      assert.ok(
        awaitIndex >= 0
      );

      assert.ok(
        gameplayIndex > awaitIndex
      );

      assert.match(
        block,
        /allowed !== true/
      );

      assert.match(
        block,
        /catch\s*\{/
      );
    }
  );

  test(
    `${entry.name}: double tap is fenced before async work`,
    () => {
      const source = fs.readFileSync(
        entry.file,
        "utf8"
      );

      const start =
        source.indexOf(
          "function startAuthorizedRound("
        );

      const end =
        source.indexOf(
          "\n    function " +
          entry.nextFunction +
          "(",
          start
        );

      assert.ok(
        start >= 0 &&
        end > start
      );

      const block =
        source.slice(start, end);

      const fence =
        block.indexOf(
          "startPending = true"
        );

      const invoke =
        block.indexOf(
          "authorizeStartedRound(authorizationId)"
        );

      assert.match(
        block,
        /if \(disposed \|\| startPending\) return/
      );

      assert.ok(
        fence >= 0 &&
        invoke > fence
      );

      assert.doesNotMatch(
        block,
        /startRound\((?:now)?\);/
      );
    }
  );

  test(
    `${entry.name}: stale response cannot restart unmounted canvas`,
    () => {
      const source = fs.readFileSync(
        entry.file,
        "utf8"
      );

      assert.match(
        source,
        /let disposed = false/
      );

      assert.match(
        source,
        /disposed \|\| authorizationId !== roundAuthorizationId/
      );

      assert.match(
        source,
        /return \(\) => \{\s*disposed = true;(?:\s*revivalResumeRef\.current = null;)?(?:\s*finalizeTimeoutRef\.current = null;)?\s*roundAuthorizationId \+= 1;/
      );

      assert.ok(
        source.includes(
          "cancelAnimationFrame(" +
          entry.frame +
          ".current)"
        )
      );
    }
  );
}
