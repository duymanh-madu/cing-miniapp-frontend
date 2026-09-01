import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

import {
  projectMutableTerrainV1,
} from "../domain/cingArtilleryMutableTerrainProjectionV1.js";

import {
  rasterizeMutableTerrainV1,
} from "../presentation/cingArtilleryTerrainRasterV1.js";

const MAP =
  "public/game-assets/cing-piu-piu/maps/phat-tich-mountain/v1/map.svg";

const BACKGROUND =
  "public/game-assets/cing-piu-piu/maps/phat-tich-mountain/v1/map-background.svg";

const SCENE =
  "src/games/cing-artillery/scenes/BattleScene.js";

const ASSETS =
  "src/games/cing-artillery/runtime/cingArtilleryMapAssets.js";

function projected(
  overrides = {}
) {
  return projectMutableTerrainV1({
    combat_state_id:
      "combat",
    match_runtime_id:
      "runtime",
    match_id:
      "match",
    map_id:
      "map",
    width_px:
      8,
    height_px:
      4,
    terrain_revision:
      "2",
    collision_mask_hex:
      "0018ff00",
    ...overrides,
  });
}

test(
  "canonical Phat Tich SVG remains byte-for-byte frozen",
  () => {
    const digest =
      crypto
        .createHash(
          "sha256"
        )
        .update(
          fs.readFileSync(
            MAP
          )
        )
        .digest(
          "hex"
        );

    assert.equal(
      digest,
      "30f520c0ca3203b6a13ca690624ea7d380057f87b6053fdb945f1cfb5b4f558c"
    );
  }
);

test(
  "static background keeps Phat Tich identity and excludes mutable terrain",
  () => {
    const source =
      fs.readFileSync(
        BACKGROUND,
        "utf8"
      );

    assert.match(
      source,
      /id="phat-tich-grand-buddha"/u
    );

    assert.match(
      source,
      /id="phat-tich-temple-silhouette"/u
    );

    assert.match(
      source,
      /id="mist"/u
    );

    assert.doesNotMatch(
      source,
      /id="canonical-gameplay-terrain"/u
    );

    assert.doesNotMatch(
      source,
      /VISUAL GRASS EDGE|ROCK STRATA|FOREGROUND PINES \/ ROCK DETAILS/u
    );
  }
);

test(
  "terrain raster alpha follows authoritative mask exactly",
  () => {
    const terrain =
      projected();

    const pixels =
      rasterizeMutableTerrainV1(
        terrain
      );

    assert.equal(
      pixels.length,
      8 * 4 * 4
    );

    for (
      let y = 0;
      y < 4;
      y += 1
    ) {
      for (
        let x = 0;
        x < 8;
        x += 1
      ) {
        const byte =
          Number.parseInt(
            terrain
              .collision_mask_hex
              .slice(
                y * 2,
                y * 2 + 2
              ),
            16
          );

        const expected =
          (
            (
              byte >>
              (7 - x)
            ) &
            1
          ) === 1
            ? 255
            : 0;

        const alpha =
          pixels[
            (
              y * 8 +
              x
            ) *
              4 +
            3
          ];

        assert.equal(
          alpha,
          expected,
          `alpha mismatch x=${x} y=${y}`
        );
      }
    }
  }
);

test(
  "terrain shading cannot create occupancy absent from authority",
  () => {
    const terrain =
      projected({
        collision_mask_hex:
          "00000080",
      });

    const pixels =
      rasterizeMutableTerrainV1(
        terrain
      );

    let opaque = 0;

    for (
      let i = 3;
      i < pixels.length;
      i += 4
    ) {
      if (
        pixels[i] !== 0
      ) {
        opaque += 1;
      }
    }

    assert.equal(
      opaque,
      1
    );
  }
);

test(
  "BattleScene reconciles persistent terrain by authoritative revision",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    assert.match(
      source,
      /applyAuthoritativeTerrain\(\s*snapshot\.terrain\s*\)/u
    );

    assert.match(
      source,
      /terrain\.terrain_revision\s*===\s*this\.lastTerrainRevision/u
    );

    assert.match(
      source,
      /this\.lastTerrainRevision\s*=\s*terrain\.terrain_revision/u
    );

    assert.match(
      source,
      /collision_format\s*!==\s*"bitmask_v1"/u
    );
  }
);

test(
  "persistent terrain owns no impact-derived crater authority",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    const start =
      source.indexOf(
        "    applyAuthoritativeTerrain("
      );

    const end =
      source.indexOf(
        "    createPlayerMarker(",
        start
      );

    assert.ok(
      start >= 0
    );

    assert.ok(
      end > start
    );

    const block =
      source.slice(
        start,
        end
      );

    for (const token of [
      "impactX",
      "impactY",
      "impact_x",
      "impact_y",
      "crater",
      "trajectory",
      "damage",
      "physics",
    ]) {
      assert.doesNotMatch(
        block,
        new RegExp(
          token,
          "iu"
        )
      );
    }
  }
);

test(
  "current snapshot reconstructs terrain without historical shot replay",
  () => {
    const source =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    const start =
      source.lastIndexOf(
        "    applySnapshot("
      );

    assert.ok(
      start >= 0
    );

    const block =
      source.slice(
        start,
        start + 4200
      );

    assert.match(
      block,
      /applyAuthoritativeTerrain\(\s*snapshot\.terrain\s*\)/u
    );

    assert.doesNotMatch(
      block,
      /result_sequence|trajectory_presentation|presentCanonicalShot/u
    );
  }
);

test(
  "BattleScene renders dedicated static background behind mutable terrain",
  () => {
    const assets =
      fs.readFileSync(
        ASSETS,
        "utf8"
      );

    const scene =
      fs.readFileSync(
        SCENE,
        "utf8"
      );

    assert.match(
      assets,
      /backgroundRenderAsset/u
    );

    assert.match(
      scene,
      /cing-piu-piu-map-background/u
    );

    assert.doesNotMatch(
      scene,
      /this\.load\.svg\(\s*"cing-piu-piu-map"\s*,\s*mapAsset\.renderAsset/su
    );
  }
);
