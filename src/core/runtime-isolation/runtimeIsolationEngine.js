class RuntimeIsolationEngine {

  isolate({
    runtime,
    permissions = [],
  }) {

    return {

      runtime,

      permissions,

      isolated:
        true,

    };

  }

}

const runtimeIsolationEngine =
  new RuntimeIsolationEngine();

export default
  runtimeIsolationEngine;