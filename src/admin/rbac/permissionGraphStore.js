import {
  create,
} from "zustand";

const usePermissionGraphStore =
  create(
    (
      set
    ) => ({

      permissionGraph:
        {},

      roleHierarchy:
        {},

      policyMappings:
        {},

      setPermissionGraph:
        (
          permissionGraph
        ) => {

          set({
            permissionGraph,
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

      setPolicyMappings:
        (
          policyMappings
        ) => {

          set({
            policyMappings,
          });

        },

    })
  );

export default
  usePermissionGraphStore;