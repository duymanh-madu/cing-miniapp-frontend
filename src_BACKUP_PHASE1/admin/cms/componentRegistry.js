class ComponentRegistry {

  registry =
    new Map();

  register({

    key,

    component,

  }) {

    this.registry.set(
      key,
      component
    );

  }

  resolve(
    key
  ) {

    return this.registry.get(
      key
    );

  }

}

const componentRegistry =
  new ComponentRegistry();

export default
  componentRegistry;