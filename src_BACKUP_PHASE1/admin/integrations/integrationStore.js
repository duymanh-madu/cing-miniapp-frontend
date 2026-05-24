import {
  create,
} from "zustand";

const useIntegrationStore =
  create(
    (
      set
    ) => ({

      integrations:
        [],

      integrationHealth:
        {},

      webhookDeliveries:
        [],

      apiUsageMetrics:
        {},

      setIntegrations:
        (
          integrations
        ) => {

          set({
            integrations,
          });

        },

      setIntegrationHealth:
        (
          integrationHealth
        ) => {

          set({
            integrationHealth,
          });

        },

      appendWebhookDelivery:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              webhookDeliveries: [

                payload,

                ...state.webhookDeliveries,

              ].slice(
                0,
                100
              ),

            })
          );

        },

      setApiUsageMetrics:
        (
          apiUsageMetrics
        ) => {

          set({
            apiUsageMetrics,
          });

        },

    })
  );

export default
  useIntegrationStore;