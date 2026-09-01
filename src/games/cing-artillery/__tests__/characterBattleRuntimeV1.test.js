import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const sceneSource =
  fs.readFileSync(
    new URL(
      "../scenes/BattleScene.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "BattleScene imports commercial character renderer",
  () => {
    assert.match(
      sceneSource,
      /createCharacterRendererV1/u
    );
  }
);

test(
  "renderer binds frozen player character identity",
  () => {
    assert.match(
      sceneSource,
      /identity:\s*playerOneCharacter/u
    );

    assert.match(
      sceneSource,
      /identity:\s*playerTwoCharacter/u
    );
  }
);

test(
  "renderer preserves authoritative player container",
  () => {
    assert.match(
      sceneSource,
      /container:\s*this\.playerOneMarker\.container/u
    );

    assert.match(
      sceneSource,
      /container:\s*this\.playerTwoMarker\.container/u
    );
  }
);

test(
  "renderer activation is asset-gated to avoid missing texture runtime",
  () => {
    assert.match(
      sceneSource,
      /this\.textures\.exists/u
    );

    assert.match(
      sceneSource,
      /cing-piu-piu-character-male-idle-v1/u
    );

    assert.match(
      sceneSource,
      /cing-piu-piu-character-female-idle-v1/u
    );
  }
);

test(
  "renderer consumes presentation controller state and activity",
  () => {
    assert.match(
      sceneSource,
      /playerOneCharacterController[\s\S]*getState\(\)/u
    );

    assert.match(
      sceneSource,
      /playerTwoCharacterController[\s\S]*getState\(\)/u
    );

    assert.match(
      sceneSource,
      /playerOneCharacterController[\s\S]*isActive\(\)/u
    );

    assert.match(
      sceneSource,
      /playerTwoCharacterController[\s\S]*isActive\(\)/u
    );
  }
);

test(
  "BattleScene character renderer integration owns no gameplay result authority",
  () => {
    const start =
      sceneSource.indexOf(
        "if (\n        !this.playerOneCharacterRenderer"
      );

    const end =
      sceneSource.indexOf(
        "this.playerOneHp.setText",
        start
      );

    assert.equal(
      start >= 0,
      true,
      "character renderer integration start must exist"
    );

    assert.equal(
      end > start,
      true,
      "character renderer integration end must exist"
    );

    const relevant =
      sceneSource.slice(
        start,
        end
      );

    for (const forbidden of [
      "damage =",
      "trajectory =",
      "winner =",
      "crater =",
      "hitbox =",
      "onFireIntent",
      "presentCanonical",
    ]) {
      assert.equal(
        relevant.includes(
          forbidden
        ),
        false,
        `renderer integration owns forbidden authority: ${forbidden}`
      );
    }

    assert.match(
      relevant,
      /createCharacterRendererV1/u
    );

    assert.match(
      relevant,
      /\.setState\(/u
    );

    assert.match(
      relevant,
      /\.setActive\(/u
    );
  }
);
