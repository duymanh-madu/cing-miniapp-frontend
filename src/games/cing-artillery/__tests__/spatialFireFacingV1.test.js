import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveViewerPlayerV1,
} from "../presentation/cingArtilleryFiringPresentationV1.js";

function snapshot({
  viewer,
  oneX,
  twoX,
}) {
  return {
    viewer: {
      account_id:
        viewer,
    },

    players: {
      player_one: {
        account_id:
          "player-one",

        position_x:
          oneX,

        position_y:
          300,
      },

      player_two: {
        account_id:
          "player-two",

        position_x:
          twoX,

        position_y:
          300,
      },
    },
  };
}

test(
  "player one fires right when opponent is spatially right",
  () => {
    const result =
      resolveViewerPlayerV1(
        snapshot({
          viewer:
            "player-one",
          oneX:
            220,
          twoX:
            740,
        })
      );

    assert.equal(
      result?.facing,
      1
    );
  }
);

test(
  "player one fires left when opponent is spatially left",
  () => {
    const result =
      resolveViewerPlayerV1(
        snapshot({
          viewer:
            "player-one",
          oneX:
            740,
          twoX:
            220,
        })
      );

    assert.equal(
      result?.facing,
      -1
    );
  }
);

test(
  "player two fires right when opponent is spatially right",
  () => {
    const result =
      resolveViewerPlayerV1(
        snapshot({
          viewer:
            "player-two",
          oneX:
            740,
          twoX:
            220,
        })
      );

    assert.equal(
      result?.facing,
      1
    );
  }
);

test(
  "player two fires left when opponent is spatially left",
  () => {
    const result =
      resolveViewerPlayerV1(
        snapshot({
          viewer:
            "player-two",
          oneX:
            220,
          twoX:
            740,
        })
      );

    assert.equal(
      result?.facing,
      -1
    );
  }
);

test(
  "spatial fire facing fails closed for equal X",
  () => {
    const result =
      resolveViewerPlayerV1(
        snapshot({
          viewer:
            "player-one",
          oneX:
            480,
          twoX:
            480,
        })
      );

    assert.equal(
      result,
      null
    );
  }
);

test(
  "spatial fire facing fails closed for unknown viewer",
  () => {
    const result =
      resolveViewerPlayerV1(
        snapshot({
          viewer:
            "not-a-participant",
          oneX:
            220,
          twoX:
            740,
        })
      );

    assert.equal(
      result,
      null
    );
  }
);
