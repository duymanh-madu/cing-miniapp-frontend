import runtimeServiceMesh from "./runtimeServiceMesh";

class RuntimeServiceResolver {

  resolve({
    service,
  }) {

    return runtimeServiceMesh
      .resolve(
        service
      );

  }

}

const runtimeServiceResolver =
  new RuntimeServiceResolver();

export default
  runtimeServiceResolver;