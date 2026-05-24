import networkRuntime from "@/core/network-runtime/networkRuntime";

class BackgroundSyncRuntime {

  tasks =
    [];

  initialize() {

    networkRuntime.subscribe(
      (
        online
      ) => {

        if (
          online
        ) {

          this.flush();

        }

      }
    );

  }

  enqueue(
    task
  ) {

    this.tasks.push(
      task
    );

  }

  async flush() {

    for (
      const task
      of this.tasks
    ) {

      await task();

    }

    this.tasks =
      [];

  }

}

const backgroundSyncRuntime =
  new BackgroundSyncRuntime();

export default
  backgroundSyncRuntime;