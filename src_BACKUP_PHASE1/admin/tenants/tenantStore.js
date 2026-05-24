import {
  create,
} from "zustand";

const useTenantStore =
  create(
    (
      set
    ) => ({

      tenants:
        [],

      tenantIsolationRuntime:
        {},

      roleHierarchy:
        {},

      distributedConfig:
        {},

      setTenants:
        (
          tenants
        ) => {

          set({
            tenants,
          });

        },

      setTenantIsolationRuntime:
        (
          tenantIsolationRuntime
        ) => {

          set({
            tenantIsolationRuntime,
          });

        },

      setRoleHierarchy:
        (
          roleHierarchy
        ) => {

          set({
            roleHierarchy,
          });

        },

      setDistributedConfig:
        (
          distributedConfig
        ) => {

          set({
            distributedConfig,
          });

        },

    })
  );

export default
  useTenantStore;