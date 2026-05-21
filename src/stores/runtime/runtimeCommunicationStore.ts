import { create } from "zustand";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

interface RuntimeMessage {

  title: string;

  content: string;

  created_at: number;

}

/**
 * =====================================================
 * STORE
 * =====================================================
 */

interface RuntimeCommunicationState {

  messages:
    RuntimeMessage[];

  unread_count:
    number;

  pushMessage: (
    message: RuntimeMessage
  ) => void;

  markAllAsRead: () => void;

}

export const useRuntimeCommunicationStore =
  create<
    RuntimeCommunicationState
  >(

    (
      set,
      get
    ) => ({

      messages: [],

      unread_count: 0,

      pushMessage: (
        message
      ) =>

        set({

          messages: [

            message,

            ...get()
              .messages,

          ],

          unread_count:

            get()
              .unread_count + 1,

        }),

      markAllAsRead:
        () =>

          set({

            unread_count: 0,

          }),

    })

  );