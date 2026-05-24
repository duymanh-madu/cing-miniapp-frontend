import runtimeZoneManager from "./runtimeZoneManager";

class RuntimeZoneRuntime {

  assign({
    zone,
    runtime,
  }) {

    runtimeZoneManager
      .attachRuntime({

        zone,

        runtime,

      });

  }

  resolve(
    zone
  ) {

    return runtimeZoneManager
      .resolveZone(
        zone
      );

  }

}

const runtimeZoneRuntime =
  new RuntimeZoneRuntime();

export default
  runtimeZoneRuntime;