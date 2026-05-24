import {
  create,
} from "zustand";

const useMultiTenantStore =
  create(
    (
      set
    ) => ({

      activeTenant:
        null,

      tenantRuntimeIsolation:
        {},

      crossTenantObservability:
        {},

      setActiveTenant:
        (
          activeTenant
        ) => {

          set({
            activeTenant,
          });

        },

      setTenantRuntimeIsolation:
        (
          tenantRuntimeIsolation
        ) => {

          set({
            tenantRuntimeIsolation,
          });

        },

      setCrossTenantObservability:
        (
          crossTenantObservability
        ) => {

          set({
            crossTenantObservability,
          });

        },

    })
  );

export default
  useMultiTenantStore;