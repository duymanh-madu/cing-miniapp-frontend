import {
  create,
} from "zustand";

const useAlertStore =
  create(
    (
      set
    ) => ({

      alerts:
        [],

      activeAlerts:
        [],

      setAlerts:
        (
          alerts
        ) => {

          set({
            alerts,
          });

        },

      appendAlert:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              activeAlerts: [

                payload,

                ...state.activeAlerts,

              ].slice(
                0,
                100
              ),

            })
          );

        },

    })
  );

export default
  useAlertStore;