class RuntimeZoneManager {

  zones =
    new Map();

  createZone({
    key,
    metadata,
  }) {

    this.zones.set(
      key,
      {
        metadata,

        runtimes:
          [],

      }
    );

  }

  attachRuntime({
    zone,
    runtime,
  }) {

    const target =
      this.zones.get(
        zone
      );

    if (
      !target
    ) {

      return;

    }

    target.runtimes.push(
      runtime
    );

  }

  resolveZone(
    key
  ) {

    return this.zones.get(
      key
    );

  }

}

const runtimeZoneManager =
  new RuntimeZoneManager();

export default
  runtimeZoneManager;