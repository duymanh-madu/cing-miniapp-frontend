import runtimeCapabilityRegistry from "./runtimeCapabilityRegistry";

class RuntimeCapabilityResolver {

  resolve({
    capability,
  }) {

    return runtimeCapabilityRegistry
      .resolve(
        capability
      );

  }

}

const runtimeCapabilityResolver =
  new RuntimeCapabilityResolver();

export default
  runtimeCapabilityResolver;