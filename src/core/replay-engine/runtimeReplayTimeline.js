import useRuntimeTimelineStore from "@/core/runtime-timeline/runtimeTimelineStore";

class RuntimeReplayTimeline {

  replay(
    callback
  ) {

    const events =
      useRuntimeTimelineStore
        .getState()
        .timelineEvents;

    events
      .slice()
      .reverse()
      .forEach(
        (
          event,
          index
        ) => {

          setTimeout(
            () => {

              callback(
                event
              );

            },
            index * 100
          );

        }
      );

  }

}

const runtimeReplayTimeline =
  new RuntimeReplayTimeline();

export default
  runtimeReplayTimeline;