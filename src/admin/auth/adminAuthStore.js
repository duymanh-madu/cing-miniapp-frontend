import {
  create,
} from "zustand";

const useAdminAuthStore =
  create(
    (
      set
    ) => ({

      admin:
        null,

      accessToken:
        null,

      authenticated:
        false,

      setAdminAuth:
        ({
          admin,
          accessToken,
        }) => {

          localStorage.setItem(
            "admin_access_token",
            accessToken
          );

          set({

            admin,

            accessToken,

            authenticated:
              true,

          });

        },

      logout:
        () => {

          localStorage.removeItem(
            "admin_access_token"
          );

          set({

            admin:
              null,

            accessToken:
              null,

            authenticated:
              false,

          });

        },

    })
  );

export default
  useAdminAuthStore;