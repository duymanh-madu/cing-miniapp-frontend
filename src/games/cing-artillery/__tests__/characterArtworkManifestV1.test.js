import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_WEAPON_ARTWORK_V1,
  CHARACTER_ARTWORK_CANVAS_V1,
  CHARACTER_ARTWORK_GENDERS_V1,
  CHARACTER_ARTWORK_MANIFEST_V1,
  CHARACTER_ARTWORK_PACKAGE_VERSION_V1,
  CHARACTER_ARTWORK_ROOT_V1,
  CHARACTER_ARTWORK_STATES_V1,
} from "../runtime/cingArtilleryCharacterArtworkManifestV1.js";

test(
  "artwork package version is explicit",
  () => {
    assert.equal(
      CHARACTER_ARTWORK_PACKAGE_VERSION_V1,
      "cing-artillery-character-artwork-package-v1"
    );
  }
);

test(
  "package root is canonical and versioned",
  () => {
    assert.equal(
      CHARACTER_ARTWORK_ROOT_V1,
      "/game-assets/cing-piu-piu/characters/default/v1"
    );
  }
);

test(
  "manifest supports exactly male and female",
  () => {
    assert.deepEqual(
      CHARACTER_ARTWORK_GENDERS_V1,
      [
        "male",
        "female",
      ]
    );
  }
);

test(
  "manifest supports exactly seven commercial states",
  () => {
    assert.deepEqual(
      CHARACTER_ARTWORK_STATES_V1,
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
  }
);

test(
  "every gender state maps to transparent 384x384 webp plus atlas",
  () => {
    for (
      const gender
      of CHARACTER_ARTWORK_GENDERS_V1
    ) {
      for (
        const state
        of CHARACTER_ARTWORK_STATES_V1
      ) {
        const entry =
          CHARACTER_ARTWORK_MANIFEST_V1[
            gender
          ].states[
            state
          ];

        assert.equal(
          entry.gender,
          gender
        );

        assert.equal(
          entry.state,
          state
        );

        assert.equal(
          entry.widthPx,
          384
        );

        assert.equal(
          entry.heightPx,
          384
        );

        assert.equal(
          entry.transparent,
          true
        );

        assert.equal(
          entry.image,
          `/game-assets/cing-piu-piu/characters/default/v1/${gender}/${state}.webp`
        );

        assert.equal(
          entry.atlas,
          `/game-assets/cing-piu-piu/characters/default/v1/${gender}/${state}.json`
        );
      }
    }
  }
);

test(
  "canonical cannon is one shared production asset",
  () => {
    assert.equal(
      CANONICAL_WEAPON_ARTWORK_V1.key,
      "cing-standard-cannon-v1"
    );

    assert.equal(
      CANONICAL_WEAPON_ARTWORK_V1.shared,
      true
    );

    assert.match(
      CANONICAL_WEAPON_ARTWORK_V1
        .base.image,
      /cing-standard-cannon-v1\.webp$/u
    );
  }
);

test(
  "canonical cannon exposes dedicated cosmetic mask",
  () => {
    assert.match(
      CANONICAL_WEAPON_ARTWORK_V1
        .cosmeticMask.image,
      /cosmetic-mask\.webp$/u
    );

    assert.notEqual(
      CANONICAL_WEAPON_ARTWORK_V1
        .base.image,
      CANONICAL_WEAPON_ARTWORK_V1
        .cosmeticMask.image
    );
  }
);

test(
  "manifest canvas matches production artwork specification",
  () => {
    assert.deepEqual(
      CHARACTER_ARTWORK_CANVAS_V1,
      {
        widthPx: 384,
        heightPx: 384,
      }
    );
  }
);

test(
  "manifest contains no gameplay authority",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const source =
      fs.readFileSync(
        new URL(
          "../runtime/cingArtilleryCharacterArtworkManifestV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "damage",
      "hitbox",
      "trajectory",
      "current_hp",
      "wind",
      "power",
      "terrain_revision",
      "winner",
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
