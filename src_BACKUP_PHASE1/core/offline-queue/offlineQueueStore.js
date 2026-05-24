import {
  create,
} from "zustand";

const useOfflineQueueStore =
  create(
    (
      set
    ) => ({

      queue:
        [],

      failedQueue:
        [],

      processing:
        false,

      enqueue:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              queue: [

                ...state.queue,

                payload,

              ],

            })
          );

        },

      dequeue:
        () => {

          set(
            (
              state
            ) => ({

              queue:
                state.queue.slice(
                  1
                ),

            })
          );

        },

      appendFailed:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              failedQueue: [

                payload,

                ...state.failedQueue,

              ],

            })
          );

        },

      setProcessing:
        (
          processing
        ) => {

          set({
            processing,
          });

        },

    })
  );

export default
  useOfflineQueueStore;