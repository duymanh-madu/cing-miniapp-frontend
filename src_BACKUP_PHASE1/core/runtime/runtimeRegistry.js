class RuntimeRegistry {

  modules =
    new Map();

  register(
    key,
    module
  ) {

    this.modules.set(
      key,
      module
    );

  }

  resolve(
    key
  ) {

    return this.modules.get(
      key
    );

  }

  getAll() {

    return Array.from(
      this.modules.entries()
    );

  }

}

const runtimeRegistry =
  new RuntimeRegistry();

export default
  runtimeRegistry;