import assert from "node:assert/strict";
import test from "node:test";

import {
  CANNON_ART_REQUIREMENTS_V1,
  CANNON_CANVAS_V1,
  CANNON_CONTRACT_VERSION_V1,
  CANNON_COSMETIC_CHANNELS_V1,
  CANNON_GAMEPLAY_BOUNDARY_V1,
  CANNON_KEY_V1,
  CANNON_PRESENTATION_GEOMETRY_V1,
} from "../runtime/cingArtilleryCanonicalCannonV1.js";

test(
  "canonical cannon identity is explicit and frozen",
  () => {
    assert.equal(
      CANNON_CONTRACT_VERSION_V1,
      "cing-artillery-canonical-cannon-v1"
    );

    assert.equal(
      CANNON_KEY_V1,
      "cing-standard-cannon-v1"
    );

    assert.deepEqual(
      CANNON_CANVAS_V1,
      {
        widthPx: 384,
        heightPx: 384,
      }
    );
  }
);

test(
  "canonical cannon owns stable presentation geometry",
  () => {
    assert.equal(
      CANNON_PRESENTATION_GEOMETRY_V1
        .nominalWidthPx,
      236
    );

    assert.equal(
      CANNON_PRESENTATION_GEOMETRY_V1
        .nominalHeightPx,
      174
    );

    assert.deepEqual(
      CANNON_PRESENTATION_GEOMETRY_V1
        .groundAnchor,
      {
        x: 0.5,
        y: 0.88,
      }
    );

    for (const point of [
      "rotationPivot",
      "muzzleOrigin",
      "projectileSpawn",
      "aftermathOrigin",
    ]) {
      const value =
        CANNON_PRESENTATION_GEOMETRY_V1[
          point
        ];

      assert.equal(
        value.x >= 0 &&
          value.x <= 1,
        true
      );

      assert.equal(
        value.y >= 0 &&
          value.y <= 1,
        true
      );
    }
  }
);

test(
  "canonical cannon supports modular cosmetic composition",
  () => {
    assert.deepEqual(
      CANNON_COSMETIC_CHANNELS_V1.dye,
      [
        "primary",
        "secondary",
      ]
    );

    assert.deepEqual(
      CANNON_COSMETIC_CHANNELS_V1.gems,
      [
        "muzzle",
        "body_left",
        "body_right",
      ]
    );

    assert.deepEqual(
      CANNON_COSMETIC_CHANNELS_V1.ornaments,
      [
        "top",
        "side_left",
        "side_right",
      ]
    );

    assert.deepEqual(
      CANNON_COSMETIC_CHANNELS_V1.vfx,
      [
        "muzzle",
        "projectile",
        "trail",
        "impact",
        "aftermath",
      ]
    );
  }
);

test(
  "production cannon explicitly rejects baked presentation contamination",
  () => {
    for (const requirement of [
      "clean-rgba-alpha",
      "no-background",
      "no-baked-ground-platform",
      "no-baked-character",
      "no-baked-projectile",
      "no-baked-impact-vfx",
    ]) {
      assert.equal(
        CANNON_ART_REQUIREMENTS_V1.includes(
          requirement
        ),
        true
      );
    }
  }
);

test(
  "canonical cannon is presentation-only and cannot change gameplay",
  () => {
    assert.deepEqual(
      CANNON_GAMEPLAY_BOUNDARY_V1,
      {
        presentationOnly: true,
        changesDamage: false,
        changesTrajectory: false,
        changesHitbox: false,
        changesPower: false,
        changesWind: false,
        changesCrater: false,
        changesCooldown: false,
        changesRankOutcome: false,
      }
    );
  }
);

test(
  "canonical cannon source contains no player-slot identity mapping",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const source =
      fs.readFileSync(
        new URL(
          "../runtime/cingArtilleryCanonicalCannonV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "player_one",
      "player_two",
      "participant_slot",
      "male",
      "female",
    ]) {
      assert.equal(
        source.includes(
          forbidden
        ),
        false,
        `forbidden identity coupling: ${forbidden}`
      );
    }
  }
);

test(
  "canonical cannon agrees with frozen artwork package contract",
  async () => {
    const manifest =
      await import(
        "../runtime/cingArtilleryCharacterArtworkManifestV1.js"
      );

    const spec =
      await import(
        "../runtime/cingArtilleryCharacterArtworkSpecV1.js"
      );

    assert.equal(
      manifest
        .CANONICAL_WEAPON_ARTWORK_V1
        .key,
      CANNON_KEY_V1
    );

    assert.equal(
      manifest
        .CANONICAL_WEAPON_ARTWORK_V1
        .shared,
      true
    );

    assert.equal(
      spec
        .CANONICAL_WEAPON_ART_V1
        .key,
      CANNON_KEY_V1
    );

    assert.equal(
      spec
        .CANONICAL_WEAPON_ART_V1
        .sharedAcrossGenders,
      true
    );

    assert.deepEqual(
      CANNON_CANVAS_V1,
      spec
        .CHARACTER_ARTWORK_CANVAS_V1
        && {
          widthPx:
            spec
              .CHARACTER_ARTWORK_CANVAS_V1
              .widthPx,

          heightPx:
            spec
              .CHARACTER_ARTWORK_CANVAS_V1
              .heightPx,
        }
    );
  }
);
