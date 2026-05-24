import {
  create,
} from "zustand";

const useNotificationStore =
  create(
    (
      set
    ) => ({

      notifications:
        [],

      deliveryMetrics:
        {},

      activeChannels:
        [],

      realtimeDeliveries:
        [],

      initialized:
        false,

      loading:
        false,

      setNotifications:
        (
          notifications
        ) => {

          set({
            notifications,
          });

        },

      setDeliveryMetrics:
        (
          deliveryMetrics
        ) => {

          set({
            deliveryMetrics,
          });

        },

      setActiveChannels:
        (
          activeChannels
        ) => {

          set({
            activeChannels,
          });

        },

      appendRealtimeDelivery:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeDeliveries: [

                payload,

                ...state.realtimeDeliveries,

              ].slice(
                0,
                100
              ),

            })
          );

        },

      setLoading:
        (
          loading
        ) => {

          set({
            loading,
          });

        },

    })
  );

export default
  useNotificationStore;