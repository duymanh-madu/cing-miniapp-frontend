class ReconciliationEngine {

  reconcile({
    localState,
    remoteState,
  }) {

    return {

      ...localState,

      ...remoteState,

    };

  }

}

const reconciliationEngine =
  new ReconciliationEngine();

export default
  reconciliationEngine;