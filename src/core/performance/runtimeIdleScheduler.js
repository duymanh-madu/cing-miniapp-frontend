class RuntimeIdleScheduler {

  schedule(
    callback
  ) {

    if (
      "requestIdleCallback"
      in window
    ) {

      requestIdleCallback(
        callback
      );

      return;

    }

    setTimeout(
      callback,
      1
    );

  }

}

const runtimeIdleScheduler =
  new RuntimeIdleScheduler();

export default
  runtimeIdleScheduler;