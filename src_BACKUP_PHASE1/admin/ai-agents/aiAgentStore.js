import {
  create,
} from "zustand";

const useAiAgentStore =
  create(
    (
      set
    ) => ({

      aiAgents:
        [],

      activeAgents:
        [],

      autonomousActions:
        [],

      realtimeRecommendations:
        [],

      initialized:
        false,

      loading:
        false,

      setAiAgents:
        (
          aiAgents
        ) => {

          set({
            aiAgents,
          });

        },

      setActiveAgents:
        (
          activeAgents
        ) => {

          set({
            activeAgents,
          });

        },

      appendAutonomousAction:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              autonomousActions: [

                payload,

                ...state.autonomousActions,

              ].slice(
                0,
                200
              ),

            })
          );

        },

      appendRealtimeRecommendation:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeRecommendations: [

                payload,

                ...state.realtimeRecommendations,

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
  useAiAgentStore;