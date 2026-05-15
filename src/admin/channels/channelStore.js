import {
  create,
} from "zustand";

const useChannelStore =
  create(
    (
      set
    ) => ({

      channels:
        [],

      channelHealth:
        {},

      setChannels:
        (
          channels
        ) => {

          set({
            channels,
          });

        },

      setChannelHealth:
        (
          channelHealth
        ) => {

          set({
            channelHealth,
          });

        },

    })
  );

export default
  useChannelStore;