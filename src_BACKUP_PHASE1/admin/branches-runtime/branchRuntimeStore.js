import {
  create,
} from "zustand";

const useBranchRuntimeStore =
  create(
    (
      set
    ) => ({

      branchHealth:
        {},

      branchRealtimeOrders:
        {},

      branchInventorySync:
        {},

      branchAlerts:
        [],

      setBranchHealth:
        (
          branchHealth
        ) => {

          set({
            branchHealth,
          });

        },

      setBranchRealtimeOrders:
        (
          branchRealtimeOrders
        ) => {

          set({
            branchRealtimeOrders,
          });

        },

      setBranchInventorySync:
        (
          branchInventorySync
        ) => {

          set({
            branchInventorySync,
          });

        },

      appendBranchAlert:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              branchAlerts: [

                payload,

                ...state.branchAlerts,

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
  useBranchRuntimeStore;