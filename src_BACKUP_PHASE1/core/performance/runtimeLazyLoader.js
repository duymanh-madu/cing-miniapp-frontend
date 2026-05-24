class RuntimeLazyLoader {

  async load(
    loader
  ) {

    return loader();

  }

}

const runtimeLazyLoader =
  new RuntimeLazyLoader();

export default
  runtimeLazyLoader;