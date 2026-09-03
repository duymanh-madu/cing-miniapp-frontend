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

const engine =
  read(
    "src/games/cing-artillery/engine/createPremiumArtilleryGame.js"
  );

const config =
  read(
    "src/games/cing-artillery/engine/premiumArtilleryConfig.js"
  );


test(
  "Rotated Surface V1 preserves canonical 16:9 render authority",
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
  "portrait Zalo host uses rotated landscape presentation",
  () => {
    assert.match(
      game,
      /cing-piu-piu--rotated-landscape/u
    );

    assert.match(
      game,
      /cing-piu-piu--native-landscape/u
    );

    assert.match(
      css,
      /rotate\(90deg\)/u
    );

    assert.match(
      css,
      /--app-height/u
    );

    assert.match(
      css,
      /--app-width/u
    );
  }
);


test(
  "portrait orientation gate cannot block gameplay",
  () => {
    assert.doesNotMatch(
      game,
      /cing-piu-piu__orientation-gate/u
    );

    assert.doesNotMatch(
      game,
      /Xoay ngang để chiến đấu/u
    );

    assert.doesNotMatch(
      game,
      /Thử chuyển sang ngang/u
    );
  }
);


test(
  "rotated surface inverse maps pointer input",
  () => {
    assert.match(
      engine,
      /installCingPiuPiuRotatedPointerAdapter/u
    );

    assert.match(
      engine,
      /transformPointer/u
    );

    assert.match(
      engine,
      /canonicalX\s*=\s*physicalY/u
    );

    assert.match(
      engine,
      /canonicalY\s*=\s*1\s*-\s*physicalX/u
    );

    assert.match(
      engine,
      /originalTransformPointer\.call/u
    );
  }
);


test(
  "rotated presentation owns no gameplay authority",
  () => {
    assert.doesNotMatch(
      engine,
      /damage|current_hp|winner|trajectory/u
    );

    assert.doesNotMatch(
      landscape,
      /shot-command|angleDeg|power|damage|current_hp/u
    );

    assert.match(
      game,
      /handleBattleFireIntent/u
    );
  }
);


test(
  "undocumented Zalo autorotate bridge remains unused",
  () => {
    assert.doesNotMatch(
      landscape,
      /CHANGE_AUTOROTATE|ZaloJSBridge|jsBridge|OrientationType/u
    );

    assert.doesNotMatch(
      engine,
      /CHANGE_AUTOROTATE|ZaloJSBridge|OrientationType/u
    );
  }
);
