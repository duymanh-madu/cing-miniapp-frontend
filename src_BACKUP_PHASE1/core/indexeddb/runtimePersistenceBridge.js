import cachePersistenceRuntime from "@/core/cache-persistence/cachePersistenceRuntime";

class RuntimePersistenceBridge {

  async persistState({
    key,
    payload,
  }) {

    await cachePersistenceRuntime
      .persist({
        key,
        payload,
      });

  }

  async restoreState(
    key
  ) {

    return cachePersistenceRuntime
      .resolve(
        key
      );

  }

}

const runtimePersistenceBridge =
  new RuntimePersistenceBridge();

export default
  runtimePersistenceBridge;