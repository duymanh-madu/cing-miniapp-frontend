class ComponentRegistry {

  registry =
    new Map();

  register({
    type,
    component,
  }) {

    this.registry.set(
      type,
      component
    );

  }

  resolve(
    type
  ) {

    return this.registry.get(
      type
    );

  }

  getAll() {

    return Array.from(
      this.registry.entries()
    );

  }

}

const componentRegistry =
  new ComponentRegistry();

export default
  componentRegistry;