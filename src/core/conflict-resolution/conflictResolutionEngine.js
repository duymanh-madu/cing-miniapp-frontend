class ConflictResolutionEngine {

  resolve({
    localState,
    remoteState,
  }) {

    return {

      ...remoteState,

      ...localState,

    };

  }

}

const conflictResolutionEngine =
  new ConflictResolutionEngine();

export default
  conflictResolutionEngine;