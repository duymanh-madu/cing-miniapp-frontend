class RuntimeDependencyGraph {

  dependencies =
    new Map();

  register({
    runtime,
    dependsOn = [],
  }) {

    this.dependencies.set(
      runtime,
      dependsOn
    );

  }

  resolve(
    runtime
  ) {

    return this.dependencies.get(
      runtime
    ) || [];

  }

}

const runtimeDependencyGraph =
  new RuntimeDependencyGraph();

export default
  runtimeDependencyGraph;