import {
  useAnalyticsStore,
} from "../store/analyticsStore";

export function initializeAnalyticsSession() {

  const sessionId =
    crypto.randomUUID();

  useAnalyticsStore
    .getState()
    .setSessionId(
      sessionId
    );

}