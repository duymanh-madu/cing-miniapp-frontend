import {
  useAnalyticsStore,
} from "../store/analyticsStore";

export function trackEvent({

  type,

  payload = {},

}) {

  useAnalyticsStore
    .getState()
    .queueEvent({

      id:
        crypto.randomUUID(),

      type,

      payload,

      timestamp:
        Date.now(),

    });

}