import runtimePreloader from "./runtimePreloader";

class RuntimeWarmupRuntime {

  warmup() {

    runtimePreloader.preload(
      () =>
        import(
          "@/pages/menu/MenuPage"
        )
    );

    runtimePreloader.preload(
      () =>
        import(
          "@/pages/game/GamePage"
        )
    );

  }

}

const runtimeWarmupRuntime =
  new RuntimeWarmupRuntime();

export default
  runtimeWarmupRuntime;