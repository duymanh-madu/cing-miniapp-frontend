import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) =>
  fs.readFileSync(
    new URL(
      path,
      import.meta.url
    ),
    "utf8"
  );

const rush =
  read(
    "../../black-pearl-rush/BlackPearlRush.jsx"
  );

const tower =
  read(
    "../../cing-stack-tower/CingStackTower.jsx"
  );

const wrapper =
  read(
    "../../../features/game-center/components/CingOfflineRevivalGameV2.jsx"
  );

for (const [name, source] of [
  ["Black Pearl", rush],
  ["Stack Tower", tower],
]) {
  test(
    `${name}: free gameplay starts before session HTTP resolves`,
    () => {
      assert.match(
        source,
        /FREE START V2/
      );

      assert.doesNotMatch(
        source,
        /const allowed = await onGameStart\(\)/
      );

      const http =
        source.indexOf(
          "await onGameStart();"
        );

      assert.ok(
        http >= 0
      );

      const before =
        source.slice(
          Math.max(
            0,
            http - 1300
          ),
          http
        );

      assert.match(
        before,
        /startRound\(/
      );
    }
  );

  test(
    `${name}: revive resume retries until acknowledged`,
    () => {
      assert.match(
        source,
        /attempts < 12/
      );

      assert.match(
        source,
        /applied === true/
      );

      assert.match(
        source,
        /requestAnimationFrame/
      );

      const a =
        source.indexOf(
          "function resumeRevivedGame"
        );

      const b =
        source.indexOf(
          "revivalResumeRef.current",
          a
        );

      assert.ok(a >= 0);
      assert.ok(b > a);

      const region =
        source.slice(
          a,
          b
        );

      assert.match(
        region,
        /return true;/
      );

      assert.match(
        region,
        /return false;/
      );
    }
  );
}

test(
  "Tower revive preserves exact +30 second authority presentation",
  () => {
    assert.match(
      tower,
      /ROUND_TIME - 30_000/
    );

    assert.match(
      tower,
      /HỒI SINH \+30 GIÂY/
    );
  }
);

test(
  "finalize no longer depends on pendingReady presentation state",
  () => {
    const a =
      wrapper.indexOf(
        "const finalize ="
      );

    const b =
      wrapper.indexOf(
        "const recoverFinalize =",
        a
      );

    const region =
      wrapper.slice(
        a,
        b
      );

    assert.doesNotMatch(
      region,
      /!pendingReadyRef\.current/
    );

    assert.doesNotMatch(
      region,
      /!pendingReady\s*\|\|/
    );

    assert.match(
      region,
      /snapshot\.status/
    );

    assert.match(
      region,
      /"revive_pending"/
    );
  }
);
