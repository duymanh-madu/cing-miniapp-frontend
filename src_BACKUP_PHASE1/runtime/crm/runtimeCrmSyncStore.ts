import { create } from "zustand";

import {
  RuntimeCrmCustomer,
} from "./runtimeCrmTypes";

interface RuntimeCrmSyncState {

  customer:
    RuntimeCrmCustomer | null;

  crmSynced:
    boolean;

  lastSyncedAt:
    string | null;

  setCustomer: (
    customer: RuntimeCrmCustomer
  ) => void;

  setCrmSynced: (
    value: boolean
  ) => void;

}

export const useRuntimeCrmSyncStore =
  create<RuntimeCrmSyncState>(

    (
      set
    ) => ({

      customer:
        null,

      crmSynced:
        false,

      lastSyncedAt:
        null,

      setCustomer: (
        customer
      ) => set({

        customer,

        lastSyncedAt:
          new Date()
            .toISOString(),

      }),

      setCrmSynced: (
        value
      ) => set({

        crmSynced:
          value,

      }),

    })

  );