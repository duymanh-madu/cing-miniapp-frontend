const CHARACTER_ARTWORK_SPEC_VERSION_V1 =
  "cing-artillery-character-artwork-spec-v1";

const CHARACTER_ARTWORK_CANVAS_V1 =
  Object.freeze({
    widthPx: 384,
    heightPx: 384,
    groundAnchorX: 0.5,
    groundAnchorY: 0.88,
  });

const CHARACTER_ARTWORK_DISPLAY_V1 =
  Object.freeze({
    nominalHeightPx: 92,
    minReadableHeightPx: 76,
    maxPresentationHeightPx: 108,
  });

const CHARACTER_ARTWORK_STATES_V1 =
  Object.freeze({
    idle: Object.freeze({
      loop: true,
      fps: 10,
      frameBudget: 8,
    }),

    aim: Object.freeze({
      loop: true,
      fps: 12,
      frameBudget: 8,
    }),

    shoot: Object.freeze({
      loop: false,
      fps: 16,
      frameBudget: 10,
    }),

    hit: Object.freeze({
      loop: false,
      fps: 14,
      frameBudget: 8,
    }),

    fall: Object.freeze({
      loop: true,
      fps: 12,
      frameBudget: 8,
    }),

    victory: Object.freeze({
      loop: true,
      fps: 12,
      frameBudget: 12,
    }),

    defeat: Object.freeze({
      loop: true,
      fps: 10,
      frameBudget: 10,
    }),
  });

const CHARACTER_ARTWORK_LAYERS_V1 =
  Object.freeze([
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
  ]);

const CANONICAL_WEAPON_ART_V1 =
  Object.freeze({
    key:
      "cing-standard-cannon-v1",

    sharedAcrossGenders:
      true,

    gameplayStatsVariant:
      false,

    visualMount:
      Object.freeze({
        normalizedX:
          0.58,

        normalizedY:
          0.61,
      }),

    cosmeticChannels:
      Object.freeze([
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
      ]),
  });

const CHARACTER_ART_DIRECTION_V1 =
  Object.freeze({
    family:
      "cing-human-chibi",

    genders:
      Object.freeze([
        "male",
        "female",
      ]),

    proportions:
      Object.freeze({
        headToBodyRatio:
          "commercial-chibi-large-head-small-body",

        sharedScale:
          true,

        readableAtLogicalWorld:
          "960x540",
      }),

    requirements:
      Object.freeze([
        "human-not-mascot",
        "distinct-male-female-silhouette",
        "shared-canonical-weapon",
        "clear-face-at-mobile-scale",
        "strong-pose-readability",
        "premium-material-rendering",
        "cosmetic-ready-layer-separation",
        "weapon-never-obscures-face",
        "no-placeholder-art",
      ]),
  });

export {
  CANONICAL_WEAPON_ART_V1,
  CHARACTER_ART_DIRECTION_V1,
  CHARACTER_ARTWORK_CANVAS_V1,
  CHARACTER_ARTWORK_DISPLAY_V1,
  CHARACTER_ARTWORK_LAYERS_V1,
  CHARACTER_ARTWORK_SPEC_VERSION_V1,
  CHARACTER_ARTWORK_STATES_V1,
};
