const MAP_ASSETS =
  Object.freeze({
    "4611bd68-07b7-46ec-b9b9-2088642e4be1":
      Object.freeze({
        mapId:
          "4611bd68-07b7-46ec-b9b9-2088642e4be1",

        mapKey:
          "phat-tich-mountain",

        version:
          1,

        displayName:
          "Núi Phật Tích",

        width:
          960,

        height:
          540,

        renderAsset:
          "/game-assets/cing-piu-piu/maps/phat-tich-mountain/v1/map.svg",

        backgroundRenderAsset:
          "/game-assets/cing-piu-piu/maps/phat-tich-mountain/v1/map-background.svg",
      }),
  });

export function
resolveCingArtilleryMapAsset(
  mapId
) {
  const id =
    String(
      mapId || ""
    ).trim();

  const asset =
    MAP_ASSETS[
      id
    ];

  if (!asset) {
    const error =
      new Error(
        "Map Cing Piu Piu chưa có render asset tương thích"
      );

    error.code =
      "CING_PIU_PIU_MAP_ASSET_UNSUPPORTED";

    throw error;
  }

  return asset;
}
