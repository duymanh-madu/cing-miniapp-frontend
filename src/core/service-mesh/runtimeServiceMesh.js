class RuntimeServiceMesh {

  services =
    new Map();

  register({
    key,
    service,
  }) {

    this.services.set(
      key,
      service
    );

  }

  resolve(
    key
  ) {

    return this.services.get(
      key
    );

  }

  getServices() {

    return Array.from(
      this.services.entries()
    );

  }

}

const runtimeServiceMesh =
  new RuntimeServiceMesh();

export default
  runtimeServiceMesh;