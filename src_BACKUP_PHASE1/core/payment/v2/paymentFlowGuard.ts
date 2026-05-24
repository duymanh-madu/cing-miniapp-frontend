import { paymentIdempotency } from "./paymentIdempotency";

class PaymentFlowGuard {

  process(paymentId: string, payload: any, handler: Function) {

    return paymentIdempotency.safeExecute(paymentId, () => {
      return handler(payload);
    });

  }

}

export const paymentFlowGuard = new PaymentFlowGuard();
