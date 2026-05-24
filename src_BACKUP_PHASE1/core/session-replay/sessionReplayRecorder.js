import useSessionReplayStore from "./sessionReplayStore";

class SessionReplayRecorder {

  record({
    type,
    payload,
  }) {

    useSessionReplayStore
      .getState()
      .appendSessionEvent({

        type,

        payload,

        timestamp:
          Date.now(),

      });

  }

}

const sessionReplayRecorder =
  new SessionReplayRecorder();

export default
  sessionReplayRecorder;