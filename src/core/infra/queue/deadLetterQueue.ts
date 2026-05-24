class DeadLetterQueue {

  private failed: any[] = [];

  push(job: any) {
    this.failed.push({
      ...job,
      failedAt: Date.now(),
    });
  }

  getAll() {
    return this.failed;
  }

}

export const deadLetterQueue = new DeadLetterQueue();
