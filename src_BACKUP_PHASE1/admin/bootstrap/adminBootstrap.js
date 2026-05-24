import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import moduleRegistry from "@/admin/config/moduleRegistry";

import adminModuleManifest from "@/admin/config/modules/adminModuleManifest";

/**
 * =====================================================
 * ADMIN BOOTSTRAP
 * =====================================================
 */

function registerAdminModules() {

  adminModuleManifest.forEach(
    (moduleDefinition) => {

      if (
        moduleRegistry.has(
          moduleDefinition.key
        )
      ) {
        return;
      }

      moduleRegistry.register(
        moduleDefinition
      );

    }
  );

}

export async function bootstrapAdminLayer() {

  registerAdminModules();

  const activeModules =
    moduleRegistry.getActive();

  runtimeLogger.info(
    "ADMIN",
    "[BOOTSTRAP] Admin layer booting",
    {
      activeModules:
        activeModules.length,
      totalModules:
        moduleRegistry.getAll().length,
    }
  );

  for (
    const moduleDefinition of activeModules
  ) {

    if (
      typeof moduleDefinition.bootstrap !==
      "function"
    ) {
      continue;
    }

    await moduleDefinition.bootstrap();

  }

  runtimeLogger.info(
    "ADMIN",
    "[BOOTSTRAP] Admin layer booted"
  );

}
