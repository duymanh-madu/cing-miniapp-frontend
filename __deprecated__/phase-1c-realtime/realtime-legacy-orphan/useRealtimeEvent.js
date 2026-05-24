import {
  useEffect,
} from "react";

import {
  onRealtimeEvent,
} from "./realtimeRegistry";

export function useRealtimeEvent({
  event,
  handler,
}) {

  useEffect(() => {

    return onRealtimeEvent(
      event,
      handler
    );

  }, [

    event,
    handler,

  ]);

}