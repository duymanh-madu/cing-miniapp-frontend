class BatchProcessor {

  private queue: any[] = [];
  private timer: any = null;

  push(event: any) {

    this.queue.push(event);

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 100);
    }

  }

  flush() {

    const batch = [...this.queue];
    this.queue = [];
    this.timer = null;

    return batch;
  }

}

export const batchProcessor = new BatchProcessor();
