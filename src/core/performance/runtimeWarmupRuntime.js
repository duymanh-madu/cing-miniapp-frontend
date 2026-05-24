import runtimePreloader from "./runtimePreloader";

class RuntimeWarmupRuntime {

  warmup() {

    runtimePreloader.preload(
      () =>
        import(
          "@/features/menu"
        )
    );

    runtimePreloader.preload(
      () =>
        import(
          "@/features/game"
        )
    );

  }

}

const runtimeWarmupRuntime =
  new RuntimeWarmupRuntime();

export default
  runtimeWarmupRuntime;