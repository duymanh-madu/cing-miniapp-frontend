function fail(
  field
) {
  throw new Error(
    `TERRAIN_RASTER_INVALID_V1:${field}`
  );
}

function solidAt(
  terrain,
  x,
  y
) {
  if (
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
      terrain
        .collision_mask[
          byteIndex
        ] >>
      bitIndex
    ) &
    1
  ) === 1;
}

function clampByte(
  value
) {
  return Math.max(
    0,
    Math.min(
      255,
      Math.round(
        value
      )
    )
  );
}

function mix(
  start,
  end,
  amount
) {
  return clampByte(
    start +
      (
        end -
        start
      ) *
      amount
  );
}

export function
rasterizeMutableTerrainV1(
  terrain
) {
  if (
    !terrain ||
    !Number.isSafeInteger(
      terrain.width_px
    ) ||
    terrain.width_px <= 0 ||
    !Number.isSafeInteger(
      terrain.height_px
    ) ||
    terrain.height_px <= 0 ||
    !Number.isSafeInteger(
      terrain.row_bytes
    ) ||
    terrain.row_bytes !==
      Math.ceil(
        terrain.width_px /
        8
      ) ||
    !Array.isArray(
      terrain.collision_mask
    ) ||
    terrain.collision_mask.length !==
      terrain.row_bytes *
      terrain.height_px
  ) {
    fail(
      "terrain"
    );
  }

  const width =
    terrain.width_px;

  const height =
    terrain.height_px;

  const pixels =
    new Uint8ClampedArray(
      width *
      height *
      4
    );

  for (
    let y = 0;
    y < height;
    y += 1
  ) {
    const vertical =
      y /
      Math.max(
        1,
        height - 1
      );

    for (
      let x = 0;
      x < width;
      x += 1
    ) {
      if (
        !solidAt(
          terrain,
          x,
          y
        )
      ) {
        continue;
      }

      const index =
        (
          y *
          width +
          x
        ) *
        4;

      const exposed =
        !solidAt(
          terrain,
          x,
          y - 1
        );

      const nearSurface =
        exposed ||
        !solidAt(
          terrain,
          x,
          y - 2
        ) ||
        !solidAt(
          terrain,
          x,
          y - 3
        );

      if (exposed) {
        pixels[index] =
          104;

        pixels[index + 1] =
          125;

        pixels[index + 2] =
          78;
      } else if (
        nearSurface
      ) {
        pixels[index] =
          86;

        pixels[index + 1] =
          101;

        pixels[index + 2] =
          65;
      } else {
        const shade =
          (
            (
              x * 17 +
              y * 11
            ) %
            29
          ) === 0
            ? 0.07
            : 0;

        const depth =
          Math.min(
            1,
            Math.max(
              0,
              (
                vertical -
                0.48
              ) /
              0.52
            )
          );

        pixels[index] =
          mix(
            112,
            42,
            depth + shade
          );

        pixels[index + 1] =
          mix(
            91,
            34,
            depth + shade
          );

        pixels[index + 2] =
          mix(
            61,
            28,
            depth + shade
          );
      }

      pixels[index + 3] =
        255;
    }
  }

  return pixels;
}

export const
TERRAIN_RASTER_PRESENTATION_VERSION =
  1;
