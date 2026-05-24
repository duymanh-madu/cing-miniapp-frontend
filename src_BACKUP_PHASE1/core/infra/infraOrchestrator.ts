import { durableQueue } from "./queue/durableQueue";
import { retryEngine } from "./retry/retryEngine";
import { deadLetterQueue } from "./queue/deadLetterQueue";
import { eventStore } from "./event-store/eventStore";

class InfraOrchestrator {

  async process(job: any, handler: Function) {

    durableQueue.enqueue(job);

    try {

      const result = await retryEngine.execute(
        () => handler(job)
      );

      eventStore.append({
        type: job.type,
        payload: job,
      });

      return result;

    } catch (err) {

      deadLetterQueue.push(job);

      return {
        status: "FAILED",
        error: err,
      };

    }

  }

}

export const infraOrchestrator = new InfraOrchestrator();
