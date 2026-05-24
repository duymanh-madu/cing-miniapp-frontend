import type {
  RuntimeModuleDefinition,
  RuntimeModuleState,
  RuntimeModuleStatus,
} from "./runtimeLifecycleTypes";

/**
 * =====================================================
 * RUNTIME MODULE REGISTRY
 * =====================================================
 * Central runtime ownership registry.
 * =====================================================
 */

class RuntimeModuleRegistry {

  private modules =
    new Map<
      string,
      RuntimeModuleDefinition
    >();

  private states =
    new Map<
      string,
      RuntimeModuleState
    >();

  register(
    moduleDefinition:
      RuntimeModuleDefinition
  ) {

    if (
      !moduleDefinition?.key
    ) {

      throw new Error(
        "Runtime module key is required"
      );

    }

    this.modules.set(
      moduleDefinition.key,
      moduleDefinition
    );

    if (
      !this.states.has(
        moduleDefinition.key
      )
    ) {

      this.states.set(
        moduleDefinition.key,
        {
          key:
            moduleDefinition.key,
          status:
            moduleDefinition.status ||
            "inactive",
          activationCount: 0,
        }
      );

    }

    return moduleDefinition;

  }

  has(
    key: string
  ) {

    return this.modules.has(
      key
    );

  }

  get(
    key: string
  ) {

    return this.modules.get(
      key
    );

  }

  getAll() {

    return Array.from(
      this.modules.values()
    ).sort(
      (a, b) =>
        (a.priority || 0) -
        (b.priority || 0)
    );

  }

  getState(
    key: string
  ) {

    return this.states.get(
      key
    );

  }

  getStates() {

    return Array.from(
      this.states.values()
    );

  }

  updateStatus(
    key: string,
    status: RuntimeModuleStatus
  ) {

    const state =
      this.states.get(
        key
      );

    if (!state) {

      return null;

    }

    state.status =
      status;

    if (
      status === "active"
    ) {

      state.initializedAt =
        Date.now();

      state.activationCount += 1;

    }

    if (
      status === "destroyed"
    ) {

      state.destroyedAt =
        Date.now();

    }

    this.states.set(
      key,
      state
    );

    return state;

  }

  remove(
    key: string
  ) {

    this.modules.delete(
      key
    );

    this.states.delete(
      key
    );

  }

  clear() {

    this.modules.clear();

    this.states.clear();

  }

}

const runtimeModuleRegistry =
  new RuntimeModuleRegistry();

export default
  runtimeModuleRegistry;
