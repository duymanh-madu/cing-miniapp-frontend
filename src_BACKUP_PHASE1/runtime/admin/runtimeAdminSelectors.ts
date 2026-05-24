import {
  useRuntimeAdminAuditStore,
} from "./runtimeAdminAuditStore";

export function getAdminAuditLogs() {

  return useRuntimeAdminAuditStore
    .getState()
    .logs;

}