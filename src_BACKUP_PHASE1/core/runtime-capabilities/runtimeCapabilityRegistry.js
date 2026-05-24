class RuntimeCapabilityRegistry {

  capabilities =
    new Map();

  register({
    key,
    capability,
  }) {

    this.capabilities.set(
      key,
      capability
    );

  }

  resolve(
    key
  ) {

    return this.capabilities.get(
      key
    );

  }

  getAll() {

    return Array.from(
      this.capabilities.entries()
    );

  }

}

const runtimeCapabilityRegistry =
  new RuntimeCapabilityRegistry();

export default
  runtimeCapabilityRegistry;