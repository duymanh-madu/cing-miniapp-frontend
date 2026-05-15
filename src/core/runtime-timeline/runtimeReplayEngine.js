class RuntimeReplayEngine {

  replay(
    events = [],
    callback
  ) {

    events.forEach(
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

const runtimeReplayEngine =
  new RuntimeReplayEngine();

export default
  runtimeReplayEngine;