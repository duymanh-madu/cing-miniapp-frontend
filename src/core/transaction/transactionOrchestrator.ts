import { eventBus } from "../event-bus/eventBus";

class TransactionOrchestrator {

  async processOrderPaid(payload: any) {

    // STEP 1: LOYALTY UPDATE
    await eventBus.emit("LOYALTY_UPDATE", payload);

    // STEP 2: CRM SYNC
    await eventBus.emit("CRM_SYNC", payload);

    // STEP 3: ANALYTICS TRACK
    await eventBus.emit("ANALYTICS_TRACK", payload);

  }

}

export const transactionOrchestrator = new TransactionOrchestrator();
