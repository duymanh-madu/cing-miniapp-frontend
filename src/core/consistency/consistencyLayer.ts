import { transactionOrchestrator } from "../transaction/transactionOrchestrator";
import { paymentReconciliation } from "../payment/paymentReconciliation";

class ConsistencyLayer {

  async onOrderPaid(event: any) {

    // 1. reconcile payment first
    paymentReconciliation.record(event.data.paymentId, event.data);

    // 2. run transaction pipeline
    await transactionOrchestrator.processOrderPaid(event.data);

    // 3. finalize reconciliation
    paymentReconciliation.reconcile(event.data.paymentId);

  }

}

export const consistencyLayer = new ConsistencyLayer();
