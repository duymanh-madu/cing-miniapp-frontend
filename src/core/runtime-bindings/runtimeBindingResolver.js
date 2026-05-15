class RuntimeBindingResolver {

  resolve({
    bindings = {},
    state = {},
  }) {

    const resolved =
      {};

    Object.entries(
      bindings
    ).forEach(
      (
        [
          key,
          value,
        ]
      ) => {

        resolved[key] =
          state[value];

      }
    );

    return resolved;

  }

}

const runtimeBindingResolver =
  new RuntimeBindingResolver();

export default
  runtimeBindingResolver;