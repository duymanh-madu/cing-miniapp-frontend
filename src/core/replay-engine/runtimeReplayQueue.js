class RuntimeReplayQueue {

  replayQueue =
    [];

  append(
    payload
  ) {

    this.replayQueue.push(
      payload
    );

  }

  flush(
    callback
  ) {

    this.replayQueue.forEach(
      (
        item
      ) => {

        callback(
          item
        );

      }
    );

    this.replayQueue =
      [];

  }

}

const runtimeReplayQueue =
  new RuntimeReplayQueue();

export default
  runtimeReplayQueue;