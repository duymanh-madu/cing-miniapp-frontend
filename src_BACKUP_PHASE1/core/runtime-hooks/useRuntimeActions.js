import runtimeActionEngine from "@/core/runtime-actions/runtimeActionEngine";

function useRuntimeActions() {

  async function execute({
    actions,
    payload,
  }) {

    return runtimeActionEngine
      .executeActions({

        actions,

        payload,

      });

  }

  return {

    execute,

  };

}

export default
  useRuntimeActions;