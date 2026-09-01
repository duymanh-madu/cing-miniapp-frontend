import assert from "node:assert/strict";
import test from "node:test";

import {
  projectMutableTerrainV1,
  terrainBitAtV1,
} from "../domain/cingArtilleryMutableTerrainProjectionV1.js";

function terrain(
  overrides = {}
) {
  return {
    combat_state_id:
      "combat-state",
    match_runtime_id:
      "runtime",
    match_id:
      "match",
    map_id:
      "map",
    width_px:
      10,
    height_px:
      2,
    terrain_revision:
      "7",

    /*
     * width 10 => two bytes per row.
     *
     * row 0:
     * 10100000 11000000
     *
     * row 1:
     * 01000000 10000000
     *
     * Only the two MSB bits of each
     * final byte belong to terrain.
     */
    collision_mask_hex:
      "a0c04080",

    ...overrides,
  };
}

test(
  "projects exact authoritative mutable terrain snapshot",
  () => {
    const projected =
      projectMutableTerrainV1(
        terrain()
      );

    assert.equal(
      projected.width_px,
      10
    );

    assert.equal(
      projected.height_px,
      2
    );

    assert.equal(
      projected.row_bytes,
      2
    );

    assert.equal(
      projected.terrain_revision,
      "7"
    );

    assert.equal(
      projected.collision_mask_hex,
      "a0c04080"
    );

    assert.deepEqual(
      Array.from(
        projected.collision_mask
      ),
      [
        0xa0,
        0xc0,
        0x40,
        0x80,
      ]
    );

    assert.ok(
      Object.isFrozen(
        projected
      )
    );

    assert.ok(
      Object.isFrozen(
        projected.collision_mask
      )
    );

    assert.throws(
      () => {
        projected
          .collision_mask[0] =
          0;
      },
      TypeError
    );
  }
);

test(
  "decodes canonical terrain MSB first",
  () => {
    const projected =
      projectMutableTerrainV1(
        terrain()
      );

    assert.equal(
      terrainBitAtV1(
        projected,
        0,
        0
      ),
      true
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        1,
        0
      ),
      false
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        2,
        0
      ),
      true
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        8,
        0
      ),
      true
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        9,
        0
      ),
      true
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        0,
        1
      ),
      false
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        1,
        1
      ),
      true
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        8,
        1
      ),
      true
    );

    assert.equal(
      terrainBitAtV1(
        projected,
        9,
        1
      ),
      false
    );
  }
);

test(
  "out of world terrain reads are empty",
  () => {
    const projected =
      projectMutableTerrainV1(
        terrain()
      );

    for (const [x, y] of [
      [-1, 0],
      [0, -1],
      [10, 0],
      [0, 2],
    ]) {
      assert.equal(
        terrainBitAtV1(
          projected,
          x,
          y
        ),
        false
      );
    }
  }
);

test(
  "revision must remain an exact canonical integer string",
  () => {
    for (const value of [
      7,
      "",
      "01",
      "-1",
      "+1",
      "1.0",
      " 1",
      "1 ",
    ]) {
      assert.throws(
        () =>
          projectMutableTerrainV1(
            terrain({
              terrain_revision:
                value,
            })
          ),
        /MUTABLE_TERRAIN_PROJECTION_INVALID_V1:terrain_revision/u
      );
    }
  }
);

test(
  "dimensions must be positive safe integers",
  () => {
    for (const [
      field,
      value,
    ] of [
      ["width_px", 0],
      ["width_px", -1],
      ["width_px", 1.5],
      [
        "width_px",
        Number.MAX_SAFE_INTEGER +
          1,
      ],
      ["height_px", 0],
      ["height_px", -1],
      ["height_px", 1.5],
    ]) {
      assert.throws(
        () =>
          projectMutableTerrainV1(
            terrain({
              [field]:
                value,
            })
          ),
        new RegExp(
          `MUTABLE_TERRAIN_PROJECTION_INVALID_V1:${field}`,
          "u"
        )
      );
    }
  }
);

test(
  "mask must be canonical lowercase exact-length hex",
  () => {
    for (const value of [
      "",
      "a0c040",
      "a0c0408000",
      "A0C04080",
      "zzc04080",
      "a0c0408",
    ]) {
      assert.throws(
        () =>
          projectMutableTerrainV1(
            terrain({
              collision_mask_hex:
                value,
            })
          ),
        /MUTABLE_TERRAIN_PROJECTION_INVALID_V1:collision_mask_hex/u
      );
    }
  }
);

test(
  "non-byte-aligned rows reject nonzero low padding bits",
  () => {
    assert.throws(
      () =>
        projectMutableTerrainV1(
          terrain({
            collision_mask_hex:
              "a0c14080",
          })
        ),
      /MUTABLE_TERRAIN_PROJECTION_INVALID_V1:collision_mask_hex\.padding/u
    );

    assert.throws(
      () =>
        projectMutableTerrainV1(
          terrain({
            collision_mask_hex:
              "a0c04081",
          })
        ),
      /MUTABLE_TERRAIN_PROJECTION_INVALID_V1:collision_mask_hex\.padding/u
    );
  }
);

test(
  "projection owns no crater or gameplay mutation authority",
  () => {
    const source =
      projectMutableTerrainV1
        .toString() +
      terrainBitAtV1
        .toString();

    for (const token of [
      "impact_x",
      "impact_y",
      "crater",
      "damage",
      "physics",
      "trajectory",
    ]) {
      assert.doesNotMatch(
        source,
        new RegExp(
          token,
          "iu"
        )
      );
    }
  }
);
