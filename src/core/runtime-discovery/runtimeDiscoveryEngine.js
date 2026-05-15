class RuntimeDiscoveryEngine {

  runtimes =
    [];

  register(
    runtime
  ) {

    this.runtimes.push(
      runtime
    );

  }

  discover({
    tags = [],
  }) {

    return this.runtimes.filter(
      (
        runtime
      ) =>

        tags.every(
          (
            tag
          ) =>

            runtime.tags?.includes(
              tag
            )

        )

    );

  }

}

const runtimeDiscoveryEngine =
  new RuntimeDiscoveryEngine();

export default
  runtimeDiscoveryEngine;