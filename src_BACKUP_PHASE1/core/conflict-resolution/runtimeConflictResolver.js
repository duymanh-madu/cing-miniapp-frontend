import conflictResolutionEngine from "./conflictResolutionEngine";

class RuntimeConflictResolver {

  resolve({
    localState,
    remoteState,
  }) {

    return conflictResolutionEngine
      .resolve({

        localState,

        remoteState,

      });

  }

}

const runtimeConflictResolver =
  new RuntimeConflictResolver();

export default
  runtimeConflictResolver;