import useStateMeshStore from "./stateMeshStore";

class DistributedStateRuntime {

  synchronize({
    key,
    payload,
  }) {

    useStateMeshStore
      .getState()
      .setDistributedState(
        key,
        payload
      );

  }

  resolve(
    key
  ) {

    return useStateMeshStore
      .getState()
      .distributedStates[
        key
      ];

  }

}

const distributedStateRuntime =
  new DistributedStateRuntime();

export default
  distributedStateRuntime;