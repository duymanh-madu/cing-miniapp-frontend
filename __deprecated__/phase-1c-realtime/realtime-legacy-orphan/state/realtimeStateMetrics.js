/**
 * =====================================================
 * REALTIME STATE METRICS
 * =====================================================
 */

const metrics = {

  optimisticApplied:
    0,

  optimisticRollback:
    0,

  reconnectRecoveries:
    0,

  offlineQueued:
    0,

};

export function trackOptimisticApplied() {

  metrics.optimisticApplied +=
    1;

}

export function trackOptimisticRollback() {

  metrics.optimisticRollback +=
    1;

}

export function trackReconnectRecovery() {

  metrics.reconnectRecoveries +=
    1;

}

export function trackOfflineQueued() {

  metrics.offlineQueued +=
    1;

}

export function getRealtimeStateMetrics() {

  return metrics;

}