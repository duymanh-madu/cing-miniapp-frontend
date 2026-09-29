import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../../../features/game-center/components/CingOfflineRevivalGameV2.jsx",
      import.meta.url
    ),
    "utf8"
  );


const gameCenterPageSource =
  fs.readFileSync(
    new URL(
      "../../../features/game-center/pages/GameCenterPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "final result prioritizes continuous play",
  () => {
    assert.match(
      source,
      /Chơi ván mới/
    );

    assert.match(
      source,
      /Bảng xếp hạng/
    );

    assert.match(
      source,
      /playAnotherRound/
    );
  }
);

test(
  "new round remounts child gameplay",
  () => {
    assert.match(
      source,
      /const \[roundKey, setRoundKey\]/
    );

    assert.match(
      source,
      /key=\{`\$\{gameKey\}:\$\{roundKey\}`\}/
    );

    assert.match(
      source,
      /setRoundKey\(\s*current => current \+ 1\s*\)/
    );
  }
);

test(
  "play again resets only local finalized runtime authority",
  () => {
    const a =
      source.indexOf(
        "const playAnotherRound"
      );

    const b =
      source.indexOf(
        "const nextCost",
        a
      );

    assert.ok(a >= 0);
    assert.ok(b > a);

    const region =
      source.slice(a, b);

    assert.match(
      region,
      /sessionRef\.current = null/
    );

    assert.match(
      region,
      /coordinatorRef\.current = null/
    );

    assert.doesNotMatch(
      region,
      /purchaseOfflineRevival/
    );

    assert.doesNotMatch(
      region,
      /finalizeOfflineRevivalSession/
    );
  }
);

test(
  "result card exposes only score and combo summary",
  () => {
    assert.match(
      source,
      /finalResult\?\.score/
    );

    assert.match(
      source,
      /finalResult\?\.bestCombo/
    );

    assert.doesNotMatch(
      source,
      /finalResult\?\.revivesUsed/
    );

    assert.doesNotMatch(
      source,
      /"HỒI SINH"/
    );

    assert.match(
      source,
      /repeat\(2,minmax\(0,1fr\)\)/
    );
  }
);

test(
  "legacy forced Game Center result button is removed",
  () => {
    assert.doesNotMatch(
      source,
      /Đã lưu kết quả · Về Game Center/
    );
  }
);


test(
  "leaderboard action closes gameplay before opening board",
  () => {
    assert.match(
      gameCenterPageSource,
      /const gameKey\s*=\s*activeGame/
    );

    assert.match(
      gameCenterPageSource,
      /setActiveGame\(null\);[\s\S]*setShowBoard\(gameKey\);/
    );
  }
);

test(
  "Game Center action clears leaderboard state before lobby",
  () => {
    assert.match(
      gameCenterPageSource,
      /setShowBoard\(null\);[\s\S]*setActiveGame\(null\);/
    );
  }
);
