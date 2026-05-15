import useRuntimeMetricsStore from "./runtimeMetricsStore";

class RuntimeMemoryMonitor {

  interval =
    null;

  initialize() {

    this.interval =
      setInterval(
        () => {

          if (
            performance.memory
          ) {

            useRuntimeMetricsStore
              .getState()
              .setMemoryUsage({

                used:
                  performance.memory.usedJSHeapSize,

                total:
                  performance.memory.totalJSHeapSize,

              });

          }

        },
        5000
      );

  }

  destroy() {

    clearInterval(
      this.interval
    );

  }

}

const runtimeMemoryMonitor =
  new RuntimeMemoryMonitor();

export default
  runtimeMemoryMonitor;