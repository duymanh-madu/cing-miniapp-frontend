import httpClient from "@/api/client/httpClient";

import {
  useAnalyticsStore,
} from "../store/analyticsStore";

export async function flushAnalyticsQueue() {

  const events =
    useAnalyticsStore
      .getState()
      .queuedEvents;

  if (!events.length) {

    return;

  }

  await httpClient.post(

    "/analytics/events",

    {

      events,

    }

  );

  useAnalyticsStore
    .getState()
    .clearQueue();

}