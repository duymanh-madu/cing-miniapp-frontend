import useNetworkStateStore from "./networkStateStore";

class NetworkLatencyMonitor {

  interval =
    null;

  initialize() {

    this.interval =
      setInterval(
        async () => {

          const start =
            performance.now();

          try {

            await fetch(
              "/health"
            );

            const end =
              performance.now();

            useNetworkStateStore
              .getState()
              .setLatency(
                Math.round(
                  end - start
                )
              );

          } catch {

            useNetworkStateStore
              .getState()
              .setLatency(
                null
              );

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

const networkLatencyMonitor =
  new NetworkLatencyMonitor();

export default
  networkLatencyMonitor;