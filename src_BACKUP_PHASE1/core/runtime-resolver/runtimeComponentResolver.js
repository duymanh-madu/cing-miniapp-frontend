import componentRegistry from "@/core/component-registry/componentRegistry";

class RuntimeComponentResolver {

  resolve(
    type
  ) {

    return componentRegistry.resolve(
      type
    );

  }

}

const runtimeComponentResolver =
  new RuntimeComponentResolver();

export default
  runtimeComponentResolver;