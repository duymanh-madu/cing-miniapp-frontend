class RuntimeCacheRuntime {

  cache =
    new Map();

  set({
    key,
    value,
  }) {

    this.cache.set(
      key,
      value
    );

  }

  get(
    key
  ) {

    return this.cache.get(
      key
    );

  }

  clear() {

    this.cache.clear();

  }

}

const runtimeCacheRuntime =
  new RuntimeCacheRuntime();

export default
  runtimeCacheRuntime;