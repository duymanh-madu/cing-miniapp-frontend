import deltaSyncEngine from "@/core/delta-sync/deltaSyncEngine";

import runtimeConflictResolver from "@/core/conflict-resolution/runtimeConflictResolver";

class DistributedSyncEngine {

  synchronize({
    previousState,
    nextState,
    remoteState,
  }) {

    const delta =
      deltaSyncEngine
        .calculateDelta({

          previous:
            previousState,

          next:
            nextState,

        });

    return runtimeConflictResolver
      .resolve({

        localState:
          delta,

        remoteState,

      });

  }

}

const distributedSyncEngine =
  new DistributedSyncEngine();

export default
  distributedSyncEngine;