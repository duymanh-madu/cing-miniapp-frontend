import {
  create,
} from "zustand";

const useWebhookStore =
  create(
    (
      set
    ) => ({

      webhookEndpoints:
        [],

      webhookLogs:
        [],

      webhookFailures:
        [],

      realtimeWebhookEvents:
        [],

      setWebhookEndpoints:
        (
          webhookEndpoints
        ) => {

          set({
            webhookEndpoints,
          });

        },

      setWebhookLogs:
        (
          webhookLogs
        ) => {

          set({
            webhookLogs,
          });

        },

      setWebhookFailures:
        (
          webhookFailures
        ) => {

          set({
            webhookFailures,
          });

        },

      appendRealtimeWebhookEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeWebhookEvents: [

                payload,

                ...state.realtimeWebhookEvents,

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
  useWebhookStore;