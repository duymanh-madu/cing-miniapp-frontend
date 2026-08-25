import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

const read =
  path =>
    fs.readFileSync(
      path,
      "utf8"
    );

const game =
  read(
    "src/games/cing-artillery/CingArtilleryGame.jsx"
  );

const css =
  read(
    "src/games/cing-artillery/CingArtilleryGame.css"
  );

const landscape =
  read(
    "src/games/cing-artillery/runtime/cingArtilleryLandscapeMode.js"
  );

const config =
  read(
    "src/games/cing-artillery/engine/premiumArtilleryConfig.js"
  );


test(
  "5J4A preserves canonical 16:9 render authority",
  () => {
    assert.match(
      config,
      /width:\s*1920/u
    );

    assert.match(
      config,
      /height:\s*1080/u
    );
  }
);


test(
  "battle shell consumes live mobile viewport instead of portrait card layout",
  () => {
    assert.match(
      css,
      /--app-width/u
    );

    assert.match(
      css,
      /--app-height/u
    );

    assert.match(
      css,
      /\.cing-piu-piu--battle[\s\S]*?height:[\s\S]*?--app-height/u
    );

    assert.match(
      css,
      /\.cing-piu-piu__battle-stage[\s\S]*?position:\s*absolute[\s\S]*?inset:\s*0/u
    );
  }
);


test(
  "landscape mode uses real viewport orientation with progressive lock",
  () => {
    assert.match(
      landscape,
      /visualViewport/u
    );

    assert.match(
      landscape,
      /screen\.orientation[\s\S]*?\.lock/u
    );

    assert.match(
      landscape,
      /\.lock\(\s*"landscape"\s*\)/u
    );

    assert.match(
      landscape,
      /requestFullscreen/u
    );
  }
);


test(
  "portrait fallback asks for physical rotation instead of CSS rotating gameplay",
  () => {
    assert.match(
      game,
      /cing-piu-piu__orientation-gate/u
    );

    assert.match(
      game,
      /Xoay ngang để chiến đấu/u
    );

    assert.match(
      game,
      /requestCingArtilleryLandscapeMode/u
    );

    assert.doesNotMatch(
      landscape,
      /rotate\s*\(/u
    );
  }
);


test(
  "5J4A remains presentation-only and cannot own shot gameplay",
  () => {
    assert.doesNotMatch(
      landscape,
      /shot-command|angleDeg|power|damage|current_hp/u
    );

    assert.doesNotMatch(
      game,
      /emitShot|submitShot|sendShot/u
    );
  }
);
