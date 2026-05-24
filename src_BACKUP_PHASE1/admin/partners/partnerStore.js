import {
  create,
} from "zustand";

const usePartnerStore =
  create(
    (
      set
    ) => ({

      partners:
        [],

      partnerMetrics:
        {},

      partnerIntegrations:
        [],

      realtimePartnerEvents:
        [],

      setPartners:
        (
          partners
        ) => {

          set({
            partners,
          });

        },

      setPartnerMetrics:
        (
          partnerMetrics
        ) => {

          set({
            partnerMetrics,
          });

        },

      setPartnerIntegrations:
        (
          partnerIntegrations
        ) => {

          set({
            partnerIntegrations,
          });

        },

      appendRealtimePartnerEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimePartnerEvents: [

                payload,

                ...state.realtimePartnerEvents,

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
  usePartnerStore;