import { create } from "zustand";

interface RuntimeAdminGovernanceState {

  crmImportRunning:
    boolean;

  crmSyncRunning:
    boolean;

  lastGovernanceAction:
    string | null;

  setGovernanceState: (
    payload: {

      crmImportRunning:
        boolean;

      crmSyncRunning:
        boolean;

      lastGovernanceAction:
        string | null;

    }
  ) => void;

}

export const useRuntimeAdminGovernanceStore =
  create<RuntimeAdminGovernanceState>(

    (
      set
    ) => ({

      crmImportRunning:
        false,

      crmSyncRunning:
        false,

      lastGovernanceAction:
        null,

      setGovernanceState: (
        payload
      ) => set({

        crmImportRunning:
          payload.crmImportRunning,

        crmSyncRunning:
          payload.crmSyncRunning,

        lastGovernanceAction:
          payload.lastGovernanceAction,

      }),

    })

  );