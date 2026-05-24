class RuntimeExecutionTopologyEngine {

  build({
    runtimes = [],
  }) {

    return {

      topology:
        runtimes.map(
          (
            runtime,
            index
          ) => ({

            id:
              runtime.name,

            order:
              index,

          })
        ),

      createdAt:
        Date.now(),

    };

  }

}

const runtimeExecutionTopologyEngine =
  new RuntimeExecutionTopologyEngine();

export default
  runtimeExecutionTopologyEngine;