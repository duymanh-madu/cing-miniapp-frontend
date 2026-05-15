import {
  create,
} from "zustand";

const useSocketMonitoringStore =
  create(
    (
      set
    ) => ({

      connections:
        0,

      rooms:
        [],

      events:
        [],

      setSnapshot:
        (
          payload
        ) => {

          set({

            connections:
              payload.connections,

            rooms:
              payload.rooms,

            events:
              payload.events,

          });

        },

    })
  );

export default
  useSocketMonitoringStore;