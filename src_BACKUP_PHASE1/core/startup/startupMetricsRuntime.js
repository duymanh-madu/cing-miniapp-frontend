class StartupMetricsRuntime {

  startedAt = 0;

  start() {

    this.startedAt =
      performance.now();

  }

  end() {

    const duration =
      performance.now() -
      this.startedAt;

    console.log(
      "startup_duration",
      duration
    );

  }

}

const startupMetricsRuntime =
  new StartupMetricsRuntime();

export default startupMetricsRuntime;