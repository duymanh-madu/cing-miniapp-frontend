import { revenuePipeline } from "../../pipeline/v2/revenuePipeline";
import { paymentLock } from "./paymentLock";

class PaymentOrchestrator {

  execute(paymentId: string, payload: any) {

    if (!paymentLock.acquire(paymentId)) {
      return { status: "LOCKED_DUPLICATE" };
    }

    try {

      const result = revenuePipeline.handlePayment(
        paymentId,
        payload
      );

      return result;

    } finally {
      paymentLock.release(paymentId);
    }

  }

}

export const paymentOrchestrator = new PaymentOrchestrator();
