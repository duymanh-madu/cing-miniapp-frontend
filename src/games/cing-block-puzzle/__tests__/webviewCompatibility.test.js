import test from "node:test";
import assert from "node:assert/strict";

import {
  cloneBlockPuzzleSerializableValue,
  createBlockPuzzleSecureUuidV4,
} from "../runtime/blockPuzzleWebviewCompatibility.js";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function withCrypto(
  cryptoValue,
  run
) {
  const descriptor =
    Object.getOwnPropertyDescriptor(
      globalThis,
      "crypto"
    );

  Object.defineProperty(
    globalThis,
    "crypto",
    {
      configurable: true,
      value: cryptoValue,
    }
  );

  try {
    return run();
  } finally {
    if (descriptor) {
      Object.defineProperty(
        globalThis,
        "crypto",
        descriptor
      );
    } else {
      delete globalThis.crypto;
    }
  }
}

function withStructuredClone(
  cloneValue,
  run
) {
  const descriptor =
    Object.getOwnPropertyDescriptor(
      globalThis,
      "structuredClone"
    );

  Object.defineProperty(
    globalThis,
    "structuredClone",
    {
      configurable: true,
      value: cloneValue,
    }
  );

  try {
    return run();
  } finally {
    if (descriptor) {
      Object.defineProperty(
        globalThis,
        "structuredClone",
        descriptor
      );
    } else {
      delete globalThis
        .structuredClone;
    }
  }
}

test(
  "UUID uses native randomUUID when available",
  () => {
    withCrypto(
      {
        randomUUID() {
          return "123e4567-e89b-42d3-a456-426614174000";
        },
      },
      () => {
        assert.equal(
          createBlockPuzzleSecureUuidV4(),
          "123e4567-e89b-42d3-a456-426614174000"
        );
      }
    );
  }
);

test(
  "UUID falls back to cryptographic getRandomValues",
  () => {
    withCrypto(
      {
        getRandomValues(bytes) {
          for (
            let i = 0;
            i < bytes.length;
            i += 1
          ) {
            bytes[i] = i;
          }

          return bytes;
        },
      },
      () => {
        const id =
          createBlockPuzzleSecureUuidV4();

        assert.match(
          id,
          UUID_V4
        );

        assert.equal(
          id,
          "00010203-0405-4607-8809-0a0b0c0d0e0f"
        );
      }
    );
  }
);

test(
  "UUID never falls back to insecure randomness",
  () => {
    withCrypto(
      {},
      () => {
        assert.throws(
          () =>
            createBlockPuzzleSecureUuidV4(),
          (error) =>
            error?.code ===
            "BLOCK_PUZZLE_REQUEST_ID_UNAVAILABLE"
        );
      }
    );
  }
);

test(
  "clone uses native structuredClone when available",
  () => {
    let called = 0;

    withStructuredClone(
      (value) => {
        called += 1;

        return {
          ...value,
          cloned: true,
        };
      },
      () => {
        assert.deepEqual(
          cloneBlockPuzzleSerializableValue({
            moves: 3,
          }),
          {
            moves: 3,
            cloned: true,
          }
        );

        assert.equal(
          called,
          1
        );
      }
    );
  }
);

test(
  "clone falls back for JSON-serializable replay data",
  () => {
    withStructuredClone(
      undefined,
      () => {
        const replay = {
          version: 4,
          events: [
            {
              type: "move",
              row: 2,
              col: 3,
            },
          ],
        };

        const clone =
          cloneBlockPuzzleSerializableValue(
            replay
          );

        assert.deepEqual(
          clone,
          replay
        );

        assert.notEqual(
          clone,
          replay
        );

        assert.notEqual(
          clone.events,
          replay.events
        );
      }
    );
  }
);
