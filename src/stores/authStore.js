import {
  create,
} from "zustand";

const defaultState =
  {

    authenticated:
      false,

    accessToken:
      null,

    refreshToken:
      null,

    profile:
      null,

  };

const useAuthStore =
  create(
    (
      set
    ) => ({

      ...defaultState,

      setSession:
        ({
          accessToken,
          refreshToken,
          profile,
        }) => {

          set({

            authenticated:
              true,

            accessToken:
              accessToken || null,

            refreshToken:
              refreshToken || null,

            profile:
              profile || null,

          });

        },

      updateProfile:
        (
          profile
        ) => {

          set({

            profile:
              profile || null,

          });

        },

      clearSession:
        () => {

          set({
            ...defaultState,
          });

        },

    })
  );

export default
  useAuthStore;