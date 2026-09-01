import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_WEAPON_ART_V1,
  CHARACTER_ART_DIRECTION_V1,
  CHARACTER_ARTWORK_CANVAS_V1,
  CHARACTER_ARTWORK_DISPLAY_V1,
  CHARACTER_ARTWORK_LAYERS_V1,
  CHARACTER_ARTWORK_SPEC_VERSION_V1,
  CHARACTER_ARTWORK_STATES_V1,
} from "../runtime/cingArtilleryCharacterArtworkSpecV1.js";

test(
  "artwork specification is explicitly versioned",
  () => {
    assert.equal(
      CHARACTER_ARTWORK_SPEC_VERSION_V1,
      "cing-artillery-character-artwork-spec-v1"
    );
  }
);

test(
  "all seven commercial animation states have production budgets",
  () => {
    assert.deepEqual(
      Object.keys(
        CHARACTER_ARTWORK_STATES_V1
      ),
      [
        "idle",
        "aim",
        "shoot",
        "hit",
        "fall",
        "victory",
        "defeat",
      ]
    );

    for (
      const state
      of Object.values(
        CHARACTER_ARTWORK_STATES_V1
      )
    ) {
      assert.equal(
        Number.isInteger(
          state.fps
        ),
        true
      );

      assert.equal(
        Number.isInteger(
          state.frameBudget
        ),
        true
      );

      assert.equal(
        state.fps > 0,
        true
      );

      assert.equal(
        state.frameBudget >= 8,
        true
      );
    }
  }
);

test(
  "male and female share one canonical weapon",
  () => {
    assert.equal(
      CANONICAL_WEAPON_ART_V1.key,
      "cing-standard-cannon-v1"
    );

    assert.equal(
      CANONICAL_WEAPON_ART_V1
        .sharedAcrossGenders,
      true
    );

    assert.equal(
      CANONICAL_WEAPON_ART_V1
        .gameplayStatsVariant,
      false
    );
  }
);

test(
  "canonical weapon exposes presentation-only cosmetic channels",
  () => {
    assert.deepEqual(
      CANONICAL_WEAPON_ART_V1
        .cosmeticChannels,
      [
        "dye_primary",
        "dye_secondary",
        "material",
        "gem_socket_muzzle",
        "gem_socket_body",
        "ornament",
        "emissive",
        "muzzle_vfx",
        "projectile_vfx",
        "trail_vfx",
        "impact_vfx",
        "aftermath_vfx",
      ]
    );
  }
);

test(
  "artwork canvas owns stable ground anchor",
  () => {
    assert.deepEqual(
      CHARACTER_ARTWORK_CANVAS_V1,
      {
        widthPx: 384,
        heightPx: 384,
        groundAnchorX: 0.5,
        groundAnchorY: 0.88,
      }
    );
  }
);

test(
  "character remains readable in canonical 960x540 battle world",
  () => {
    assert.equal(
      CHARACTER_ARTWORK_DISPLAY_V1
        .nominalHeightPx,
      92
    );

    assert.equal(
      CHARACTER_ARTWORK_DISPLAY_V1
        .minReadableHeightPx >= 72,
      true
    );

    assert.equal(
      CHARACTER_ART_DIRECTION_V1
        .proportions
        .readableAtLogicalWorld,
      "960x540"
    );
  }
);

test(
  "production layer contract supports character and cosmetic separation",
  () => {
    assert.deepEqual(
      CHARACTER_ARTWORK_LAYERS_V1,
      [
        "rear_fx",
        "rear_accessory",
        "body",
        "head",
        "hair_rear",
        "hair_front",
        "face",
        "front_accessory",
        "weapon",
        "weapon_emissive",
        "front_fx",
      ]
    );

    assert.equal(
      Object.isFrozen(
        CHARACTER_ARTWORK_LAYERS_V1
      ),
      true
    );
  }
);

test(
  "art direction forbids placeholder and mascot substitution",
  () => {
    const requirements =
      CHARACTER_ART_DIRECTION_V1
        .requirements;

    assert.equal(
      requirements.includes(
        "human-not-mascot"
      ),
      true
    );

    assert.equal(
      requirements.includes(
        "no-placeholder-art"
      ),
      true
    );

    assert.equal(
      requirements.includes(
        "shared-canonical-weapon"
      ),
      true
    );
  }
);

test(
  "art specification contains no gameplay authority",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const source =
      fs.readFileSync(
        new URL(
          "../runtime/cingArtilleryCharacterArtworkSpecV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "damage",
      "current_hp",
      "hitbox",
      "trajectory",
      "wind",
      "power",
      "terrain_revision",
      "crater_radius",
      "winner_account",
    ]) {
      assert.equal(
        source.includes(
          forbidden
        ),
        false,
        `forbidden gameplay authority: ${forbidden}`
      );
    }
  }
);
