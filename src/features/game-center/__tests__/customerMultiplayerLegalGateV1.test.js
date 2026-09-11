import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here =
  path.dirname(
    fileURLToPath(import.meta.url)
  );

const source =
  fs.readFileSync(
    path.resolve(
      here,
      "../pages/GameCenterPage.jsx"
    ),
    "utf8"
  );

test(
  "customer multiplayer fails closed",
  () => {
    assert.match(
      source,
      /customerMultiplayerEnabled[\s\S]*useState\(false\)/
    );
  }
);

test(
  "Game Center reads backend legal authority",
  () => {
    assert.match(
      source,
      /\.get\("\/app-config\/public"\)/
    );

    assert.match(
      source,
      /customer_multiplayer_enabled\s*===\s*true/
    );
  }
);

test(
  "Piu Piu requires multiplayer legal availability",
  () => {
    assert.match(
      source,
      /game\.id !== "cing-artillery"[\s\S]*customerMultiplayerEnabled[\s\S]*cingArtilleryVisible/
    );
  }
);

test(
  "Chess surface is behind multiplayer legal availability",
  () => {
    assert.match(
      source,
      /\{customerMultiplayerEnabled && \([\s\S]*Kỳ thủ cờ vua/
    );
  }
);

test(
  "offline game registry remains active",
  () => {
    assert.match(
      source,
      /getAllGames\(\)/
    );
  }
);
