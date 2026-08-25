import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

import crypto
  from "node:crypto";

const MAP =
  "public/game-assets/cing-piu-piu/maps/phat-tich-mountain/v1/map.svg";

const source =
  fs.readFileSync(
    MAP,
    "utf8"
  );

test(
  "Phat Tich visual carries the canonical summit Buddha landmark",
  () => {
    assert.match(
      source,
      /id="phat-tich-grand-buddha"/u
    );

    assert.match(
      source,
      /id="phat-tich-temple-silhouette"/u
    );
  }
);

test(
  "commercial Phat Tich map remains exact 960x540 logical world",
  () => {
    assert.match(
      source,
      /viewBox="0 0 960 540"/u
    );

    assert.match(
      source,
      /width="960"/u
    );

    assert.match(
      source,
      /height="540"/u
    );
  }
);

test(
  "Phat Tich art includes multi-depth mountain forest and atmosphere",
  () => {
    assert.match(
      source,
      /farMountain/u
    );

    assert.match(
      source,
      /midMountain/u
    );

    assert.match(
      source,
      /id="softGlow"/u
    );

    assert.match(
      source,
      /id="mist"/u
    );
  }
);

test(
  "canonical gameplay terrain geometry is unchanged by visual art pass",
  () => {
    const match =
      source.match(
        /id="canonical-gameplay-terrain"\s+points="([^"]+)"/su
      );

    assert.ok(
      match
    );

    const digest =
      crypto
        .createHash(
          "sha256"
        )
        .update(
          match[1]
        )
        .digest(
          "hex"
        );

    assert.equal(
      digest,
      "1c6979ee5f01d3a15933fecec6c753d2bef413f75442ee82b82eac421f039bfd"
    );
  }
);

test(
  "map art owns no gameplay or transport authority",
  () => {
    assert.doesNotMatch(
      source,
      /shot-command|damage|winner|loser|socket|fetch|axios/iu
    );
  }
);
