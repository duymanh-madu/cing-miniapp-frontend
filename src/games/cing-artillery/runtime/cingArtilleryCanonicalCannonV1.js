const CANNON_CONTRACT_VERSION_V1 =
  "cing-artillery-canonical-cannon-v1";

const CANNON_KEY_V1 =
  "cing-standard-cannon-v1";

const CANNON_CANVAS_V1 =
  Object.freeze({
    widthPx: 384,
    heightPx: 384,
  });

const CANNON_PRESENTATION_GEOMETRY_V1 =
  Object.freeze({
    nominalWidthPx: 236,
    nominalHeightPx: 174,

    groundAnchor:
      Object.freeze({
        x: 0.5,
        y: 0.88,
      }),

    rotationPivot:
      Object.freeze({
        x: 0.58,
        y: 0.61,
      }),

    muzzleOrigin:
      Object.freeze({
        x: 0.245,
        y: 0.505,
      }),

    projectileSpawn:
      Object.freeze({
        x: 0.205,
        y: 0.505,
      }),

    aftermathOrigin:
      Object.freeze({
        x: 0.245,
        y: 0.505,
      }),
  });

const CANNON_COSMETIC_CHANNELS_V1 =
  Object.freeze({
    dye:
      Object.freeze([
        "primary",
        "secondary",
      ]),

    material:
      Object.freeze([
        "metal",
      ]),

    gems:
      Object.freeze([
        "muzzle",
        "body_left",
        "body_right",
      ]),

    ornaments:
      Object.freeze([
        "top",
        "side_left",
        "side_right",
      ]),

    emissive:
      Object.freeze([
        "weapon",
      ]),

    vfx:
      Object.freeze([
        "muzzle",
        "projectile",
        "trail",
        "impact",
        "aftermath",
      ]),
  });

const CANNON_ART_REQUIREMENTS_V1 =
  Object.freeze([
    "shared-by-all-players",
    "same-gameplay-stats-for-all",
    "commercial-mobile-readable-silhouette",
    "premium-metal-material",
    "clean-rgba-alpha",
    "no-background",
    "no-baked-ground-platform",
    "no-baked-character",
    "no-baked-projectile",
    "no-baked-impact-vfx",
    "cosmetic-ready",
    "gem-ready",
    "ornament-ready",
    "emissive-ready",
    "vfx-hook-ready",
  ]);

const CANNON_GAMEPLAY_BOUNDARY_V1 =
  Object.freeze({
    presentationOnly: true,
    changesDamage: false,
    changesTrajectory: false,
    changesHitbox: false,
    changesPower: false,
    changesWind: false,
    changesCrater: false,
    changesCooldown: false,
    changesRankOutcome: false,
  });

export {
  CANNON_ART_REQUIREMENTS_V1,
  CANNON_CANVAS_V1,
  CANNON_CONTRACT_VERSION_V1,
  CANNON_COSMETIC_CHANNELS_V1,
  CANNON_GAMEPLAY_BOUNDARY_V1,
  CANNON_KEY_V1,
  CANNON_PRESENTATION_GEOMETRY_V1,
};
