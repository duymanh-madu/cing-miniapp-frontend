class HydrationCache {

  CACHE_KEY =
    "cing_hydration_cache";

  memoryCache =
    new Map();

  async restore() {

    try {

      const raw =
        localStorage.getItem(
          this.CACHE_KEY
        );

      if (!raw) {
        return;
      }

      const data =
        JSON.parse(raw);

      Object
        .entries(data)
        .forEach(
          ([key, value]) => {

            this.memoryCache.set(
              key,
              value
            );

          }
        );

    } catch (error) {

      console.error(
        "hydration cache restore failed",
        error
      );

    }

  }

  set(key, value) {

    this.memoryCache.set(
      key,
      value
    );

    this.persist();

  }

  get(key) {

    return this.memoryCache.get(
      key
    );

  }

  persist() {

    localStorage.setItem(
      this.CACHE_KEY,
      JSON.stringify(
        Object.fromEntries(
          this.memoryCache
        )
      )
    );

  }

}

const hydrationCache =
  new HydrationCache();

export default hydrationCache;