const metrics = {

  received:
    0,

  processed:
    0,

  failed:
    0,

};

export function trackReceived() {

  metrics.received += 1;

}

export function trackProcessed() {

  metrics.processed += 1;

}

export function trackFailed() {

  metrics.failed += 1;

}

export function getGamificationMetrics() {

  return metrics;

}