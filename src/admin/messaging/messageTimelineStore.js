import {
  create,
} from "zustand";

const useMessageTimelineStore =
  create(
    (
      set
    ) => ({

      customerMessages:
        [],

      realtimeConversation:
        [],

      setCustomerMessages:
        (
          customerMessages
        ) => {

          set({
            customerMessages,
          });

        },

      appendConversation:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeConversation: [

                payload,

                ...state.realtimeConversation,

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
  useMessageTimelineStore;