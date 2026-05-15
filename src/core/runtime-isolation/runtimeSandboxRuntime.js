import runtimeIsolationEngine from "./runtimeIsolationEngine";

class RuntimeSandboxRuntime {

  create({
    runtime,
    permissions,
  }) {

    return runtimeIsolationEngine
      .isolate({

        runtime,

        permissions,

      });

  }

}

const runtimeSandboxRuntime =
  new RuntimeSandboxRuntime();

export default
  runtimeSandboxRuntime;