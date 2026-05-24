class RuntimeWarmCache {

  warm() {

    requestIdleCallback(
      () => {

        import(
          "@/admin/AdminApp"
        );

      }
    );

  }

}

const runtimeWarmCache =
  new RuntimeWarmCache();

export default runtimeWarmCache;