import { create } from "zustand";

interface RuntimeAuditLog {

  id:
    string;

  action:
    string;

  operator:
    string;

  createdAt:
    string;

}

interface RuntimeAdminAuditState {

  logs:
    RuntimeAuditLog[];

  pushAuditLog: (
    log: RuntimeAuditLog
  ) => void;

}

export const useRuntimeAdminAuditStore =
  create<RuntimeAdminAuditState>(

    (
      set,
      get
    ) => ({

      logs:
        [],

      pushAuditLog: (
        log
      ) => {

        set({

          logs: [

            log,

            ...get().logs,

          ],

        });

      },

    })

  );