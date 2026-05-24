import useRuntimeDiagnosticsStore from "./runtimeDiagnosticsStore";

class RuntimeErrorReporter {

  report({
    error,
    runtime,
  }) {

    useRuntimeDiagnosticsStore
      .getState()
      .appendRuntimeError({

        runtime,

        error,

        timestamp:
          Date.now(),

      });

  }

}

const runtimeErrorReporter =
  new RuntimeErrorReporter();

export default
  runtimeErrorReporter;