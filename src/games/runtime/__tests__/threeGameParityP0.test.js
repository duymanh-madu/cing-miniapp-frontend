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
  "Rush and Tower pending UI uses React state",
  () => {
    assert.match(
      revival,
      /const \[pendingReady, setPendingReady\]/
    );

    assert.match(
      revival,
      /setPendingReady\(true\)/
    );

    const render =
      revival.slice(
        revival.indexOf("const nextCost =")
      );

    assert.doesNotMatch(
      render,
      /pendingReadyRef\.current/
    );
  }
);

test(
  "Rush and Tower expose visible revive and finalize actions",
  () => {
    assert.match(
      revival,
      /REVIVAL_PRIMARY_ACTION_STYLE/
    );

    assert.match(
      revival,
      /REVIVAL_SECONDARY_ACTION_STYLE/
    );

    assert.match(
      revival,
      /Dùng Revive Credit/
    );

    assert.match(
      revival,
      /Kết thúc và lưu điểm/
    );

    assert.match(
      revival,
      /Cần hồi sinh để tiếp tục!/
    );

    assert.doesNotMatch(
      revival,
      /Cing iu cần hồi sinh!/
    );
  }
);

test(
  "Block Puzzle customer surface is free start and V5 revive oriented",
  () => {
    assert.match(
      block,
      /Bắt đầu miễn phí/
    );

    assert.doesNotMatch(
      block,
      /Bắt đầu · 1 lượt/
    );

    assert.match(
      block,
      /\[1, 2, 4, 8, 16\]/
    );

    assert.match(
      block,
      /Revive Credit/
    );

    assert.doesNotMatch(
      block,
      /\/ 3 mạng/
    );
  }
);
