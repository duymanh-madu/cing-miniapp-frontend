import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const runtime =
  fs.readFileSync(
    new URL(
      "../audio/blockPuzzleAudioRuntime.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Block Puzzle audio uses WebAudio rather than HTML Audio",
  () => {
    assert.match(
      runtime,
      /AudioContext/
    );

    assert.doesNotMatch(
      runtime,
      /new\s+Audio\s*\(/
    );
  }
);

test(
  "Cing sonic runtime does not depend on external audio files",
  () => {
    assert.doesNotMatch(
      runtime,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      runtime,
      /\.(mp3|wav|ogg|m4a|aac)/i
    );
  }
);

test(
  "audio runtime has Cing-specific deterministic timbre seed",
  () => {
    assert.match(
      runtime,
      /0x43494e47/
    );

    assert.match(
      runtime,
      /createCingNoiseBuffer/
    );
  }
);

test(
  "audio runtime exposes reactive gameplay presentation hooks",
  () => {
    assert.match(
      runtime,
      /playPlacement/
    );

    assert.match(
      runtime,
      /playLineClear/
    );

    assert.match(
      runtime,
      /playCombo/
    );

    assert.match(
      runtime,
      /playMoveEvent/
    );

    assert.match(
      runtime,
      /startMusic/
    );

    assert.match(
      runtime,
      /suspend/
    );

    assert.match(
      runtime,
      /resume/
    );
  }
);
