class RuntimeContainerRegistry {

  containers =
    new Map();

  register({
    key,
    container,
  }) {

    this.containers.set(
      key,
      container
    );

  }

  resolve(
    key
  ) {

    return this.containers.get(
      key
    );

  }

}

const runtimeContainerRegistry =
  new RuntimeContainerRegistry();

export default
  runtimeContainerRegistry;