import assert from "node:assert/strict";
import test from "node:test";
import {
  readFile,
} from "node:fs/promises";

const sceneUrl =
  new URL(
    "../scenes/BattleScene.js",
    import.meta.url
  );

const sceneSource =
  await readFile(
    sceneUrl,
    "utf8"
  );

test(
  "BattleScene consumes canonical terminal projection",
  () => {
    assert.match(
      sceneSource,
      /projectTerminalPresentationV1\s*\(\s*snapshot\s*\)/u
    );

    assert.match(
      sceneSource,
      /terminalPresentation\s*\?\.\s*completed/u
    );
  }
);

test(
  "completed battle locks fire intent before transport",
  () => {
    const start =
      sceneSource.indexOf(
        "async fireShot()"
      );

    const end =
      sceneSource.indexOf(
        "handleSnapshot(",
        start
      );

    const block =
      sceneSource.slice(
        start,
        end
      );

    assert.match(
      block,
      /terminalPresentation[\s\S]*completed[\s\S]*return/u
    );

    assert.ok(
      block.indexOf(
        "terminalPresentation"
      ) <
        block.indexOf(
          "onFireIntent"
        )
    );
  }
);

test(
  "terminal winner drives character victory and defeat",
  () => {
    assert.match(
      sceneSource,
      /winnerAccountId/u
    );

    assert.match(
      sceneSource,
      /CHARACTER_STATE_V1[\s\S]*VICTORY/u
    );

    assert.match(
      sceneSource,
      /CHARACTER_STATE_V1[\s\S]*DEFEAT/u
    );
  }
);

test(
  "result overlay distinguishes canonical terminal reasons",
  () => {
    assert.match(
      sceneSource,
      /FELL_OUT_OF_WORLD/u
    );

    assert.match(
      sceneSource,
      /ĐỐI THỦ RƠI KHỎI CHIẾN TRƯỜNG/u
    );

    assert.match(
      sceneSource,
      /ĐÃ HẠ GỤC ĐỐI THỦ/u
    );
  }
);

test(
  "terminal UX owns no winner inference from HP fall or projectile",
  () => {
    const start =
      sceneSource.indexOf(
        "presentCommercialTerminalResultV1()"
      );

    const end =
      sceneSource.indexOf(
        "applySnapshot(",
        start
      );

    const block =
      sceneSource.slice(
        start,
        end
      );

    for (const forbidden of [
      "current_hp",
      "motion_state",
      "target_account_id",
      "damage",
      "trajectory",
    ]) {
      assert.equal(
        block.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);
