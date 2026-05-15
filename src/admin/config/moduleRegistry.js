class ModuleRegistry {

  modules = new Map();

  register({
    key,
    module,
  }) {

    this.modules.set(
      key,
      module
    );

  }

  get(key) {

    return this.modules.get(key);

  }

  getAll() {

    return Array.from(
      this.modules.values()
    );

  }

}

const moduleRegistry =
  new ModuleRegistry();

export default moduleRegistry;