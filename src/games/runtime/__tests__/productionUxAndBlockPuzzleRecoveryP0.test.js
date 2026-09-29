import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const revival =
  fs.readFileSync(
    new URL(
      "../../../features/game-center/components/CingOfflineRevivalGameV2.jsx",
      import.meta.url
    ),
    "utf8"
  );

const block =
  fs.readFileSync(
    new URL(
      "../../cing-block-puzzle/CingBlockPuzzle.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "terminal result UI hides child legacy terminal screen",
  () => {
    assert.match(
      revival,
      /background:\s*"#170d08"/
    );

    assert.match(
      revival,
      /Đang lưu kết quả\.\.\./
    );

    assert.match(
      revival,
      /Đã lưu kết quả thành công\./
    );
  }
);

test(
  "Block Puzzle start self-recovers stale unsupported version state",
  () => {
    assert.match(
      block,
      /VERSION SELF-RECOVERY/
    );

    assert.match(
      block,
      /BLOCK_PUZZLE_UNSUPPORTED_VERSION/
    );

    assert.match(
      block,
      /BLOCK_PUZZLE_UNSUPPORTED_ENGINE_CONTRACT/
    );

    assert.match(
      block,
      /clearBlockPuzzleRecovery\(\)/
    );

    assert.match(
      block,
      /clearBlockPuzzleTerminalIntent\(\)/
    );

    assert.match(
      block,
      /setPhase\(\s*PHASE\.IDLE\s*\)/
    );
  }
);

test(
  "version self-recovery never invokes financial authority",
  () => {
    const i =
      block.indexOf(
        "VERSION SELF-RECOVERY"
      );

    const end =
      block.indexOf(
        '"BLOCK_PUZZLE_SESSION_EXPIRED"',
        i
      );

    assert.ok(i >= 0);
    assert.ok(end > i);

    const region =
      block.slice(
        i,
        end
      );

    assert.match(
      region,
      /clearBlockPuzzleRecovery\(\)/
    );

    assert.match(
      region,
      /clearBlockPuzzleTerminalIntent\(\)/
    );

    assert.doesNotMatch(
      region,
      /purchaseAuthorizedBlockPuzzleContinue\s*\(/
    );

    assert.doesNotMatch(
      region,
      /startAuthorizedBlockPuzzleSession\s*\(/
    );

    assert.doesNotMatch(
      region,
      /submitAuthorizedBlockPuzzleReplay\s*\(/
    );

    assert.doesNotMatch(
      region,
      /apiClient\s*\./
    );

    assert.doesNotMatch(
      region,
      /fetch\s*\(/
    );
  }
);
