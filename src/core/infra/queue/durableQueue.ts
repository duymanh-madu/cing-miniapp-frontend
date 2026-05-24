class DurableQueue {

  private queue: any[] = [];

  enqueue(job: any) {
    this.queue.push({
      ...job,
      status: "PENDING",
      retry: 0,
    });
  }

  getJobs() {
    return this.queue;
  }

  remove(index: number) {
    this.queue.splice(index, 1);
  }

}

export const durableQueue = new DurableQueue();
