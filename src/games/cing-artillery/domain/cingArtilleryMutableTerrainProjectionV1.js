const CANONICAL_NON_NEGATIVE_INTEGER =
  /^(?:0|[1-9][0-9]*)$/u;

const CANONICAL_LOWER_HEX =
  /^(?:[0-9a-f]{2})+$/u;

function fail(
  field
) {
  throw new Error(
    `MUTABLE_TERRAIN_PROJECTION_INVALID_V1:${field}`
  );
}

function positiveSafeInteger(
  value,
  field
) {
  if (
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    fail(field);
  }

  return value;
}

function canonicalRevision(
  value
) {
  if (
    typeof value !== "string" ||
    !CANONICAL_NON_NEGATIVE_INTEGER.test(
      value
    )
  ) {
    fail(
      "terrain_revision"
    );
  }

  return value;
}

function canonicalMaskHex(
  value,
  expectedBytes,
  width
) {
  if (
    typeof value !== "string" ||
    !CANONICAL_LOWER_HEX.test(
      value
    ) ||
    value.length !==
      expectedBytes * 2
  ) {
    fail(
      "collision_mask_hex"
    );
  }

  const bytes =
    Uint8Array.from(
      {
        length:
          expectedBytes,
      },
      (_, index) =>
        Number.parseInt(
          value.slice(
            index * 2,
            index * 2 + 2
          ),
          16
        )
    );

  const remainder =
    width & 7;

  if (remainder !== 0) {
    const rowBytes =
      Math.ceil(
        width / 8
      );

    const paddingMask =
      (1 << (8 - remainder)) -
      1;

    for (
      let row = 0;
      row <
      expectedBytes / rowBytes;
      row += 1
    ) {
      const lastByte =
        bytes[
          row * rowBytes +
          rowBytes -
          1
        ];

      if (
        (
          lastByte &
          paddingMask
        ) !== 0
      ) {
        fail(
          "collision_mask_hex.padding"
        );
      }
    }
  }

  return bytes;
}

export function
projectMutableTerrainV1(
  input
) {
  if (
    !input ||
    typeof input !== "object"
  ) {
    fail(
      "terrain"
    );
  }

  const width =
    positiveSafeInteger(
      input.width_px,
      "width_px"
    );

  const height =
    positiveSafeInteger(
      input.height_px,
      "height_px"
    );

  const rowBytes =
    Math.ceil(
      width / 8
    );

  const expectedBytes =
    rowBytes * height;

  const bytes =
    canonicalMaskHex(
      input.collision_mask_hex,
      expectedBytes,
      width
    );

  const immutableBytes =
    Object.freeze(
      Array.from(
        bytes
      )
    );

  const terrain = {
    combat_state_id:
      input.combat_state_id,

    match_runtime_id:
      input.match_runtime_id,

    match_id:
      input.match_id,

    map_id:
      input.map_id,

    width_px:
      width,

    height_px:
      height,

    terrain_revision:
      canonicalRevision(
        input.terrain_revision
      ),

    collision_mask_hex:
      input.collision_mask_hex,

    row_bytes:
      rowBytes,

    collision_mask:
      immutableBytes,
  };

  return Object.freeze(
    terrain
  );
}

export function
terrainBitAtV1(
  terrain,
  x,
  y
) {
  if (
    !terrain ||
    !Number.isSafeInteger(
      terrain.width_px
    ) ||
    !Number.isSafeInteger(
      terrain.height_px
    ) ||
    !Array.isArray(
      terrain.collision_mask
    )
  ) {
    fail(
      "terrain"
    );
  }

  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    y < 0 ||
    x >= terrain.width_px ||
    y >= terrain.height_px
  ) {
    return false;
  }

  const byteIndex =
    y *
      terrain.row_bytes +
    (x >> 3);

  const bitIndex =
    7 -
    (x & 7);

  return (
    (
      terrain.collision_mask[
        byteIndex
      ] >>
      bitIndex
    ) &
    1
  ) === 1;
}
