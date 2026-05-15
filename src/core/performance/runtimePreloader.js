class RuntimePreloader {

  preload(
    loader
  ) {

    requestIdleCallback(
      () => {

        loader();

      }
    );

  }

}

const runtimePreloader =
  new RuntimePreloader();

export default
  runtimePreloader;