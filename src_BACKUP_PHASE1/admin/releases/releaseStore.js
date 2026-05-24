import {
  create,
} from "zustand";

const useReleaseStore =
  create(
    (
      set
    ) => ({

      releases:
        [],

      activeDeployments:
        [],

      environmentStatus:
        {},

      setReleases:
        (
          releases
        ) => {

          set({
            releases,
          });

        },

      setActiveDeployments:
        (
          activeDeployments
        ) => {

          set({
            activeDeployments,
          });

        },

      setEnvironmentStatus:
        (
          environmentStatus
        ) => {

          set({
            environmentStatus,
          });

        },

    })
  );

export default
  useReleaseStore;