class MemoryPressureRuntime {

  cleanupCallbacks =
    [];

  register(
    callback
  ) {

    this.cleanupCallbacks.push(
      callback
    );

  }

  cleanup() {

    this.cleanupCallbacks.forEach(
      (
        callback
      ) => {

        callback();

      }
    );

  }

}

const memoryPressureRuntime =
  new MemoryPressureRuntime();

export default
  memoryPressureRuntime;