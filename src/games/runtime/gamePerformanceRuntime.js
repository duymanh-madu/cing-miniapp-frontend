class GamePerformanceRuntime {

  lowPerformanceMode =
    false;

  detect() {

    const memory =
      navigator.deviceMemory;

    if (
      memory &&
      memory <= 4
    ) {

      this.lowPerformanceMode =
        true;

    }

  }

  isLowPerformance() {

    return this
      .lowPerformanceMode;

  }

}

const gamePerformanceRuntime =
  new GamePerformanceRuntime();

export default
  gamePerformanceRuntime;