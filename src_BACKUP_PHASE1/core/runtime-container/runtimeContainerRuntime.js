import runtimeContainerRegistry from "./runtimeContainerRegistry";

class RuntimeContainerRuntime {

  boot({
    container,
  }) {

    runtimeContainerRegistry
      .register({

        key:
          container.name,

        container,

      });

  }

  resolve({
    container,
  }) {

    return runtimeContainerRegistry
      .resolve(
        container
      );

  }

}

const runtimeContainerRuntime =
  new RuntimeContainerRuntime();

export default
  runtimeContainerRuntime;