import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import runtimeModuleRegistry from "./runtimeModuleRegistry";

import type {
  RuntimeActivationContext,
  RuntimeModuleDefinition,
} from "./runtimeLifecycleTypes";

/**
 * =====================================================
 * RUNTIME ORCHESTRATOR
 * =====================================================
 * Central runtime lifecycle governance layer.
 * =====================================================
 */

class RuntimeOrchestrator {

  async register(
    moduleDefinition:
      RuntimeModuleDefinition
  ) {

    return runtimeModuleRegistry.register(
      moduleDefinition
    );

  }

  async activate(
    key: string,
    context:
      RuntimeActivationContext = {}
  ) {

    const moduleDefinition =
      runtimeModuleRegistry.get(
        key
      );

    if (
      !moduleDefinition
    ) {

      runtimeLogger.warn(
        "RUNTIME",
        "[ORCHESTRATOR] Module not found",
        {
          key,
        }
      );

      return null;

    }

    const currentState =
      runtimeModuleRegistry.getState(
        key
      );

    if (
      currentState?.status ===
      "active"
    ) {

      return currentState;

    }

    runtimeModuleRegistry.updateStatus(
      key,
      "bootstrapping"
    );

    runtimeLogger.info(
      "RUNTIME",
      "[ORCHESTRATOR] Activating module",
      {
        key,
        context,
      }
    );

    try {

      for (
        const dependency of
        moduleDefinition.dependencies || []
      ) {

        await this.activate(
          dependency,
          {
            source:
              key,
            lazy: true,
          }
        );

      }

      await moduleDefinition.initialize?.();

      const nextState =
        runtimeModuleRegistry.updateStatus(
          key,
          "active"
        );

      runtimeLogger.info(
        "RUNTIME",
        "[ORCHESTRATOR] Module activated",
        {
          key,
        }
      );

      return nextState;

    } catch (
      error
    ) {

      runtimeLogger.error(
        "RUNTIME",
        "[ORCHESTRATOR] Activation failed",
        {
          key,
          error,
        }
      );

      runtimeModuleRegistry.updateStatus(
        key,
        "inactive"
      );

      return null;

    }

  }

  async destroy(
    key: string
  ) {

    const moduleDefinition =
      runtimeModuleRegistry.get(
        key
      );

    if (
      !moduleDefinition
    ) {

      return null;

    }

    runtimeModuleRegistry.updateStatus(
      key,
      "destroying"
    );

    runtimeLogger.info(
      "RUNTIME",
      "[ORCHESTRATOR] Destroying module",
      {
        key,
      }
    );

    try {

      await moduleDefinition.destroy?.();

      const nextState =
        runtimeModuleRegistry.updateStatus(
          key,
          "destroyed"
        );

      runtimeLogger.info(
        "RUNTIME",
        "[ORCHESTRATOR] Module destroyed",
        {
          key,
        }
      );

      return nextState;

    } catch (
      error
    ) {

      runtimeLogger.error(
        "RUNTIME",
        "[ORCHESTRATOR] Destroy failed",
        {
          key,
          error,
        }
      );

      return null;

    }

  }

  getRegistry() {

    return runtimeModuleRegistry;

  }

}

const runtimeOrchestrator =
  new RuntimeOrchestrator();

export default
  runtimeOrchestrator;
