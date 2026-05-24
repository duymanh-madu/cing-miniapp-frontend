import {
  create,
} from "zustand";

const useAiCopilotStore =
  create(
    (
      set
    ) => ({

      copilotConversations:
        [],

      activeSuggestions:
        [],

      realtimeCopilotActions:
        [],

      setCopilotConversations:
        (
          copilotConversations
        ) => {

          set({
            copilotConversations,
          });

        },

      setActiveSuggestions:
        (
          activeSuggestions
        ) => {

          set({
            activeSuggestions,
          });

        },

      appendRealtimeCopilotAction:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeCopilotActions: [

                payload,

                ...state.realtimeCopilotActions,

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
  useAiCopilotStore;