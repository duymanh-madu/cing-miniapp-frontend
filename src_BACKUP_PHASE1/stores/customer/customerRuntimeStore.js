import {
  create,
} from "zustand";

/**
 * =====================================================
 * REALTIME CUSTOMER STORE
 * =====================================================
 */

const useRealtimeCustomerStore =
  create(
    (
      set
    ) => ({

      profile: {

        id:
          null,

        name:
          "Khách",

        tier:
          "Bronze",

        points:
          0,

        avatar:
          null,

      },

      online:
        false,

      setProfile:
        (
          profile
        ) => {

          set(
            (
              state
            ) => ({

              profile: {

                ...state.profile,

                ...profile,

              },

            })
          );

        },

      setOnline:
        (
          online
        ) => {

          set({

            online,

          });

        },

      increasePoints:
        (
          points
        ) => {

          set(
            (
              state
            ) => ({

              profile: {

                ...state.profile,

                points:
                  state.profile.points +
                  points,

              },

            })
          );

        },

    })
  );

export default
  useRealtimeCustomerStore;