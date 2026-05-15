class BackgroundTaskRegistry {

  tasks =
    new Map();

  register({
    key,
    task,
  }) {

    this.tasks.set(
      key,
      task
    );

  }

  resolve(
    key
  ) {

    return this.tasks.get(
      key
    );

  }

  getAll() {

    return Array.from(
      this.tasks.entries()
    );

  }

}

const backgroundTaskRegistry =
  new BackgroundTaskRegistry();

export default
  backgroundTaskRegistry;